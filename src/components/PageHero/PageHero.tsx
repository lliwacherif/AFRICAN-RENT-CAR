import React, { useState } from 'react';
import { Sparkles, Star, ShieldCheck, Compass, Car, Home as HomeIcon } from 'lucide-react';

interface PageHeroProps {
  page: 'voitures' | 'hebergement' | 'excursions' | 'combos';
  onNavigateHome?: () => void;
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({ page, onNavigateHome, children }) => {
  const pageConfigs = {
    voitures: {
      badge: 'FLOTTE AUTOMOBILE EXCLUSIVE 2025 / 2026',
      badgeIcon: Car,
      titlePrefix: 'Louez un véhicule récent ',
      titleHighlight: 'sans caution démesurée.',
      subtitle: 'Berlines affaires, SUV d\'aventure et compactes chic révisées en 40 points, livrées directement au terminal aéroport ou à votre hôtel.',
      image: '/hero-fallback.jpg',
      trustBadges: [
        { label: 'Contrôles 40 Points', icon: ShieldCheck },
        { label: '4.98/5 Satisfaction', icon: Star },
        { label: 'Prise Express 5 min', icon: Sparkles },
      ],
    },
    hebergement: {
      badge: 'DEMEURES & VILLAS DE PRESTIGE EN TUNISIE',
      badgeIcon: HomeIcon,
      titlePrefix: 'Séjournez dans les plus somptueuses ',
      titleHighlight: 'villas avec piscine privée.',
      subtitle: 'Villas d\'architecte avec piscine lagon à Djerba, La Marsa, Hammamet et lodges de Tabarka. Chaque résidence est inspectée et certifiée.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80',
      trustBadges: [
        { label: 'Piscines Privatisées', icon: Sparkles },
        { label: '4.96/5 Évaluations', icon: Star },
        { label: 'Conciergerie Dédiée 24/7', icon: ShieldCheck },
      ],
    },
    excursions: {
      badge: 'CIRCUITS SAHARIENS & EXPÉDITIONS D\'EXCEPTION',
      badgeIcon: Compass,
      titlePrefix: 'Découvrez la Tunisie secrète : ',
      titleHighlight: 'Sahara, Oasis & Cités Antiques.',
      subtitle: 'Franchissement des dunes dorées en 4x4 Land Cruiser, nuit sous les étoiles à Ksar Ghilane et visites culturelles privées avec guides certifiés.',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1800&q=80',
      trustBadges: [
        { label: 'Flotte 4x4 Tout-Terrain', icon: ShieldCheck },
        { label: 'Guides Bilingues Certifiés', icon: Star },
        { label: 'Bivouac Nomade VIP', icon: Sparkles },
      ],
    },
    combos: {
      badge: 'FORMULES FUSION VOITURE + HÉBERGEMENT (-15%)',
      badgeIcon: Sparkles,
      titlePrefix: 'La synergie parfaite : ',
      titleHighlight: 'Votre villa et votre voiture tout-en-un.',
      subtitle: 'Économisez jusqu\'à -20% en réservant votre villa avec piscine et votre véhicule de prestige dans un forfait unique sans tracas.',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1800&q=80',
      trustBadges: [
        { label: 'Jusqu\'à -20% d\'Économie', icon: Sparkles },
        { label: 'Contrat Unique Clé en Main', icon: ShieldCheck },
        { label: 'Assistance VIP Privée', icon: Star },
      ],
    },
  };

  const config = pageConfigs[page] || pageConfigs.voitures;
  const BadgeIcon = config.badgeIcon;
  const [imgSrc, setImgSrc] = useState(config.image);

  return (
    <section className="relative w-full overflow-hidden bg-[#121820] border-b border-white/15 min-h-[480px] lg:min-h-[540px] flex items-center justify-start">
      {/* 1. Cinematic Backdrop Picture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <img
          src={imgSrc}
          alt={config.titleHighlight}
          onError={() => {
            if (imgSrc !== '/hero-fallback.jpg') {
              setImgSrc('/hero-fallback.jpg');
            }
          }}
          className="w-full h-full object-cover object-center filter brightness-105 contrast-[1.03]"
        />
        {/* Soft left-side readability gradient: preserves vehicle/location visibility while ensuring crisp contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141B26]/95 via-[#141B26]/75 to-transparent sm:w-[85%] lg:w-[62%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141B26]/85 via-transparent to-black/25" />
      </div>

      {/* Subtle radiant red glow matching brand color #A84A3B */}
      <div className="absolute top-[-60px] right-24 w-[650px] h-[550px] bg-gradient-to-b from-[#A84A3B]/20 via-[#A84A3B]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[-80px] left-10 w-[550px] h-[450px] bg-gradient-to-b from-[#A84A3B]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Left-Aligned Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <div className="max-w-3xl lg:max-w-[820px] flex flex-col items-start text-left">
          {/* Breadcrumb / Return Link */}
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors mb-3 font-semibold cursor-pointer group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Retour à l'accueil principal</span>
            </button>
          )}

          {/* Category Pill: Clean Frosted Glass */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/20 text-xs font-bold tracking-wide uppercase text-white shadow-xs mb-3 sm:mb-4">
            <BadgeIcon className="w-3.5 h-3.5 text-[#A84A3B]" />
            <span>{config.badge}</span>
          </div>

          {/* Main Title (Left-aligned) - Clean, high contrast */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.14] text-white drop-shadow-xs font-display">
            {config.titlePrefix}{' '}
            <span className="text-white font-black">
              {config.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-xs sm:text-sm md:text-base text-white/85 font-medium leading-relaxed max-w-2xl">
            {config.subtitle}
          </p>

          {/* Clean Unified Trust Badges: Coherent White & Red Brand Palette with Apple Glass */}
          <div className="mt-4 flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 text-xs">
            {config.trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className="bg-black/35 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 text-white flex items-center gap-2 font-bold shadow-xs"
                >
                  <Icon className="w-3.5 h-3.5 text-[#A84A3B]" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>

          {/* Optional Children Console / Filter */}
          {children && (
            <div className="mt-6 w-full text-left">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
