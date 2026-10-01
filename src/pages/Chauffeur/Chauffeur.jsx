import { useText } from '../../context/LanguageContext'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  UserCheck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Users, 
  Briefcase, 
  Check, 
  Plane, 
  Phone, 
  Calendar, 
  X, 
  Car, 
  Navigation, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpDown, 
  Compass,
  Wifi,
  Coffee,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Search
} from 'lucide-react';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { chauffeurService } from '../../services/chauffeurService';
import ChauffeurTrailModal from '../../components/ChauffeurMap/ChauffeurTrailModal';
import './Chauffeur.css';

export default function Chauffeur() {
  const tr = useText()

  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();

  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [selectedTrailRoute, setSelectedTrailRoute] = useState(null);

  // Catalog filter & search state
  const [catalogFilter, setCatalogFilter] = useState('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Selector state
  const [departPoint, setDepartPoint] = useState('');
  const [destinationPoint, setDestinationPoint] = useState('');
  const [locations, setLocations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [matchedRoute, setMatchedRoute] = useState(null);

  // Reservation Modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '14:30',
    flightNumber: '',
    passengers: 2,
    luggage: 2,
    fullName: user ? `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    notes: '',
  });

  const resultRef = useRef(null);

  // Load routes and locations on mount
  useEffect(() => {
    async function loadData() {
      setLoadingRoutes(true);
      try {
        const [routesData, locsData] = await Promise.all([
          chauffeurService.getAll(),
          chauffeurService.getLocations(),
        ]);
        setRoutes(Array.isArray(routesData) ? routesData : []);
        setLocations(Array.isArray(locsData) ? locsData : []);

        if (routesData.length > 0) {
          // Preselect popular route (e.g. Aéroport Tunis -> Sousse)
          setDepartPoint(routesData[0].from);
          setDestinationPoint(routesData[0].to);
        } else if (locsData && locsData.length >= 2) {
          setDepartPoint(locsData[0].name);
          setDestinationPoint(locsData[1].name);
        }
      } catch (err) {
        console.error('Error loading chauffeur lines and locations:', err);
      } finally {
        setLoadingRoutes(false);
      }
    }
    loadData();
  }, []);

  // Distinct list of departures and destinations (combining locations catalog + any existing routes)
  const departureOptions = useMemo(() => {
    const set = new Set();
    locations
      .filter(l => l.isActive !== false && (l.type === 'departure' || l.type === 'both' || !l.type))
      .forEach(l => set.add(l.name));
    routes.forEach(r => r.from && set.add(r.from));
    return Array.from(set).sort((a, b) => {
      const locA = locations.find(l => l.name === a);
      const locB = locations.find(l => l.name === b);
      if (locA?.popular && !locB?.popular) return -1;
      if (!locA?.popular && locB?.popular) return 1;
      return a.localeCompare(b, 'fr');
    });
  }, [locations, routes]);

  const destinationOptions = useMemo(() => {
    const set = new Set();
    locations
      .filter(l => l.isActive !== false && (l.type === 'destination' || l.type === 'both' || !l.type))
      .forEach(l => set.add(l.name));
    routes.forEach(r => r.to && set.add(r.to));
    return Array.from(set).sort((a, b) => {
      const locA = locations.find(l => l.name === a);
      const locB = locations.find(l => l.name === b);
      if (locA?.popular && !locB?.popular) return -1;
      if (!locA?.popular && locB?.popular) return 1;
      return a.localeCompare(b, 'fr');
    });
  }, [locations, routes]);

  // Valid destinations for currently selected departure
  const availableDestinationsForDepart = routes
    .filter(r => r.from === departPoint)
    .map(r => r.to);

  // Filtered routes for the catalog grid
  const filteredCatalogRoutes = routes.filter((route) => {
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const matchText =
        route.from.toLowerCase().includes(q) ||
        route.to.toLowerCase().includes(q) ||
        route.title?.toLowerCase().includes(q) ||
        route.assignedChauffeur?.name?.toLowerCase().includes(q) ||
        route.assignedChauffeur?.vehicleModel?.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    if (catalogFilter === 'airports') {
      return (
        route.from.toLowerCase().includes('aéroport') ||
        route.to.toLowerCase().includes('aéroport') ||
        route.from.includes('(TUN)') ||
        route.from.includes('(NBE)') ||
        route.from.includes('(DJE)')
      );
    }
    if (catalogFilter === 'sahel') {
      return (
        route.from.toLowerCase().includes('sousse') ||
        route.to.toLowerCase().includes('sousse') ||
        route.from.toLowerCase().includes('enfidha') ||
        route.to.toLowerCase().includes('hammamet')
      );
    }
    if (catalogFilter === 'tunis') {
      return (
        route.from.toLowerCase().includes('tunis') ||
        route.to.toLowerCase().includes('tunis') ||
        route.to.toLowerCase().includes('marsa') ||
        route.to.toLowerCase().includes('bizerte')
      );
    }
    if (catalogFilter === 'south') {
      return (
        route.from.toLowerCase().includes('djerba') ||
        route.to.toLowerCase().includes('djerba') ||
        route.to.toLowerCase().includes('midoun') ||
        route.from.toLowerCase().includes('tozeur')
      );
    }
    return true;
  });

  // Swap Points
  const handleSwap = () => {
    const temp = departPoint;
    setDepartPoint(destinationPoint);
    setDestinationPoint(temp);
    setHasSearched(false);
  };

  // Perform search / availability check
  const handleCheckRoute = async (e) => {
    if (e) e.preventDefault();
    if (!departPoint || !destinationPoint) return;

    setCheckingAvailability(true);
    setHasSearched(true);

    try {
      const match = await chauffeurService.checkRoute(departPoint, destinationPoint);
      setMatchedRoute(match);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      console.error('Error checking chauffeur availability:', err);
      setMatchedRoute(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Instant Select from Catalog
  const handleSelectFromCatalog = (route) => {
    setDepartPoint(route.from);
    setDestinationPoint(route.to);
    setMatchedRoute(route);
    setHasSearched(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  // Open booking modal
  const handleOpenBooking = () => {
    if (user) {
      setBookingForm(prev => ({
        ...prev,
        fullName: `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
    setBookingSuccess(null);
    setIsBookingOpen(true);
  };

  // Submit booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!matchedRoute) return;

    setIsSubmittingBooking(true);
    try {
      const res = await chauffeurService.bookRoute(matchedRoute._id, {
        ...bookingForm,
        routeName: `${matchedRoute.from} → ${matchedRoute.to}`,
        chauffeurName: matchedRoute.assignedChauffeur?.name,
        priceTND: matchedRoute.basePriceTND
      });

      setBookingSuccess(res);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Une erreur est survenue lors de votre demande. Notre support est joignable au +216 27 908 060.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="chauffeur-page">
      <Header />

      {/* Hero Section */}
      <section className="chauffeur-hero">
        <div className="chauffeur-hero__glow-1" />
        <div className="chauffeur-hero__glow-2" />

        <div className="max-w-[1300px] mx-auto text-center relative z-10 px-4">
          <div className="chauffeur-badge">
            <UserCheck className="w-4 h-4 text-[#F4A261]" />
            <span>{tr("Lignes Régulières & Chauffeur Privé Assigné")}</span>
          </div>

          <h1 className="chauffeur-title">
            {tr("Voyagez d'un Point A à un Point B")} <br />
            <span className="accent">{tr("avec Chauffeur Dédié & Prix Fixe")}</span>
          </h1>

          <p className="chauffeur-subtitle mx-auto">
            {tr("Notre agence programme et sécurise des liaisons régulières à travers toute la Tunisie. Choisissez votre point de départ et votre destination pour vérifier en temps réel le chauffeur et le véhicule de prestige affectés à votre trajet.")}
          </p>

          {/* Quick Pillars pill */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/80 font-semibold pt-2">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tr("Lignes Garanties & Tarifs Fixes")}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15">
              <Plane className="w-3.5 h-3.5 text-[#F4A261]" />
              <span>{tr("Accueil Pancarte Aéroports 24/7")}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{tr("Flotte VIP Mercedes, Audi & BMW")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Route Checker Box */}
      <section className="max-w-[1300px] mx-auto px-4">
        <div className="chauffeur-search-card">
          <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-6 border-b border-[#EBE6DC] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A84A3B] animate-ping" />
                <h2 className="text-xl sm:text-2xl font-black text-[#191C1F] tracking-tight">
                  {tr("Vérificateur de Ligne & Disponibilité Chauffeur")}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#727D88] mt-1 font-medium">
                {tr("Sélectionnez vos étapes parmi les liaisons configurées par l'agence.")}
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-[#EBE6DC] px-4 py-2 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2C3E56]/10 text-[#2C3E56] flex items-center justify-center font-black text-xs">
                {tr(routes.length)}
              </div>
              <div className="text-left text-xs">
                <p className="font-extrabold text-[#191C1F]">{tr("Liaisons Actives")}</p>
                <p className="text-[11px] text-[#727D88]">{tr("Chauffeurs assignés")}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCheckRoute}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Point A : Départ */}
              <div className="lg:col-span-5">
                <label className="search-step-tag">
                  <MapPin className="w-3.5 h-3.5 text-[#A84A3B]" />
                  <span>{tr("Point de Départ (Lieu de prise en charge)")}</span>
                </label>
                <div className="route-select-wrapper">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A84A3B]" />
                    <select
                      value={departPoint}
                      onChange={(e) => {
                        setDepartPoint(e.target.value);
                        setHasSearched(false);
                      }}
                      className="cursor-pointer"
                    >
                      <option value="" disabled>{tr("Sélectionnez le lieu de départ...")}</option>
                      {departureOptions.map((pt) => {
                        const locObj = locations.find(l => l.name === pt);
                        const icon = locObj?.category === 'airport' ? '✈️ ' : locObj?.category === 'hotel_zone' ? '🏨 ' : locObj?.category === 'port' ? '⚓ ' : '📍 ';
                        return (
                          <option key={pt} value={pt}>
                            {tr(icon)}{tr(pt)} {tr(locObj?.popular ? '⭐' : '')}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#727D88] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="lg:col-span-2 flex justify-center py-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="route-swap-btn"
                  title={tr("Inverser le sens du trajet")}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Point B : Destination */}
              <div className="lg:col-span-5">
                <label className="search-step-tag">
                  <Navigation className="w-3.5 h-3.5 text-[#2C3E56]" />
                  <span>{tr("Point d'Arrivée (Destination finale)")}</span>
                </label>
                <div className="route-select-wrapper">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C3E56]" />
                    <select
                      value={destinationPoint}
                      onChange={(e) => {
                        setDestinationPoint(e.target.value);
                        setHasSearched(false);
                      }}
                      className="cursor-pointer"
                    >
                      <option value="" disabled>{tr("Sélectionnez la destination...")}</option>
                      {destinationOptions.map((pt) => {
                        const isReachableDirectly = availableDestinationsForDepart.includes(pt);
                        const locObj = locations.find(l => l.name === pt);
                        const icon = locObj?.category === 'airport' ? '✈️ ' : locObj?.category === 'hotel_zone' ? '🏨 ' : locObj?.category === 'port' ? '⚓ ' : '📍 ';
                        return (
                          <option key={pt} value={pt}>
                            {tr(icon)}{tr(pt)} {tr(isReachableDirectly ? '• (Liaison Directe)' : '')}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#727D88] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit / Check Button */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                disabled={checkingAvailability || !departPoint || !destinationPoint}
                className="chauffeur-check-btn"
              >
                {checkingAvailability ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{tr("Vérification de l'affectation en cours...")}</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    <span>{tr("Vérifier la disponibilité du chauffeur pour ce trajet")}</span>
                  </>
                )}
              </button>

              <a
                href="tel:+21627908060"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#EBE6DC] text-xs font-bold text-[#2C3E56] flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-[#A84A3B]" />
                <span>{tr("Assistance Lignes 24/7 : +216 27 908 060")}</span>
              </a>
            </div>
          </form>

          {/* Quick popular routes pills */}
          <div className="mt-6 pt-5 border-t border-[#F0EBE1] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#727D88] font-bold">{tr("Liaisons directes fréquentes :")}</span>
            {routes.slice(0, 4).map((r) => (
              <button
                key={r._id}
                type="button"
                onClick={() => handleSelectFromCatalog(r)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3D7D2]/40 text-[#191C1F] hover:text-[#A84A3B] border border-[#EBE6DC] font-semibold transition-all flex items-center gap-1.5 text-[11px]"
              >
                <span>{r.from.split('(')[0].trim()}</span>
                <span className="text-[#A84A3B]">➔</span>
                <span>{r.to.split('&')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Result Showcase */}
        <div ref={resultRef} className="route-result-container mb-16">
          {hasSearched && (
            matchedRoute ? (
              /* MATCH FOUND WITH DESIGNATED CHAUFFEUR */
              <div className="assigned-card">
                {/* Header */}
                <div className="assigned-card__header">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          {tr("Liaison Confirmée & Chauffeur Prêt")}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black mt-1 text-white">
                        {tr(matchedRoute.from)} <span className="text-[#F4A261]">➔</span> {tr(matchedRoute.to)}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-white/90">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                      <Clock className="w-4 h-4 text-[#F4A261]" />
                      <span>{tr(matchedRoute.duration || '1h 30m')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                      <Navigation className="w-4 h-4 text-emerald-400" />
                      <span>{tr(matchedRoute.distance || '120 km')}</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left: Chauffeur Profile */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-sm flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="chauffeur-avatar-ring shrink-0">
                          <img 
                            src={matchedRoute.assignedChauffeur?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'} 
                            alt={tr(matchedRoute.assignedChauffeur?.name)}
                          />
                          <div className="verified-driver-badge" title={tr("Chauffeur Professionnel Agréé")}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#A84A3B] bg-[#A84A3B]/10 px-2 py-0.5 rounded-md">
                            {tr("Chauffeur Assigné à cette ligne")}
                          </span>
                          <h4 className="text-xl font-extrabold text-[#191C1F] mt-1">
                            {tr(matchedRoute.assignedChauffeur?.name || 'Chauffeur VIP')}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-amber-500 font-bold text-xs">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                              <span>{tr(matchedRoute.assignedChauffeur?.rating || 4.9)}</span>
                              <span className="text-[#727D88] font-normal ml-1">/ 5.0</span>
                            </div>
                            <span className="text-[#727D88] text-xs">•</span>
                            <span className="text-xs font-semibold text-[#727D88]">
                              {tr(matchedRoute.assignedChauffeur?.experienceYears || 10)} {tr("ans d'expérience")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="mt-4 pt-4 border-t border-[#F0EBE1]">
                        <p className="text-[11px] font-bold text-[#727D88] uppercase tracking-wider mb-2">
                          {tr("Langues parlées par le chauffeur :")}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(matchedRoute.assignedChauffeur?.spokenLanguages || ['Français', 'العربية', 'English']).map(lang => (
                            <span key={lang} className="px-2.5 py-1 rounded-full bg-[#FAF8F5] text-xs font-semibold text-[#2C3E56] border border-[#EBE6DC]">
                              {tr(lang)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F0EBE1] flex items-center justify-between text-xs text-[#727D88]">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {tr("Disponibilité confirmée")}
                      </span>
                      <span>{tr("Badge d'accueil nominatif")}</span>
                    </div>
                  </div>

                  {/* Middle: Vehicle & Amenities */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-5 rounded-3xl border border-[#EBE6DC] shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-black text-[#A84A3B] uppercase tracking-wider mb-2">
                        <Car className="w-4 h-4" />
                        <span>{tr("Véhicule de Prestige Affecté")}</span>
                      </div>

                      <h5 className="text-lg font-black text-[#191C1F]">
                        {tr(matchedRoute.assignedChauffeur?.vehicleModel || 'Berline Affaires')}
                      </h5>
                      <p className="text-xs font-semibold text-[#727D88] mt-0.5">
                        {tr("Immatriculation :")} <span className="font-mono font-bold text-[#191C1F]">{tr(matchedRoute.assignedChauffeur?.vehiclePlate || '234 TU 8901')}</span>
                      </p>

                      <div className="mt-4 space-y-2">
                        {(matchedRoute.assignedChauffeur?.amenities || [
                          'Climatisation régulée',
                          'Wi-Fi 5G Haut Débit',
                          'Bouteilles d\'eau minérale fraîches',
                          'Chargeurs smartphone universels'
                        ]).map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#2C3E56] font-medium">
                            <Check className="w-3.5 h-3.5 text-[#A84A3B] shrink-0" />
                            <span>{tr(amenity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EBE6DC] text-xs text-[#4A525A] space-y-1.5">
                      <p className="font-bold text-[#191C1F] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#A84A3B]" />
                        <span>{tr("Inclus dans ce forfait fixe :")}</span>
                      </p>
                      <p>{tr("✓ Tous les frais de péages autoroutiers")}</p>
                      <p>{tr("✓ 60 minutes d'attente gratuite en cas de retard d'avion")}</p>
                      <p>{tr("✓ Prise en charge des bagages")}</p>
                    </div>
                  </div>

                  {/* Right: Price & Booking Action */}
                  <div className="lg:col-span-3 bg-gradient-to-br from-[#1F2C3D] to-[#162232] text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between text-center">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#F4A261] bg-white/10 px-3 py-1 rounded-full border border-white/15">
                        {tr("Tarif Fixe Tout Inclus")}
                      </span>

                      <div className="my-5">
                        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          {formatPrice(matchedRoute.basePriceTND)}
                        </div>
                        <p className="text-[11px] text-white/70 mt-1 font-medium">
                          {tr("Prix garanti sans surprise • Pas de compteur")}
                        </p>
                      </div>

                      <div className="border-t border-white/10 pt-4 text-[11px] text-white/80 space-y-1 text-left">
                        <p className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{tr("Annulation gratuite jusqu'à 12h")}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{tr("Paiement en ligne ou à bord")}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTrailRoute(matchedRoute)}
                      className="mt-4 w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Navigation className="w-4 h-4 text-[#F4A261]" />
                      <span>{tr("Visualiser le tracé sur la carte Google Maps")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenBooking}
                      className="mt-2.5 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#A84A3B] to-[#C25847] hover:brightness-110 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{tr("Réserver ce Trajet")}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* NO MATCH FOUND BANNER */
              <div className="not-found-banner">
                <div className="w-16 h-16 rounded-3xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#191C1F]">
                  {tr("Aucune ligne régulière assignée pour :")}
                </h3>
                <p className="text-base font-extrabold text-[#A84A3B] mt-1 mb-3">
                  « {tr(departPoint)} » ➔ « {tr(destinationPoint)} »
                </p>
                <p className="text-sm text-[#727D88] max-w-xl mx-auto mb-6 leading-relaxed">
                  {tr("Nos chauffeurs opèrent sur des trajets réguliers prédéfinis par l'agence. Ce trajet précis ne fait pas partie des lignes directes fixes actuelles.")}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (routes.length > 0) {
                        handleSelectFromCatalog(routes[0]);
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#2C3E56] text-white text-xs font-extrabold hover:bg-[#1F2C3D] transition-colors"
                  >
                    {tr("Voir notre liaison principale :")} {tr(routes[0]?.from)} ➔ {tr(routes[0]?.to)}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenBooking}
                    className="px-6 py-3 rounded-2xl bg-[#A84A3B] text-white text-xs font-extrabold hover:bg-[#8F3E31] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{tr("Demander un chauffeur privé pour cet itinéraire")}</span>
                  </button>

                  <a
                    href="tel:+21627908060"
                    className="px-6 py-3 rounded-2xl bg-white border border-[#EBE6DC] text-xs font-extrabold text-[#A84A3B] hover:bg-[#FAF8F5] transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{tr("Assistance téléphonique 24/7 : +216 27 908 060")}</span>
                  </a>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Catalog of Pre-configured Routes */}
      <section className="py-16 bg-[#FAF8F5] border-t border-[#EBE6DC]">
        <div className="max-w-[1300px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="catalog-card__badge mb-2">
                <Compass className="w-3.5 h-3.5 text-[#2C3E56]" />
                <span>{tr("Réseau de Lignes Régulières")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] tracking-tight">
                {tr("Toutes nos Lignes Fixes avec Chauffeurs Dédiés")}
              </h2>
              <p className="text-xs sm:text-sm text-[#727D88] mt-1 font-medium">
                {tr("Cliquez sur une ligne pour l'examiner et voir immédiatement son chauffeur assigné.")}
              </p>
            </div>

            <div className="text-xs text-[#727D88] font-semibold">
              {tr("Tarifs garantis en")} <span className="font-extrabold text-[#A84A3B]">{tr(currency)}</span>
            </div>
          </div>

          {/* Filter Toolbar & Quick Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#EBE6DC]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: `Toutes les lignes (${routes.length})` },
                { id: 'airports', label: '✈️ Aéroports Direct' },
                { id: 'sahel', label: '🏖️ Sousse & Sahel' },
                { id: 'tunis', label: '🏛️ Grand Tunis' },
                { id: 'south', label: '🌴 Djerba & Sud' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCatalogFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    catalogFilter === f.id
                      ? 'bg-[#A84A3B] text-white shadow-sm'
                      : 'bg-white hover:bg-[#F2EDE4] text-[#4A525A] border border-[#EBE6DC]'
                  }`}
                >
                  {tr(f.label)}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#727D88] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={tr("Rechercher une ville, chauffeur...")}
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-[#EBE6DC] text-xs font-semibold text-[#191C1F] placeholder:text-[#727D88] focus:outline-none focus:border-[#A84A3B] focus:ring-2 focus:ring-[#A84A3B]/10 transition-all shadow-2xs"
              />
              {catalogSearch && (
                <button
                  type="button"
                  onClick={() => setCatalogSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727D88] hover:text-[#191C1F] cursor-pointer"
                  title={tr("Effacer la recherche")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {loadingRoutes ? (
            <div className="py-12 text-center text-[#727D88]">
              <div className="w-8 h-8 border-3 border-[#A84A3B]/30 border-t-[#A84A3B] rounded-full animate-spin mx-auto mb-3" />
              <p className="font-bold text-sm">{tr("Chargement des liaisons régulières...")}</p>
            </div>
          ) : filteredCatalogRoutes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#EBE6DC] p-8 max-w-md mx-auto shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#191C1F]">{tr("Aucune ligne ne correspond à vos filtres")}</h3>
              <p className="text-xs text-[#727D88] mt-1 mb-4">
                {tr("Essayez d'ajuster votre recherche ou réinitialisez les critères.")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCatalogFilter('all');
                  setCatalogSearch('');
                }}
                className="px-4 py-2 rounded-xl bg-[#2C3E56] text-white text-xs font-extrabold hover:bg-[#A84A3B] transition-colors"
              >
                {tr("Réinitialiser les filtres")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredCatalogRoutes.map((route) => {
                const isCurrent = matchedRoute?._id === route._id;
                const isAirport = route.from.toLowerCase().includes('aéroport') || route.to.toLowerCase().includes('aéroport');

                return (
                  <div
                    key={route._id}
                    onClick={() => setSelectedTrailRoute(route)}
                    className={`catalog-card cursor-pointer group ${isCurrent ? 'is-active' : ''}`}
                    title={tr("Cliquer pour afficher l'itinéraire complet sur Google Maps")}
                  >
                    <div>
                      {/* Top Header Pill Bar */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-800 border border-emerald-500/25">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{tr("Chauffeur Dédié")}</span>
                          </span>
                          {route.popular && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-800 border border-amber-500/30">
                              <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                              <span>{tr("Prisée")}</span>
                            </span>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#2C3E56] text-xs font-extrabold border border-[#EBE6DC] shrink-0">
                          <Clock className="w-3.5 h-3.5 text-[#A84A3B]" />
                          <span>{tr(route.duration)}</span>
                          {route.distance && (
                            <>
                              <span className="text-[#727D88]/30">•</span>
                              <span className="text-[#727D88] text-[11px]">{tr(route.distance)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Route Journey Visual Display */}
                      <div className="p-3.5 rounded-2xl bg-[#FFFFF0]/90 border border-[#EBE6DC] shadow-2xs">
                        {/* Departure (Point A) */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center shrink-0 border border-[#A84A3B]/20 mt-0.5">
                            {route.from.toLowerCase().includes('aéroport') ? (
                              <Plane className="w-3.5 h-3.5 text-[#A84A3B]" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-[#A84A3B]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-[#A84A3B] block">
                              {tr("Prise en charge")}
                            </span>
                            <p className="text-xs sm:text-[13px] font-extrabold text-[#191C1F] leading-snug mt-0.5">
                              {tr(route.from)}
                            </p>
                          </div>
                        </div>

                        {/* Connector with Direct Transfer Pill */}
                        <div className="flex items-center gap-2 pl-3.5 my-1.5">
                          <div className="h-4 border-l-2 border-dashed border-[#A84A3B]/35" />
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#727D88] bg-white px-2 py-0.5 rounded-full border border-[#EBE6DC]">
                            <Navigation className="w-2.5 h-2.5 text-[#A84A3B]" />
                            <span>{tr("Liaison Directe Sans Arrêt")}</span>
                          </div>
                        </div>

                        {/* Arrival (Point B) */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-[#2C3E56]/10 text-[#2C3E56] flex items-center justify-center shrink-0 border border-[#2C3E56]/20 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#2C3E56]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-[#2C3E56] block">
                              Destination
                            </span>
                            <p className="text-xs sm:text-[13px] font-extrabold text-[#191C1F] leading-snug mt-0.5">
                              {tr(route.to)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Trail Map Preview CTA Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrailRoute(route);
                        }}
                        className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#2C3E56]/5 to-[#A84A3B]/10 hover:from-[#A84A3B]/15 hover:to-[#A84A3B]/25 border border-[#A84A3B]/20 text-[#A84A3B] hover:text-[#8B3224] text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#A84A3B]" />
                        <span>{tr("Voir le tracé en direct sur la carte")}</span>
                        <ArrowRight className="w-3 h-3 text-[#A84A3B] opacity-70" />
                      </button>

                      {/* Driver & Vehicle Prestige Inset Box */}
                      <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-br from-[#1F2C3D] to-[#162232] text-white shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={route.assignedChauffeur?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
                              alt={tr(route.assignedChauffeur?.name)}
                              className="w-11 h-11 rounded-2xl object-cover border-2 border-white/20 shadow-xs"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-[#162232]" title={tr("Chauffeur Certifié")}>
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-black text-white truncate">
                                {tr(route.assignedChauffeur?.name || 'Chauffeur Dédié')}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded-md border border-amber-400/20 shrink-0">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{tr(route.assignedChauffeur?.rating || '4.95')}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-[#F4A261] font-bold mt-0.5 truncate">
                              <Car className="w-3 h-3 shrink-0" />
                              <span className="truncate">{tr(route.assignedChauffeur?.vehicleModel || 'Berline VIP')}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-white/60">
                              {route.assignedChauffeur?.tripsCount && (
                                <span>{tr(route.assignedChauffeur.tripsCount)} {tr("courses")}</span>
                              )}
                              {route.assignedChauffeur?.languages?.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{route.assignedChauffeur.languages.slice(0, 2).join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Price & CTA */}
                    <div className="pt-3.5 border-t border-[#EBE6DC] flex items-center justify-between gap-3 mt-4">
                      <div>
                        <span className="text-[10px] text-[#727D88] font-black uppercase tracking-wider block">
                          {tr("Tarif Fixe Garanti")}
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-[#A84A3B] tracking-tight">
                          {formatPrice(route.basePriceTND)}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          {tr("✓ Péages & accueil inclus")}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFromCatalog(route);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap ${
                          isCurrent
                            ? 'bg-[#A84A3B] text-white shadow-[#A84A3B]/30 shadow-md ring-2 ring-[#A84A3B]/40'
                            : 'bg-[#2C3E56] hover:bg-[#A84A3B] text-white hover:shadow-md'
                        }`}
                      >
                        <span>{tr(isCurrent ? 'Ligne Activée' : 'Choisir cette ligne')}</span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isCurrent ? 'rotate-90' : ''} transition-transform`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Service Guarantees Section */}
      <section className="py-16 bg-[#FFFFF0]">
        <div className="max-w-[1300px] mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] tracking-tight">
              {tr("L'Excellence du Transport avec Chauffeur Privé")}
            </h3>
            <p className="text-xs sm:text-sm text-[#727D88] mt-2">
              {tr("Un confort sans compromis, pensé pour les professionnels, les voyageurs et les familles exigeantes.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#2C3E56]/10 text-[#2C3E56] flex items-center justify-center mb-4">
                <Plane className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-[#191C1F] mb-1.5">{tr("Accueil Aéroports VIP")}</h4>
              <p className="text-xs text-[#727D88] leading-relaxed">
                {tr("Votre chauffeur vous attend hall des arrivées avec une pancarte à votre nom et vous aide avec vos bagages.")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-[#191C1F] mb-1.5">{tr("Ponctualité Infaillible")}</h4>
              <p className="text-xs text-[#727D88] leading-relaxed">
                {tr("Suivi du statut de votre vol en temps réel. Si votre vol a du retard, votre chauffeur ajuste son heure sans supplément.")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#2C3E56]/10 text-[#2C3E56] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-[#191C1F] mb-1.5">{tr("Sécurité & Véhicules Récent")}</h4>
              <p className="text-xs text-[#727D88] leading-relaxed">
                {tr("Toutes nos voitures ont moins de 2 ans, sont climatisées et inspectées rigoureusement avant chaque départ.")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-[#191C1F] mb-1.5">{tr("Confort À Bord")}</h4>
              <p className="text-xs text-[#727D88] leading-relaxed">
                {tr("Wi-Fi 5G, eau minérale fraîche, chargeurs multi-marques et ambiance musicale relaxante sur mesure.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {isBookingOpen && matchedRoute && (
        <div className="booking-modal-overlay" onClick={() => setIsBookingOpen(false)}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 sm:p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EBE6DC] mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#A84A3B] bg-[#A84A3B]/10 px-2 py-0.5 rounded-md">
                    {tr("Réservation de Ligne Fixe")}
                  </span>
                  <h3 className="text-xl font-black text-[#191C1F] mt-1">
                    {tr("Confirmer votre Chauffeur")}
                  </h3>
                  <p className="text-xs text-[#727D88]">
                    {tr(matchedRoute.from)} ➔ {tr(matchedRoute.to)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#727D88] hover:text-[#191C1F] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-[#191C1F] mb-2">
                    {tr("Réservation Confirmée !")}
                  </h4>
                  <p className="text-xs text-[#727D88] max-w-md mx-auto mb-4 leading-relaxed">
                    {tr(bookingSuccess.message || 'Votre chauffeur et notre équipe ont bien reçu votre demande de prise en charge.')}
                  </p>

                  <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EBE6DC] text-xs font-mono font-bold text-[#2C3E56] mb-6 inline-block">
                    {tr("Dossier N° :")} {tr(bookingSuccess.reference || 'CHF-892110')}
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(false)}
                      className="px-6 py-3 rounded-xl bg-[#2C3E56] text-white text-xs font-extrabold hover:bg-[#1F2C3D] transition-colors"
                    >
                      {tr("Fermer")}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {/* Summary Recap banner */}
                  <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EBE6DC] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-[#191C1F]">
                        {tr("Chauffeur :")} {tr(matchedRoute.assignedChauffeur?.name)}
                      </p>
                      <p className="text-[#727D88]">
                        {tr("Véhicule :")} {tr(matchedRoute.assignedChauffeur?.vehicleModel)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#727D88] uppercase font-bold">{tr("Tarif Fixe")}</span>
                      <p className="text-base font-black text-[#A84A3B]">
                        {formatPrice(matchedRoute.basePriceTND)}
                      </p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1">
                        {tr("Date de prise en charge *")}
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-bold text-[#191C1F] outline-none focus:border-[#A84A3B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1">
                        {tr("Heure souhaitée *")}
                      </label>
                      <input
                        type="time"
                        required
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-bold text-[#191C1F] outline-none focus:border-[#A84A3B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1">
                        {tr("N° Vol (Aéroport)")}
                      </label>
                      <input
                        type="text"
                        placeholder={tr("Ex: TU 722")}
                        value={bookingForm.flightNumber}
                        onChange={(e) => setBookingForm({ ...bookingForm, flightNumber: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-medium text-[#191C1F] outline-none focus:border-[#A84A3B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1">
                        {tr("Passagers")}
                      </label>
                      <select
                        value={bookingForm.passengers}
                        onChange={(e) => setBookingForm({ ...bookingForm, passengers: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-bold text-[#191C1F] outline-none focus:border-[#A84A3B]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                          <option key={num} value={num}>{tr(num)} {tr("passager(s)")}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1">
                        {tr("Valises")}
                      </label>
                      <select
                        value={bookingForm.luggage}
                        onChange={(e) => setBookingForm({ ...bookingForm, luggage: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-bold text-[#191C1F] outline-none focus:border-[#A84A3B]"
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{tr(num)} {tr("valise(s)")}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="pt-2 border-t border-[#F0EBE1] space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1">
                        {tr("Nom & Prénom *")}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={tr("Ex: Ahmed Ben Salah")}
                        value={bookingForm.fullName}
                        onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-medium text-[#191C1F] outline-none focus:border-[#A84A3B]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#191C1F] mb-1">
                          {tr("Email de confirmation *")}
                        </label>
                        <input
                          type="email"
                          required
                          placeholder={tr("votre@email.com")}
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-medium text-[#191C1F] outline-none focus:border-[#A84A3B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#191C1F] mb-1">
                          {tr("Téléphone WhatsApp *")}
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+216 ..."
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-medium text-[#191C1F] outline-none focus:border-[#A84A3B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1">
                        {tr("Instructions particulières (optionnel)")}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={tr("Ex: Siège bébé 2 ans requis, pancarte au nom de la société...")}
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] text-xs font-medium text-[#191C1F] outline-none focus:border-[#A84A3B]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-[#EBE6DC] text-xs font-bold text-[#727D88] hover:bg-black/5 transition-colors"
                    >
                      {tr("Annuler")}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A84A3B] to-[#C25847] hover:brightness-110 text-white text-xs font-black shadow-md transition-all flex items-center gap-2"
                    >
                      {isSubmittingBooking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{tr("Transmission...")}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{tr("Confirmer ma Réservation")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Google Maps Route Trail Modal */}
      {selectedTrailRoute && (
        <ChauffeurTrailModal
          route={selectedTrailRoute}
          onClose={() => setSelectedTrailRoute(null)}
          onBookNow={(r) => {
            setSelectedTrailRoute(null);
            setMatchedRoute(r);
            setDepartPoint(r.from);
            setDestinationPoint(r.to);
            setHasSearched(true);
            handleOpenBooking();
          }}
        />
      )}

      <Footer />
    </div>
  );
}
