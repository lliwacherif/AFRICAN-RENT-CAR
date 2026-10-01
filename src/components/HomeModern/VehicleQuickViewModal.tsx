import { useText } from '../../context/LanguageContext'
import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Gauge, 
  Wind, 
  Briefcase, 
  ShieldCheck, 
  Check, 
  Star, 
  RotateCw, 
  Calendar, 
  ArrowRight,
  Sparkles,
  Fuel
} from 'lucide-react';
import { Vehicle, Currency } from '../types';
import { formatPrice } from '../data/mockData';

interface VehicleQuickViewModalProps {
  vehicle: Vehicle | null;
  currency: Currency;
  onClose: () => void;
  onBook: (vehicle: Vehicle) => void;
}

export const VehicleQuickViewModal: React.FC<VehicleQuickViewModalProps> = ({
  vehicle,
  currency,
  onClose,
  onBook,
}) => {
  const tr = useText()

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  if (!vehicle) return null;

  // All images available for this vehicle
  const allImages = vehicle.gallery && vehicle.gallery.length > 0 ? vehicle.gallery : [vehicle.image];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EBE6DC] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#191C1F] shadow-lg border border-[#EBE6DC] flex items-center justify-center transition-all"
          aria-label={tr("Fermer")}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Visual Gallery & 360 Simulator */}
          <div className="md:col-span-7 bg-[#F8F7EE] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EBE6DC]">
            <div>
              {/* Top info badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-xl bg-[#2C3E56] text-white text-xs font-black uppercase">
                  {tr(vehicle.category)}
                </span>
                <button
                  onClick={() => setIs360Mode(!is360Mode)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    is360Mode
                      ? 'bg-[#A84A3B] text-white'
                      : 'bg-white text-[#2C3E56] border border-[#EBE6DC] hover:bg-[#F8F7EE]'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{tr(is360Mode ? 'Mode Photo Classique' : 'Simulateur Vue 360°')}</span>
                </button>
              </div>

              {/* Main Image Display */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/5 border border-[#EBE6DC]">
                <img
                  src={allImages[activeImgIndex % allImages.length]}
                  alt={tr(vehicle.name)}
                  className="w-full h-full object-cover transition-all duration-300"
                  style={is360Mode ? { transform: `rotate(${rotationAngle}deg)` } : undefined}
                />

                {is360Mode && (
                  <div className="absolute inset-x-4 bottom-4 bg-black/70 backdrop-blur-md text-white p-3 rounded-xl">
                    <p className="text-[11px] font-semibold text-center mb-1">
                      {tr("Faites pivoter le véhicule pour une inspection complète")}
                    </p>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotationAngle}
                      onChange={(e) => setRotationAngle(Number(e.target.value))}
                      className="w-full accent-[#A84A3B] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {!is360Mode && allImages.length > 1 && (
                <div className="flex items-center gap-3 mt-4">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImgIndex === idx ? 'border-[#A84A3B] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Insurance assurance notice */}
            <div className="mt-6 p-4 rounded-2xl bg-white border border-[#EBE6DC] flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-[#191C1F]">{tr("Protection Complète Sans Franchise")}</p>
                <p className="text-[#4A525A]">{tr("Inclus : bris de glace, pneus, vol et assistance dépannage 24/7 en Tunisie.")}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Specs, Features & Booking Action */}
          <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[#727D88] uppercase">{tr(vehicle.brand)}</span>
                <span className="text-xs text-[#EBE6DC]">•</span>
                <div className="flex items-center gap-1 text-xs font-bold text-[#191C1F]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{tr(vehicle.rating)}</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#191C1F] font-display mb-2">
                {tr(vehicle.name)}
              </h2>

              <p className="text-xs sm:text-sm text-[#4A525A] mb-6 leading-relaxed">
                {tr(vehicle.tagline)}
              </p>

              {/* Technical Specifications */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#727D88]">
                  {tr("Fiche Technique Constructeur")}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F7EE] p-3.5 rounded-2xl border border-[#EBE6DC]">
                  <div className="flex items-center gap-2 text-[#191C1F] font-bold">
                    <Users className="w-4 h-4 text-[#A84A3B]" />
                    <span>{tr(vehicle.specs.seats)} {tr("Passagers")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#191C1F] font-bold">
                    <Gauge className="w-4 h-4 text-[#2C3E56]" />
                    <span>{tr(vehicle.specs.transmission)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#191C1F] font-bold">
                    <Fuel className="w-4 h-4 text-[#A84A3B]" />
                    <span>{tr("Carburant :")} {tr(vehicle.specs.fuel)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#191C1F] font-bold">
                    <Briefcase className="w-4 h-4 text-[#2C3E56]" />
                    <span>{tr(vehicle.specs.luggage)} {tr("Grandes Valises")}</span>
                  </div>
                </div>
              </div>

              {/* Features Equipment list */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#727D88]">
                  {tr("Équipements Inclus à Bord")}
                </h4>
                <div className="space-y-1.5">
                  {vehicle.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-[#4A525A]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{tr(feat)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Price & Booking CTA */}
            <div className="pt-6 border-t border-[#EBE6DC]">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-[11px] text-[#727D88] uppercase font-bold block">
                    {tr("Tarif Journalier Transparent")}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#A84A3B] font-display">
                      {formatPrice(vehicle.pricePerDayTND, currency)}
                    </span>
                    <span className="text-xs text-[#727D88] font-bold">{tr("/ jour")}</span>
                  </div>
                </div>

                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  {tr("Disponible immédiatement")}
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onBook(vehicle);
                }}
                className="w-full py-3.5 bg-[#A84A3B] hover:bg-[#8A372A] text-white rounded-2xl font-extrabold text-sm shadow-[0_8px_20px_rgba(168,74,59,0.35)] transition-all flex items-center justify-center gap-2"
              >
                <span>{tr("Continuer avec ce modèle")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
