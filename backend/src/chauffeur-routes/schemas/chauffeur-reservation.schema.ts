import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChauffeurReservationDocument = ChauffeurReservation & Document;

@Schema({ timestamps: true })
export class ChauffeurReservation {
  @Prop({ required: true })
  routeId: string;

  @Prop({ required: true })
  routeName: string;

  @Prop({ default: '' })
  from: string;

  @Prop({ default: '' })
  to: string;

  @Prop({ default: '' })
  chauffeurName: string;

  @Prop({ default: '' })
  vehicleModel: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop({ default: '' })
  flightNumber: string;

  @Prop({ default: 1 })
  passengers: number;

  @Prop({ default: 1 })
  luggage: number;

  @Prop({ required: true })
  priceTND: number;

  @Prop({ default: 'pending' }) // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  status: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId?: Types.ObjectId;
}

export const ChauffeurReservationSchema = SchemaFactory.createForClass(ChauffeurReservation);
