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
    if (query.minPrice || query.maxPrice) {
      filter.pricePerAdult = {};
      if (query.minPrice) filter.pricePerAdult.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.pricePerAdult.$lte = Number(query.maxPrice);
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const sortField = query.sortBy || 'createdAt';
    const sortDir = query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortDir };

    const [excursions, total] = await Promise.all([
      this.excursionModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
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
    const created = new this.excursionModel(dto);
    return created.save();
  }

  async update(id: string, dto: UpdateExcursionDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID excursion invalide');
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

    const adults = Number(dto.adults);
    const children = Number(dto.children || 0);
    const requestedSeats = adults + children;

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
      (sum, b) => sum + (b.totalParticipants || (b.adults + (b.children || 0))),
      0,
    );

    if (alreadyBookedSeats + requestedSeats > excursion.maxGroupSize) {
      const remaining = Math.max(0, excursion.maxGroupSize - alreadyBookedSeats);
      throw new BadRequestException(
        `Il ne reste que ${remaining} place(s) disponible(s) pour cette date. (Taille max de groupe: ${excursion.maxGroupSize})`,
      );
    }

    const pricePerAdult = excursion.pricePerAdult;
    const pricePerChild = excursion.pricePerChild || excursion.pricePerAdult * 0.6;
    const totalPrice = Math.round((adults * pricePerAdult + children * pricePerChild) * 100) / 100;

    const reservation = new this.reservationModel({
      excursion: excursion._id,
      user: new Types.ObjectId(userId),
      date: excursionDate,
      adults,
      children,
      totalParticipants: requestedSeats,
      pricePerAdult,
      pricePerChild,
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
