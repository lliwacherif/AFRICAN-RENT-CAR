import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Sparkles,
  Car,
  ShieldCheck,
  Heart,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verifyEmail, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Lien de vérification invalide ou manquant.');
      return;
    }

    let isMounted = true;
    const doVerify = async () => {
      try {
        const res = await verifyEmail(token);
        if (isMounted) {
          setSuccess(true);
          setMessage(res?.message || 'Votre e-mail a été vérifié avec succès !');
          if (res?.user) {
            setVerifiedUser(res.user);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              'Le lien de vérification a expiré ou est invalide.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    doVerify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-[#121820] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#A84A3B]/30 selection:text-white">
      {/* 1. CINEMATIC LUXURY BACKDROP (Matches Accueil Hero) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <img
          src="/hero-crimson-amg.jpg"
          alt="African Rent Car"
          onError={(e) => {
            e.currentTarget.src = '/hero-fallback.jpg';
          }}
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.25] contrast-[1.1] blur-[1px]"
        />
        {/* Soft luxury overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121820] via-[#121820]/75 to-[#121820]/90" />
        <div className="absolute top-[-80px] right-10 w-[550px] h-[550px] bg-gradient-to-b from-[#A84A3B]/25 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] left-10 w-[600px] h-[600px] bg-gradient-to-t from-[#2C3E56]/30 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. UNIFIED MODERN HEADER (Matches Accueil) */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* 3. MAIN VERIFICATION CARD CONTAINER */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="w-full max-w-lg mx-auto">
          <div className="bg-[#161D26]/85 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl shadow-black/70 p-6 sm:p-10 text-center relative overflow-hidden">
            {/* Ambient top light */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#A84A3B]/30 rounded-full blur-2xl pointer-events-none" />

            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-white/90 mb-6 uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#F4A261]" />
              <span>AFRICAN RENT CAR • ESPACE PRIVILÈGE</span>
            </div>

            {/* ── STATE 1: LOADING ── */}
            {loading && (
              <div className="flex flex-col items-center py-6 space-y-4">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#A84A3B]/10 border border-[#A84A3B]/30">
                  <Loader2 className="w-10 h-10 text-[#A84A3B] animate-spin" />
                  <div className="absolute inset-0 rounded-full animate-ping bg-[#A84A3B]/10 pointer-events-none" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                  Vérification en cours...
                </h1>
                <p className="text-sm text-white/70 max-w-sm leading-relaxed">
                  Validation de votre jeton de sécurité et activation de votre compte en temps réel.
                </p>
              </div>
            )}

            {/* ── STATE 2: SUCCESS ── */}
            {!loading && success && (
              <div className="flex flex-col items-center py-2 space-y-5">
                {/* Glowing Success Icon */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-11 h-11 text-emerald-400" />
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                    E-mail confirmé avec succès ! 🎉
                  </h1>
                  <p className="text-sm font-semibold text-emerald-400">
                    {message}
                  </p>
                  {verifiedUser?.firstName && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full mt-1 border border-white/10">
                      <UserCheck className="w-3.5 h-3.5 text-[#F4A261]" />
                      <span>Bienvenue, <strong className="text-white font-bold">{verifiedUser.firstName} {verifiedUser.lastName}</strong></span>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-md">
                  Votre compte est désormais actif et sécurisé. Profitez dès maintenant d'un accès complet à tous nos services de mobilité premium en Tunisie.
                </p>

                {/* Key Benefits Grid */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 text-left pt-2 pb-1">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                    <Car className="w-4 h-4 text-[#A84A3B]" />
                    <span className="text-[11px] font-bold text-white">Flotte 2025/2026</span>
                    <span className="text-[10px] text-white/60 leading-tight">Réservation directe sans caution démesurée</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-bold text-white">Accueil VIP</span>
                    <span className="text-[10px] text-white/60 leading-tight">Prise en charge aéroports 24h/24 7j/7</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="text-[11px] font-bold text-white">Favoris & Suivi</span>
                    <span className="text-[10px] text-white/60 leading-tight">Accès direct à votre liste et historique</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col gap-3 pt-2">
                  <button
                    onClick={() => navigate('/voitures')}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-[#A84A3B] to-[#8F3E31] text-white shadow-lg shadow-[#A84A3B]/30 hover:shadow-[#A84A3B]/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Explorer nos véhicules</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    to="/"
                    className="w-full py-3 px-6 rounded-xl font-semibold text-xs text-white/80 bg-white/10 hover:bg-white/15 hover:text-white border border-white/15 transition-all text-center"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            )}

            {/* ── STATE 3: ERROR ── */}
            {!loading && error && (
              <div className="flex flex-col items-center py-2 space-y-5">
                {/* Error Icon */}
                <div className="w-20 h-20 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <AlertTriangle className="w-11 h-11 text-rose-400" />
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                    Échec de la vérification
                  </h1>
                  <p className="text-sm font-semibold text-rose-400">
                    {error}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-md">
                  Le lien de confirmation que vous avez utilisé a expiré ou a déjà été validé. Vous pouvez vous connecter directement ou demander un nouvel e-mail.
                </p>

                <div className="w-full flex flex-col gap-3 pt-3">
                  <button
                    onClick={() => {
                      if (openAuthModal) {
                        openAuthModal('login');
                      } else {
                        navigate('/');
                      }
                    }}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-[#A84A3B] to-[#8F3E31] text-white shadow-lg shadow-[#A84A3B]/30 hover:shadow-[#A84A3B]/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Se connecter à mon compte</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    to="/"
                    className="w-full py-3 px-6 rounded-xl font-semibold text-xs text-white/80 bg-white/10 hover:bg-white/15 hover:text-white border border-white/15 transition-all text-center"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. UNIFIED MODERN FOOTER (Matches Accueil) */}
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
