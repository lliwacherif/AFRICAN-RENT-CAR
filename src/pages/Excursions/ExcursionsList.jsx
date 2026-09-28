import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  Heart,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ArrowUpDown,
  ChevronRight,
  Eye,
  Car,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';
import { excursionsService } from '../../services/excursionsService';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';
import { AIConciergeModal } from '../../components/HomeModern/AIConciergeModal';
import { useWishlist } from '../../context/WishlistContext';

const CATEGORIES = [
  { id: 'all', label: 'Toutes les catégories' },
  { id: 'Sahara & Désert', label: 'Sahara & Désert' },
  { id: 'Culture & Histoire', label: 'Culture & Histoire' },
  { id: 'Randonnée & Nature', label: 'Randonnée & Nature' },
  { id: 'Mer & Bateau', label: 'Mer & Bateau' },
  { id: 'Aventure & Quad', label: 'Aventure & Quad' },
];

const DEPARTURE_CITIES = [
  { id: 'all', label: 'Toutes les villes de départ' },
  { id: 'Tunis', label: 'Tunis / Carthage' },
  { id: 'Sousse', label: 'Sousse / Monastir' },
  { id: 'Djerba', label: 'Djerba' },
  { id: 'Tozeur', label: 'Tozeur' },
  { id: 'Hammamet', label: 'Hammamet' },
];

const DURATIONS = [
  { id: 'all', label: 'Toutes les durées' },
  { id: 'Demi-journée', label: 'Demi-journée (4-6h)' },
  { id: 'Journée Complète', label: 'Journée complète' },
  { id: '2 Jours', label: 'Circuit 2 jours / 1 nuit' },
];

function getExcursionHighlights(item) {
  if (!item) return [];
  if (Array.isArray(item.highlights) && item.highlights.length > 0) return item.highlights;
  if (Array.isArray(item.included) && item.included.length > 0) return item.included;
  return [];
}

export default function ExcursionsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { t, isRtl } = useLanguage();

  const [excursions, setExcursions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode: list vs grid (mosaique)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('african_view_mode_exc') || 'list';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('african_view_mode_exc', mode);
  };

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [maxPrice, setMaxPrice] = useState(600);
  const [sortBy, setSortBy] = useState('rating');
  const { isFavorite, toggleFavorite } = useWishlist();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedDuration('all');
    setMaxPrice(600);
    setSortBy('rating');
  };

  const fetchExcursions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        page: 1,
        limit: 30,
        sortBy: sortBy === 'rating' ? 'rating' : 'pricePerAdult',
        sortOrder: sortBy === 'price_desc' ? 'desc' : 'asc',
      };
      if (selectedCategory && selectedCategory !== 'all') query.category = selectedCategory;
      if (selectedCity && selectedCity !== 'all') query.departureCity = selectedCity;
      if (maxPrice) query.maxPrice = maxPrice;

      const res = await excursionsService.getAll(query);
      let list = res?.excursions || [];

      // Duration filtering client-side if needed
      if (selectedDuration !== 'all') {
        list = list.filter((item) => {
          if (!item.duration) return true;
          if (selectedDuration === '2 Jours') return item.duration.includes('2 Jours') || item.duration.includes('2 jours');
          if (selectedDuration === 'Journée Complète') return item.duration.toLowerCase().includes('journée');
          if (selectedDuration === 'Demi-journée') return item.duration.toLowerCase().includes('demi');
          return true;
        });
      }

      setExcursions(list);
    } catch (err) {
      console.error('Error fetching excursions:', err);
      setError('Impossible de charger les excursions. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedCity, selectedDuration, maxPrice, sortBy]);

  useEffect(() => {
    fetchExcursions();
  }, [fetchExcursions]);

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
            <span>Circuits Privatifs & Aventures Sahariennes • Guides Certifiés</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Circuits & Excursions d'Exception en Tunisie
          </h1>
          <p className="text-sm sm:text-base text-white/75 mt-2 max-w-2xl">
            Des dunes majestueuses du Grand Erg Oriental aux villages troglodytiques de Matmata et aux oasis de montagne de Tozeur.
          </p>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#A84A3B] text-white shadow-md'
                    : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#EBE6DC] text-sm font-bold text-[#191C1F] shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#A84A3B]" />
            <span>Filtres ({excursions.length})</span>
          </button>

          {/* Toggle View for Mobile */}
          <div className="view-toggle-pill">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`view-toggle-item ${viewMode === 'list' ? 'active' : 'inactive'}`}
              title="Vue Liste"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">Liste</span>
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`view-toggle-item ${viewMode === 'grid' ? 'active' : 'inactive'}`}
              title="Vue Mosaïque"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Mosaïque</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT SIDEBAR (FILTERS) ================= */}
          <aside className={`lg:col-span-4 xl:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            
            {/* Filter: Departure City */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A84A3B]" />
                <span>Ville de départ</span>
              </h3>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-[#F8F7EE] border border-[#EBE6DC] rounded-xl px-3 py-2 text-xs font-bold text-[#191C1F] focus:outline-hidden cursor-pointer"
              >
                {DEPARTURE_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Categories */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2C3E56]" />
                <span>Type d'expédition</span>
              </h3>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#A84A3B] text-white font-bold shadow-xs'
                          : 'text-[#4A525A] hover:bg-[#F8F7EE]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Duration */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <h3 className="font-bold text-sm text-[#191C1F] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2C3E56]" />
                <span>Durée du circuit</span>
              </h3>
              <div className="space-y-1.5">
                {DURATIONS.map((d) => {
                  const isActive = selectedDuration === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDuration(d.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#2C3E56] text-white font-bold shadow-xs'
                          : 'bg-[#F8F7EE] text-[#4A525A] hover:bg-[#EBE6DC]'
                      }`}
                    >
                      <span>{d.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Max Price per person */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE6DC] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#191C1F]">Budget max / pers.</h3>
                <span className="text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 px-2 py-0.5 rounded-full">
                  {formatPrice(maxPrice, isRtl)}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="600"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-medium text-[#727D88] mt-2">
                <span>50 TND</span>
                <span>300 TND</span>
                <span>600+ TND</span>
              </div>
            </div>

            {/* Reset Filters CTA */}
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#DAD3C5] text-xs font-bold text-[#727D88] hover:text-[#191C1F] hover:bg-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser tous les filtres</span>
            </button>

          </aside>

          {/* ================= RIGHT MAIN LISTINGS ================= */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Header bar with Count, Sort and Toggle [ Liste | Mosaïque ] */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EBE6DC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#191C1F] font-display">
                  {loading
                    ? 'Exploration des circuits...'
                    : `${excursions.length} expédition${excursions.length > 1 ? 's' : ''} disponible${excursions.length > 1 ? 's' : ''}`
                  }
                </h2>
                <p className="text-xs text-[#727D88] mt-0.5">
                  Guides bilingues diplômés d'État & véhicules 4x4 tout-terrain révisés
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
                    <option value="rating">Mieux notés</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                  </select>
                </div>

                {/* View toggle segmented pill */}
                <div className="view-toggle-pill">
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`view-toggle-item ${viewMode === 'list' ? 'active' : 'inactive'}`}
                    title="Affichage en Liste"
                  >
                    <LayoutList className="w-4 h-4" />
                    <span className="hidden sm:inline">Liste</span>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`view-toggle-item ${viewMode === 'grid' ? 'active' : 'inactive'}`}
                    title="Affichage en Mosaïque"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Mosaïque</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchExcursions}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  Réessayer
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
            {!loading && !error && excursions.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EBE6DC] shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#191C1F]">
                  Aucune excursion trouvée avec ces critères
                </h3>
                <p className="text-sm text-[#727D88] mt-1 max-w-md mx-auto">
                  Modifiez la ville de départ ou la catégorie d'expédition pour découvrir d'autres circuits.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-6 py-2.5 rounded-full bg-[#A84A3B] text-white font-bold text-xs hover:bg-[#8A372A] transition-colors cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* ================= MODE 1: LISTE ================= */}
            {!loading && !error && viewMode === 'list' && excursions.length > 0 && (
              <div className="space-y-5">
                {excursions.map((item) => {
                  const isFav = isFavorite(item._id || item.id);
                  const itemImg = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800';

                  return (
                    <div
                      key={item._id || item.id}
                      className="bg-white rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-xl hover:border-[#DAD3C5] transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
                    >
                      {/* Left: 100% Height Photo Edge-to-Edge with Object Cover */}
                      <div className="md:w-72 lg:w-84 shrink-0 relative bg-neutral-900 overflow-hidden min-h-[220px] md:min-h-full">
                        <img
                          src={itemImg}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        {/* Top Category Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {item.category}
                          </span>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={() => toggleFavorite(item, 'excursion')}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-[#A84A3B] transition-colors cursor-pointer"
                          title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#A84A3B] text-[#A84A3B]' : ''}`} />
                        </button>

                        {/* Duration Pill */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#F4A261]" />
                          <span>{item.duration || '1 Journée'}</span>
                        </div>
                      </div>

                      {/* Center: Metadata, Highlights & Inclusions */}
                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                        <div>
                          {/* Departure City & Vehicle pill */}
                          <div className="flex flex-wrap items-center gap-2 mb-1.5 text-[11px] font-bold text-[#727D88]">
                            <span className="inline-flex items-center gap-1 text-[#A84A3B] bg-[#A84A3B]/10 px-2 py-0.5 rounded-full">
                              <MapPin className="w-3 h-3" /> Départ : {item.departureCity || 'Tunis'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[#2C3E56] bg-[#2C3E56]/10 px-2 py-0.5 rounded-full">
                              <Car className="w-3 h-3" /> {item.vehicleType || '4x4 VIP'}
                            </span>
                            {item.groupSize && (
                              <span className="inline-flex items-center gap-1 text-[#4A525A] bg-[#F8F7EE] px-2 py-0.5 rounded-full border border-[#EBE6DC]">
                                <Users className="w-3 h-3" /> {item.groupSize}
                              </span>
                            )}
                          </div>

                          {/* Title & Rating */}
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <h3 className="text-xl font-extrabold text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors">
                              {item.title}
                            </h3>

                            <div className="flex items-center gap-1.5 shrink-0 bg-[#F8F7EE] px-2.5 py-1 rounded-xl border border-[#EBE6DC]">
                              <span className="text-xs font-black text-[#A84A3B]">★ {(item.rating || 4.96).toFixed(2)}</span>
                              <span className="text-[10px] text-[#727D88]">({item.reviewsCount || 34} avis)</span>
                            </div>
                          </div>

                          {/* Tagline / route summary */}
                          <p className="text-xs text-[#727D88] line-clamp-2 mb-3">
                            {item.tagline || item.description}
                          </p>

                          {/* Highlights with checkmarks */}
                          {getExcursionHighlights(item).slice(0, 3).map((hl, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-[#4A525A] mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="line-clamp-1">{hl}</span>
                            </div>
                          ))}
                        </div>

                        {/* Inclusions assurance */}
                        <div className="pt-2 border-t border-[#EBE6DC] flex items-center gap-2 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">Guide officiel bilingue + transport aller-retour inclus</span>
                        </div>
                      </div>

                      {/* Right: Price & CTA Panel */}
                      <div className="md:w-60 lg:w-64 p-5 sm:p-6 bg-[#F8F7EE] border-t md:border-t-0 md:border-l border-[#EBE6DC] flex flex-col justify-between shrink-0">
                        <div>
                          <div className="text-right mb-1">
                            {item.originalPriceTND && (
                              <p className="text-xs text-[#727D88] line-through font-semibold">
                                {formatPrice(item.originalPriceTND, isRtl)}
                              </p>
                            )}
                            <p className="text-[11px] uppercase tracking-wider font-bold text-[#727D88]">Par adulte</p>
                            <p className="text-2xl font-black text-[#191C1F] font-display">
                              {formatPrice(item.pricePerAdult || item.pricePerPersonTND || 150, isRtl)}
                            </p>
                          </div>
                          <p className="text-right text-xs font-semibold text-[#A84A3B]">
                            Tarif tout compris
                          </p>
                          <p className="text-right text-[10px] text-[#727D88] mt-0.5">
                            Transport, repas & accès sites
                          </p>
                        </div>

                        <div className="space-y-2 mt-4">
                          <button
                            onClick={() => navigate(`/excursions/${item._id || item.id}`)}
                            className="w-full py-2 px-3 rounded-xl border border-[#DAD3C5] bg-white hover:bg-[#EBE6DC] text-[#191C1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#2C3E56]" />
                            <span>Voir l'itinéraire</span>
                          </button>

                          <button
                            onClick={() => navigate(`/excursions/${item._id || item.id}`)}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#A84A3B] to-[#C25847] hover:from-[#8A372A] hover:to-[#A84A3B] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                          >
                            <span>Réserver le circuit</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <div className="pt-1 text-center">
                            <span className="text-[10px] text-[#727D88]">
                              Confirmation immédiate par WhatsApp
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= MODE 2: MOSAÏQUE (Bento Grid 3 Columns) ================= */}
            {!loading && !error && viewMode === 'grid' && excursions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {excursions.map((item) => {
                  const isFav = isFavorite(item._id || item.id);
                  const itemImg = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800';

                  return (
                    <div
                      key={item._id || item.id}
                      className="bg-white rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-xl hover:border-[#DAD3C5] transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                    >
                      {/* Photo Top */}
                      <div className="relative aspect-16/10 bg-neutral-900 overflow-hidden">
                        <img
                          src={itemImg}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {item.category}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleFavorite(item, 'excursion')}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-[#A84A3B] transition-colors cursor-pointer"
                          title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#A84A3B] text-[#A84A3B]' : ''}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-extrabold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#F4A261]" /> {item.duration || '1 Journée'}
                          </span>
                          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-[#F4A261]">
                            ★ {(item.rating || 4.96).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Middle Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#A84A3B] mb-1">
                            <MapPin className="w-3 h-3" /> Départ : {item.departureCity || 'Tunisie'}
                          </div>

                          <h3 className="font-extrabold text-lg text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors">
                            {item.title}
                          </h3>

                          <p className="text-xs text-[#727D88] line-clamp-2 mt-1 mb-3">
                            {item.tagline || item.description}
                          </p>

                          {/* Highlights */}
                          {getExcursionHighlights(item).slice(0, 2).map((hl, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#4A525A] mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="line-clamp-1">{hl}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Price and Actions */}
                        <div className="pt-4 mt-4 border-t border-[#EBE6DC]">
                          <div className="flex items-baseline justify-between mb-3">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-[#727D88]">Par personne</p>
                              <p className="text-xl font-black text-[#191C1F] font-display">
                                {formatPrice(item.pricePerAdult || item.pricePerPersonTND || 150, isRtl)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-emerald-700 font-bold">Tout inclus</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => navigate(`/excursions/${item._id || item.id}`)}
                              className="py-2 rounded-xl border border-[#DAD3C5] text-xs font-bold text-[#191C1F] hover:bg-[#F8F7EE] transition-colors cursor-pointer"
                            >
                              Détails
                            </button>
                            <button
                              onClick={() => navigate(`/excursions/${item._id || item.id}`)}
                              className="py-2 rounded-xl bg-[#A84A3B] hover:bg-[#8A372A] text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                            >
                              Réserver
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

      {/* 3. REASSURANCE TRUST SECTION */}
      <div className="mt-16 border-t border-[#EBE6DC] bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Flotte 4x4 tout-terrain révisée',
                desc: 'Land Cruiser et quads préparés spécifiquement pour le franchissement saharien',
              },
              {
                icon: Users,
                title: 'Guides bilingues certifiés',
                desc: 'Guides officiels du Ministère du Tourisme natifs des régions visitées',
              },
              {
                icon: Sparkles,
                title: 'Bivouacs nomades VIP',
                desc: 'Tentes sahariennes privatives avec lits confortables et cuisine traditionnelle au feu de camp',
              },
              {
                icon: CheckCircle2,
                title: 'Assistance & sécurité satellite',
                desc: 'Balises GPS satellitaires et liaison permanente sur toutes nos expéditions du Sud',
              },
            ].map((g, idx) => {
              const Icon = g.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 p-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#191C1F]">{g.title}</h4>
                    <p className="text-xs text-[#727D88] mt-0.5 leading-relaxed">{g.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating AI Concierge Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsConciergeOpen(true)}
          className="flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-[#2C3E56] to-[#1F2C3D] text-white shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#A84A3B] flex items-center justify-center text-white shadow-sm group-hover:rotate-12 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Concierge VIP</p>
            <p className="text-xs font-extrabold text-white">Conseiller Voyage IA</p>
          </div>
        </button>
      </div>

      <AIConciergeModal isOpen={isConciergeOpen} onClose={() => setIsConciergeOpen(false)} />
      <Footer />
    </div>
  );
}
