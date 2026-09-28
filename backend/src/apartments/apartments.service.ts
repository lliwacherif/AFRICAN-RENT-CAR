import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Apartment, ApartmentDocument } from './schemas/apartment.schema';
import {
  ApartmentReservation,
  ApartmentReservationDocument,
  ApartmentReservationStatus,
} from './schemas/apartment-reservation.schema';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { QueryApartmentDto } from './dto/query-apartment.dto';
import { CreateApartmentReservationDto } from './dto/create-apartment-reservation.dto';

@Injectable()
export class ApartmentsService {
  constructor(
    @InjectModel(Apartment.name) private apartmentModel: Model<ApartmentDocument>,
    @InjectModel(ApartmentReservation.name)
    private reservationModel: Model<ApartmentReservationDocument>,
  ) {}

  async findAll(query: QueryApartmentDto) {
    const filter: any = { isActive: true };

    if (query.city) {
      filter.city = { $regex: new RegExp(query.city, 'i') };
    }
    if (query.type) {
      filter.type = query.type;
    }
    if (query.minPrice || query.maxPrice) {
      filter.pricePerNight = {};
      if (query.minPrice) filter.pricePerNight.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.pricePerNight.$lte = Number(query.maxPrice);
    }
    if (query.guests) {
      filter.maxGuests = { $gte: Number(query.guests) };
    }
    if (query.bedrooms) {
      filter.bedrooms = { $gte: Number(query.bedrooms) };
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const sortField = query.sortBy || 'createdAt';
    const sortDir = query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortDir };

    const [apartments, total] = await Promise.all([
      this.apartmentModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.apartmentModel.countDocuments(filter),
    ]);

    return {
      apartments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findAllAdmin() {
    return this.apartmentModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID hébergement invalide');
    const apartment = await this.apartmentModel.findById(id).lean();
    if (!apartment) throw new NotFoundException('Hébergement introuvable');
    return apartment;
  }

  async create(dto: CreateApartmentDto) {
    const created = new this.apartmentModel(dto);
    return created.save();
  }

  async update(id: string, dto: UpdateApartmentDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID hébergement invalide');
    const updated = await this.apartmentModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Hébergement introuvable');
    return updated;
  }

  async toggleActive(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID hébergement invalide');
    const apt = await this.apartmentModel.findById(id);
    if (!apt) throw new NotFoundException('Hébergement introuvable');
    apt.isActive = !apt.isActive;
    return apt.save();
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID hébergement invalide');
    const deleted = await this.apartmentModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Hébergement introuvable');
    return { message: 'Hébergement supprimé avec succès' };
  }

  // ── Reservations ──────────────────────────────────────────────────────────

  async createReservation(apartmentId: string, dto: CreateApartmentReservationDto, userId: string) {
    const apartment = await this.apartmentModel.findById(apartmentId);
    if (!apartment || !apartment.isActive) {
      throw new NotFoundException('Hébergement non disponible');
    }

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);

    if (checkOut <= checkIn) {
      throw new BadRequestException('La date de départ doit être ultérieure à la date d’arrivée');
    }

    const totalNights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    if (totalNights < (apartment.minNights || 1)) {
      throw new BadRequestException(`Le séjour minimum pour cet hébergement est de ${apartment.minNights} nuit(s)`);
    }

    const totalGuests = Number(dto.adults) + Number(dto.children || 0);
    if (totalGuests > apartment.maxGuests) {
      throw new BadRequestException(`Cet hébergement peut accueillir un maximum de ${apartment.maxGuests} personnes`);
    }

    // Check for overlap with existing confirmed or received bookings
    const overlap = await this.reservationModel.findOne({
      apartment: new Types.ObjectId(apartmentId),
      status: { $in: [ApartmentReservationStatus.RECU, ApartmentReservationStatus.CONFIRMED] },
      $or: [
        { checkInDate: { $lt: checkOut, $gte: checkIn } },
        { checkOutDate: { $gt: checkIn, $lte: checkOut } },
        { checkInDate: { $lte: checkIn }, checkOutDate: { $gte: checkOut } },
      ],
    });

    if (overlap) {
      throw new BadRequestException('Ces dates ne sont plus disponibles pour cet hébergement');
    }

    // Pricing calculation
    const subtotalHT = totalNights * apartment.pricePerNight;
    const cleaningFee = apartment.cleaningFee || 0;
    const tvaRate = 0.07; // 7% TVA touristique
    const tva = Math.round((subtotalHT + cleaningFee) * tvaRate * 100) / 100;
    const totalTTC = Math.round((subtotalHT + cleaningFee + tva) * 100) / 100;

    const reservation = new this.reservationModel({
      apartment: apartment._id,
      user: new Types.ObjectId(userId),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights,
      adults: dto.adults,
      children: dto.children || 0,
      pricePerNight: apartment.pricePerNight,
      subtotalHT,
      tva,
      cleaningFee,
      totalTTC,
      depositAmount: apartment.depositAmount || 200,
      specialRequests: dto.specialRequests,
      status: ApartmentReservationStatus.RECU,
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
      .populate('apartment')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .lean();
  }

  async updateReservationStatus(id: string, status: ApartmentReservationStatus) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID réservation invalide');
    const res = await this.reservationModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .populate('apartment')
      .lean();
    if (!res) throw new NotFoundException('Réservation introuvable');
    return res;
  }
}
