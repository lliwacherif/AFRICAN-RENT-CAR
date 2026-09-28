import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  Car,
  Home as HomeIcon,
  Compass,
  Trash2,
  Eye,
  ChevronRight,
  Star,
  MapPin,
  Users,
  Fuel,
  Gauge,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';
import { AIConciergeModal } from '../../components/HomeModern/AIConciergeModal';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { wishlist, cars, apartments, excursions, count, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { t, isRtl } = useLanguage();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'car' | 'apartment' | 'excursion'
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  // If user is not logged in, show account login screen just like Historique page
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFFF0] pb-24 text-[#191C1F]">
        <Header />
        <main className="max-w-md mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#EBE6DC] shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-8 h-8 fill-[#A84A3B]" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 px-3 py-1 rounded-full">
                Espace Client Sécurisé
              </span>
              <h2 className="text-2xl font-black text-[#191C1F] font-display mt-3">
                Connexion requise
              </h2>
              <p className="text-xs sm:text-sm text-[#727D88] mt-2 leading-relaxed">
                Votre liste de favoris est enregistrée directement sur votre compte client. Connectez-vous pour retrouver vos véhicules, dars et excursions sauvegardés.
              </p>
            </div>
            <button
              onClick={() => openAuthModal && openAuthModal('login')}
              className="w-full py-3 px-6 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Se connecter à mon compte</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-[#727D88]">
              Nouveau sur African Rent Car ?{' '}
              <button
                onClick={() => openAuthModal && openAuthModal('register')}
                className="text-[#A84A3B] font-bold hover:underline cursor-pointer"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredItems = wishlist.filter((entry) => {
    if (activeTab === 'all') return true;
    return entry.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#FFFFF0] pb-24 text-[#191C1F]">
      {/* 1. LUXURY MODERN HEADER */}
      <Header />

      {/* 2. TOP HERO HEADER - Sleek Gradient Banner */}
      <div className="bg-gradient-to-b from-[#2C3E56] to-[#1F2C3D] pt-10 sm:pt-12 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A84A3B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#2C3E56]/40 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold mb-3">
            <Heart className="w-3.5 h-3.5 fill-[#F4A261] text-[#F4A261]" />
            <span>Sélection privée • Compte de {user.firstName || user.name || 'Client'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Mes Coups de Cœur ({count})
          </h1>
          <p className="text-sm sm:text-base text-white/75 mt-2 max-w-2xl">
            Retrouvez tous vos coups de cœur enregistrés sur votre compte client. Comparez et finalisez vos réservations en toute sérénité.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#A84A3B] text-white shadow-md'
                  : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/10'
              }`}
            >
              Tous les favoris ({count})
            </button>
            <button
              onClick={() => setActiveTab('car')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'car'
                  ? 'bg-[#A84A3B] text-white shadow-md'
                  : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/10'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Voitures ({cars.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('apartment')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'apartment'
                  ? 'bg-[#A84A3B] text-white shadow-md'
                  : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/10'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Hébergements ({apartments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('excursion')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'excursion'
                  ? 'bg-[#A84A3B] text-white shadow-md'
                  : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Excursions ({excursions.length})</span>
            </button>

            {count > 0 && (
              <button
                onClick={clearWishlist}
                className="ml-auto text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Vider la liste"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider la liste</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. MAIN WISHLIST GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* LOADING STATE */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#EBE6DC] shadow-xs max-w-xl mx-auto my-8 space-y-4">
            <div className="w-12 h-12 border-4 border-[#A84A3B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#191C1F]">Chargement de vos favoris depuis votre compte...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#EBE6DC] shadow-xs max-w-2xl mx-auto my-8 space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#191C1F] font-display">
                {activeTab === 'all'
                  ? 'Votre liste de favoris est vide'
                  : `Aucun favori dans la catégorie sélectionnée`}
              </h3>
              <p className="text-xs sm:text-sm text-[#727D88] mt-2 max-w-md mx-auto leading-relaxed">
                Cliquez sur l'icône cœur <strong className="text-[#A84A3B]">♥</strong> sur n'importe quel véhicule, dar ou excursion pour les enregistrer et les retrouver instantanément ici.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                to="/voitures"
                className="px-5 py-2.5 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Explorer les voitures</span>
              </Link>
              <Link
                to="/appartements"
                className="px-5 py-2.5 rounded-full bg-[#2C3E56] hover:bg-[#1F2C3D] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Voir les hébergements</span>
              </Link>
              <Link
                to="/excursions"
                className="px-5 py-2.5 rounded-full bg-white border border-[#EBE6DC] hover:bg-[#F8F7EE] text-[#191C1F] text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-[#A84A3B]" />
                <span>Découvrir les circuits</span>
              </Link>
            </div>
          </div>
        ) : (
          /* POPULATED CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((entry) => {
              const { id, type, item } = entry;

              if (type === 'car') {
                const carImg = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800';
                return (
                  <div
                    key={`car-${id}`}
                    className="bg-white rounded-3xl border border-[#EBE6DC] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative h-52 bg-neutral-900 overflow-hidden">
                        <img
                          src={carImg}
                          alt={item.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {item.category || 'Voiture'}
                          </span>
                        </div>

                        {/* Remove from Wishlist Button */}
                        <button
                          onClick={() => removeFromWishlist(id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#A84A3B] hover:scale-110 shadow-xs transition-transform cursor-pointer"
                          title="Retirer des favoris"
                        >
                          <Heart className="w-4 h-4 fill-[#A84A3B]" />
                        </button>

                        <div className="absolute bottom-3 left-3 text-white text-xs font-bold">
                          Année {item.year || 2025} • {item.brand}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-extrabold text-lg text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-xs text-[#727D88]">{item.tagline || 'Véhicule certifié 2025/2026'}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-[#F8F7EE] px-2 py-0.5 rounded-lg border border-[#EBE6DC] shrink-0">
                            <Star className="w-3 h-3 fill-[#A84A3B] text-[#A84A3B]" />
                            <span className="text-xs font-black text-[#A84A3B]">{(item.rating || 4.9).toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-[#F8F7EE]/80 border border-[#EBE6DC] text-xs text-[#4A525A] my-3">
                          <div className="flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-[#A84A3B]" />
                            <span className="truncate">{item.transmission || 'Manuelle'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="w-3.5 h-3.5 text-[#2C3E56]" />
                            <span className="truncate">{item.fuel || 'Essence'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#2C3E56]" />
                            <span>{item.seats || 5} pl.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between pt-3 border-t border-[#EBE6DC] mb-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#727D88]">Tarif journalier</p>
                          <p className="text-xl font-black text-[#191C1F] font-display">
                            {formatPrice(item.pricePerDay || 90, isRtl)} <span className="text-xs font-semibold text-[#727D88]">/ jour</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Kilométrage adapté
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/voitures/${id}`)}
                          className="py-2.5 rounded-full border border-[#DAD3C5] bg-white hover:bg-[#F8F7EE] text-[#191C1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2C3E56]" />
                          <span>Détails</span>
                        </button>
                        <button
                          onClick={() => navigate(`/voitures/${id}?book=true`)}
                          className="py-2.5 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                        >
                          <span>Réserver</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (type === 'apartment') {
                const aptImg = item.images?.[0] || item.coverImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';
                return (
                  <div
                    key={`apt-${id}`}
                    className="bg-white rounded-3xl border border-[#EBE6DC] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-52 bg-neutral-900 overflow-hidden">
                        <img
                          src={aptImg}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {item.type || 'Dar & Villa'}
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromWishlist(id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#A84A3B] hover:scale-110 shadow-xs transition-transform cursor-pointer"
                          title="Retirer des favoris"
                        >
                          <Heart className="w-4 h-4 fill-[#A84A3B]" />
                        </button>

                        <div className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#F4A261]" />
                          <span>{item.city || 'Tunisie'}</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-extrabold text-lg text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#727D88]">{item.city}, Tunisie</p>
                          </div>
                          <div className="flex items-center gap-1 bg-[#F8F7EE] px-2 py-0.5 rounded-lg border border-[#EBE6DC] shrink-0">
                            <Star className="w-3 h-3 fill-[#A84A3B] text-[#A84A3B]" />
                            <span className="text-xs font-black text-[#A84A3B]">{(item.rating || 4.9).toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 py-2 text-xs text-[#4A525A]">
                          <span>👥 Jusqu'à {item.capacity?.maxGuests || 4} pers.</span>
                          <span>•</span>
                          <span>🛏 {item.capacity?.bedrooms || 2} ch.</span>
                          <span>•</span>
                          <span>🏊‍♂️ {item.amenities?.pool ? 'Piscine' : 'Vue mer'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between pt-3 border-t border-[#EBE6DC] mb-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#727D88]">Par nuitée</p>
                          <p className="text-xl font-black text-[#191C1F] font-display">
                            {formatPrice(item.pricing?.pricePerNight || 220, isRtl)} <span className="text-xs font-semibold text-[#727D88]">/ nuit</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/appartements/${id}`)}
                          className="py-2.5 rounded-full border border-[#DAD3C5] bg-white hover:bg-[#F8F7EE] text-[#191C1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2C3E56]" />
                          <span>Détails</span>
                        </button>
                        <button
                          onClick={() => navigate(`/appartements/${id}`)}
                          className="py-2.5 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                        >
                          <span>Réserver</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (type === 'excursion') {
                const excImg = item.images?.[0] || item.coverImage || 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800';
                return (
                  <div
                    key={`exc-${id}`}
                    className="bg-white rounded-3xl border border-[#EBE6DC] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-52 bg-neutral-900 overflow-hidden">
                        <img
                          src={excImg}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#191C1F] shadow-xs">
                            {item.category || 'Circuit'}
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromWishlist(id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#A84A3B] hover:scale-110 shadow-xs transition-transform cursor-pointer"
                          title="Retirer des favoris"
                        >
                          <Heart className="w-4 h-4 fill-[#A84A3B]" />
                        </button>

                        <div className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#F4A261]" />
                          <span>{item.duration || 'Journée complète'}</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-extrabold text-lg text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#727D88]">{item.departureCity ? `Départ : ${item.departureCity}` : 'Sud & Sahara'}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-[#F8F7EE] px-2 py-0.5 rounded-lg border border-[#EBE6DC] shrink-0">
                            <Star className="w-3 h-3 fill-[#A84A3B] text-[#A84A3B]" />
                            <span className="text-xs font-black text-[#A84A3B]">{(item.rating || 4.95).toFixed(1)}</span>
                          </div>
                        </div>

                        <p className="text-xs text-[#727D88] line-clamp-2 my-2">
                          {item.shortDescription || item.description || 'Guide certifié, transfert 4x4 et expérience VIP privative.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between pt-3 border-t border-[#EBE6DC] mb-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#727D88]">Par adulte</p>
                          <p className="text-xl font-black text-[#191C1F] font-display">
                            {formatPrice(item.pricePerAdult || 140, isRtl)}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Guide & Déjeuner inclus
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/excursions/${id}`)}
                          className="py-2.5 rounded-full border border-[#DAD3C5] bg-white hover:bg-[#F8F7EE] text-[#191C1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2C3E56]" />
                          <span>Circuit</span>
                        </button>
                        <button
                          onClick={() => navigate(`/excursions/${id}`)}
                          className="py-2.5 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                        >
                          <span>Réserver</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}

      </main>

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
