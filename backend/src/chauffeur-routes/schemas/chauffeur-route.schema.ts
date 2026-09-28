import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChauffeurRouteDocument = ChauffeurRoute & Document;

@Schema({ timestamps: true })
export class ChauffeurRoute {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  distance: string;

  @Prop({ type: Object, default: null })
  fromCoords?: {
    lat: number;
    lng: number;
    label?: string;
  };

  @Prop({ type: Object, default: null })
  toCoords?: {
    lat: number;
    lng: number;
    label?: string;
  };

  @Prop({ type: Array, default: [] })
  routeTrail?: number[][]; // Array of [lat, lng]

  @Prop({ default: 'business-sedan' })
  vehicleType?: string;

  @Prop({ required: true })
  basePriceTND: number;

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: 'active' }) // 'active' | 'busy' | 'unassigned'
  status: string;

  @Prop({ default: false })
  popular: boolean;

  @Prop({ default: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80' })
  image: string;

  @Prop({ type: Object, default: {} })
  assignedChauffeur: {
    name: string;
    phone: string;
    avatar?: string;
    rating?: number;
    tripsCount?: number;
    languages?: string[];
    vehicleModel?: string;
    vehiclePlate?: string;
    vehicleColor?: string;
    amenities?: string[];
  };

  @Prop({ type: [String], default: [] })
  includes: string[];

  @Prop({ default: '' })
  notes?: string;
}

export const ChauffeurRouteSchema = SchemaFactory.createForClass(ChauffeurRoute);
