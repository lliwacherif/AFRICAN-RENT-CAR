export type Currency = 'TND' | 'EUR' | 'USD';

export type ServiceType = 'cars' | 'chauffeur' | 'stays' | 'tours';

export type PageTab = 'home' | 'voitures' | 'hebergement' | 'excursions' | 'combos';

export type ChauffeurTripType = 'one_way' | 'round_trip' | 'hourly';

export interface Vehicle {
  id: string;
  _id?: string;
  name: string;
  brand: string;
  category: 'Économique' | 'Compacte' | 'Berline' | 'SUV' | 'Luxe' | 'Monospace' | 'Utilitaire';
  tagline: string;
  pricePerDayTND: number;
  pricePerDay?: number;
  year?: number;
  featured?: boolean;
  bentoSize?: 'large' | 'medium' | 'small';
  image: string;
  images?: string[];
  gallery?: string[];
  specs: {
    seats: number;
    transmission: 'Automatique' | 'Manuelle';
    fuel: 'Essence' | 'Diesel' | 'Hybride' | 'Électrique';
    doors?: number;
    luggage: number;
    airConditioning?: boolean;
  };
  features: string[];
  rating: number;
  reviewsCount: number;
  availableAt?: string[];
  cancellationFree?: boolean;
  depositTND?: number;
}

export interface ChauffeurRoute {
  id: string;
  from: string;
  to: string;
  duration: string;
  distance: string;
  basePriceTND: number;
  popular?: boolean;
  image: string;
  recommendedVehicle: string;
  includes: string[];
}

export interface Accommodation {
  id: string;
  _id?: string;
  title: string;
  type: string;
  location: string;
  city?: string;
  rating: number;
  reviewsCount: number;
  pricePerNightTND: number;
  pricePerNight?: number;
  capacityGuests: number;
  maxGuests?: number;
  bedrooms: number;
  baths: number;
  bedsCount?: number;
  surfaceM2?: number;
  amenities: any;
  image: string;
  images?: string[];
  gallery?: string[];
  featured?: boolean;
  isTopChoice?: boolean;
  description?: string;
}

export interface Excursion {
  id: string;
  _id?: string;
  title: string;
  region?: string;
  departureCity: string;
  duration: string;
  category: string;
  tagline?: string;
  description: string;
  highlights?: string[];
  vehicleType?: string;
  included?: string[];
  pricePerPersonTND: number;
  pricePerAdult?: number;
  priceTiers?: { minPeople: number; maxPeople: number; price: number }[];
  originalPriceTND?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  gallery?: string[];
  featured?: boolean;
  groupSize?: string;
}

export interface ComboPackage {
  id: string;
  title: string;
  destination: string;
  tagline: string;
  description: string;
  duration: string;
  carIncluded: string;
  stayIncluded: string;
  priceTotalTND: number;
  originalPriceTND: number;
  discountBadge: string;
  images: string[];
  tags: string[];
  highlights: string[];
}

export interface Review {
  id: string;
  author: string;
  location: string;
  flag: string;
  avatar: string;
  rating: number;
  date: string;
  serviceCategory: 'Voiture' | 'Chauffeur Privé' | 'Hébergement' | 'Circuit';
  serviceUsed: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface AgencyBranch {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  isAirport: boolean;
}

