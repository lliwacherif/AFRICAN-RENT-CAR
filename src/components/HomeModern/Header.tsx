import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Phone, 
  Shield, 
  User, 
  Globe, 
  ChevronDown, 
  Sparkles, 
  Menu, 
  X, 
  Car, 
  Home as HomeIcon, 
  Compass, 
  Check, 
  LogOut,
  Grid,
  Clock,
  BookOpen,
  Building2,
  Heart,
  UserCheck
} from 'lucide-react';
import { Currency } from '../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';

interface HeaderProps {
  currency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenQuickSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currency: propCurrency,
  onCurrencyChange,
  onNavigateTab,
  onOpenQuickSearch,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Connect to app contexts for real logic
  const authContext = useAuth() as any;
  const langContext = useLanguage() as any;
  const currContext = useCurrency() as any;
  const wishlistContext = useWishlist() as any;
  const wishlistCount = wishlistContext?.count || 0;

  const user = authContext?.user;
  const openAuthModal = authContext?.openAuthModal;
  const logout = authContext?.logout;

  const lang = langContext?.lang || 'fr';
  const setLanguage = langContext?.setLanguage || (() => {});
  const t = langContext?.t || ((_k: string, d: string) => d);

  const currentCurrency = (currContext?.currency || propCurrency || 'TND') as Currency;
  const setCurrency = (c: Currency) => {
    if (currContext?.setCurrency) currContext.setCurrency(c);
    if (onCurrencyChange) onCurrencyChange(c);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: t('nav.accueil', 'Accueil'), href: '/', isHome: true },
    { label: t('nav.voitures', 'Voitures & Flotte'), href: '/voitures', icon: Car },
    { label: t('nav.appartements', 'Hébergements & Villas'), href: '/appartements', icon: HomeIcon },
    { label: t('nav.excursions', 'Circuits & Excursions'), href: '/excursions', icon: Compass },
    { label: t('nav.chauffeur', 'Transfer'), href: '/transfer', icon: UserCheck },
    { label: t('nav.guide', 'Guide Tunisie'), href: '/guide', icon: BookOpen },
    { label: t('nav.contact', 'À Propos & Agences'), href: '/contact', icon: Building2 },
  ];

  const handleLogout = () => {
    if (logout) logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top micro-bar: assistance & contact with subtle frosted dark glass */}
      <div className="relative z-50 bg-[#1F2C3D]/95 backdrop-blur-xl text-[#EBE6DC] text-xs py-1.5 px-4 sm:px-8 border-b border-white/10 shadow-sm">
        <div className="max-w-[1750px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-medium text-white/95">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Assistance & Prise en charge aéroport 24/7
            </span>
            <span className="sm:hidden font-semibold text-white/90 text-[11px]">
              AFRICAN RENT CAR
            </span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline text-white/75">
              12 agences & comptoirs express en Tunisie
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <a
              href="tel:+21627908060"
              className="hidden sm:inline-flex items-center gap-1.5 text-white/90 hover:text-[#C25847] transition-colors font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-[#C25847]" />
              <span>+216 27 908 060</span>
            </a>
            <span className="hidden sm:inline text-white/20">|</span>

            {/* Currency Selector Pill (Top Right) */}
            <div className="flex items-center bg-black/40 p-0.5 rounded-full border border-white/15 backdrop-blur-md shadow-inner">
              {(['TND', 'EUR', 'USD'] as Currency[]).map((curr) => {
                const isActive = currentCurrency === curr;
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-2 sm:px-2.5 py-0.5 text-[10.5px] sm:text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#A84A3B] to-[#C25847] text-white shadow-[0_2px_8px_rgba(168,74,59,0.5)] font-black scale-[1.02]'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title={`Afficher les prix en ${curr}`}
                  >
                    {curr}
                  </button>
                );
              })}
            </div>

            <span className="text-white/25">|</span>

            {/* Language Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 hover:text-white text-xs font-semibold cursor-pointer transition-all duration-200 shadow-xs"
                aria-expanded={isLangDropdownOpen}
              >
                <img
                  src={lang === 'ar' ? '/Ar.png' : '/Fr.png'}
                  alt={lang}
                  className="w-4 h-3 object-cover rounded-xs shadow-xs"
                />
                <span className="text-white font-medium">{lang === 'ar' ? 'العربية' : 'Français'}</span>
                <ChevronDown className={`w-3 h-3 text-white/70 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-[#162232]/98 backdrop-blur-2xl rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.5)] border border-white/20 py-1.5 text-white z-[100] animate-in fade-in zoom-in-95 overflow-hidden">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1">
                    Langue / Language
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('fr');
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs rounded-xl flex items-center justify-between font-bold cursor-pointer transition-colors ${
                      lang === 'fr' 
                        ? 'bg-[#A84A3B]/30 text-[#F4A261]' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src="/Fr.png" alt="Français" className="w-4 h-3 object-cover rounded-xs" />
                      <span>Français</span>
                    </div>
                    {lang === 'fr' && <Check className="w-3.5 h-3.5 text-[#F4A261]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('ar');
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs rounded-xl flex items-center justify-between font-bold cursor-pointer transition-colors ${
                      lang === 'ar' 
                        ? 'bg-[#A84A3B]/30 text-[#F4A261]' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src="/Ar.png" alt="العربية" className="w-4 h-3 object-cover rounded-xs" />
                      <span>العربية</span>
                    </div>
                    {lang === 'ar' && <Check className="w-3.5 h-3.5 text-[#F4A261]" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Apple Frosted Glass navigation bar */}
      <nav
        className={`relative z-30 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-2xl backdrop-saturate-[180%] shadow-[0_12px_40px_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(255,255,255,0.8)] py-2 border-b border-white/60'
            : 'bg-white/65 backdrop-blur-2xl backdrop-saturate-[180%] py-2.5 sm:py-3 border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.03),inset_0_-1px_0_rgba(255,255,255,0.6)]'
        }`}
      >
        <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Logo with stylized car contour & typography */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#2C3E56] to-[#1F2C3D] flex items-center justify-center shadow-[0_8px_16px_rgba(44,62,86,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-all duration-300 border border-white/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.2V16c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl tracking-tight text-[#191C1F]">
                  AFRICAN
                </span>
                <span className="font-extrabold text-xl tracking-tight text-[#A84A3B]">
                  RENT CAR
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#727D88]">
                Mobilité & Séjours d'Exception
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const isActive = item.isHome
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#A84A3B] bg-white shadow-[0_2px_8px_rgba(168,74,59,0.08)] border border-[#F3D7D2] font-bold'
                      : 'text-[#4A525A] hover:text-[#191C1F] hover:bg-black/[0.03]'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A84A3B]' : 'text-[#727D88]'}`} />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right actions: Admin/User pill, Wishlist, Magnetic CTA */}
          <div className="hidden sm:flex items-center gap-2.5">

            {/* User Profile / Login Pill */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/70 hover:bg-white backdrop-blur-md border border-[#EBE6DC] shadow-xs text-xs font-semibold text-[#191C1F] transition-all cursor-pointer"
                  title="Mon Espace Client"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName || 'Profil'}
                      className="w-6 h-6 rounded-full object-cover shadow-xs border border-white/40"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2C3E56] to-[#1F2C3D] text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U'))}
                    </div>
                  )}
                  <span className="hidden md:inline font-bold">
                    {user.firstName || user.name || 'Client'} {user.lastName ? user.lastName.charAt(0) + '.' : ''}
                  </span>
                  <span className={`text-[10px] border font-bold px-1.5 py-0.5 rounded-full ${
                    isAdmin 
                      ? 'bg-red-500/15 text-red-900 border-red-500/20' 
                      : 'bg-amber-500/20 text-amber-900 border-amber-500/30'
                  }`}>
                    {isAdmin ? 'ADMIN' : 'VIP'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#727D88]" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-white/80 py-2 text-[#191C1F] z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2 border-b border-black/[0.06] mb-1">
                      <p className="text-xs font-bold text-[#191C1F]">
                        {user.firstName || user.name || 'Client'} {user.lastName || ''}
                      </p>
                      <p className="text-[10px] text-[#727D88] truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-black/5 rounded-xl flex items-center gap-2 font-bold text-[#A84A3B] transition-colors"
                      >
                        <Grid className="w-3.5 h-3.5" />
                        <span>Tableau de bord Admin</span>
                      </Link>
                    )}

                    <Link
                      to="/historique"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-black/5 rounded-xl flex items-center gap-2 font-bold text-[#2C3E56] transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mes réservations</span>
                    </Link>

                    <Link
                      to="/favoris"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-black/5 rounded-xl flex items-center justify-between font-bold text-[#191C1F] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-[#A84A3B]" />
                        <span>Mes favoris</span>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#A84A3B] text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-red-50 text-red-600 rounded-xl flex items-center gap-2 font-bold transition-colors cursor-pointer border-t border-black/[0.04] mt-1 pt-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal && openAuthModal('login')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-xs font-bold text-[#191C1F] border border-[#EBE6DC] shadow-xs hover:border-[#A84A3B]/40 hover:text-[#A84A3B] transition-all cursor-pointer"
                title="Se connecter à votre compte"
              >
                <User className="w-3.5 h-3.5 text-[#A84A3B]" />
                <span>{t('nav.login', 'Connexion')}</span>
              </button>
            )}

            {/* Quick Wishlist Link */}
            <Link
              to="/favoris"
              className="relative p-2 rounded-full bg-white/70 hover:bg-white text-[#4A525A] hover:text-[#A84A3B] border border-[#EBE6DC] shadow-xs transition-colors cursor-pointer"
              title="Mes favoris"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#A84A3B] text-[#A84A3B]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A84A3B] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Quick Action Button: Navigates to /voitures */}
            <Link
              to="/voitures"
              className="bg-[#A84A3B] hover:bg-[#8F3E31] active:scale-[0.98] text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Car className="w-3.5 h-3.5 text-white/90" />
              <span>{t('nav.reserver', 'Réserver')}</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-2xl bg-white/60 backdrop-blur-md text-[#191C1F] hover:bg-white/90 border border-white/80 shadow-sm cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown with Apple frosted glass */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-3xl border-b border-white/80 px-4 pt-3 pb-6 mt-3 space-y-3 shadow-2xl animate-in slide-in-from-top-2">
            {/* Currency & Language row in mobile menu */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#727D88] uppercase tracking-wider">Devise</span>
                <div className="flex items-center bg-black/[0.04] p-0.5 rounded-full border border-black/[0.05]">
                  {(['TND', 'EUR', 'USD'] as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-full cursor-pointer transition-all ${
                        currentCurrency === curr 
                          ? 'bg-[#A84A3B] text-white shadow-xs' 
                          : 'text-[#727D88]'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-black/[0.04] p-0.5 rounded-full border border-black/[0.05]">
                <button
                  type="button"
                  onClick={() => setLanguage('fr')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                    lang === 'fr' ? 'bg-[#A84A3B] text-white shadow-xs' : 'text-[#727D88]'
                  }`}
                >
                  <img src="/Fr.png" alt="FR" className="w-3.5 h-2.5 object-cover rounded-xs" />
                  <span>FR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                    lang === 'ar' ? 'bg-[#A84A3B] text-white shadow-xs' : 'text-[#727D88]'
                  }`}
                >
                  <img src="/Ar.png" alt="AR" className="w-3.5 h-2.5 object-cover rounded-xs" />
                  <span>AR</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-[#191C1F] hover:bg-black/5 flex items-center justify-between transition-colors"
                >
                  <span>{item.label}</span>
                  <span className="text-[#A84A3B] text-xs font-bold">→</span>
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-black/[0.06] space-y-3">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName || 'Profil'}
                        className="w-8 h-8 rounded-full object-cover shadow-xs border border-black/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#2C3E56] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-[#191C1F] truncate">{user.firstName || user.name} {user.lastName || ''}</p>
                      <p className="text-[10px] text-[#727D88] truncate">{isAdmin ? 'Mode Administrateur' : 'Client Privilège'}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2 px-3 rounded-xl bg-[#A84A3B] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Tableau de bord Admin</span>
                    </Link>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/historique"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#EBE6DC] text-xs font-bold text-[#2C3E56] flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Réservations</span>
                    </Link>
                    <Link
                      to="/favoris"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#EBE6DC] text-xs font-bold text-[#A84A3B] flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#A84A3B]" />
                      <span>Favoris ({wishlistCount})</span>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (openAuthModal) openAuthModal('login');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#EBE6DC] text-xs font-bold text-[#191C1F] hover:text-[#A84A3B] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <User className="w-4 h-4 text-[#A84A3B]" />
                    <span>Se connecter / Inscription</span>
                  </button>
                  <Link
                    to="/favoris"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2 px-4 rounded-xl bg-white border border-[#EBE6DC] text-xs font-bold text-[#4A525A] flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Heart className="w-4 h-4 text-[#A84A3B]" />
                    <span>Mes favoris ({wishlistCount})</span>
                  </Link>
                </div>
              )}

              <Link
                to="/voitures"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4" />
                <span>Rechercher un véhicule</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
