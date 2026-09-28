import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApartmentDocument = Apartment & Document;

export enum ApartmentType {
  APPARTEMENT = 'Appartement',
  VILLA = 'Villa',
  DAR = "Maison d'hôtes (Dar)",
  STUDIO = 'Studio',
  PENTHOUSE = 'Penthouse',
}

@Schema({ _id: false })
export class ApartmentAmenities {
  @Prop({ default: true }) wifi: boolean;
  @Prop({ default: true }) ac: boolean;
  @Prop({ default: false }) pool: boolean;
  @Prop({ default: false }) seaView: boolean;
  @Prop({ default: true }) parking: boolean;
  @Prop({ default: true }) kitchen: boolean;
  @Prop({ default: true }) tv: boolean;
  @Prop({ default: false }) washingMachine: boolean;
  @Prop({ default: false }) terrace: boolean;
  @Prop({ default: true }) heating: boolean;
  @Prop({ default: false }) elevator: boolean;
  @Prop({ default: false }) petFriendly: boolean;
}
export const ApartmentAmenitiesSchema = SchemaFactory.createForClass(ApartmentAmenities);

@Schema({ timestamps: true })
export class Apartment {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, enum: ApartmentType, default: ApartmentType.APPARTEMENT })
  type: ApartmentType;

  @Prop({ required: true, trim: true })
  city: string; // e.g. "Sidi Bou Said", "Hammamet", "Djerba", "Tunis", "La Marsa", "Sousse"

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, min: 0 })
  pricePerNight: number; // in TND

  @Prop({ min: 0, default: 0 })
  cleaningFee: number;

  @Prop({ min: 0, default: 200 })
  depositAmount: number;

  @Prop({ required: true, min: 1 })
  bedrooms: number;

  @Prop({ required: true, min: 1 })
  bathrooms: number;

  @Prop({ required: true, min: 1 })
  bedsCount: number;

  @Prop({ required: true, min: 1 })
  maxGuests: number;

  @Prop({ min: 10 })
  surfaceM2: number;

  @Prop({ min: 1, default: 1 })
  minNights: number;

  @Prop({ type: ApartmentAmenitiesSchema, default: () => ({}) })
  amenities: ApartmentAmenities;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ type: [Date], default: [] })
  unavailableDates: Date[];
}

export const ApartmentSchema = SchemaFactory.createForClass(Apartment);

ApartmentSchema.index({ city: 1, type: 1, pricePerNight: 1 });
ApartmentSchema.index({ isActive: 1, featured: 1 });
