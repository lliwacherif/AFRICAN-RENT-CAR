import {
  IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional,
  Min, IsArray, IsBoolean, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApartmentType } from '../schemas/apartment.schema';

export class ApartmentAmenitiesDto {
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() wifi?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() ac?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() pool?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() seaView?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() parking?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() kitchen?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() tv?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() washingMachine?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() terrace?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() heating?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() elevator?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() petFriendly?: boolean;
}

export class CreateApartmentDto {
  @ApiProperty({ example: 'Dar Sidi Bou Said — Vue Mer Panoramique' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Magnifique maison traditionnelle avec vue sur le golfe de Tunis.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ApartmentType, example: ApartmentType.DAR })
  @IsEnum(ApartmentType)
  type: ApartmentType;

  @ApiProperty({ example: 'Sidi Bou Said' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Rue Habib Thameur, Sidi Bou Said 2026' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 280, description: 'Prix par nuitée en TND' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @ApiPropertyOptional({ example: 50, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cleaningFee?: number;

  @ApiPropertyOptional({ example: 300, default: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bedrooms: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bathrooms: number;

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bedsCount: number;

  @ApiProperty({ example: 4, description: 'Capacité maximale d’invités' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxGuests: number;

  @ApiPropertyOptional({ example: 110 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  surfaceM2?: number;

  @ApiPropertyOptional({ example: 2, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minNights?: number;

  @ApiPropertyOptional({ type: ApartmentAmenitiesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApartmentAmenitiesDto)
  amenities?: ApartmentAmenitiesDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
