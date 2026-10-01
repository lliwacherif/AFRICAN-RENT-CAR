import { useText } from '../../context/LanguageContext'
import React, { useState } from 'react';
import { Star, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreFleet?: () => void;
  onExploreChauffeur?: () => void;
  onExploreStays?: () => void;
  children?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({ onExploreFleet, onExploreChauffeur, onExploreStays, children }) => {
  const tr = useText()

  const heroBackgrounds = [
    { id: 'amg-crimson', label: 'AMG Ciel Rouge Flamboyant', src: '/hero-crimson-amg.jpg' },
    { id: 'sportback-crimson', label: 'Sportback Crépuscule', src: '/hero-crimson-sportback.jpg' },
    { id: 'sedan-golden', label: 'Berline Dorée', src: '/hero-luxury-sedan.jpg' },
    { id: 'suv-panorama', label: 'SUV Panorama', src: '/hero-luxury-suv.jpg' },
    { id: 'bmw-sport', label: 'BMW Sport', src: '/hero-fallback.jpg' },
  ];

  const [bgSrc, setBgSrc] = useState<string>('/hero-crimson-amg.jpg');

  return (
    <section id="hero" className="relative w-full overflow-hidden bg-[#121820] border-b border-white/15 min-h-[680px] lg:min-h-[760px] flex items-center justify-start">
      {/* 1. Full-Screen Cinematic Backdrop Car Picture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <img
          src={bgSrc}
          alt={tr("African Rent Car - Mobilité d'Exception")}
          onError={() => {
            if (bgSrc !== '/hero-fallback.jpg') {
              setBgSrc('/hero-fallback.jpg');
            }
          }}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center lg:object-[78%_center] scale-100 filter brightness-105 contrast-[1.03] transition-all duration-700"
        />
        {/* Soft left-side readability gradient: preserves vehicle visibility while ensuring crisp text contrast on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141B26]/90 via-[#141B26]/70 to-transparent sm:w-[85%] lg:w-[60%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141B26]/80 via-transparent to-black/20" />
      </div>

      {/* Subtle warm radiant red glow matching brand color #A84A3B */}
      <div className="absolute top-[-60px] right-24 w-[650px] h-[550px] bg-gradient-to-b from-[#A84A3B]/20 via-[#A84A3B]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[-80px] left-10 w-[550px] h-[450px] bg-gradient-to-b from-[#A84A3B]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Left-Aligned Hero Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <div className="max-w-3xl lg:max-w-[820px] flex flex-col items-start text-left">
          {/* Category Pill: Clean Frosted Glass */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/20 text-xs font-bold tracking-wide uppercase text-white shadow-sm mb-3 sm:mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#A84A3B]" />
            <span>{tr("MOBILITÉ GLOBALE & SÉJOURS DE RÊVE EN TUNISIE")}</span>
          </div>

          {/* Main Title (Left-aligned) - Clean, high contrast */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.14] text-white drop-shadow-sm font-display">
            {tr("Votre voyage complet en Tunisie :")}{' '}
            <span className="text-white font-black">
              {tr("Voitures, Chauffeurs Privés & Hébergements.")}
            </span>
          </h1>

          {/* Subtitle (Left-aligned) */}
          <p className="mt-3 text-xs sm:text-sm md:text-base text-white/85 font-medium leading-relaxed max-w-2xl">
            {tr("Location de véhicules sans caution démesurée, transferts aéroport avec accueil VIP, et privatisation de villas avec piscine.")}
          </p>

          {/* Clean Unified Trust Badges: Coherent White & Red Brand Palette */}
          <div className="mt-4 flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 text-xs">
            <div className="bg-black/35 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 text-white flex items-center gap-2 font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#A84A3B]" />
              <span>{tr("Chauffeurs VIP Vérifiés")}</span>
            </div>
            <div className="bg-black/35 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 text-white flex items-center gap-1.5 font-bold shadow-sm">
              <Star className="w-3.5 h-3.5 fill-[#A84A3B] text-[#A84A3B]" />
              <span>{tr("4.96/5 (1 200+ avis)")}</span>
            </div>
            <div className="bg-black/35 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 text-white flex items-center gap-1.5 font-bold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-white/90" />
              <span>{tr("0 € Caution Abusive")}</span>
            </div>
          </div>

          {/* THE SEARCH BAR AS IT IS - Translucent Apple Glass Console on the Left */}
          <div className="mt-6 w-full text-left">
            {tr(children)}
          </div>
        </div>
      </div>

      {/* Subtle Ambiance Switcher Pill for User Exploration */}
      <div className="absolute bottom-4 right-4 sm:right-8 z-20 hidden md:flex items-center gap-1.5 p-1 rounded-full bg-black/45 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white shadow-xl">
        <span className="pl-3 pr-1 text-white/60 uppercase tracking-wider text-[9px] font-extrabold">{tr("Ambiance :")}</span>
        {heroBackgrounds.map((bg) => (
          <button
            key={bg.id}
            type="button"
            onClick={() => setBgSrc(bg.src)}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              bgSrc === bg.src
                ? 'bg-[#A84A3B] text-white shadow-md font-black'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {tr(bg.label)}
          </button>
        ))}
      </div>
    </section>
  );
};

