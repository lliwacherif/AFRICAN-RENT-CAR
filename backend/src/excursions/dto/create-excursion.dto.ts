import {
  IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional,
  Min, IsArray, IsBoolean, ValidateNested, IsInt, ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExcursionCategory } from '../schemas/excursion.schema';

export class ItineraryStepDto {
  @ApiProperty({ example: 'Matin - 08:30' })
  @IsString()
  @IsNotEmpty()
  dayOrTime: string;

  @ApiProperty({ example: 'Départ et traversée du Chott El Djerid' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Arrêt photo au lac salé pour observer le mirage et le lever de soleil.' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class PriceTierDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minPeople: number;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPeople: number;

  @ApiProperty({ example: 166.5, description: 'Prix total du groupe en TND' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;
}

export class CreateExcursionDto {
  @ApiProperty({ example: 'Circuit Sud Tunisien : Tozeur, Douz & Matmata (2 Jours / 1 Nuit)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Découvrez les oasis de montagne, le coucher de soleil sur les dunes du Sahara et les maisons troglodytes.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ExcursionCategory, example: ExcursionCategory.SAHARA })
  @IsEnum(ExcursionCategory)
  category: ExcursionCategory;

  @ApiProperty({ example: 'Djerba' })
  @IsString()
  @IsNotEmpty()
  departureCity: string;

  @ApiProperty({ example: 'Tozeur & Douz' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ example: '2 jours / 1 nuit' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ type: [PriceTierDto], description: 'Tranches de personnes, bornes incluses, sans chevauchement' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  priceTiers: PriceTierDto[];

  @ApiPropertyOptional({ description: 'Ancien tarif par adulte en TND' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerAdult?: number;

  @ApiPropertyOptional({ example: 180, description: 'Prix par enfant (< 12 ans) en TND' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerChild?: number;

  @ApiPropertyOptional({ example: 16, default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxGroupSize?: number;

  @ApiPropertyOptional({ example: 2, default: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minGroupSize?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  included?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excluded?: string[];

  @ApiPropertyOptional({ type: [ItineraryStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryStepDto)
  itinerary?: ItineraryStepDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Tous les mardis et samedis'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
