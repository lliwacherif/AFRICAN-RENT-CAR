import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateChauffeurRouteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsNotEmpty()
  @IsString()
  distance: string;

  @IsOptional()
  fromCoords?: {
    lat: number;
    lng: number;
    label?: string;
  };

  @IsOptional()
  toCoords?: {
    lat: number;
    lng: number;
    label?: string;
  };

  @IsOptional()
  routeTrail?: number[][];

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsNotEmpty()
  @IsNumber()
  basePriceTND: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  assignedChauffeur?: {
    name: string;
    phone: string;
    avatar?: string;
    rating?: number;
    experienceYears?: number;
    spokenLanguages?: string[];
    tripsCount?: number;
    languages?: string[];
    vehicleModel?: string;
    vehiclePlate?: string;
    vehicleColor?: string;
    amenities?: string[];
  };

  @IsOptional()
  includes?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
