import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Car, 
  Home as HomeIcon, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Percent
} from 'lucide-react';
import { ComboPackage, Currency } from '../types';
import { COMBO_PACKAGES, formatPrice } from '../data/mockData';

interface ComboPackagesProps {
  currency: Currency;
  onSelectPackage: (pkg: ComboPackage) => void;
}

export const ComboPackages: React.FC<ComboPackagesProps> = ({
  currency,
  onSelectPackage,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({
    'package-djerba': 0,
    'package-tabarka': 0,
    'package-sahara': 0,
  });

  const nextImage = (pkgId: string, max: number) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [pkgId]: ((prev[pkgId] || 0) + 1) % max,
    }));
  };

  const prevImage = (pkgId: string, max: number) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [pkgId]: ((prev[pkgId] || 0) - 1 + max) % max,
    }));
  };

  return (
    <section id="combo-packages" className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 mb-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formules Fusion Exclusives</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191C1F] tracking-tight font-display">
            Packs Voiture + Hébergement d'Exception
          </h2>
          <p className="mt-2 text-base text-[#4A525A] font-medium max-w-xl">
            La synergie parfaite : combinez un véhicule de prestige et une villa ou lodge privatisé en Tunisie, avec tarif préférentiel tout-en-un.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F8F7EE] p-2 rounded-2xl border border-[#EBE6DC] text-xs font-bold text-[#2C3E56]">
          <Percent className="w-4 h-4 text-[#A84A3B]" />
          <span>Jusqu'à -20% d'économie par rapport aux réservations séparées</span>
        </div>
      </div>

      {/* Grid of 3 High-End Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {COMBO_PACKAGES.map((pkg) => {
          const currentImgIdx = activeImageIndex[pkg.id] || 0;

          return (
            <div
              key={pkg.id}
              className="group bg-white rounded-3xl border border-[#EBE6DC] overflow-hidden shadow-[0_15px_35px_rgba(44,62,86,0.06)] hover:shadow-[0_25px_50px_rgba(44,62,86,0.12)] hover:border-[#DAD3C5] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Image Carousel */}
                <div className="relative aspect-[16/11] overflow-hidden bg-[#2C3E56]">
                  <img
                    src={pkg.images[currentImgIdx]}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#191C1F]/80 via-transparent to-black/20" />

                  {/* Top discount and destination badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-xl bg-[#A84A3B] text-white text-xs font-black uppercase tracking-wider shadow-md">
                      {pkg.discountBadge}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[#2C3E56] text-xs font-bold shadow-sm flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#A84A3B]" />
                      <span>{pkg.destination}</span>
                    </span>
                  </div>

                  {/* Carousel navigation buttons */}
                  {pkg.images.length > 1 && (
                    <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage(pkg.id, pkg.images.length);
                        }}
                        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#191C1F] flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
                        aria-label="Image précédente"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage(pkg.id, pkg.images.length);
                        }}
                        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#191C1F] flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
                        aria-label="Image suivante"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Bottom Duration Badge */}
                  <div className="absolute bottom-4 left-4 text-white z-10">
                    <span className="text-xs font-bold bg-[#2C3E56]/90 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      {pkg.duration}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6">
                  <h3 className="text-xl font-extrabold text-[#191C1F] mb-2 font-display group-hover:text-[#A84A3B] transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A525A] mb-4 leading-relaxed line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Inclusions Box */}
                  <div className="bg-[#F8F7EE] p-3.5 rounded-2xl border border-[#EBE6DC] mb-4 space-y-2">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-[#191C1F]">
                      <div className="w-6 h-6 rounded-lg bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center">
                        <Car className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{pkg.carIncluded}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-bold text-[#191C1F]">
                      <div className="w-6 h-6 rounded-lg bg-[#2C3E56]/10 text-[#2C3E56] flex items-center justify-center">
                        <HomeIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{pkg.stayIncluded}</span>
                    </div>
                  </div>

                  {/* Highlights checklist */}
                  <ul className="space-y-1.5 mb-4">
                    {pkg.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#4A525A]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer with Price & Reservation CTA */}
              <div className="p-6 pt-0 border-t border-[#EBE6DC]/60 flex items-center justify-between gap-4 mt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs line-through text-[#727D88]">
                      {formatPrice(pkg.originalPriceTND, currency)}
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                      Économie
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#A84A3B] font-display">
                      {formatPrice(pkg.priceTotalTND, currency)}
                    </span>
                    <span className="text-xs text-[#727D88] font-semibold">/ séjour</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="bg-[#A84A3B] hover:bg-[#8A372A] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 transform active:scale-95"
                >
                  <span>Réserver le Pack</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
