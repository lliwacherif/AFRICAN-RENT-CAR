import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApartmentReservationDocument = ApartmentReservation & Document;

export enum ApartmentReservationStatus {
  RECU = 'recu',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum ApartmentPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class ApartmentReservation {
  @Prop({ type: Types.ObjectId, ref: 'Apartment', required: true })
  apartment: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  checkInDate: Date;

  @Prop({ required: true })
  checkOutDate: Date;

  @Prop({ required: true, min: 1 })
  totalNights: number;

  @Prop({ required: true, min: 1 })
  adults: number;

  @Prop({ default: 0, min: 0 })
  children: number;

  @Prop({ required: true, min: 0 })
  pricePerNight: number;

  @Prop({ required: true, min: 0 })
  subtotalHT: number;

  @Prop({ required: true, min: 0 })
  tva: number; // 7% or 19%

  @Prop({ default: 0, min: 0 })
  cleaningFee: number;

  @Prop({ required: true, min: 0 })
  totalTTC: number;

  @Prop({ default: 200, min: 0 })
  depositAmount: number;

  @Prop({ enum: ApartmentReservationStatus, default: ApartmentReservationStatus.RECU })
  status: ApartmentReservationStatus;

  @Prop({ enum: ApartmentPaymentStatus, default: ApartmentPaymentStatus.PENDING })
  paymentStatus: ApartmentPaymentStatus;

  @Prop({ trim: true })
  specialRequests?: string;

  @Prop({ trim: true })
  cancelReason?: string;
}

export const ApartmentReservationSchema = SchemaFactory.createForClass(ApartmentReservation);

ApartmentReservationSchema.index({ apartment: 1, checkInDate: 1, checkOutDate: 1 });
ApartmentReservationSchema.index({ user: 1, status: 1 });
