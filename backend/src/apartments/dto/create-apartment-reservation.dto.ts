import { IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApartmentReservationDto {
  @ApiProperty({ example: '2026-10-01T14:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ example: '2026-10-05T11:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  checkOutDate: string;

  @ApiProperty({ example: 2, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  adults: number;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  children?: number = 0;

  @ApiPropertyOptional({ example: 'Arrivée tardive vers 21h, besoin d’un lit bébé.' })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}
