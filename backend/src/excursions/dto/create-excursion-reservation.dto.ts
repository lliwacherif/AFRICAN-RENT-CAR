import { IsNotEmpty, IsDateString, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExcursionReservationDto {
  @ApiProperty({ example: '2026-10-15T08:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 4, description: 'Nombre total de personnes pour un tarif de groupe' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  participants?: number;

  @ApiPropertyOptional({ example: 2, description: 'Réservations avec les anciens tarifs individuels' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number = 0;

  @ApiPropertyOptional({ example: 'Hôtel Mövenpick Gammarth' })
  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @ApiPropertyOptional({ example: 'Régime végétarien pour 1 personne' })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}
