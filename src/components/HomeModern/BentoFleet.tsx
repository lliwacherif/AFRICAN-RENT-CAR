import { useText } from '../../context/LanguageContext'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Gauge, 
  Wind, 
  Briefcase, 
  Star, 
  Sparkles, 
  Eye, 
  Check, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Fuel,
  Cuboid
} from 'lucide-react';
import { Vehicle, Currency } from '../types';
import { VEHICLES, formatPrice } from '../data/mockData';

interface BentoFleetProps {
  currency: Currency;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBookVehicle: (vehicle: Vehicle) => void;
}

export const BentoFleet: React.FC<BentoFleetProps> = ({
  currency,
  onSelectVehicle,
  onBookVehicle,
}) => {
  const tr = useText()

  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  // Categories matching exact prompt: Économique chic, Berline Business, SUV Aventure & Premium Prestige
  const categories = [
    { label: 'Tous', filterKey: 'Tous', count: VEHICLES.length },
    { label: 'Économique chic', filterKey: 'Économique', count: VEHICLES.filter((v) => v.category === 'Économique' || v.category === 'Compacte').length },
    { label: 'Berline Business', filterKey: 'Berline', count: VEHICLES.filter((v) => v.category === 'Berline').length },
    { label: 'SUV Aventure', filterKey: 'SUV', count: VEHICLES.filter((v) => v.category === 'SUV').length },
    { label: 'Premium Prestige', filterKey: 'Luxe', count: VEHICLES.filter((v) => v.category === 'Luxe').length },
  ];

  const filteredVehicles = selectedCategory === 'Tous'
    ? VEHICLES
    : VEHICLES.filter((v) => {
        if (selectedCategory === 'Économique chic') return v.category === 'Économique' || v.category === 'Compacte';
        if (selectedCategory === 'Berline Business') return v.category === 'Berline';
        if (selectedCategory === 'SUV Aventure') return v.category === 'SUV';
        if (selectedCategory === 'Premium Prestige') return v.category === 'Luxe';
        return true;
      });

  return (
    <section id="bento-fleet" className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 mb-24">
      {/* Header with Title and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C3E56]/10 text-[#2C3E56] text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#A84A3B]" />
            <span>{tr("Showroom Automobile Moderne 2025 / 2026")}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191C1F] tracking-tight font-display">
            {tr("La Flotte African Rent Car")}
          </h2>
          <p className="mt-2 text-base text-[#4A525A] font-medium max-w-xl">
            {tr("Véhicules récents contrôlés en 40 points, équipés des dernières technologies de sécurité et sans mauvaise surprise au retour.")}
          </p>
        </div>

        {/* Category Filter Pills: Apple frosted glass style */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none max-w-full bg-black/[0.04] p-1.5 rounded-2xl backdrop-blur-md border border-black/[0.04]">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.label
                  ? 'bg-white/95 text-[#A84A3B] shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] border border-white/90'
                  : 'text-[#4A525A] hover:text-[#191C1F] hover:bg-white/40'
              }`}
            >
              <span>{tr(cat.label)}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === cat.label
                    ? 'bg-[#A84A3B]/10 text-[#A84A3B]'
                    : 'bg-black/5 text-[#727D88]'
                }`}
              >
                {tr(cat.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Asymmetric Bento Grid Layout with Apple Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle, index) => {
          const isHighlight = vehicle.featured && index === 0 && selectedCategory === 'Tous';

          return (
            <div
              key={vehicle.id}
              className={`group apple-glass-subtle hover:bg-white/90 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.12)] ${
                isHighlight ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div>
                {/* Image Showcase with full-bleed and subtle hover scale */}
                <div className="relative overflow-hidden bg-[#F8F7EE] aspect-[16/10]">
                  <img
                    src={vehicle.image}
                    alt={tr(vehicle.name)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

                  {/* Top badges: Apple Glass Category & Rating */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold tracking-wide uppercase shadow-sm">
                      {tr(vehicle.category)}
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/85 backdrop-blur-md border border-white/90 shadow-sm text-xs font-bold text-[#191C1F]">
                      <Star className="w-3.5 h-3.5 fill-[#A84A3B] text-[#A84A3B]" />
                      <span>{tr(vehicle.rating)}</span>
                      <span className="text-[11px] text-[#727D88]">({tr(vehicle.reviewsCount)})</span>
                    </div>
                  </div>

                  {/* Bottom Image Info (Brand & Tagline) */}
                  <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                    <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                      {tr(vehicle.brand)}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-display drop-shadow-sm">
                      {tr(vehicle.name)}
                    </h3>
                  </div>
                </div>

                {/* Card Body with Specs & Features */}
                <div className="p-5 sm:p-6">
                  {/* Tagline */}
                  <p className="text-xs sm:text-sm text-[#4A525A] mb-4 line-clamp-2 font-medium">
                    {tr(vehicle.tagline)}
                  </p>

                  {/* Technical Specs Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-y border-black/[0.05] mb-4 bg-white/40 backdrop-blur-sm rounded-2xl p-2.5 border border-white/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#191C1F]">
                      <Users className="w-4 h-4 text-[#A84A3B]" />
                      <span>{tr(vehicle.specs.seats)} {tr("places")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#191C1F]">
                      <Gauge className="w-4 h-4 text-[#2C3E56]" />
                      <span>{tr(vehicle.specs.transmission)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#191C1F]">
                      <Wind className="w-4 h-4 text-[#A84A3B]" />
                      <span>{tr("Climatisation")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#191C1F]">
                      <Fuel className="w-4 h-4 text-[#2C3E56]" />
                      <span>{tr("Zéro surprise")}</span>
                    </div>
                  </div>

                  {/* Key feature pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {vehicle.features.slice(0, 3).map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4A525A] bg-white/60 px-2.5 py-0.8 rounded-xl border border-white/80 shadow-xs"
                      >
                        <Check className="w-3 h-3 text-[#A84A3B]" />
                        <span>{tr(feat)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer with Price and Interactive Actions */}
              <div className="p-5 sm:p-6 pt-0 border-t border-black/[0.05] flex items-center justify-between gap-3 mt-2">
                <div>
                  <span className="text-[10px] text-[#727D88] font-bold block uppercase tracking-wider">
                    {tr("Tarif par jour")}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-[#A84A3B] font-display">
                      {formatPrice(vehicle.pricePerDayTND, currency)}
                    </span>
                    <span className="text-xs text-[#727D88] font-medium">{tr("/ jour")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectVehicle(vehicle)}
                    className="px-3 py-2.5 rounded-xl border border-[#2C3E56]/30 hover:border-[#2C3E56] hover:bg-white/80 text-[#2C3E56] transition-all text-xs font-extrabold flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
                    title={tr("Inspection 3D et état des lieux numérique")}
                  >
                    <Cuboid className="w-4 h-4 text-[#2C3E56]" />
                    <span className="hidden sm:inline">{tr("Inspection 3D")}</span>
                  </button>

                  <button
                    onClick={() => onBookVehicle(vehicle)}
                    className="bg-gradient-to-r from-[#A84A3B] to-[#C25847] hover:brightness-105 active:scale-[0.99] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-[0_8px_18px_rgba(168,74,59,0.30)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{tr("Réserver")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View all fleet CTA */}
      <div className="mt-8 text-center">
        <Link
          to="/voitures"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white border border-[#2C3E56]/20 hover:border-[#A84A3B] text-[#191C1F] hover:text-[#A84A3B] font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <span>{tr("Voir toute la flotte et réserver en ligne")}</span>
          <ArrowRight className="w-4 h-4 text-[#A84A3B] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Trust banner underneath Fleet: Apple frosted glass */}
      <div className="mt-10 p-5 rounded-3xl apple-glass-subtle flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#4A525A]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#A84A3B]" />
          <span>{tr("Tous nos véhicules font l'objet d'un état des lieux numérique certifié et d'une désinfection complète.")}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#191C1F] font-bold">{tr("Besoin d'un modèle spécifique ou mise à disposition ?")}</span>
          <a
            href="tel:+21627908060"
            className="text-[#A84A3B] hover:underline font-bold"
          >
            {tr("Contactez notre conciergerie VIP →")}
          </a>
        </div>
      </div>
    </section>
  );
};
