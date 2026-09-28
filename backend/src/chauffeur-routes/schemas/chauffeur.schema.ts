import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChauffeurDocument = Chauffeur & Document;

@Schema({ timestamps: true })
export class Chauffeur {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: '' })
  email?: string;

  @Prop({ default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' })
  avatar: string;

  @Prop({ default: 4.95 })
  rating: number;

  @Prop({ default: 8 })
  experienceYears: number;

  @Prop({ type: [String], default: ['Français', 'العربية', 'English'] })
  languages: string[];

  @Prop({ default: 'Mercedes-Benz Classe E' })
  vehicleModel: string;

  @Prop({ default: 'business-sedan' })
  vehicleType: string;

  @Prop({ default: '' })
  vehiclePlate?: string;

  @Prop({ default: 'Noir Métallisé' })
  vehicleColor?: string;

  @Prop({ default: 'Tunis' })
  city: string;

  @Prop({ default: 'active' })
  status: string; // 'active' | 'inactive' | 'busy'

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: '' })
  bio?: string;
}

export const ChauffeurSchema = SchemaFactory.createForClass(Chauffeur);
