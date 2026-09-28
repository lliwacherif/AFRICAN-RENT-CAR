import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateChauffeurReservationDto {
  @IsOptional()
  @IsString()
  routeId?: string;

  @IsOptional()
  @IsString()
  routeName?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  chauffeurName?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsOptional()
  @IsString()
  flightNumber?: string;

  @IsOptional()
  @IsNumber()
  passengers?: number;

  @IsOptional()
  @IsNumber()
  luggage?: number;

  @IsOptional()
  @IsNumber()
  priceTND?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
