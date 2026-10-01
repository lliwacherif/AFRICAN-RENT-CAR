import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Excursion, ExcursionDocument } from './schemas/excursion.schema';
import {
  ExcursionReservation,
  ExcursionReservationDocument,
  ExcursionReservationStatus,
} from './schemas/excursion-reservation.schema';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { QueryExcursionDto } from './dto/query-excursion.dto';
import { CreateExcursionReservationDto } from './dto/create-excursion-reservation.dto';
import { findPriceTier, normalizePriceTiers } from './excursion-pricing';

@Injectable()
export class ExcursionsService {
  constructor(
    @InjectModel(Excursion.name) private excursionModel: Model<ExcursionDocument>,
    @InjectModel(ExcursionReservation.name)
    private reservationModel: Model<ExcursionReservationDocument>,
  ) {}

  async findAll(query: QueryExcursionDto) {
    const filter: any = { isActive: true };

    if (query.category) {
      filter.category = query.category;
    }
    if (query.departureCity) {
      filter.departureCity = { $regex: new RegExp(query.departureCity, 'i') };
    }
    const startingPrice = {
      $cond: [
        { $gt: [{ $size: { $ifNull: ['$priceTiers', []] } }, 0] },
        { $min: '$priceTiers.price' },
        { $ifNull: ['$pricePerAdult', 0] },
      ],
    };
    if (query.minPrice != null || query.maxPrice != null) {
      filter.$expr = { $and: [
        ...(query.minPrice != null ? [{ $gte: [startingPrice, Number(query.minPrice)] }] : []),
        ...(query.maxPrice != null ? [{ $lte: [startingPrice, Number(query.maxPrice)] }] : []),
      ] };
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const sortField = query.sortBy === 'pricePerAdult' ? 'startingPrice' : query.sortBy || 'createdAt';
    const sortDir: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortDir };

    const [excursions, total] = await Promise.all([
      this.excursionModel.aggregate([
        { $match: filter }, { $addFields: { startingPrice } },
        { $sort: sort }, { $skip: skip }, { $limit: limit },
      ]),
      this.excursionModel.countDocuments(filter),
    ]);

    return {
      excursions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findAllAdmin() {
    return this.excursionModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID excursion invalide');
    const excursion = await this.excursionModel.findById(id).lean();
    if (!excursion) throw new NotFoundException('Excursion introuvable');
    return excursion;
  }

  async create(dto: CreateExcursionDto) {
    const priceTiers = normalizePriceTiers(dto.priceTiers);
    const created = new this.excursionModel({
      ...dto, priceTiers,
      minGroupSize: priceTiers[0].minPeople,
      maxGroupSize: priceTiers[priceTiers.length - 1].maxPeople,
    });
    return created.save();
  }

  async update(id: string, dto: UpdateExcursionDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID excursion invalide');
    if (dto.priceTiers !== undefined) {
      const priceTiers = normalizePriceTiers(dto.priceTiers);
      dto = { ...dto, priceTiers, minGroupSize: priceTiers[0].minPeople, maxGroupSize: priceTiers[priceTiers.length - 1].maxPeople };
    }
    const updated = await this.excursionModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Excursion introuvable');
    return updated;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID excursion invalide');
    const deleted = await this.excursionModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Excursion introuvable');
    return { message: 'Excursion supprimée avec succès' };
  }

  // ── Reservations ──────────────────────────────────────────────────────────

  async createReservation(excursionId: string, dto: CreateExcursionReservationDto, userId: string) {
    const excursion = await this.excursionModel.findById(excursionId);
    if (!excursion || !excursion.isActive) {
      throw new NotFoundException('Excursion non disponible');
    }

    let excursionDate = new Date(dto.date);
    if (typeof dto.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dto.date)) {
      const [y, m, d] = dto.date.split('T')[0].split('-').map(Number);
      excursionDate = new Date(y, m - 1, d, 12, 0, 0);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (excursionDate < today) {
      throw new BadRequestException('La date de l’excursion ne peut pas être dans le passé');
    }

    // Validate that departure date matches allowed excursion days
    if (
      excursion.availableDays &&
      excursion.availableDays.length > 0 &&
      !excursion.availableDays.includes('Tous les jours')
    ) {
      const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      const bookingDayName = dayNames[excursionDate.getDay()];
      const isAllowedDay = excursion.availableDays.some(ad =>
        ad.toLowerCase().includes(bookingDayName)
      );

      if (!isAllowedDay) {
        throw new BadRequestException(
          `Cette excursion démarre uniquement le(s) : ${excursion.availableDays.join(', ')}. Veuillez sélectionner une date autorisée.`,
        );
      }
    }

    const adults = Number(dto.adults ?? dto.participants ?? 0);
    const children = Number(dto.children || 0);
    const requestedSeats = Number(dto.participants ?? adults + children);
    if (!Number.isInteger(requestedSeats) || requestedSeats < 1) {
      throw new BadRequestException('Indiquez un nombre entier de personnes supérieur à zéro.');
    }
    const hasGroupPricing = Boolean(excursion.priceTiers?.length);
    const priceTier = hasGroupPricing ? findPriceTier(excursion.priceTiers, requestedSeats) : undefined;
    if (hasGroupPricing && !priceTier) {
      throw new BadRequestException('Aucun tarif pour ce nombre de personnes.');
    }
    if (!hasGroupPricing && (adults < 1 || requestedSeats !== adults + children)) {
      throw new BadRequestException('Nombre de participants invalide.');
    }

    // Check available seats for this day
    const startOfDay = new Date(excursionDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(excursionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.reservationModel.find({
      excursion: new Types.ObjectId(excursionId),
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [ExcursionReservationStatus.RECU, ExcursionReservationStatus.CONFIRMED] },
    });

    const alreadyBookedSeats = existingBookings.reduce(
      (sum, b) => sum + (b.totalParticipants || ((b.adults || 0) + (b.children || 0))),
      0,
    );

    if (alreadyBookedSeats + requestedSeats > excursion.maxGroupSize) {
      const remaining = Math.max(0, excursion.maxGroupSize - alreadyBookedSeats);
      throw new BadRequestException(
        `Il ne reste que ${remaining} place(s) disponible(s) pour cette date. (Taille max de groupe: ${excursion.maxGroupSize})`,
      );
    }

    const pricePerAdult = excursion.pricePerAdult || 0;
    const pricePerChild = excursion.pricePerChild || pricePerAdult * 0.6;
    const totalPrice = priceTier ? priceTier.price : Math.round((adults * pricePerAdult + children * pricePerChild) * 100) / 100;

    const reservation = new this.reservationModel({
      excursion: excursion._id,
      user: new Types.ObjectId(userId),
      date: excursionDate,
      ...(priceTier
        ? { pricingType: 'group', priceTier }
        : { pricingType: 'per-person', adults, children, pricePerAdult, pricePerChild }),
      totalParticipants: requestedSeats,
      totalPrice,
      pickupLocation: dto.pickupLocation,
      specialRequests: dto.specialRequests,
      status: ExcursionReservationStatus.RECU,
    });

    return reservation.save();
  }

  async findReservations(userId: string, role: string) {
    const filter: any = {};
    if (role !== 'admin') {
      filter.user = new Types.ObjectId(userId);
    }
    return this.reservationModel
      .find(filter)
      .populate('excursion')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .lean();
  }

  async updateReservationStatus(id: string, status: ExcursionReservationStatus) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID réservation invalide');
    const res = await this.reservationModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .populate('excursion')
      .lean();
    if (!res) throw new NotFoundException('Réservation introuvable');
    return res;
  }
}
