import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PriceTier, PriceTierSchema } from './excursion.schema';

export type ExcursionReservationDocument = ExcursionReservation & Document;

export enum ExcursionReservationStatus {
  RECU = 'recu',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum ExcursionPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class ExcursionReservation {
  @Prop({ type: Types.ObjectId, ref: 'Excursion', required: true })
  excursion: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ min: 1 })
  adults?: number;

  @Prop({ default: 0, min: 0 })
  children: number;

  @Prop({ required: true, min: 1 })
  totalParticipants: number;

  @Prop({ enum: ['group', 'per-person'], default: 'per-person' })
  pricingType: string;

  @Prop({ type: PriceTierSchema })
  priceTier?: PriceTier;

  @Prop({ min: 0 })
  pricePerAdult?: number;

  @Prop({ default: 0, min: 0 })
  pricePerChild: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ trim: true })
  pickupLocation?: string; // Hotel name or address

  @Prop({ enum: ExcursionReservationStatus, default: ExcursionReservationStatus.RECU })
  status: ExcursionReservationStatus;

  @Prop({ enum: ExcursionPaymentStatus, default: ExcursionPaymentStatus.PENDING })
  paymentStatus: ExcursionPaymentStatus;

  @Prop({ trim: true })
  specialRequests?: string;

  @Prop({ trim: true })
  cancelReason?: string;
}

export const ExcursionReservationSchema = SchemaFactory.createForClass(ExcursionReservation);

ExcursionReservationSchema.index({ excursion: 1, date: 1 });
ExcursionReservationSchema.index({ user: 1, status: 1 });
