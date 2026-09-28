import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChauffeurLocationDocument = ChauffeurLocation & Document;

@Schema({ timestamps: true })
export class ChauffeurLocation {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 'both', enum: ['both', 'departure', 'destination'] })
  type: string; // 'both' | 'departure' | 'destination'

  @Prop({ default: 'city', enum: ['airport', 'city', 'hotel_zone', 'port', 'station', 'other'] })
  category: string; // 'airport' | 'city' | 'hotel_zone' | 'port' | 'station' | 'other'

  @Prop({ default: 'Grand Tunis' })
  region: string; // 'Grand Tunis' | 'Sahel' | 'Cap Bon' | 'Sud & Djerba' | 'Nord-Ouest' | 'Centre'

  @Prop({ default: '' })
  city?: string;

  @Prop({ default: false })
  popular: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const ChauffeurLocationSchema = SchemaFactory.createForClass(ChauffeurLocation);
