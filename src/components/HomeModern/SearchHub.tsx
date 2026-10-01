import { useText } from '../../context/LanguageContext'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  UserCheck, 
  Home as HomeIcon, 
  Compass, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  ArrowRightLeft, 
  Search, 
  Check, 
  Sparkles, 
  SlidersHorizontal, 
  ChevronDown, 
  Navigation, 
  Briefcase, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { ServiceType, Currency, ChauffeurTripType } from '../types';
import { AGENCIES, CHAUFFEUR_ROUTES, formatPrice } from '../data/mockData';
import { parcsService } from '../../services/vehiclesService';

interface SearchHubProps {
  currency: Currency;
  onSearch: (params: any) => void;
}

export const SearchHub: React.FC<SearchHubProps> = ({ currency, onSearch }) => {
  const tr = useText()

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ServiceType>('cars');
  const [parcs, setParcs] = useState<any[]>([]);

  // Calculate dynamic dates
  const todayStr = new Date().toISOString().split('T')[0];
  const inSevenDaysStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const inThreeDaysStr = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  // Tab 1: Cars Search State
  const [pickupLocation, setPickupLocation] = useState('tunis-carthage');
  const [returnLocation, setReturnLocation] = useState('tunis-carthage');
  const [sameLocation, setSameLocation] = useState(true);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState(inSevenDaysStr);
  const [returnTime, setReturnTime] = useState('10:00');
  const [driverAge, setDriverAge] = useState<'25+' | '21-24'>('25+');
  const [carTypeFilter, setCarTypeFilter] = useState<string>('all');

  // Tab 2: Chauffeur Privé (Point A -> Point B) State
  const [tripType, setTripType] = useState<ChauffeurTripType>('one_way');
  const [pickupPointA, setPickupPointA] = useState('Aéroport Tunis-Carthage (TUN)');
  const [destinationB, setDestinationB] = useState('Hammamet Sud & Yasmine');
  const [chauffeurDate, setChauffeurDate] = useState(todayStr);
  const [chauffeurTime, setChauffeurTime] = useState('14:30');
  const [passengersCount, setPassengersCount] = useState('2 passagers');
  const [luggageCount, setLuggageCount] = useState('2 valises');
  const [chauffeurHours, setChauffeurHours] = useState('4 heures');

  // Tab 3: Stays Search State
  const [stayDestination, setStayDestination] = useState('Djerba');
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(inSevenDaysStr);
  const [guestsCount, setGuestsCount] = useState('2 adultes, 1 enfant');
  const [propertyType, setPropertyType] = useState('Villa avec piscine privée');

  // Tab 4: Tours Search State
  const [tourRegion, setTourRegion] = useState('Sahara & Tozeur');
  const [tourDate, setTourDate] = useState(inThreeDaysStr);
  const [tourParticipants, setTourParticipants] = useState('2 personnes');
  const [tourTheme, setTourTheme] = useState('Raid 4x4 Dunes & Oasis');

  // Load actual backend parcs
  useEffect(() => {
    parcsService.getAll()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setParcs(data);
        }
      })
      .catch(() => {});
  }, []);

  // Calculate rental duration in days
  const calculateDays = () => {
    try {
      const d1 = new Date(pickupDate).getTime();
      const d2 = new Date(returnDate).getTime();
      const diff = Math.round((d2 - d1) / (1000 * 3600 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 7;
    }
  };

  const daysCount = calculateDays();

  // Instant chauffeur fare estimation helper
  const getEstimatedChauffeurPrice = () => {
    const matchedRoute = CHAUFFEUR_ROUTES.find(
      (r) => r.from.includes(pickupPointA.split(' ')[0]) || r.to.includes(destinationB.split(' ')[0])
    );
    const base = matchedRoute ? matchedRoute.basePriceTND : 95;
    if (tripType === 'round_trip') return Math.round(base * 1.85);
    if (tripType === 'hourly') {
      const hrs = parseInt(chauffeurHours) || 4;
      return hrs * 45;
    }
    return base;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'cars') {
      const selectedAg = AGENCIES.find((a) => a.id === pickupLocation);
      const locName = selectedAg ? selectedAg.name : pickupLocation;
      const matchedParc = parcs.find(
        (p) => p._id === pickupLocation || p.city?.toLowerCase() === selectedAg?.city?.toLowerCase() || p.name?.toLowerCase().includes(pickupLocation)
      );

      const params = new URLSearchParams({
        location: locName,
        ...(matchedParc ? { parcId: matchedParc._id } : {}),
        pickupDate,
        dropoffDate: returnDate,
        driverAge: driverAge === '25+' ? '25' : '21',
      });
      navigate(`/voitures?${params.toString()}`);
    } else if (activeTab === 'chauffeur') {
      onSearch({
        type: 'chauffeur',
        tripType,
        pickupPointA,
        destinationB,
        chauffeurDate,
        chauffeurTime,
        passengersCount,
        luggageCount,
        chauffeurHours,
        estimatedPriceTND: getEstimatedChauffeurPrice(),
      });
    } else if (activeTab === 'stays') {
      const params = new URLSearchParams();
      if (stayDestination && stayDestination !== 'Toutes les villes') {
        params.set('city', stayDestination);
      }
      if (checkInDate) params.set('checkIn', checkInDate);
      if (checkOutDate) params.set('checkOut', checkOutDate);
      const parsedGuests = parseInt(guestsCount) || 2;
      params.set('guests', String(parsedGuests));
      navigate(`/appartements?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      if (tourTheme && tourTheme !== 'Toutes les catégories') params.set('category', tourTheme);
      if (tourRegion && tourRegion !== 'Toutes les régions') params.set('city', tourRegion);
      if (tourDate) params.set('date', tourDate);
      navigate(`/excursions?${params.toString()}`);
    }
  };

  return (
    <div id="search-hub" className="relative z-20 w-full">
      {/* Container: Authentic See-Through Apple Frosted Glass with specular reflections */}
      <div className="apple-glass rounded-3xl p-4 sm:p-5 md:p-6 transition-all">
        {/* The 4 Core Service Tabs: Apple Segmented Control */}
        <div className="flex flex-col gap-3 pb-4 border-b border-white/15">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-black/35 p-1.5 rounded-2xl border border-white/15 backdrop-blur-xl w-full">
            {/* Tab 1: Location de Voitures */}
            <button
              type="button"
              onClick={() => setActiveTab('cars')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'cars'
                  ? 'bg-white text-[#191C1F] shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,1)] border border-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Car className={`w-4 h-4 shrink-0 ${activeTab === 'cars' ? 'text-[#A84A3B]' : 'text-white/80'}`} />
              <span>{tr("1. Voitures")}</span>
            </button>

            {/* Tab 2: Chauffeur Privé (Point A -> Point B) */}
            <button
              type="button"
              onClick={() => setActiveTab('chauffeur')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'chauffeur'
                  ? 'bg-white text-[#191C1F] shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,1)] border border-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserCheck className={`w-4 h-4 shrink-0 ${activeTab === 'chauffeur' ? 'text-[#2C3E56]' : 'text-white/80'}`} />
              <span>{tr("2. Chauffeur")}</span>
            </button>

            {/* Tab 3: Hébergements & Villas */}
            <button
              type="button"
              onClick={() => setActiveTab('stays')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'stays'
                  ? 'bg-white text-[#191C1F] shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,1)] border border-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <HomeIcon className={`w-4 h-4 shrink-0 ${activeTab === 'stays' ? 'text-[#A84A3B]' : 'text-white/80'}`} />
              <span>3. Villas</span>
            </button>

            {/* Tab 4: Circuits & Excursions */}
            <button
              type="button"
              onClick={() => setActiveTab('tours')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'tours'
                  ? 'bg-white text-[#191C1F] shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,1)] border border-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className={`w-4 h-4 shrink-0 ${activeTab === 'tours' ? 'text-[#2C3E56]' : 'text-white/80'}`} />
              <span>{tr("4. Circuits")}</span>
            </button>
          </div>

          {/* Service-specific sub-toggles / badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {activeTab === 'cars' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white/90 hover:text-white">
                  <input
                    type="checkbox"
                    checked={sameLocation}
                    onChange={(e) => setSameLocation(e.target.checked)}
                    className="rounded border-white/30 text-[#A84A3B] focus:ring-[#A84A3B] w-4 h-4 cursor-pointer bg-black/40"
                  />
                  <span>{tr("Restitution même agence")}</span>
                </label>

                <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                  <span>{tr("Âge conducteur :")}</span>
                  <select
                    value={driverAge}
                    onChange={(e) => setDriverAge(e.target.value as any)}
                    className="apple-glass-input rounded-xl px-2.5 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="25+" className="bg-[#141B26] text-white">{tr("25+ ans (Standard)")}</option>
                    <option value="21-24" className="bg-[#141B26] text-white">{tr("21 - 24 ans (Jeune)")}</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'chauffeur' && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {(['one_way', 'round_trip', 'hourly'] as ChauffeurTripType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTripType(t)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      tripType === t
                        ? 'bg-white text-[#191C1F] shadow-sm font-black'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/20'
                    }`}
                  >
                    {tr(t === 'one_way' && 'Trajet simple')}
                    {tr(t === 'round_trip' && 'Aller-Retour')}
                    {tr(t === 'hourly' && 'Mise à disposition')}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'stays' && (
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A84A3B]" />
                  <span>{tr("Piscine privée sans vis-à-vis garantie")}</span>
                </span>
              </div>
            )}

            {activeTab === 'tours' && (
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#A84A3B]" />
                  <span>{tr("4x4 tout-terrain & guide local certifié")}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Forms Container */}
        <form onSubmit={handleFormSubmit} className="mt-4">
          {/* TAB 1: LOCATION DE VOITURES */}
          {activeTab === 'cars' && (
            <div className="space-y-3.5">
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${sameLocation ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3 items-end`}>
                {/* Prise en charge */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Lieu de prise en charge")}</span>
                  </label>
                    <div className="relative">
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full apple-glass-input rounded-2xl px-3.5 py-3 text-sm font-bold text-white appearance-none focus:outline-none transition-all cursor-pointer"
                      >
                        {parcs.length > 0 ? (
                          <>
                            <optgroup label="Nos Parcs & Agences Principaux" className="bg-[#141B26] text-[#C25847] font-bold">
                              {parcs.map((p) => (
                                <option key={p._id} value={p._id} className="bg-[#141B26] text-white">
                                  {tr(p.name)} 🏢
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label={tr("Points Express & Aéroports")} className="bg-[#141B26] text-white/60 font-semibold">
                              {AGENCIES.map((ag) => (
                                <option key={ag.id} value={ag.id} className="bg-[#141B26] text-white">
                                  {tr(ag.name)} {tr(ag.isAirport ? '✈️' : '📍')}
                                </option>
                              ))}
                            </optgroup>
                          </>
                        ) : (
                          AGENCIES.map((ag) => (
                            <option key={ag.id} value={ag.id} className="bg-[#141B26] text-white">
                              {tr(ag.name)} {tr(ag.isAirport ? '✈️' : '📍')}
                            </option>
                          ))
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-white/60 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Restitution (if different) */}
                  {!sameLocation && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-white/80" />
                        <span>{tr("Lieu de restitution")}</span>
                      </label>
                      <div className="relative">
                        <select
                          value={returnLocation}
                          onChange={(e) => setReturnLocation(e.target.value)}
                          className="w-full apple-glass-input rounded-2xl px-3.5 py-3 text-sm font-bold text-white appearance-none focus:outline-none transition-all cursor-pointer"
                        >
                          {parcs.length > 0 ? (
                            <>
                              <optgroup label="Nos Parcs & Agences Principaux" className="bg-[#141B26] text-[#C25847] font-bold">
                                {parcs.map((p) => (
                                  <option key={p._id} value={p._id} className="bg-[#141B26] text-white">
                                    {tr(p.name)} 🏢
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label={tr("Points Express & Aéroports")} className="bg-[#141B26] text-white/60 font-semibold">
                                {AGENCIES.map((ag) => (
                                  <option key={ag.id} value={ag.id} className="bg-[#141B26] text-white">
                                    {tr(ag.name)}
                                  </option>
                                ))}
                              </optgroup>
                            </>
                          ) : (
                            AGENCIES.map((ag) => (
                              <option key={ag.id} value={ag.id} className="bg-[#141B26] text-white">
                                {tr(ag.name)}
                              </option>
                            ))
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 text-white/60 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  )}

                {/* Date & Heure Début */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Départ & Heure")}</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="col-span-3 apple-glass-input rounded-xl px-2.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none"
                    />
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="col-span-2 apple-glass-input rounded-xl px-1.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date & Heure Retour */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/80" />
                      <span>{tr("Retour & Heure")}</span>
                    </label>
                    <span className="text-[10px] font-bold text-white bg-[#A84A3B] px-2 py-0.5 rounded-full shadow-sm">
                      {tr(daysCount)} {tr(daysCount > 1 ? 'jours' : 'jour')}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="col-span-3 apple-glass-input rounded-xl px-2.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none"
                    />
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="col-span-2 apple-glass-input rounded-xl px-1.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="col-span-full pt-1">
                  <button
                    type="submit"
                    className="w-full bg-[#A84A3B] hover:bg-[#933F32] active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-2xl shadow-[0_8px_24px_rgba(168,74,59,0.35)] transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    <Search className="w-5 h-5 text-white/95" />
                    <span>{tr("Trouver une voiture disponible")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOITURE AVEC CHAUFFEUR PRIVÉ (A -> B) */}
          {activeTab === 'chauffeur' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                {/* Point de départ A */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Point de départ A")}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickupPointA}
                      onChange={(e) => setPickupPointA(e.target.value)}
                      placeholder={tr("Aéroport, Hôtel, Adresse...")}
                      className="w-full apple-glass-input rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none transition-colors placeholder:text-white/40"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/15 text-white border border-white/20 flex items-center justify-center text-xs font-black">
                      A
                    </div>
                  </div>
                </div>

                {/* Destination B */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr(tripType === 'hourly' ? 'Mise à disposition' : 'Destination B')}</span>
                  </label>
                  <div className="relative">
                    {tripType === 'hourly' ? (
                      <select
                        value={chauffeurHours}
                        onChange={(e) => setChauffeurHours(e.target.value)}
                        className="w-full apple-glass-input rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white appearance-none focus:outline-none cursor-pointer"
                      >
                        <option value="2 heures" className="bg-[#141B26] text-white">{tr("2 Heures (90 TND)")}</option>
                        <option value="4 heures" className="bg-[#141B26] text-white">{tr("Demi-journée 4h (180 TND)")}</option>
                        <option value="8 heures" className="bg-[#141B26] text-white">{tr("Journée 8h (320 TND)")}</option>
                        <option value="12 heures" className="bg-[#141B26] text-white">{tr("Grand circuit 12h (450 TND)")}</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={destinationB}
                        onChange={(e) => setDestinationB(e.target.value)}
                        placeholder={tr("Hôtel, Quartier d'arrivée...")}
                        className="w-full apple-glass-input rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none transition-colors placeholder:text-white/40"
                      />
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#A84A3B] text-white flex items-center justify-center text-xs font-black">
                      B
                    </div>
                  </div>
                </div>

                {/* Date & Heure */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Prise en charge")}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={chauffeurDate}
                      onChange={(e) => setChauffeurDate(e.target.value)}
                      className="apple-glass-input rounded-xl px-2 py-2.5 text-xs font-bold text-white focus:outline-none"
                    />
                    <input
                      type="time"
                      value={chauffeurTime}
                      onChange={(e) => setChauffeurTime(e.target.value)}
                      className="apple-glass-input rounded-xl px-2 py-2.5 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Passagers & Bagages */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Passagers & Valises")}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={passengersCount}
                      onChange={(e) => setPassengersCount(e.target.value)}
                      className="apple-glass-input rounded-xl px-2 py-2.5 text-xs font-bold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="1 passager" className="bg-[#141B26] text-white">{tr("1 pers.")}</option>
                      <option value="2 passagers" className="bg-[#141B26] text-white">{tr("2 pers.")}</option>
                      <option value="3 passagers" className="bg-[#141B26] text-white">{tr("3 pers.")}</option>
                      <option value="4-7 passagers (Van VIP)" className="bg-[#141B26] text-white">{tr("4-7 pers. (Van VIP)")}</option>
                    </select>
                    <select
                      value={luggageCount}
                      onChange={(e) => setLuggageCount(e.target.value)}
                      className="apple-glass-input rounded-xl px-2 py-2.5 text-xs font-bold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="1 valise" className="bg-[#141B26] text-white">{tr("1 valise")}</option>
                      <option value="2 valises" className="bg-[#141B26] text-white">{tr("2 valises")}</option>
                      <option value="3-4 valises" className="bg-[#141B26] text-white">{tr("3-4 valises")}</option>
                      <option value="5+ valises" className="bg-[#141B26] text-white">{tr("5+ valises")}</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <div className="col-span-full pt-1">
                  <button
                    type="submit"
                    className="w-full bg-[#2C3E56] hover:bg-[#223145] active:scale-[0.99] text-white font-black py-3.5 px-4 rounded-2xl shadow-[0_8px_24px_rgba(44,62,86,0.35)] transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    <UserCheck className="w-5 h-5 text-white/95" />
                    <span>{tr("Réserver mon chauffeur (Dès")} {formatPrice(getEstimatedChauffeurPrice(), currency)} {tr("fixe)")}</span>
                  </button>
                </div>
              </div>

              {/* Quick transfer chips */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-white/70 font-bold text-[11px]">{tr("Directs :")}</span>
                {CHAUFFEUR_ROUTES.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setPickupPointA(r.from);
                      setDestinationB(r.to);
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-colors text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm backdrop-blur-md"
                  >
                    <span>{tr(r.from.split(' ')[0])} ➔ {tr(r.to.split(' ')[0])}</span>
                    <span className="font-bold text-white/90">({formatPrice(r.basePriceTND, currency)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HÉBERGEMENTS & VILLAS */}
          {activeTab === 'stays' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Destination en Tunisie")}</span>
                  </label>
                  <select
                    value={stayDestination}
                    onChange={(e) => setStayDestination(e.target.value)}
                    className="w-full apple-glass-input rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="Djerba" className="bg-[#141B26] text-white">{tr("Djerba (Villas avec piscine privée)")}</option>
                    <option value="Hammamet" className="bg-[#141B26] text-white">{tr("Hammamet (Villas mer & golf)")}</option>
                    <option value="Tunis-Marsa" className="bg-[#141B26] text-white">La Marsa / Gammarth / Sidi Bou Saïd</option>
                    <option value="Sousse" className="bg-[#141B26] text-white">Sousse & Port El Kantaoui</option>
                    <option value="Tabarka" className="bg-[#141B26] text-white">Tabarka & Aïn Draham (Nature)</option>
                    <option value="Bizerte" className="bg-[#141B26] text-white">{tr("Bizerte (Maisons de charme)")}</option>
                  </select>
                </div>

                {/* Type de bien */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <HomeIcon className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Type de bien recherché")}</span>
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full apple-glass-input rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="Villa avec piscine privée" className="bg-[#141B26] text-white">{tr("Villa d'architecte avec piscine")}</option>
                    <option value="Appartement standing vue mer" className="bg-[#141B26] text-white">{tr("Appartement grand standing vue mer")}</option>
                    <option value="Maison traditionnelle de charme" className="bg-[#141B26] text-white">{tr("Darna de charme / Maison d'hôtes")}</option>
                    <option value="Lodge & Spa nature" className="bg-[#141B26] text-white">{tr("Lodge panoramique & Spa")}</option>
                  </select>
                </div>

                {/* Dates Check-in / Check-out */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Arrivée & Départ")}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="apple-glass-input rounded-xl px-2 py-2.5 text-xs font-bold text-white focus:outline-none"
                    />
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="apple-glass-input rounded-xl px-2 py-2.5 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Voyageurs */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Voyageurs")}</span>
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    className="w-full apple-glass-input rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="2 personnes (1 chambre)" className="bg-[#141B26] text-white">{tr("2 personnes (1 chambre)")}</option>
                    <option value="4 personnes (2 chambres)" className="bg-[#141B26] text-white">{tr("4 personnes (2 chambres)")}</option>
                    <option value="6 personnes (3 chambres)" className="bg-[#141B26] text-white">{tr("6 personnes (3 chambres)")}</option>
                    <option value="8+ personnes (Villa complète)" className="bg-[#141B26] text-white">{tr("8+ personnes (Villa privée)")}</option>
                  </select>
                </div>

                {/* Action button */}
                <div className="col-span-full pt-1">
                  <button
                    type="submit"
                    className="w-full bg-[#A84A3B] hover:bg-[#933F32] active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-2xl shadow-[0_8px_24px_rgba(168,74,59,0.35)] transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    <Search className="w-5 h-5 text-white/95" />
                    <span>{tr("Découvrir les villas & séjours")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CIRCUITS & EXCURSIONS */}
          {activeTab === 'tours' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                {/* Région */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Région d'aventure")}</span>
                  </label>
                  <select
                    value={tourRegion}
                    onChange={(e) => setTourRegion(e.target.value)}
                    className="w-full apple-glass-input rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="Sahara & Tozeur" className="bg-[#141B26] text-white">{tr("Grand Sud : Tozeur & Douz")}</option>
                    <option value="Ksar Ghilane & Tembaine" className="bg-[#141B26] text-white">{tr("Dunes de Ksar Ghilane")}</option>
                    <option value="Cap Bon & El Haouaria" className="bg-[#141B26] text-white">{tr("Cap Bon & Criques")}</option>
                    <option value="Tataouine Ksours" className="bg-[#141B26] text-white">{tr("Ksour de Tataouine")}</option>
                  </select>
                </div>

                {/* Thématique */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Type d'expédition")}</span>
                  </label>
                  <select
                    value={tourTheme}
                    onChange={(e) => setTourTheme(e.target.value)}
                    className="w-full apple-glass-input rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="Raid 4x4 Dunes & Oasis" className="bg-[#141B26] text-white">{tr("Raid 4x4 Dunes & Oasis")}</option>
                    <option value="Road Trip Culture & Patrimoine" className="bg-[#141B26] text-white">{tr("Road Trip Culture & Histoire")}</option>
                    <option value="Nuit Royale sous les étoiles" className="bg-[#141B26] text-white">{tr("Campement Royal Saharien")}</option>
                  </select>
                </div>

                {/* Date souhaitée */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/80" />
                    <span>{tr("Date souhaitée")}</span>
                  </label>
                  <input
                    type="date"
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full apple-glass-input rounded-xl px-2.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none"
                  />
                </div>

                {/* Participants */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-white/80" />
                    <span>Participants</span>
                  </label>
                  <select
                    value={tourParticipants}
                    onChange={(e) => setTourParticipants(e.target.value)}
                    className="w-full apple-glass-input rounded-xl px-2.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="1 personne" className="bg-[#141B26] text-white">{tr("1 aventurier")}</option>
                    <option value="2 personnes" className="bg-[#141B26] text-white">{tr("2 personnes")}</option>
                    <option value="3-4 personnes" className="bg-[#141B26] text-white">{tr("Famille (3-4 pers.)")}</option>
                    <option value="Groupe 5-8 personnes" className="bg-[#141B26] text-white">{tr("Groupe privé (5-8 pers.)")}</option>
                  </select>
                </div>

                {/* Action button */}
                <div className="col-span-full pt-1">
                  <button
                    type="submit"
                    className="w-full bg-[#2C3E56] hover:bg-[#223145] active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-2xl shadow-[0_8px_24px_rgba(44,62,86,0.35)] transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    <Search className="w-5 h-5 text-white/95" />
                    <span>{tr("Explorer les circuits en Tunisie")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
