import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExcursionDocument = Excursion & Document;

export enum ExcursionCategory {
  SAHARA = 'Sahara & Désert',
  NATURE = 'Randonnée & Nature',
  CULTURE = 'Culture & Histoire',
  MER = 'Mer & Bateau',
  AVENTURE = 'Aventure & Quad',
}

@Schema({ _id: false })
export class ItineraryStep {
  @Prop({ required: true }) dayOrTime: string; // e.g. "Jour 1", "08:00", "Après-midi"
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;
}
export const ItineraryStepSchema = SchemaFactory.createForClass(ItineraryStep);

@Schema({ _id: false })
export class PriceTier {
  @Prop({ required: true, min: 1 }) minPeople: number;
  @Prop({ required: true, min: 1 }) maxPeople: number;
  @Prop({ required: true, min: 0.01 }) price: number;
}
export const PriceTierSchema = SchemaFactory.createForClass(PriceTier);

@Schema({ timestamps: true })
export class Excursion {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, enum: ExcursionCategory, default: ExcursionCategory.SAHARA })
  category: ExcursionCategory;

  @Prop({ required: true, trim: true })
  departureCity: string; // e.g. "Tunis", "Djerba", "Tozeur", "Sousse", "Hammamet"

  @Prop({ required: true, trim: true })
  destination: string; // e.g. "Tozeur, Douz & Matmata", "Îles Kerkennah", "Tabarka & Aïn Draham"

  @Prop({ required: true, trim: true })
  duration: string; // e.g. "1 jour", "2 jours / 1 nuit", "Demi-journée"

  @Prop({ type: [PriceTierSchema], default: [] })
  priceTiers: PriceTier[];

  // Retained for excursions created before group pricing was introduced.
  @Prop({ min: 0 })
  pricePerAdult?: number; // TND

  @Prop({ min: 0, default: 0 })
  pricePerChild: number; // TND

  @Prop({ required: true, min: 1, default: 15 })
  maxGroupSize: number;

  @Prop({ min: 1, default: 2 })
  minGroupSize: number;

  @Prop({ type: [String], default: [] })
  included: string[]; // e.g. ["Guide touristique certifié", "Transport en minibus 4x4", "Déjeuner traditionnel"]

  @Prop({ type: [String], default: [] })
  excluded: string[]; // e.g. ["Dépenses personnelles", "Boissons alcoolisées"]

  @Prop({ type: [ItineraryStepSchema], default: [] })
  itinerary: ItineraryStep[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: ['Tous les jours'] })
  availableDays: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  featured: boolean;
}

export const ExcursionSchema = SchemaFactory.createForClass(Excursion);

ExcursionSchema.index({ category: 1, departureCity: 1, pricePerAdult: 1 });
ExcursionSchema.index({ isActive: 1, featured: 1 });
