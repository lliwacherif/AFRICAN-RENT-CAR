import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Check, 
  ArrowRight,
  Car,
  Home as HomeIcon,
  Compass,
  Phone,
  UserCheck,
  Navigation
} from 'lucide-react';
import { Currency, Vehicle, ComboPackage, ChauffeurRoute, Accommodation } from '../types';
import { formatPrice, AGENCIES } from '../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface SearchResultsModalProps {
  searchParams: any;
  selectedVehicle: Vehicle | null;
  selectedPackage: ComboPackage | null;
  selectedRoute?: ChauffeurRoute | null;
  selectedAccommodation?: Accommodation | null;
  currency: Currency;
  onClose: () => void;
}

export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  searchParams,
  selectedVehicle,
  selectedPackage,
  selectedRoute,
  selectedAccommodation,
  currency,
  onClose,
}) => {
  const { user } = useAuth() as any;
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['Assurance 0 Franchise']);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [customerName, setCustomerName] = useState(user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+216 ');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [flightNumber, setFlightNumber] = useState('');

  const extrasList = [
    { id: 'Assurance 0 Franchise', name: 'Assurance Tous Risques 0 Franchise', priceTND: 0, included: true },
    { id: 'GPS', name: 'GPS Tunisie Offline & Live Trafic', priceTND: 15 },
    { id: 'BabySeat', name: 'Siège Enfant Conforme Isofix', priceTND: 20 },
    { id: 'ExtraDriver', name: 'Conducteur Additionnel Inclus', priceTND: 25 },
    { id: 'VIPDelivery', name: 'Livraison Hôtelière Privée', priceTND: 35 },
  ];

  const toggleExtra = (id: string) => {
    if (id === 'Assurance 0 Franchise') return; // Always included
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Compute duration or price depending on active service
  const days = searchParams?.daysCount || 7;
  const isChauffeur = searchParams?.type === 'chauffeur' || !!selectedRoute;
  const isStay = searchParams?.type === 'stays' || !!selectedAccommodation;
  const isPackage = searchParams?.type === 'package' || !!selectedPackage;

  let grandTotalTND = 0;
  if (selectedRoute) {
    grandTotalTND = selectedRoute.basePriceTND;
  } else if (selectedAccommodation) {
    grandTotalTND = selectedAccommodation.pricePerNightTND * 4; // 4 nights default
  } else if (selectedPackage) {
    grandTotalTND = selectedPackage.priceTotalTND;
  } else if (isChauffeur) {
    grandTotalTND = searchParams?.estimatedPriceTND || 140;
  } else if (isStay) {
    grandTotalTND = 380 * 4;
  } else {
    const baseDailyPrice = selectedVehicle ? selectedVehicle.pricePerDayTND : 140;
    const extrasTotalTND = selectedExtras.reduce((sum, extId) => {
      const item = extrasList.find((e) => e.id === extId);
      return sum + (item ? item.priceTND : 0);
    }, 0);
    grandTotalTND = baseDailyPrice * days + extrasTotalTND;
  }

  const agencyObj = AGENCIES.find((a) => a.id === searchParams?.pickupLocation) || AGENCIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#EBE6DC] relative p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F8F7EE] hover:bg-[#EBE6DC] text-[#191C1F] flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {isConfirmed ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#191C1F] font-display">
              Réservation Enregistrée avec Succès !
            </h2>
            <p className="text-sm text-[#4A525A] max-w-md mx-auto">
              Merci {customerName}. Votre bon de réservation VIP a été généré avec succès. Notre équipe locale vous contacte par WhatsApp sous 5 minutes.
            </p>

            <div className="bg-[#F8F7EE] p-5 rounded-2xl border border-[#EBE6DC] text-left max-w-md mx-auto space-y-2.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-[#727D88]">Numéro de dossier VIP :</span>
                <span className="text-[#A84A3B] font-extrabold">#ARC-2026-9844</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-[#727D88]">Service réservé :</span>
                <span className="text-[#191C1F]">
                  {isChauffeur 
                    ? 'Chauffeur Privé avec accueil aéroport' 
                    : isStay 
                    ? 'Séjour en Villa d\'exception' 
                    : 'Location Véhicule Prestige'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-[#727D88]">Montant total garanti :</span>
                <span className="text-[#191C1F] font-black text-sm">{formatPrice(grandTotalTND, currency)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-[#727D88]">Modalité :</span>
                <span className="text-emerald-700">Règlement au chauffeur ou au comptoir (0€ prélevé maintenant)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 px-8 py-3.5 bg-[#A84A3B] text-white rounded-xl font-black text-sm shadow-md hover:bg-[#8A372A]"
            >
              Fermer et retourner à l'accueil
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] text-xs font-bold uppercase mb-2">
                <span>Confirmation Immédiate • Tarif Fixe Garanti</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#191C1F] font-display">
                {isChauffeur 
                  ? 'Votre Course avec Chauffeur Privé' 
                  : isStay 
                  ? 'Votre Réservation de Séjour' 
                  : 'Détails de votre Location Véhicule'}
              </h2>
            </div>

            {/* Selected Item Summary Card */}
            <div className="bg-[#F8F7EE] p-4 rounded-2xl border border-[#EBE6DC] flex items-center gap-4">
              <img
                src={
                  selectedRoute?.image ||
                  selectedAccommodation?.image ||
                  selectedVehicle?.image ||
                  selectedPackage?.images[0] ||
                  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80'
                }
                alt="Selected"
                className="w-24 h-20 rounded-xl object-cover"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#A84A3B] uppercase">
                  {isChauffeur 
                    ? 'Chauffeur Privé A ➔ B' 
                    : isStay 
                    ? 'Villa & Standing' 
                    : selectedPackage 
                    ? 'Pack Fusion -15%' 
                    : 'Véhicule Certifié'}
                </p>
                <h3 className="font-extrabold text-base text-[#191C1F] truncate">
                  {selectedRoute 
                    ? `${selectedRoute.from} ➔ ${selectedRoute.to}` 
                    : selectedAccommodation 
                    ? selectedAccommodation.title 
                    : selectedPackage 
                    ? selectedPackage.title 
                    : selectedVehicle?.name || 'Porsche Macan GTS'}
                </h3>
                <p className="text-xs text-[#727D88]">
                  {isChauffeur 
                    ? `Véhicule haut de gamme • Accueil pancarte inclus • ${searchParams?.passengersCount || '2 passagers'}` 
                    : isStay 
                    ? `${selectedAccommodation?.location || searchParams?.destination || 'Djerba'} • Piscine & Conciergerie` 
                    : `${days} jours de location • Km inclus`}
                </p>
              </div>
            </div>

            {/* Itinerary / Pick-up Details */}
            {isChauffeur ? (
              <div className="p-4 bg-white rounded-2xl border border-[#EBE6DC] space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#EBE6DC] pb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#2C3E56]" />
                    <span className="font-bold text-[#727D88]">Point de Départ A :</span>
                    <strong className="text-[#191C1F]">
                      {selectedRoute?.from || searchParams?.pickupPointA || 'Aéroport Tunis-Carthage (TUN)'}
                    </strong>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-[#EBE6DC] pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#A84A3B]" />
                    <span className="font-bold text-[#727D88]">Destination B :</span>
                    <strong className="text-[#191C1F]">
                      {selectedRoute?.to || searchParams?.destinationB || 'Hammamet Sud'}
                    </strong>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2C3E56]" />
                    <span className="font-bold text-[#727D88]">Heure & Vol :</span>
                    <strong className="text-[#191C1F]">
                      {searchParams?.chauffeurTime || '14:30'} • Chauffeur en attente à la sortie
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#EBE6DC]">
                  <p className="font-bold text-[#727D88] uppercase text-[10px] mb-1">Prise en charge</p>
                  <p className="font-extrabold text-[#191C1F]">{agencyObj.name}</p>
                  <p className="text-[#4A525A] text-[11px] mt-0.5">
                    Date : {searchParams?.pickupDate || '25 Septembre 2026'} à {searchParams?.pickupTime || '10:00'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#EBE6DC]">
                  <p className="font-bold text-[#727D88] uppercase text-[10px] mb-1">Restitution</p>
                  <p className="font-extrabold text-[#191C1F]">{agencyObj.name}</p>
                  <p className="text-[#4A525A] text-[11px] mt-0.5">
                    Date : {searchParams?.returnDate || '02 Octobre 2026'} à {searchParams?.returnTime || '10:00'}
                  </p>
                </div>
              </div>
            )}

            {/* Flight number for chauffeur or airport rental */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#727D88] block mb-1">
                Numéro de Vol ou Nom pour la Pancarte
              </label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="Ex: Vol TU 721 ou 'M. et Mme Dupont'"
                className="w-full p-3 bg-[#F8F7EE] border border-[#EBE6DC] rounded-xl text-xs font-bold text-[#191C1F] focus:outline-none focus:border-[#A84A3B]"
              />
            </div>

            {/* Contact details */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#727D88]">
                Coordonnées du Passager Principal
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nom & Prénom"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="p-3 bg-[#F8F7EE] border border-[#EBE6DC] rounded-xl text-xs font-bold text-[#191C1F] focus:outline-none focus:border-[#A84A3B]"
                />
                <input
                  type="tel"
                  placeholder="Téléphone / WhatsApp"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="p-3 bg-[#F8F7EE] border border-[#EBE6DC] rounded-xl text-xs font-bold text-[#191C1F] focus:outline-none focus:border-[#A84A3B]"
                />
              </div>
            </div>

            {/* Price & Confirmation */}
            <div className="pt-4 border-t border-[#EBE6DC] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-[#727D88] uppercase font-bold block">
                  Montant Total Fixe Garanti
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#A84A3B] font-display">
                    {formatPrice(grandTotalTND, currency)}
                  </span>
                  <span className="text-xs text-[#727D88] font-bold">TTC</span>
                </div>
              </div>

              <button
                onClick={() => setIsConfirmed(true)}
                className="px-8 py-3.5 bg-[#A84A3B] hover:bg-[#8A372A] text-white rounded-2xl font-extrabold text-sm shadow-[0_8px_20px_rgba(168,74,59,0.30)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Confirmer la Réservation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
