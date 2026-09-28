import React, { useState } from 'react';
import { 
  Home as HomeIcon, 
  MapPin, 
  Star, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Car,
  Tag
} from 'lucide-react';
import { Currency, Accommodation } from '../types';
import { ACCOMMODATIONS, formatPrice } from '../data/mockData';

interface AccommodationsSectionProps {
  currency: Currency;
  onBookAccommodation: (acc: Accommodation) => void;
  onExploreCombo: () => void;
}

export const AccommodationsSection: React.FC<AccommodationsSectionProps> = ({
  currency,
  onBookAccommodation,
  onExploreCombo,
}) => {
  const [filterLocation, setFilterLocation] = useState<string>('all');

  const filteredAccommodations = filterLocation === 'all'
    ? ACCOMMODATIONS
    : ACCOMMODATIONS.filter((a) => a.location.toLowerCase().includes(filterLocation.toLowerCase()));

  return (
    <section id="villas-stays" className="py-20 bg-white border-t border-[#EBE6DC]">
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] text-xs font-black tracking-wide uppercase">
              <HomeIcon className="w-3.5 h-3.5 text-[#A84A3B]" />
              <span>Hébergements Sélectionnés & Villas Privées</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191C1F] font-display tracking-tight leading-[1.15]">
              Séjournez dans les plus belles demeures{' '}
              <span className="text-[#A84A3B]">de Tunisie.</span>
            </h2>

            <p className="text-base text-[#4A525A] font-medium leading-relaxed">
              Villas d'architecte avec piscine privée, appartements les pieds dans l'eau et lodges d'exception. Chaque résidence est inspectée et certifiée par notre conciergerie locale.
            </p>
          </div>

          {/* Location filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Toutes les régions', val: 'all' },
              { label: 'Djerba', val: 'Djerba' },
              { label: 'La Marsa / Carthage', val: 'Marsa' },
              { label: 'Hammamet', val: 'Hammamet' },
              { label: 'Tabarka', val: 'Tabarka' },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setFilterLocation(f.val)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  filterLocation === f.val
                    ? 'bg-[#2C3E56] text-white shadow-sm'
                    : 'bg-[#F8F7EE] text-[#4A525A] hover:bg-[#EBE6DC]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accommodations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {filteredAccommodations.map((acc) => (
            <div
              key={acc.id}
              className="bg-[#FFFFF0] rounded-3xl border border-[#EBE6DC] shadow-[0_12px_32px_rgba(44,62,86,0.06)] hover:shadow-[0_20px_48px_rgba(44,62,86,0.12)] transition-all overflow-hidden flex flex-col group"
            >
              {/* Grand Format Photo with Location Badge */}
              <div className="relative h-64 sm:h-72 overflow-hidden">
                <img
                  src={acc.image}
                  alt={acc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                {/* Location Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-[#191C1F] text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A84A3B]" />
                  <span>{acc.location}</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{acc.rating} ({acc.reviewsCount} avis)</span>
                </div>

                {/* Property Type Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-[#A84A3B] text-white text-[11px] font-black rounded-lg uppercase tracking-wider shadow-sm">
                    {acc.type}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#191C1F] font-display mb-2 group-hover:text-[#A84A3B] transition-colors">
                    {acc.title}
                  </h3>

                  {/* Amenities / Features Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#4A525A] py-2 border-y border-[#EBE6DC] my-3">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#2C3E56]" />
                      <span>{acc.capacityGuests} invités</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-[#2C3E56]" />
                      <span>{acc.bedrooms} chambres</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-[#2C3E56]" />
                      <span>{acc.baths} sdb</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-4 h-4 text-emerald-600" />
                      <span>Wifi Fibre</span>
                    </span>
                  </div>

                  {/* Highlights checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#727D88] pt-1">
                    {acc.amenities.map((am, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A84A3B] shrink-0" />
                        <span>{am}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price per night and booking action */}
                <div className="pt-4 border-t border-[#EBE6DC] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#727D88] block">Tarif par nuit</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-[#A84A3B]">
                        {formatPrice(acc.pricePerNightTND, currency)}
                      </span>
                      <span className="text-xs text-[#727D88] font-medium">/ nuit</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onBookAccommodation(acc)}
                    className="px-5 py-3 bg-[#A84A3B] hover:bg-[#8A372A] text-white text-xs sm:text-sm font-black rounded-2xl shadow-[0_8px_18px_rgba(168,74,59,0.3)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <span>Réserver ce séjour</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Encadré "Offre Combo" exact as requested */}
        <div className="bg-gradient-to-r from-[#2C3E56] to-[#1F2C3D] text-white rounded-3xl p-8 sm:p-10 border border-[#3A495E] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A84A3B] text-white text-xs font-black uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Avantage Exclusif African Rent Car</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Offre Combo : Réservez votre hébergement + votre voiture et bénéficiez de -15%
            </h3>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Une clé unique pour toute votre escapade en Tunisie. Votre véhicule vous attend directement au terminal aéroport ou au portail de votre villa privatisée, sans file d'attente ni intermédiaire.
            </p>
          </div>

          <button
            onClick={onExploreCombo}
            className="relative z-10 shrink-0 px-7 py-4 bg-[#A84A3B] hover:bg-[#8A372A] text-white text-sm font-black rounded-2xl shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
          >
            <Car className="w-4 h-4" />
            <span>Découvrir les Packs Fusion (-15%)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
