import { useText } from '../../context/LanguageContext'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Users,
  Bed,
  Bath,
  Maximize2,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  Heart,
  Star,
  Wifi,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  ArrowUpDown,
  ChevronRight,
  Eye,
  Key,
  Home,
  Check,
  AlertCircle,
} from 'lucide-react';
import { apartmentsService } from '../../services/apartmentsService';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';
import { AIConciergeModal } from '../../components/HomeModern/AIConciergeModal';
import { useWishlist } from '../../context/WishlistContext';

const CITIES = [
  { id: 'all', label: 'Toutes les destinations' },
  { id: 'Sidi Bou Said', label: 'Sidi Bou Saïd' },
  { id: 'Hammamet', label: 'Hammamet' },
  { id: 'Djerba', label: 'Djerba' },
  { id: 'La Marsa', label: 'La Marsa / Gammarth' },
  { id: 'Tozeur', label: 'Tozeur' },
  { id: 'Tabarka', label: 'Tabarka' },
];

const TYPES = [
  { id: 'all', label: 'Tous les types' },
  { id: 'Dar traditionnel', label: 'Dar traditionnel' },
  { id: 'Villa privée', label: 'Villa privée' },
  { id: 'Penthouse', label: 'Penthouse' },
  { id: 'Appartement', label: 'Appartement standing' },
];

const POPULAR_AMENITIES = [
  { id: 'pool', label: 'Piscine' },
  { id: 'seaView', label: 'Vue mer' },
  { id: 'wifi', label: 'Wifi haut débit' },
  { id: 'ac', label: 'Climatisation' },
  { id: 'jacuzzi', label: 'Jacuzzi' },
];

export default function ApartmentsList() {
  const tr = useText()

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { t, isRtl } = useLanguage();

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode: list vs grid (mosaique)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('african_view_mode_apts') || 'list';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('african_view_mode_apts', mode);
  };

  // Filters state
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [minGuests, setMinGuests] = useState(Number(searchParams.get('guests')) || 1);
  const [maxPrice, setMaxPrice] = useState(800);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const { isFavorite, toggleFavorite } = useWishlist();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  // Nights count for price estimation
  const nightsCount = 3;

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedType('all');
    setMinGuests(1);
    setMaxPrice(800);
    setSelectedAmenities([]);
    setSortBy('rating');
  };

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        page: 1,
        limit: 30,
        sortBy: sortBy === 'rating' ? 'rating' : 'pricePerNight',
        sortOrder: sortBy === 'price_desc' ? 'desc' : 'asc',
      };
      if (selectedCity && selectedCity !== 'all') query.city = selectedCity;
      if (selectedType && selectedType !== 'all') query.type = selectedType;
      if (minGuests && minGuests > 1) query.guests = minGuests;
      if (maxPrice) query.maxPrice = maxPrice;

      const res = await apartmentsService.getAll(query);
      let list = res?.apartments || [];

      // Client-side filtering for amenities if specified
      if (selectedAmenities.length > 0) {
        list = list.filter((item) => {
          return selectedAmenities.every((req) => {
            if (item.amenities && typeof item.amenities === 'object') {
              if (item.amenities[req]) return true;
            }
            if (Array.isArray(item.amenities)) {
              return item.amenities.some((a) => String(a).toLowerCase().includes(req.toLowerCase()));
            }
            return false;
          });
        });
      }

      setApartments(list);
    } catch (err) {
      console.error('Error fetching apartments:', err);
      setError('Impossible de charger les hébergements. Veuillez vérifier que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedType, minGuests, maxPrice, selectedAmenities, sortBy]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  return (
    <div className="min-h-screen bg-[#FFFFF0] pb-24 text-[#191C1F]">
      {/* 1. LUXURY MODERN HEADER (Version 4) */}
      <Header />

      {/* 2. TOP HERO HEADER - Sleek Gradient Banner (Version 4) */}
      <div className="bg-gradient-to-b from-[#2C3E56] to-[#1F2C3D] pt-10 sm:pt-12 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-lg relative overflow-hidden">
        {/* Subtle decorative warm glow */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#A84A3B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#F4A261]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#F4A261]" />
            <span>{tr("Sélection Exclusivité & Charme • Dars & Villas en Tunisie")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            {tr("Dars Traditionnels & Villas d'Exception")}
          </h1>
          <p className="text-sm sm:text-base text-white/75 mt-2 max-w-2xl">
            {tr("Villas avec piscine privée, demeures mauresques restaurées à Sidi Bou Saïd et penthouses face à la Méditerranée.")}
          </p>

          {/* Quick Destination Pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {CITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === c.id
                    ? 'bg-[#A84A3B] text-white shadow-md'
                    : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/10'
                }`}
              >
                {tr(c.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#EBE6DC] text-sm font-bold text-[#191C1F] shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#A84A3B]" />
            <span>{tr("Filtres (")}{tr(apartments.length)})</span>
          </button>

          {/* Toggle View for Mobile */}
          <div className="view-toggle-pill">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`view-toggle-item ${viewMode === 'list' ? 'active' : 'inactive'}`}
              title={tr("Vue Liste")}
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">{tr("Liste")}</span>
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`view-toggle-item ${viewMode === 'grid' ? 'active' : 'inactive'}`}
              title={tr("Vue Mosaïque")}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{tr("Mosaïque")}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ================= LEFT SIDEBAR (FILTERS) ================= */}
          <aside className={`lg:col-span-4 xl:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>

            {/* Filter: Destination City */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A84A3B]" />
                <span>{tr("Destination en Tunisie")}</span>
              </h3>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-[#F8F7EE] border border-[#EBE6DC] rounded-xl px-3 py-2 text-xs font-bold text-[#191C1F] focus:outline-hidden cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {tr(c.label)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Type of Accommodation */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3 flex items-center gap-2">
                <Home className="w-4 h-4 text-[#2C3E56]" />
                <span>{tr("Type d'hébergement")}</span>
              </h3>
              <div className="space-y-1.5">
                {TYPES.map((tItem) => {
                  const isActive = selectedType === tItem.id;
                  return (
                    <button
                      key={tItem.id}
                      onClick={() => setSelectedType(tItem.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#A84A3B] text-white font-bold shadow-xs'
                          : 'text-[#4A525A] hover:bg-[#F8F7EE]'
                      }`}
                    >
                      <span>{tr(tItem.label)}</span>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Guests Count */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2C3E56]" />
                <span>{tr("Voyageurs minimum")}</span>
              </h3>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 6].map((count) => (
                  <button
                    key={count}
                    onClick={() => setMinGuests(count)}
                    className={`py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      minGuests === count
                        ? 'bg-[#2C3E56] text-white shadow-xs'
                        : 'bg-[#F8F7EE] text-[#4A525A] hover:bg-[#EBE6DC]'
                    }`}
                  >
                    {tr(count)}{tr("+ pers.")}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Max Price per night */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#191C1F]">{tr("Budget max / nuitée")}</h3>
                <span className="text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 px-2 py-0.5 rounded-full">
                  {formatPrice(maxPrice, isRtl)}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-medium text-[#727D88] mt-2">
                <span>100 TND</span>
                <span>450 TND</span>
                <span>800+ TND</span>
              </div>
            </div>

            {/* Filter: Amenities */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3">{tr("Équipements recherchés")}</h3>
              <div className="space-y-2">
                {POPULAR_AMENITIES.map((amenity) => {
                  const active = selectedAmenities.includes(amenity.id);
                  return (
                    <label
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#4A525A] hover:bg-[#F8F7EE] cursor-pointer"
                    >
                      <span>{tr(amenity.label)}</span>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          active ? 'bg-[#A84A3B] border-[#A84A3B] text-white' : 'border-[#DAD3C5] bg-white'
                        }`}
                      >
                        {active && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Reset Filters CTA */}
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#DAD3C5] text-xs font-bold text-[#727D88] hover:text-[#191C1F] hover:bg-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tr("Réinitialiser tous les filtres")}</span>
            </button>

          </aside>

          {/* ================= RIGHT MAIN LISTINGS ================= */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">

            {/* Header bar with Count, Sort and Toggle [ Liste | Mosaïque ] */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EBE6DC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#191C1F] font-display">
                  {tr(loading
                    ? 'Chargement des résidences...'
                    : `${apartments.length} hébergement${apartments.length > 1 ? 's' : ''} disponible${apartments.length > 1 ? 's' : ''}`)
                  }
                </h2>
                <p className="text-xs text-[#727D88] mt-0.5">
                  {tr("Demeures certifiées avec conciergerie VIP et ménage hôtelier inclus")}
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

                {/* View toggle segmented pill */}
                <div className="view-toggle-pill">
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`view-toggle-item ${viewMode === 'list' ? 'active' : 'inactive'}`}
                    title={tr("Affichage en Liste")}
                  >
                    <LayoutList className="w-4 h-4" />
                    <span className="hidden sm:inline">{tr("Liste")}</span>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`view-toggle-item ${viewMode === 'grid' ? 'active' : 'inactive'}`}
                    title={tr("Affichage en Mosaïque")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">{tr("Mosaïque")}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{tr(error)}</span>
                </div>
                <button
                  onClick={fetchApartments}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  {tr("Réessayer")}
                </button>
              </div>
            )}

            {/* Loading skeletons */}
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

            {/* Zero Results State */}
            {!loading && !error && apartments.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EBE6DC] shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#191C1F]">
                  {tr("Aucun hébergement ne correspond à vos critères")}
                </h3>
                <p className="text-sm text-[#727D88] mt-1 max-w-md mx-auto">
                  {tr("Ajustez vos filtres de destination ou augmentez votre budget par nuitée.")}
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-6 py-2.5 rounded-full bg-[#A84A3B] text-white font-bold text-xs hover:bg-[#8A372A] transition-colors cursor-pointer"
                >
                  {tr("Réinitialiser les filtres")}
                </button>
              </div>
            )}

            {/* ================= MODE 1: LISTE (Booking Luxury Style) ================= */}
            {!loading && !error && viewMode === 'list' && apartments.length > 0 && (
              <div className="space-y-5">
                {apartments.map((item) => {
                  const isFav = isFavorite(item._id || item.id);
                  const estimatedTotal = (item.pricePerNight || 300) * nightsCount;
                  const itemImg = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

                  return (
                    <div
                      key={item._id || item.id}
                      className="bg-white rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-xl hover:border-[#DAD3C5] transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
                    >
                      {/* Left: 100% Height Photo Edge-to-Edge with Object Cover */}
                      <div className="md:w-72 lg:w-84 shrink-0 relative bg-neutral-900 overflow-hidden min-h-[220px] md:min-h-full">
                        <img
                          src={itemImg}
                          alt={tr(item.title)}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {tr(item.type || 'Villa')}
                          </span>
                          {item.featured && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#A84A3B] text-white shadow-xs">
                              {tr("⭐ Coup de cœur")}
                            </span>
                          )}
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={() => toggleFavorite(item, 'apartment')}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-[#A84A3B] transition-colors cursor-pointer"
                          title={tr(isFav ? "Retirer des favoris" : "Ajouter aux favoris")}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#A84A3B] text-[#A84A3B]' : ''}`} />
                        </button>

                        {/* City pin on photo */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#F4A261]" />
                          <span>{tr(item.city || item.location || 'Tunisie')}</span>
                        </div>
                      </div>

                      {/* Center: Details, Physical Specs & Amenities */}
                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                        <div>
                          {/* Title & Rating */}
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <div>
                              <div className="flex items-center gap-1 text-xs text-[#727D88] mb-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[#A84A3B]" />
                                <span>{tr(item.city || item.location)}</span>
                              </div>
                              <h3 className="text-xl font-extrabold text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors">
                                {tr(item.title)}
                              </h3>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 bg-[#F8F7EE] px-2.5 py-1 rounded-xl border border-[#EBE6DC]">
                              <span className="text-xs font-black text-[#A84A3B]">★ {(item.rating || 4.95).toFixed(2)}</span>
                              <span className="text-[10px] text-[#727D88]">({tr(item.reviewsCount || 18)} {tr("avis)")}</span>
                            </div>
                          </div>

                          {/* Physical Characteristics (Bedrooms, Beds, Capacity, Surface) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 py-2.5 px-3 rounded-2xl bg-[#F8F7EE]/80 border border-[#EBE6DC]/80 text-xs text-[#4A525A]">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#A84A3B]" />
                              <span className="font-semibold">{tr(item.capacityGuests || item.maxGuests || 4)} {tr("personnes")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Bed className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span className="font-semibold">{tr(item.bedrooms || 2)} {tr("chambres")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Bath className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span className="font-semibold">{tr(item.baths || 2)} {tr("sdb")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span className="font-semibold">{tr(item.surfaceM2 || 180)} m²</span>
                            </div>
                          </div>

                          {/* Short Description */}
                          {item.description && (
                            <p className="text-xs text-[#727D88] line-clamp-2 mb-3">
                              {tr(item.description)}
                            </p>
                          )}

                          {/* Amenities Pills */}
                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                            {item.amenities?.pool && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#EBE6DC] text-[#4A525A] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {tr("Piscine privée")}
                              </span>
                            )}
                            {item.amenities?.seaView && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#EBE6DC] text-[#4A525A] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {tr("Vue panoramique mer")}
                              </span>
                            )}
                            {item.amenities?.wifi && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#EBE6DC] text-[#4A525A] font-medium">
                                <Wifi className="w-3 h-3 text-sky-600" /> {tr("Wifi Fibre")}
                              </span>
                            )}
                            {item.amenities?.ac && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#EBE6DC] text-[#4A525A] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {tr("Climatisation")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Guarantee tag */}
                        <div className="pt-2 border-t border-[#EBE6DC] flex items-center gap-2 text-xs font-bold text-[#2C3E56]">
                          <Key className="w-3.5 h-3.5 text-[#A84A3B]" />
                          <span>{tr("Conciergerie VIP dédiée & ménage d'arrivée inclus")}</span>
                        </div>
                      </div>

                      {/* Right: Price & CTA Panel */}
                      <div className="md:w-60 lg:w-64 p-5 sm:p-6 bg-[#F8F7EE] border-t md:border-t-0 md:border-l border-[#EBE6DC] flex flex-col justify-between shrink-0">
                        <div>
                          <div className="text-right mb-1">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-[#727D88]">{tr("Par nuitée")}</p>
                            <p className="text-2xl font-black text-[#191C1F] font-display">
                              {formatPrice(item.pricePerNight, isRtl)}
                            </p>
                          </div>
                          <p className="text-right text-xs font-semibold text-[#727D88]">
                            {tr("estimé à")} {formatPrice(estimatedTotal, isRtl)} {tr("pour")} {tr(nightsCount)} {tr("nuits")}
                          </p>
                          <p className="text-right text-[10px] text-emerald-700 font-bold mt-0.5">
                            {tr("Taxes de séjour & frais inclus")}
                          </p>
                        </div>

                        <div className="space-y-2 mt-4">
                          <button
                            onClick={() => navigate(`/appartements/${item._id || item.id}`)}
                            className="w-full py-2 px-3 rounded-xl border border-[#DAD3C5] bg-white hover:bg-[#EBE6DC] text-[#191C1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#2C3E56]" />
                            <span>{tr("Voir la propriété")}</span>
                          </button>

                          <button
                            onClick={() => navigate(`/appartements/${item._id || item.id}`)}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#A84A3B] to-[#C25847] hover:from-[#8A372A] hover:to-[#A84A3B] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                          >
                            <span>{tr("Réserver ce séjour")}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= MODE 2: MOSAÏQUE (Bento Grid 3 Columns) ================= */}
            {!loading && !error && viewMode === 'grid' && apartments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {apartments.map((item) => {
                  const isFav = isFavorite(item._id || item.id);
                  const itemImg = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

                  return (
                    <div
                      key={item._id || item.id}
                      className="bg-white rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-xl hover:border-[#DAD3C5] transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                    >
                      {/* Top Full Width Photo */}
                      <div className="relative aspect-16/10 bg-neutral-900 overflow-hidden">
                        <img
                          src={itemImg}
                          alt={tr(item.title)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {tr(item.type || 'Villa')}
                          </span>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={() => toggleFavorite(item, 'apartment')}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-[#A84A3B] transition-colors cursor-pointer"
                          title={tr(isFav ? "Retirer des favoris" : "Ajouter aux favoris")}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#A84A3B] text-[#A84A3B]' : ''}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-extrabold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#F4A261]" />
                            {tr(item.city || item.location)}
                          </span>
                          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-[#F4A261]">
                            ★ {(item.rating || 4.95).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Middle Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-lg text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors">
                            {tr(item.title)}
                          </h3>
                          <p className="text-xs text-[#727D88] line-clamp-1 mt-0.5">
                            {tr(item.location)}
                          </p>

                          {/* Compact Specs Grid */}
                          <div className="grid grid-cols-2 gap-2 my-3 py-2 px-2.5 rounded-xl bg-[#F8F7EE] text-[11px] text-[#4A525A] font-semibold">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#A84A3B]" />
                              <span>{tr(item.capacityGuests || item.maxGuests || 4)} {tr("pers.")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Bed className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span>{tr(item.bedrooms || 2)} {tr("chambres")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Bath className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span>{tr(item.baths || 2)} {tr("sdb")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5 text-[#2C3E56]" />
                              <span>{tr(item.surfaceM2 || 180)} m²</span>
                            </div>
                          </div>

                          <p className="text-[11px] font-bold text-[#2C3E56] flex items-center gap-1">
                            <Key className="w-3.5 h-3.5 text-[#A84A3B]" /> {tr("Conciergerie VIP & ménage inclus")}
                          </p>
                        </div>

                        {/* Bottom Price and Actions */}
                        <div className="pt-4 mt-4 border-t border-[#EBE6DC]">
                          <div className="flex items-baseline justify-between mb-3">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-[#727D88]">{tr("Par nuitée")}</p>
                              <p className="text-xl font-black text-[#191C1F] font-display">
                                {formatPrice(item.pricePerNight, isRtl)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-emerald-700 font-bold">{tr("Frais inclus")}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => navigate(`/appartements/${item._id || item.id}`)}
                              className="py-2 rounded-xl border border-[#DAD3C5] text-xs font-bold text-[#191C1F] hover:bg-[#F8F7EE] transition-colors cursor-pointer"
                            >
                              {tr("Détails")}
                            </button>
                            <button
                              onClick={() => navigate(`/appartements/${item._id || item.id}`)}
                              className="py-2 rounded-xl bg-[#A84A3B] hover:bg-[#8A372A] text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                            >
                              {tr("Réserver")}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
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
                title: 'Propriétés vérifiées en 50 points',
                desc: 'Chaque villa et dar fait l\'objet d\'une inspection physique rigoureuse',
              },
              {
                icon: Key,
                title: 'Conciergerie privée 24/7',
                desc: 'Chef à domicile, réservations VIP et transferts aéroport dédiés',
              },
              {
                icon: CheckCircle2,
                title: 'Piscines privées garanties',
                desc: 'Entretien quotidien et analyse sanitaire de l\'eau avant votre arrivée',
              },
              {
                icon: Sparkles,
                title: 'Linge & ménage hôtelier',
                desc: 'Literie d\'exception en coton égyptien et ménage complet inclus',
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
