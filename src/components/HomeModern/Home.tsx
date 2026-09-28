import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Hero } from './Hero';
import { SearchHub } from './SearchHub';
import { TrustBenefits } from './TrustBenefits';
import { BentoFleet } from './BentoFleet';
import { ChauffeurServiceSection } from './ChauffeurServiceSection';
import { AccommodationsSection } from './AccommodationsSection';
import { ComboPackages } from './ComboPackages';
import { SocialProof } from './SocialProof';
import { MobileAppSection } from './MobileAppSection';
import { Footer } from './Footer';
import { VehicleQuickViewModal } from './VehicleQuickViewModal';
import { SearchResultsModal } from './SearchResultsModal';
import { AIConciergeModal } from './AIConciergeModal';
import { Currency, Vehicle, ComboPackage, ChauffeurRoute, Accommodation } from '../types';
import { Sparkles, MessageSquare } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<Currency>('TND');
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [selectedPackageForModal, setSelectedPackageForModal] = useState<ComboPackage | null>(null);
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<ChauffeurRoute | null>(null);
  const [selectedAccommodationForModal, setSelectedAccommodationForModal] = useState<Accommodation | null>(null);
  const [searchParamsForModal, setSearchParamsForModal] = useState<any | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  // Triggered when user submits search in SearchHub (e.g. chauffeur or package)
  const handleSearch = (params: any) => {
    setSelectedVehicleForModal(null);
    setSelectedPackageForModal(null);
    setSelectedRouteForModal(null);
    setSelectedAccommodationForModal(null);
    setSearchParamsForModal(params);
    setIsSearchModalOpen(true);
  };

  // Triggered when user clicks "Inspection 3D" on a vehicle card
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForModal(vehicle);
  };

  // Triggered when user clicks "Réserver maintenant" on a vehicle card
  const handleBookVehicle = (vehicle: Vehicle) => {
    navigate(`/voitures?category=${encodeURIComponent(vehicle.category)}`);
  };

  // Triggered when user clicks "Réserver" on a chauffeur route
  const handleBookRoute = (route: ChauffeurRoute) => {
    setSelectedVehicleForModal(null);
    setSelectedPackageForModal(null);
    setSelectedRouteForModal(route);
    setSelectedAccommodationForModal(null);
    setSearchParamsForModal({
      type: 'chauffeur',
      pickupPointA: route.from,
      destinationB: route.to,
      estimatedPriceTND: route.basePriceTND,
      passengersCount: '2 passagers',
    });
    setIsSearchModalOpen(true);
  };

  // Triggered when user clicks "Réserver ce séjour" on an accommodation card
  const handleBookAccommodation = (acc: Accommodation) => {
    navigate(`/appartements?city=${encodeURIComponent(acc.location)}`);
  };

  // Triggered when user clicks "Réserver le Pack" on combo package card
  const handleSelectPackage = (pkg: ComboPackage) => {
    setSelectedVehicleForModal(null);
    setSelectedPackageForModal(pkg);
    setSelectedRouteForModal(null);
    setSelectedAccommodationForModal(null);
    setSearchParamsForModal({
      type: 'package',
      pickupLocation: 'djerba-zarzis',
      pickupDate: '2026-09-25',
      returnDate: '2026-10-02',
      daysCount: 7,
    });
    setIsSearchModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#191C1F] font-sans antialiased selection:bg-[#A84A3B]/15 selection:text-[#8A372A]">
      {/* 1. Header with dynamic currency & language switcher */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenQuickSearch={() => {
          const el = document.getElementById('search-hub');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Sections */}
      <main>
        {/* 2. Cinematic Hero Section with Central Integrated Search Hub */}
        <Hero
          onExploreFleet={() => {
            const el = document.getElementById('bento-fleet');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreChauffeur={() => {
            const el = document.getElementById('chauffeur-service');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreStays={() => {
            const el = document.getElementById('villas-stays');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {/* Search Engine Hub "All-in-One" - Focal Centerpiece of Screen Load */}
          <SearchHub currency={currency} onSearch={handleSearch} />
        </Hero>

        {/* 3. Section "L'Expérience & Engagements African Rent Car" (4 key pillars) */}
        <TrustBenefits />

        {/* 5. Grille Bento "La Flotte African Rent Car" */}
        <BentoFleet
          currency={currency}
          onSelectVehicle={handleSelectVehicle}
          onBookVehicle={handleBookVehicle}
        />

        {/* 6. Section Dédiée : "Service Chauffeur Privé & Transferts VIP" (A -> B) */}
        <ChauffeurServiceSection
          currency={currency}
          onBookRoute={handleBookRoute}
          onCustomChauffeurRequest={() => {
            const el = document.getElementById('search-hub');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 7. Section Dédiée : "Hébergements Sélectionnés & Villas Privées" */}
        <AccommodationsSection
          currency={currency}
          onBookAccommodation={handleBookAccommodation}
          onExploreCombo={() => {
            const el = document.getElementById('combo-packages');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 8. Section Fusion "Voiture + Hébergement" (Combo packages -15%) */}
        <ComboPackages
          currency={currency}
          onSelectPackage={handleSelectPackage}
        />

        {/* 9. Preuve Sociale & Avis Clients Vérifiés (Note 4.9/5, +1200 avis) */}
        <SocialProof />

        {/* 10. Application Mobile & Expérience Digitale (Bluetooth, GPS Chauffeur, Code Villa) */}
        <MobileAppSection />
      </main>

      {/* 11. Pied de Page Ultra-Complet & Répertoire des Agences */}
      <Footer />

      {/* Floating VIP Travel Concierge Button - Apple Glass Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsConciergeOpen(true)}
          className="group flex items-center gap-2.5 apple-glass-dark text-white px-4 py-3 rounded-full shadow-[0_16px_36px_rgba(0,0,0,0.35)] hover:bg-[#1E293B]/90 border border-white/25 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Contacter le Concierge VIP"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/70 leading-none">Concierge VIP</p>
            <p className="text-xs font-black leading-tight">Conseiller Voyage IA</p>
          </div>
        </button>
      </div>

      {/* Vehicle Quick View Modal with 360 Simulator */}
      {selectedVehicleForModal && !isSearchModalOpen && (
        <VehicleQuickViewModal
          vehicle={selectedVehicleForModal}
          currency={currency}
          onClose={() => setSelectedVehicleForModal(null)}
          onBook={(v) => {
            handleBookVehicle(v);
          }}
        />
      )}

      {/* Search Results & Immediate Booking Confirmation Modal */}
      {isSearchModalOpen && (
        <SearchResultsModal
          searchParams={searchParamsForModal}
          selectedVehicle={selectedVehicleForModal}
          selectedPackage={selectedPackageForModal}
          selectedRoute={selectedRouteForModal}
          selectedAccommodation={selectedAccommodationForModal}
          currency={currency}
          onClose={() => {
            setIsSearchModalOpen(false);
            setSelectedVehicleForModal(null);
            setSelectedPackageForModal(null);
            setSelectedRouteForModal(null);
            setSelectedAccommodationForModal(null);
          }}
        />
      )}

      {/* AI VIP Concierge Travel Advisor Modal */}
      <AIConciergeModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
      />
    </div>
  );
};
