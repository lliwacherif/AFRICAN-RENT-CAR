import { useText } from '../../context/LanguageContext'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Calendar,
  MapPin,
  User,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  Heart,
  Gauge,
  Fuel,
  Users,
  Briefcase,
  Snowflake,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  CreditCard,
  RotateCcw,
  ArrowUpDown,
  ChevronRight,
  Eye,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { vehiclesService, parcsService } from '../../services/vehiclesService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';
import { AIConciergeModal } from '../../components/HomeModern/AIConciergeModal';
import { useWishlist } from '../../context/WishlistContext';

const CATEGORIES = [
  { id: 'all', label: 'Toutes les catégories' },
  { id: 'Économique', label: 'Économique' },
  { id: 'Compacte', label: 'Compacte' },
  { id: 'Berline', label: 'Berline Affaires' },
  { id: 'SUV', label: 'SUV Prestige & 4x4' },
  { id: 'Luxe', label: 'Luxe & Sport' },
  { id: 'Monospace', label: 'Monospace & Van VIP' },
  { id: 'Utilitaire', label: 'Utilitaire' },
];

const TRANSMISSIONS = [
  { id: 'all', label: 'Toutes' },
  { id: 'Automatique', label: 'Automatique' },
  { id: 'Manuelle', label: 'Manuelle' },
];

const FUELS = [
  { id: 'all', label: 'Tous les carburants' },
  { id: 'Essence', label: 'Essence sans plomb' },
  { id: 'Diesel', label: 'Diesel grand confort' },
  { id: 'Hybride', label: 'Hybride' },
  { id: 'Électrique', label: '100% Électrique' },
];

function fmt(dateStr, locale = 'fr-FR') {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function daysBetween(a, b) {
  if (!a || !b) return 7;
  const d = Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  return d > 0 ? d : 7;
}

function getCarFeatures(car) {
  if (!car) return ['Bluetooth', 'Régulateur', 'Caméra de recul'];
  if (Array.isArray(car.features)) {
    return car.features.length > 0 ? car.features : ['Bluetooth', 'Régulateur', 'Caméra de recul'];
  }
  if (car.features && typeof car.features === 'object') {
    const featureLabels = {
      bluetooth: 'Bluetooth',
      gps: 'GPS Navigation',
      cruiseControl: 'Régulateur',
      camera360: 'Caméra 360°',
      parkingSensors: 'Radars de recul',
      sunroof: 'Toit ouvrant',
      heatedSeats: 'Sièges chauffants',
      usb: 'Prise USB',
      radio: 'Radio HD',
    };
    const active = [];
    for (const [key, label] of Object.entries(featureLabels)) {
      if (car.features[key]) {
        active.push(label);
      }
    }
    if (active.length > 0) return active;
  }
  return ['Bluetooth', 'Régulateur', 'Caméra de recul'];
}

export default function SearchResults() {
  const tr = useText()

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRtl, locale } = useLanguage();
  const { formatPrice } = useCurrency();

  // URL state
  const urlLocation = searchParams.get('location') || 'Tunis';
  const urlParcId = searchParams.get('parcId') || '';
  const urlPickup = searchParams.get('pickupDate') || '2026-09-25';
  const urlDropoff = searchParams.get('dropoffDate') || '2026-10-02';
  const urlAge = searchParams.get('driverAge') || '25';

  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search bar state
  const [searchLocation, setSearchLocation] = useState(urlLocation);
  const [searchParcId, setSearchParcId] = useState(urlParcId);
  const [searchPickup, setSearchPickup] = useState(urlPickup);
  const [searchDropoff, setSearchDropoff] = useState(urlDropoff);
  const [searchAge, setSearchAge] = useState(urlAge);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTransmission, setSelectedTransmission] = useState('all');
  const [selectedFuel, setSelectedFuel] = useState('all');
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useWishlist();
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  // View Mode: list vs grid
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('african_view_mode_cars') || 'list';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('african_view_mode_cars', mode);
  };

  // Parcs from API
  const [parcs, setParcs] = useState([]);
  useEffect(() => {
    parcsService.getAll().then((data) => setParcs(data || [])).catch(() => {});
  }, []);

  const searchDays = useMemo(() => daysBetween(searchPickup, searchDropoff), [searchPickup, searchDropoff]);
  const effectiveAge = user?.age ? Number(user.age) : Number(searchAge);

  const categoryCounts = useMemo(() => {
    const counts = {};
    vehicles.forEach((v) => {
      const cat = v.category || 'Économique';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  const carDetailParams = useMemo(() => {
    return new URLSearchParams({
      location: searchLocation,
      ...(searchParcId && { parcId: searchParcId }),
      ...(searchPickup && { pickupDate: searchPickup }),
      ...(searchDropoff && { dropoffDate: searchDropoff }),
      driverAge: String(effectiveAge),
    }).toString();
  }, [searchLocation, searchParcId, searchPickup, searchDropoff, effectiveAge]);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        sortBy: sortBy === 'rating' ? 'rating' : 'pricePerDay',
        sortOrder: sortBy === 'price_desc' ? 'desc' : 'asc',
        maxPrice: priceRange,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedTransmission !== 'all' && { transmission: selectedTransmission }),
        ...(selectedFuel !== 'all' && { fuel: selectedFuel }),
        ...(searchPickup && { pickupDate: searchPickup }),
        ...(searchDropoff && { dropoffDate: searchDropoff }),
        driverAge: effectiveAge,
        ...(searchParcId && { parcId: searchParcId }),
      };
      const data = await vehiclesService.getAll(params);
      setVehicles(data.vehicles || []);
      setPagination(data.pagination || null);
    } catch {
      setError('Impossible de charger les véhicules. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedCategory, selectedTransmission, selectedFuel, priceRange, searchPickup, searchDropoff, effectiveAge, searchParcId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = () => {
    setPage(1);
    setSearchParams({
      location: searchLocation,
      ...(searchParcId && { parcId: searchParcId }),
      pickupDate: searchPickup,
      dropoffDate: searchDropoff,
      driverAge: String(effectiveAge),
    });
    fetchVehicles();
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedTransmission('all');
    setSelectedFuel('all');
    setPriceRange(500);
    setSortBy('rating');
    setPage(1);
  };

  const currentAgencyName = useMemo(() => {
    if (searchParcId && parcs.length > 0) {
      const found = parcs.find((p) => p._id === searchParcId || p.id === searchParcId);
      if (found) return `${found.name} (${found.city || searchLocation})`;
    }
    return searchLocation || 'Aéroport International Tunis–Carthage (TUN)';
  }, [searchParcId, parcs, searchLocation]);

  return (
    <div className="min-h-screen bg-[#FFFFF0] pb-24 text-[#191C1F]">
      {/* 1. LUXURY MODERN HEADER (Version 4) */}
      <Header />

      {/* 2. TOP HERO SEARCH BAR - Sleek Gradient Banner (Version 4) */}
      <div className="bg-gradient-to-b from-[#2C3E56] to-[#1F2C3D] pt-10 sm:pt-12 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A84A3B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#2C3E56]/40 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#F4A261]" />
              <span>{tr("Flotte Haut de Gamme • Prise en charge VIP aux aéroports")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              {tr("Location de Voitures Récentes en Tunisie")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 mt-1 max-w-2xl">
              {tr("Modèles 2025/2026 certifiés, kilométrage adapté, livraison sur mesure sans file d'attente.")}
            </p>
          </div>

          {/* Floating Pill Search Bar (Matching Screenshot 1) */}
          <div className="bg-[#FAF9F5] p-2 sm:p-2.5 rounded-3xl lg:rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.25)] border border-white/80 max-w-6xl">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">

              {/* Pickup Agency / Location */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl lg:rounded-full bg-white/80 border border-[#EBE6DC] hover:border-[#A84A3B]/40 transition-colors min-w-0">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#A84A3B] shadow-xs shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#727D88]">
                    {t('booking.pickupLocation', 'LIEU / PARC DE DÉPART')}
                  </label>
                  <select
                    value={searchParcId || searchLocation}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = parcs.find((p) => p._id === val || p.id === val || p.name === val);
                      if (found) {
                        setSearchParcId(found._id || found.id);
                        setSearchLocation(found.name);
                      } else {
                        setSearchParcId('');
                        setSearchLocation(val);
                      }
                    }}
                    className="w-full bg-transparent font-bold text-xs text-[#191C1F] focus:outline-hidden cursor-pointer truncate pr-1"
                  >
                    {parcs.length > 0 ? (
                      parcs.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id} className="bg-white text-[#191C1F]">
                          {tr(p.name)} {tr(p.city ? `(${p.city})` : '')}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="tunis-carthage" className="bg-white text-[#191C1F]">{tr("Aéroport International Tunis–Carthage (TUN)")}</option>
                        <option value="djerba" className="bg-white text-[#191C1F]">{tr("Aéroport Djerba–Zarzis (DJE)")}</option>
                        <option value="monastir" className="bg-white text-[#191C1F]">{tr("Aéroport Monastir Habib Bourguiba (MIR)")}</option>
                        <option value="hammamet" className="bg-white text-[#191C1F]">{tr("Agence Hammamet Centre")}</option>
                        <option value="sousse" className="bg-white text-[#191C1F]">{tr("Agence Sousse Corniche")}</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Pickup Date */}
              <div className="w-full lg:w-44 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl lg:rounded-full bg-white/80 border border-[#EBE6DC] hover:border-[#A84A3B]/40 transition-colors shrink-0">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2C3E56] shadow-xs shrink-0">
                  <Calendar className="w-4 h-4 text-[#727D88]" />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#727D88]">
                    {t('booking.pickupDate', 'DÉPART')}
                  </label>
                  <input
                    type="date"
                    value={searchPickup}
                    onChange={(e) => setSearchPickup(e.target.value)}
                    className="w-full bg-transparent font-bold text-xs text-[#191C1F] focus:outline-hidden cursor-pointer"
                  />
                </div>
              </div>

              {/* Return Date */}
              <div className="w-full lg:w-44 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl lg:rounded-full bg-white/80 border border-[#EBE6DC] hover:border-[#A84A3B]/40 transition-colors shrink-0">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2C3E56] shadow-xs shrink-0">
                  <Calendar className="w-4 h-4 text-[#727D88]" />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#727D88]">
                    {t('booking.dropoffDate', 'RETOUR')}
                  </label>
                  <input
                    type="date"
                    value={searchDropoff}
                    min={searchPickup}
                    onChange={(e) => setSearchDropoff(e.target.value)}
                    className="w-full bg-transparent font-bold text-xs text-[#191C1F] focus:outline-hidden cursor-pointer"
                  />
                </div>
              </div>

              {/* Driver Age */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl lg:rounded-full bg-white/80 border border-[#EBE6DC] shrink-0">
                <User className="w-4 h-4 text-[#727D88] shrink-0" />
                <select
                  value={searchAge}
                  onChange={(e) => setSearchAge(e.target.value)}
                  className="bg-transparent font-bold text-xs text-[#191C1F] focus:outline-hidden cursor-pointer"
                >
                  <option value="25">{tr("25+ ans")}</option>
                  <option value="23">{tr("21-24 ans")}</option>
                  <option value="30">{tr("30+ ans")}</option>
                </select>
              </div>

              {/* Search CTA Button */}
              <button
                onClick={handleSearch}
                className="h-12 px-7 rounded-2xl lg:rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-95 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{t('booking.search', 'Rechercher')}</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN LAYOUT: SIDEBAR (FILTERS) + MAIN LISTINGS */}
      <div id="cars-main-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Mobile Filter Trigger Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#EBE6DC] text-sm font-bold text-[#191C1F] shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#A84A3B]" />
            <span>{tr("Filtres & Préférences (")}{tr(pagination?.total ?? vehicles.length)})</span>
          </button>

          {/* Toggle View for Mobile */}
          <div className="view-toggle-pill">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`view-toggle-item ${viewMode === 'list' ? 'active' : 'inactive'}`}
              title={tr("Vue Liste")}
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">{t('view.list', 'Liste')}</span>
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`view-toggle-item ${viewMode === 'grid' ? 'active' : 'inactive'}`}
              title={tr("Vue Mosaïque")}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{t('view.grid', 'Mosaïque')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ================= LEFT SIDEBAR (FILTERS) ================= */}
          <aside className={`lg:col-span-4 xl:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>

            {/* Trip Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE6DC]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#727D88]">
                  {t('searchResults.recap', 'Récapitulatif')}
                </span>
                <span className="text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 px-2 py-0.5 rounded-full">
                  {tr(searchDays)} {tr(searchDays > 1 ? t('searchResults.days', 'jours') : t('searchResults.day', 'jour'))}
                </span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs text-[#4A525A]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#A84A3B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#191C1F]">{tr(currentAgencyName)}</p>
                    <p className="text-[11px] text-[#727D88]">{tr("Accueil hall ou livraison hôtel")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#2C3E56] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#191C1F]">{tr("Du")} {fmt(searchPickup, locale)} {tr("au")} {fmt(searchDropoff, locale)}</p>
                    <p className="text-[11px] text-[#727D88]">{tr("Restitution flexible 24/7")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-[#727D88] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#191C1F]">{tr("Conducteur :")} {tr(effectiveAge)} {tr("ans")}</p>
                    <p className="text-[11px] text-[#727D88]">{tr("Assurance tous risques disponible")}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-[#2C3E56] bg-[#F8F7EE] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
              >
                {tr("Modifier les dates ou l'agence")}
              </button>
            </div>

            {/* Filter Group: Categories */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-[#191C1F]">
                  {t('searchResults.category', 'Catégorie du véhicule')}
                </h3>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-[11px] font-bold text-[#A84A3B] hover:underline cursor-pointer"
                  >
                    {tr("Effacer")}
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const count = cat.id === 'all'
                    ? (pagination?.total ?? vehicles.length)
                    : (categoryCounts[cat.id] || 0);

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#A84A3B] text-white font-bold shadow-xs'
                          : 'text-[#4A525A] hover:bg-[#F8F7EE] hover:text-[#191C1F]'
                      }`}
                    >
                      <span>{tr(cat.label)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-[#EBE6DC] text-[#727D88]'
                      }`}>
                        {tr(count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Group: Max Daily Budget Slider */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#191C1F]">
                  {t('searchResults.maxPrice', 'Budget max / jour')}
                </h3>
                <span className="text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 px-2 py-0.5 rounded-full">
                  {formatPrice(priceRange, isRtl)}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="600"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-medium text-[#727D88] mt-2">
                <span>40 TND</span>
                <span>300 TND</span>
                <span>600+ TND</span>
              </div>
            </div>

            {/* Filter Group: Transmission */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3">
                {t('searchResults.transmission', 'Boîte de vitesses')}
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {TRANSMISSIONS.map((tItem) => {
                  const isActive = selectedTransmission === tItem.id;
                  return (
                    <button
                      key={tItem.id}
                      onClick={() => setSelectedTransmission(tItem.id)}
                      className={`py-2 px-1.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2C3E56] text-white shadow-xs'
                          : 'bg-[#F8F7EE] text-[#4A525A] hover:bg-[#EBE6DC]'
                      }`}
                    >
                      {tr(tItem.label)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Group: Fuel */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3">
                {t('searchResults.fuel', 'Carburant')}
              </h3>
              <div className="space-y-1.5">
                {FUELS.map((fItem) => (
                  <label
                    key={fItem.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4A525A] hover:bg-[#F8F7EE] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="fuel"
                      checked={selectedFuel === fItem.id}
                      onChange={() => setSelectedFuel(fItem.id)}
                      className="accent-[#A84A3B] w-4 h-4 cursor-pointer"
                    />
                    <span>{tr(fItem.label)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset Filters CTA */}
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#DAD3C5] text-xs font-bold text-[#727D88] hover:text-[#191C1F] hover:bg-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('searchResults.reset', 'Réinitialiser tous les filtres')}</span>
            </button>

          </aside>

          {/* ================= RIGHT MAIN LISTINGS ================= */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">

            {/* Header bar with Count, Sort and Toggle [ Liste | Mosaïque ] */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EBE6DC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#191C1F] font-display">
                  {tr(loading
                    ? 'Recherche des véhicules...'
                    : `${pagination?.total ?? vehicles.length} véhicule${vehicles.length > 1 ? 's' : ''} disponible${vehicles.length > 1 ? 's' : ''}`)
                  }
                </h2>
                <p className="text-xs text-[#727D88] mt-0.5">
                  {tr("Tarifs calculés pour")} <strong className="text-[#191C1F]">{tr(searchDays)} {tr("jours")}</strong> {tr("de location • Zéro frais cachés")}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Sort selector */}
                <div className="flex items-center gap-1.5 text-xs text-[#727D88] bg-[#F8F7EE] px-3 py-1.5 rounded-full border border-[#EBE6DC]">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#2C3E56]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-bold text-xs text-[#191C1F] focus:outline-hidden cursor-pointer"
                  >
                    <option value="rating">{tr("Mieux notés")}</option>
                    <option value="price_asc">{tr("Prix croissant")}</option>
                    <option value="price_desc">{tr("Prix décroissant")}</option>
                  </select>
                </div>

                {/* Segmented Toggle [ ☰ Liste | ⊞ Mosaïque ] */}
                <div className="view-toggle-pill">
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`view-toggle-item ${viewMode === 'list' ? 'active' : 'inactive'}`}
                    title={tr("Affichage en Liste")}
                  >
                    <LayoutList className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('view.list', 'Liste')}</span>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`view-toggle-item ${viewMode === 'grid' ? 'active' : 'inactive'}`}
                    title={tr("Affichage en Mosaïque")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('view.grid', 'Mosaïque')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{tr(error)}</span>
                </div>
                <button
                  onClick={fetchVehicles}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  {tr("Réessayer")}
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-6 border border-[#EBE6DC] shadow-xs flex flex-col md:flex-row gap-6 animate-pulse"
                  >
                    <div className="w-full md:w-72 h-44 bg-[#F8F7EE] rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-[#F8F7EE] rounded-md w-1/3" />
                      <div className="h-4 bg-[#F8F7EE] rounded-md w-1/2" />
                      <div className="h-10 bg-[#F8F7EE] rounded-xl w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && vehicles.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EBE6DC] shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#191C1F]">
                  {t('searchResults.noCarsFound', 'Aucun véhicule ne correspond à vos filtres')}
                </h3>
                <p className="text-sm text-[#727D88] mt-1 max-w-md mx-auto">
                  {tr("Essayez d'augmenter votre budget ou de sélectionner une autre catégorie de véhicule.")}
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-6 py-2.5 rounded-full bg-[#A84A3B] text-white font-bold text-xs hover:bg-[#8A372A] transition-colors cursor-pointer"
                >
                  {t('searchResults.reset', 'Réinitialiser les filtres')}
                </button>
              </div>
            )}

            {/* ================= MODE 1: VUE LISTE (Booking-style Horizontal Card) ================= */}
            {!loading && !error && viewMode === 'list' && vehicles.length > 0 && (
              <div className="space-y-5">
                {vehicles.map((car) => {
                  const totalTND = (car.pricePerDay || 80) * searchDays;
                  const isFav = isFavorite(car._id || car.id);
                  const carImg = car.images?.[0] || car.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800';

                  return (
                    <div
                      key={car._id || car.id}
                      className="bg-white rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-xl hover:border-[#DAD3C5] transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
                    >
                      {/* Left: 100% Height Photo Edge-to-Edge with Object Cover */}
                      <div className="md:w-72 lg:w-80 shrink-0 relative bg-neutral-900 overflow-hidden min-h-[220px] md:min-h-full">
                        <img
                          src={carImg}
                          alt={tr(car.name)}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {tr(car.category)}
                          </span>
                          {car.featured && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#A84A3B] text-white shadow-xs">
                              {tr("⭐ Coup de cœur")}
                            </span>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(car, 'car')}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-[#A84A3B] transition-colors cursor-pointer"
                          title={tr(isFav ? "Retirer des favoris" : "Ajouter aux favoris")}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#A84A3B] text-[#A84A3B]' : ''}`} />
                        </button>

                        {/* Year pill on image */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {tr("Année")} {tr(car.year || 2025)} • {tr(car.brand)}
                        </div>
                      </div>

                      {/* Center: Details, Technical Specs & Options */}
                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                        <div>
                          {/* Title & Rating */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h3 className="text-xl font-extrabold text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors">
                                {tr(car.name)}
                              </h3>
                              <p className="text-xs text-[#727D88] line-clamp-1">{tr(car.tagline || `${car.category} moderne et économique`)}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 bg-[#F8F7EE] px-2.5 py-1 rounded-xl border border-[#EBE6DC]">
                              <span className="text-xs font-black text-[#A84A3B]">★ {(car.rating || 4.9).toFixed(2)}</span>
                              <span className="text-[10px] text-[#727D88]">({tr(car.reviewsCount || 28)} {tr("avis)")}</span>
                            </div>
                          </div>

                          {/* Technical Specifications Icons Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 py-2.5 px-3 rounded-2xl bg-[#F8F7EE]/80 border border-[#EBE6DC]/80 text-xs text-[#4A525A]">
                            <div className="flex items-center gap-1.5">
                              <Gauge className="w-3.5 h-3.5 text-[#A84A3B]" />
                              <span className="font-semibold">{tr(car.transmission || car.specs?.transmission || 'Manuelle')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Fuel className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span className="font-semibold">{tr(car.fuel || car.specs?.fuel || 'Essence')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span className="font-semibold">{tr(car.seats || car.specs?.seats || 5)} {tr("places")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span className="font-semibold">{tr(car.bags || car.specs?.luggage || 2)} {tr("bagages")}</span>
                            </div>
                          </div>

                          {/* Equipment & Features Pills */}
                          <div className="flex flex-wrap gap-1.5 text-[11px] mb-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#EBE6DC] text-[#4A525A] font-medium">
                              <Snowflake className="w-3 h-3 text-sky-600" /> {tr("Climatisation")}
                            </span>
                            {getCarFeatures(car).slice(0, 3).map((feat, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#EBE6DC] text-[#4A525A] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {tr(feat)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Free Cancellation reassurance badge */}
                        <div className="pt-2 border-t border-[#EBE6DC] flex items-center gap-2 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t('searchResults.freeCancellation', "Annulation gratuite jusqu'à 48h avant la prise en charge")}</span>
                        </div>
                      </div>

                      {/* Right: Pricing & CTA Panel */}
                      <div className="md:w-60 lg:w-64 p-5 sm:p-6 bg-[#F8F7EE] border-t md:border-t-0 md:border-l border-[#EBE6DC] flex flex-col justify-between shrink-0">
                        <div>
                          <div className="text-right mb-1">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-[#727D88]">
                              {t('searchResults.totalPrice', 'Prix total')} ({tr(searchDays)} {t('searchResults.days', 'j')})
                            </p>
                            <p className="text-2xl font-black text-[#191C1F] font-display">
                              {formatPrice(totalTND, isRtl)}
                            </p>
                          </div>
                          <p className="text-right text-xs font-semibold text-[#A84A3B]">
                            {tr("soit")} {formatPrice(car.pricePerDay, isRtl)} / {t('searchResults.day', 'jour')}
                          </p>
                          <p className="text-right text-[10px] text-[#727D88] mt-0.5">{tr("Taxes et assurances incluses")}</p>
                        </div>

                        <div className="space-y-2 mt-4">
                          {/* Detail Button */}
                          <button
                            onClick={() => navigate(`/voitures/${car._id || car.id}?${carDetailParams}`)}
                            className="w-full py-2.5 px-4 rounded-full border border-[#DAD3C5] bg-white hover:bg-[#F8F7EE] text-[#191C1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#2C3E56]" />
                            <span>{t('searchResults.seeDetails', 'Voir les détails')}</span>
                          </button>

                          {/* Primary CTA */}
                          <button
                            onClick={() => navigate(`/voitures/${car._id || car.id}?${carDetailParams}&book=true`)}
                            className="w-full py-2.5 px-4 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                          >
                            <span>{t('searchResults.book', 'Réserver')}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {/* Click to pay reassurance */}
                          <div className="pt-1 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#727D88]">
                              <CreditCard className="w-3.5 h-3.5 text-[#A84A3B]" />
                              {tr("Payer l'acompte avec Click to Pay")}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= MODE 2: VUE MOSAÏQUE (Bento Grid 3 Columns) ================= */}
            {!loading && !error && viewMode === 'grid' && vehicles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((car) => {
                  const totalTND = (car.pricePerDay || 80) * searchDays;
                  const isFav = isFavorite(car._id || car.id);
                  const carImg = car.images?.[0] || car.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800';

                  return (
                    <div
                      key={car._id || car.id}
                      className="bg-white rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-xl hover:border-[#DAD3C5] transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                    >
                      {/* Top Full Width Photo */}
                      <div className="relative aspect-16/10 bg-neutral-900 overflow-hidden">
                        <img
                          src={carImg}
                          alt={tr(car.name)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        {/* Category badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {tr(car.category)}
                          </span>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={() => toggleFavorite(car, 'car')}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-[#A84A3B] transition-colors cursor-pointer"
                          title={tr(isFav ? "Retirer des favoris" : "Ajouter aux favoris")}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#A84A3B] text-[#A84A3B]' : ''}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-extrabold">{tr(car.brand)} • {tr(car.year || 2025)}</span>
                          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-[#F4A261]">
                            ★ {(car.rating || 4.9).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Middle Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-lg text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors">
                            {tr(car.name)}
                          </h3>
                          <p className="text-xs text-[#727D88] line-clamp-1 mt-0.5">
                            {tr(car.tagline || `${car.category} grand confort`)}
                          </p>

                          {/* Compact Specs Grid */}
                          <div className="grid grid-cols-2 gap-2 my-3 py-2 px-2.5 rounded-xl bg-[#F8F7EE] text-[11px] text-[#4A525A] font-semibold">
                            <div className="flex items-center gap-1.5">
                              <Gauge className="w-3.5 h-3.5 text-[#A84A3B]" />
                              <span>{tr(car.transmission || car.specs?.transmission || 'Manuelle')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Fuel className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span>{tr(car.fuel || car.specs?.fuel || 'Essence')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span>{tr(car.seats || car.specs?.seats || 5)} {tr("places")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span>{tr(car.bags || car.specs?.luggage || 2)} {tr("valises")}</span>
                            </div>
                          </div>

                          <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {tr("Annulation gratuite")}
                          </p>
                        </div>

                        {/* Bottom Price and Actions */}
                        <div className="pt-4 mt-4 border-t border-[#EBE6DC]">
                          <div className="flex items-baseline justify-between mb-3">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-[#727D88]">Total {tr(searchDays)}j</p>
                              <p className="text-xl font-black text-[#191C1F] font-display">
                                {formatPrice(totalTND, isRtl)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-[#A84A3B]">
                                {formatPrice(car.pricePerDay, isRtl)}
                              </p>
                              <p className="text-[10px] text-[#727D88]">{tr("/ jour")}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => navigate(`/voitures/${car._id || car.id}?${carDetailParams}`)}
                              className="py-2 rounded-xl border border-[#DAD3C5] text-xs font-bold text-[#191C1F] hover:bg-[#F8F7EE] transition-colors cursor-pointer"
                            >
                              {t('searchResults.seeDetails', 'Détails')}
                            </button>
                            <button
                              onClick={() => navigate(`/voitures/${car._id || car.id}?${carDetailParams}&book=true`)}
                              className="py-2 rounded-xl bg-[#A84A3B] hover:bg-[#8A372A] text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                            >
                              {t('searchResults.book', 'Réserver')}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage((p) => p - 1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl border border-[#DAD3C5] bg-white text-xs font-bold text-[#191C1F] hover:bg-[#F8F7EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {tr("← Précédent")}
                </button>
                <span className="text-xs font-bold text-[#727D88]">
                  Page {tr(page)} / {tr(pagination.totalPages)}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => {
                    setPage((p) => p + 1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl border border-[#DAD3C5] bg-white text-xs font-bold text-[#191C1F] hover:bg-[#F8F7EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {tr("Suivant →")}
                </button>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* 4. REASSURANCE TRUST SECTION */}
      <div className="mt-16 border-t border-[#EBE6DC] bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Meilleur prix garanti',
                desc: 'Tarifs transparents alignés et sans frais surprises au guichet',
              },
              {
                icon: CheckCircle2,
                title: 'Annulation gratuite',
                desc: "Jusqu'à 48 heures avant la prise en charge de votre véhicule",
              },
              {
                icon: CreditCard,
                title: 'Paiement sécurisé',
                desc: 'Paiement en ligne sécurisé ou règlement sur place à la prise en charge',
              },
              {
                icon: Clock,
                title: 'Assistance VIP 24/7',
                desc: 'Équipe dédiée disponible partout en Tunisie jour et nuit',
              },
            ].map((g, idx) => {
              const Icon = g.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 p-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#191C1F]">{tr(g.title)}</h4>
                    <p className="text-xs text-[#727D88] mt-0.5 leading-relaxed">{tr(g.desc)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. FOOTER */}
      <Footer />

      {/* 6. FLOATING VIP CONCIERGE BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsConciergeOpen(true)}
          className="group flex items-center gap-2.5 apple-glass-dark text-white px-4 py-3 rounded-full shadow-[0_16px_36px_rgba(0,0,0,0.35)] hover:bg-[#1E293B]/90 border border-white/25 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label={tr("Contacter le Concierge VIP")}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/70 leading-none">{tr("Concierge VIP")}</p>
            <p className="text-xs font-black leading-tight">{tr("Conseiller Voyage IA")}</p>
          </div>
        </button>
      </div>

      <AIConciergeModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
      />
    </div>
  );
}
