import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Home as HomeIcon,
  Compass,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Lock,
  ChevronRight,
  AlertCircle,
  FileCheck,
  UserCheck,
  Phone,
  Navigation,
  Plane,
  Users,
  Briefcase,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { reservationsService } from '../../services/vehiclesService';
import { apartmentsService } from '../../services/apartmentsService';
import { excursionsService } from '../../services/excursionsService';
import { chauffeurService } from '../../services/chauffeurService';
import ChauffeurTrailModal from '../../components/ChauffeurMap/ChauffeurTrailModal';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';

/* ── Helpers ─────────────────────────────────────────── */
const fmt = (d, lang = 'fr') =>
  d
    ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

/* ── Status badge styling ────────────────────────────── */
function StatusBadge({ status, label }) {
  const s = (status || '').toLowerCase();

  if (s === 'confirmed' || s === 'confirmee' || s === 'confirmée') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/25">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>{label || 'Confirmée'}</span>
      </span>
    );
  }

  if (s === 'completed' || s === 'terminee' || s === 'terminée') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#2C3E56]/10 text-[#2C3E56] border border-[#2C3E56]/25">
        <FileCheck className="w-3.5 h-3.5 text-[#2C3E56]" />
        <span>{label || 'Terminée'}</span>
      </span>
    );
  }

  if (s === 'cancelled' || s === 'annulee' || s === 'annulée') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/25">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>{label || 'Annulée'}</span>
      </span>
    );
  }

  // Default: reçu / en attente
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/25">
      <Clock className="w-3.5 h-3.5 text-amber-600" />
      <span>{label || 'Reçu'}</span>
    </span>
  );
}

/* ── Car Reservation Card ─────────────────────────────── */
function CarReservationCard({ r }) {
  const { t, lang, isRtl } = useLanguage();
  const { formatPrice } = useCurrency();

  const totalTTC = Number(r.totalTTC || 0);
  const amountPaid = Number(r.amountPaid || 0);
  const remaining = Number(r.remainingBalance || 0);
  const isFullyPaid = remaining <= 0;
  const totalDays = r.totalDays || 0;
  const pricePerDay = Number(r.pricePerDay || 0);

  const statusLabel = {
    recu: t('historique.statusRecu', 'Reçu'),
    pending: t('historique.statusPending', 'En attente'),
    confirmed: t('historique.statusConfirmed', 'Confirmée'),
    completed: t('historique.statusCompleted', 'Terminée'),
    cancelled: t('historique.statusCancelled', 'Annulée'),
  };

  const bookingCode = r._id ? `#${r._id.slice(-6).toUpperCase()}` : '#TCR-ARC';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE6DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5">
      {/* Top Details Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Image */}
          <div className="w-24 sm:w-32 h-18 sm:h-22 rounded-2xl bg-[#121820] overflow-hidden flex-shrink-0 border border-[#EBE6DC] flex items-center justify-center">
            {r.vehicle?.images?.[0] ? (
              <img
                src={r.vehicle.images[0]}
                alt={r.vehicle?.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <Car className="w-8 h-8 text-[#A84A3B]" />
            )}
          </div>

          {/* Title & Specs */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#191C1F]">
                {r.vehicle?.name || 'Véhicule'}
              </h3>
              <span className="font-mono text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 border border-[#A84A3B]/25 px-2.5 py-0.5 rounded-md">
                {bookingCode}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#727D88]">
              {r.vehicle?.category && (
                <span className="font-semibold text-[#191C1F]">
                  {r.vehicle.category}
                </span>
              )}
              {r.vehicle?.transmission && (
                <>
                  <span>•</span>
                  <span>{r.vehicle.transmission}</span>
                </>
              )}
              {r.vehicle?.fuel && (
                <>
                  <span>•</span>
                  <span>{r.vehicle.fuel}</span>
                </>
              )}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-1.5 text-xs text-[#727D88] pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#A84A3B]" />
              <span>
                {fmt(r.pickupDate, lang)} → {fmt(r.dropoffDate, lang)}
              </span>
              <span className="font-bold text-[#191C1F]">
                ({totalDays} {t('historique.days', 'jours')})
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-[#727D88]">
              <MapPin className="w-3.5 h-3.5 text-[#2C3E56]" />
              <span>{r.pickupLocation}</span>
              {r.dropoffLocation && r.dropoffLocation !== r.pickupLocation && (
                <span>→ {r.dropoffLocation}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="sm:self-start">
          <StatusBadge
            status={r.status}
            label={statusLabel[r.status] || r.status}
          />
        </div>
      </div>

      {/* Financial Breakdown Grid (Modern 4-Column Bar) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#FFFFF0] border border-[#EBE6DC]">
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            {t('historique.ratePerDay', 'Tarif / jour')}
          </div>
          <div className="text-sm sm:text-base font-bold text-[#191C1F] mt-0.5">
            {formatPrice(pricePerDay, isRtl)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            {t('historique.totalTTC', 'Total TTC')}
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#191C1F] mt-0.5">
            {formatPrice(totalTTC, isRtl)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            {t('historique.paid', 'Payé')}
          </div>
          <div className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">
            {formatPrice(amountPaid, isRtl)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            {t('historique.balance', 'Reste à payer')}
          </div>
          <div
            className={`text-sm sm:text-base font-extrabold mt-0.5 ${
              isFullyPaid ? 'text-emerald-600' : 'text-[#A84A3B]'
            }`}
          >
            {isFullyPaid ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('historique.paidInFull', 'Soldé')}</span>
              </span>
            ) : (
              formatPrice(remaining, isRtl)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Apartment Reservation Card ───────────────────────── */
function ApartmentReservationCard({ r }) {
  const { formatPrice } = useCurrency();
  const apt = r.apartment;
  const bookingCode = r._id ? `#${r._id.slice(-6).toUpperCase()}` : '#TCR-APT';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE6DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-24 sm:w-32 h-18 sm:h-22 rounded-2xl bg-[#121820] overflow-hidden flex-shrink-0 border border-[#EBE6DC] flex items-center justify-center">
            {apt?.images?.[0] ? (
              <img
                src={apt.images[0]}
                alt={apt?.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <HomeIcon className="w-8 h-8 text-[#A84A3B]" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#191C1F]">
                {apt?.title || 'Hébergement'}
              </h3>
              <span className="font-mono text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 border border-[#A84A3B]/25 px-2.5 py-0.5 rounded-md">
                {bookingCode}
              </span>
            </div>

            <div className="text-xs text-[#A84A3B] font-bold">
              {apt?.type || 'Dar & Villa'}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#727D88]">
              <Calendar className="w-3.5 h-3.5 text-[#A84A3B]" />
              <span>
                Du {fmt(r.checkInDate)} au {fmt(r.checkOutDate)}
              </span>
              <span className="font-bold text-[#191C1F]">
                ({r.totalNights} nuit{r.totalNights > 1 ? 's' : ''})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#727D88]">
              <MapPin className="w-3.5 h-3.5 text-[#2C3E56]" />
              <span>
                {apt?.city} • {r.adults} adulte(s)
                {r.children ? `, ${r.children} enfant(s)` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="sm:self-start">
          <StatusBadge status={r.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#FFFFF0] border border-[#EBE6DC]">
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Prix / nuit
          </div>
          <div className="text-sm sm:text-base font-bold text-[#191C1F] mt-0.5">
            {formatPrice(r.pricePerNight)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Frais ménage
          </div>
          <div className="text-sm sm:text-base font-bold text-[#191C1F] mt-0.5">
            {formatPrice(r.cleaningFee || 0)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Total TTC
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#191C1F] mt-0.5">
            {formatPrice(r.totalTTC)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Caution requise
          </div>
          <div className="text-sm sm:text-base font-bold text-[#2C3E56] mt-0.5">
            {formatPrice(r.depositAmount || 200)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Excursion Reservation Card ───────────────────────── */
function ExcursionReservationCard({ r }) {
  const { formatPrice } = useCurrency();
  const exc = r.excursion;
  const bookingCode = r._id ? `#${r._id.slice(-6).toUpperCase()}` : '#TCR-EXC';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE6DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-24 sm:w-32 h-18 sm:h-22 rounded-2xl bg-[#121820] overflow-hidden flex-shrink-0 border border-[#EBE6DC] flex items-center justify-center">
            {exc?.images?.[0] ? (
              <img
                src={exc.images[0]}
                alt={exc?.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <Compass className="w-8 h-8 text-[#A84A3B]" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#191C1F]">
                {exc?.title || 'Excursion'}
              </h3>
              <span className="font-mono text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 border border-[#A84A3B]/25 px-2.5 py-0.5 rounded-md">
                {bookingCode}
              </span>
            </div>

            <div className="text-xs text-[#A84A3B] font-bold">
              {exc?.category || 'Circuit Découverte'}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#727D88]">
              <Calendar className="w-3.5 h-3.5 text-[#A84A3B]" />
              <span>Date prévue : {fmt(r.date)}</span>
              {exc?.duration && (
                <span className="font-bold text-[#191C1F]">
                  ({exc.duration})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#727D88]">
              <MapPin className="w-3.5 h-3.5 text-[#2C3E56]" />
              <span>
                Prise en charge :{' '}
                {r.pickupLocation || `Départ ${exc?.departureCity || 'Tunis'}`}{' '}
                • {r.totalParticipants || r.adults} participant(s)
              </span>
            </div>
          </div>
        </div>

        <div className="sm:self-start">
          <StatusBadge status={r.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#FFFFF0] border border-[#EBE6DC]">
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Adultes
          </div>
          <div className="text-sm sm:text-base font-bold text-[#191C1F] mt-0.5">
            {r.adults} pers.
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Enfants
          </div>
          <div className="text-sm sm:text-base font-bold text-[#191C1F] mt-0.5">
            {r.children || 0} pers.
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Total réglé
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#191C1F] mt-0.5">
            {formatPrice(r.totalPrice)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Statut paiement
          </div>
          <div className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">
            {r.paymentStatus === 'paid' ? 'Payé' : 'À régler en agence'}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Chauffeur Reservation Card ───────────────────────── */
function ChauffeurReservationCard({ r, onOpenMap }) {
  const { formatPrice } = useCurrency();
  const bookingCode = r._id ? `#${r._id.slice(-6).toUpperCase()}` : '#TCR-CHF';

  const statusLabel = {
    recu: 'Reçu',
    pending: 'En attente',
    confirmed: 'Confirmée',
    completed: 'Terminée',
    cancelled: 'Annulée',
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE6DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5">
      {/* Top Details Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Chauffeur Avatar / Photo */}
          <div className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-[#121820] overflow-hidden flex-shrink-0 border border-[#EBE6DC] flex items-center justify-center">
            <img
              src={
                r.assignedChauffeur?.avatar ||
                r.chauffeurAvatar ||
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
              }
              alt={r.chauffeurName || 'Chauffeur Agréé'}
              className="w-full h-full object-cover object-center"
            />
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
              title="Chauffeur Certifié"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Title & Logistics */}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#191C1F]">
                {r.routeName || `${r.from} ➔ ${r.to}`}
              </h3>
              <span className="font-mono text-xs font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 border border-[#A84A3B]/25 px-2.5 py-0.5 rounded-md">
                {bookingCode}
              </span>
            </div>

            {/* Chauffeur and Vehicle badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-[#2C3E56]">
                <UserCheck className="w-3.5 h-3.5 text-[#A84A3B]" />
                <span>Chauffeur : <strong>{r.chauffeurName || 'Chauffeur Assigné'}</strong></span>
              </span>
              <span className="text-[#EBE6DC]">•</span>
              <span className="font-semibold text-[#727D88]">
                {r.vehicleModel || 'Berline Prestige'}
              </span>
              {r.flightNumber && (
                <>
                  <span className="text-[#EBE6DC]">•</span>
                  <span className="inline-flex items-center gap-1 text-[#A84A3B] font-bold">
                    <Plane className="w-3 h-3" />
                    <span>Vol {r.flightNumber}</span>
                  </span>
                </>
              )}
            </div>

            {/* Dates & Times */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#727D88] pt-0.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#A84A3B]" />
                <span>
                  Prise en charge :{' '}
                  <strong className="text-[#191C1F]">
                    {fmt(r.date)} à {r.time || '14:30'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#2C3E56]" />
                <span>{r.passengers || 1} passager(s)</span>
              </div>
              {r.luggage > 0 && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#2C3E56]" />
                  <span>{r.luggage} bagage(s)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="sm:self-start">
          <StatusBadge
            status={r.status}
            label={statusLabel[r.status] || r.status}
          />
        </div>
      </div>

      {/* Financial Breakdown Grid (Modern 4-Column Bar) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#FFFFF0] border border-[#EBE6DC]">
        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Type de Service
          </div>
          <div className="text-xs sm:text-sm font-bold text-[#191C1F] mt-0.5">
            Liaison Fixe Directe
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Tarif Forfaitaire
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#A84A3B] mt-0.5">
            {formatPrice(r.priceTND || 100)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Péages & Attente
          </div>
          <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5">
            Inclus sans surcoût
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-[#727D88] uppercase tracking-wider">
            Paiement
          </div>
          <div className="text-xs sm:text-sm font-bold text-[#2C3E56] mt-0.5">
            À bord ou en ligne
          </div>
        </div>
      </div>

      {/* Interactive Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#F0EBE1]">
        <button
          type="button"
          onClick={() => onOpenMap && onOpenMap(r)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2C3E56]/5 hover:bg-[#2C3E56]/10 text-[#2C3E56] text-xs font-extrabold border border-[#2C3E56]/15 transition-colors cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-[#A84A3B]" />
          <span>Voir l'itinéraire sur la carte Google Maps</span>
        </button>

        <a
          href={`https://wa.me/21627908060?text=Bonjour,%20je%20vous%20contacte%20concernant%20ma%20réservation%20de%20chauffeur%20${bookingCode}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 text-xs font-extrabold border border-emerald-500/20 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Contacter Support & Chauffeur</span>
        </a>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────── */
export default function Historique() {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [serviceTab, setServiceTab] = useState('cars'); // 'cars' | 'apartments' | 'excursions' | 'chauffeur'
  const [carResas, setCarResas] = useState([]);
  const [aptResas, setAptResas] = useState([]);
  const [excResas, setExcResas] = useState([]);
  const [chauffeurResas, setChauffeurResas] = useState([]);
  const [previewMapRoute, setPreviewMapRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      reservationsService.getAll().catch(() => []),
      apartmentsService.getReservations().catch(() => []),
      excursionsService.getReservations().catch(() => []),
      chauffeurService.getReservations({ userId: user._id, email: user.email }).catch(() => []),
    ])
      .then(([cars, apts, excs, chfs]) => {
        setCarResas(Array.isArray(cars) ? cars : []);
        setAptResas(Array.isArray(apts) ? apts : []);
        setExcResas(Array.isArray(excs) ? excs : []);
        setChauffeurResas(Array.isArray(chfs) ? chfs : []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Logged-out State
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFFF0] pb-24 text-[#191C1F]">
        <Header />
        <main className="max-w-md mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#EBE6DC] shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8 text-[#A84A3B]" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#A84A3B] bg-[#A84A3B]/10 px-3 py-1 rounded-full">
                Espace Client Sécurisé
              </span>
              <h2 className="text-2xl font-black text-[#191C1F] font-display mt-3">
                Connexion requise
              </h2>
              <p className="text-xs sm:text-sm text-[#727D88] mt-2 leading-relaxed">
                Connectez-vous pour consulter l'historique complet de vos
                réservations et gérer vos contrats en cours.
              </p>
            </div>
            <button
              onClick={() => openAuthModal && openAuthModal('login')}
              className="w-full py-3 px-6 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Se connecter à mon compte</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentCount =
    serviceTab === 'cars'
      ? carResas.length
      : serviceTab === 'apartments'
      ? aptResas.length
      : serviceTab === 'excursions'
      ? excResas.length
      : chauffeurResas.length;

  return (
    <div className="min-h-screen bg-[#FFFFF0] pb-24 text-[#191C1F] font-sans antialiased selection:bg-[#A84A3B]/15 selection:text-[#8A372A]">
      {/* 1. LUXURY MODERN HEADER (Matches Accueil) */}
      <Header />

      {/* 2. TOP HERO HEADER - Sleek Gradient Banner (Matches Accueil / Wishlist) */}
      <div className="bg-gradient-to-b from-[#2C3E56] to-[#1F2C3D] pt-10 sm:pt-12 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-lg relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A84A3B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#2C3E56]/40 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#F4A261]" />
            <span>Espace Privilège Client • Suivi en Temps Réel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Mon Espace Réservations
          </h1>
          <p className="text-sm sm:text-base text-white/75 mt-2 max-w-2xl leading-relaxed">
            Bonjour{' '}
            <strong className="text-white font-bold">
              {user.firstName} {user.lastName}
            </strong>{' '}
            — retrouvez le récapitulatif complet de vos véhicules, séjours et
            excursions en Tunisie.
          </p>

          {/* Quick Direct Links */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            <Link
              to="/voitures"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#A84A3B] text-white shadow-md hover:bg-[#8F3E31] transition-colors"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Réserver une voiture</span>
            </Link>
            <Link
              to="/appartements"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white/90 border border-white/10 transition-colors"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Voir les hébergements</span>
            </Link>
            <Link
              to="/excursions"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white/90 border border-white/10 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explorer les excursions</span>
            </Link>
            <Link
              to="/transfer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white/90 border border-white/10 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#F4A261]" />
              <span>Lignes Chauffeur Privé</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
        {/* ── Single Unified Filter Switcher Tabs (Clean & Polished) ── */}
        <div className="flex items-center justify-start gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setServiceTab('cars')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              serviceTab === 'cars'
                ? 'bg-[#A84A3B] text-white shadow-md shadow-[#A84A3B]/20'
                : 'bg-white text-[#727D88] hover:text-[#191C1F] border border-[#EBE6DC]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Voitures</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                serviceTab === 'cars'
                  ? 'bg-black/20 text-white'
                  : 'bg-[#FFFFF0] text-[#727D88]'
              }`}
            >
              {carResas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setServiceTab('apartments')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              serviceTab === 'apartments'
                ? 'bg-[#A84A3B] text-white shadow-md shadow-[#A84A3B]/20'
                : 'bg-white text-[#727D88] hover:text-[#191C1F] border border-[#EBE6DC]'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            <span>Hébergements</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                serviceTab === 'apartments'
                  ? 'bg-black/20 text-white'
                  : 'bg-[#FFFFF0] text-[#727D88]'
              }`}
            >
              {aptResas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setServiceTab('excursions')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              serviceTab === 'excursions'
                ? 'bg-[#A84A3B] text-white shadow-md shadow-[#A84A3B]/20'
                : 'bg-white text-[#727D88] hover:text-[#191C1F] border border-[#EBE6DC]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Excursions</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                serviceTab === 'excursions'
                  ? 'bg-black/20 text-white'
                  : 'bg-[#FFFFF0] text-[#727D88]'
              }`}
            >
              {excResas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setServiceTab('chauffeur')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              serviceTab === 'chauffeur'
                ? 'bg-[#A84A3B] text-white shadow-md shadow-[#A84A3B]/20'
                : 'bg-white text-[#727D88] hover:text-[#191C1F] border border-[#EBE6DC]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Chauffeur Privé</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                serviceTab === 'chauffeur'
                  ? 'bg-black/20 text-white'
                  : 'bg-[#FFFFF0] text-[#727D88]'
              }`}
            >
              {chauffeurResas.length}
            </span>
          </button>
        </div>

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-[#EBE6DC] animate-pulse h-40"
              />
            ))}
          </div>
        )}

        {/* ── Empty State (Luxury Glassmorphic matching Wishlist) ── */}
        {!loading && currentCount === 0 && (
          <div className="max-w-md mx-auto my-12 text-center bg-white rounded-3xl p-8 sm:p-10 border border-[#EBE6DC] shadow-sm space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mx-auto shadow-inner">
              {serviceTab === 'cars' ? (
                <Car className="w-8 h-8 text-[#A84A3B]" />
              ) : serviceTab === 'apartments' ? (
                <HomeIcon className="w-8 h-8 text-[#A84A3B]" />
              ) : serviceTab === 'excursions' ? (
                <Compass className="w-8 h-8 text-[#A84A3B]" />
              ) : (
                <UserCheck className="w-8 h-8 text-[#A84A3B]" />
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#191C1F] font-display">
                Aucune réservation trouvée
              </h2>
              <p className="text-xs sm:text-sm text-[#727D88] mt-2 leading-relaxed">
                {serviceTab === 'cars' &&
                  "Vous n'avez pas encore de réservation de véhicule active."}
                {serviceTab === 'apartments' &&
                  "Vous n'avez pas encore réservé de dar ou villa pour vos vacances."}
                {serviceTab === 'excursions' &&
                  "Vous n'avez pas encore réservé d'excursion ou circuit touristique."}
                {serviceTab === 'chauffeur' &&
                  "Vous n'avez pas encore de trajet régulier avec chauffeur réservé."}
              </p>
            </div>

            <Link
              to={
                serviceTab === 'cars'
                  ? '/voitures'
                  : serviceTab === 'apartments'
                  ? '/appartements'
                  : serviceTab === 'excursions'
                  ? '/excursions'
                  : '/transfer'
              }
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>
                {serviceTab === 'cars'
                  ? 'Explorer notre flotte de véhicules'
                  : serviceTab === 'apartments'
                  ? 'Découvrir nos hébergements'
                  : serviceTab === 'excursions'
                  ? 'Voir nos circuits & excursions'
                  : 'Découvrir nos liaisons avec chauffeur'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Active Reservation Listings ── */}
        {!loading && currentCount > 0 && (
          <div className="space-y-4">
            {serviceTab === 'cars' &&
              carResas.map((r) => <CarReservationCard key={r._id} r={r} />)}
            {serviceTab === 'apartments' &&
              aptResas.map((r) => (
                <ApartmentReservationCard key={r._id} r={r} />
              ))}
            {serviceTab === 'excursions' &&
              excResas.map((r) => (
                <ExcursionReservationCard key={r._id} r={r} />
              ))}
            {serviceTab === 'chauffeur' &&
              chauffeurResas.map((r) => (
                <ChauffeurReservationCard
                  key={r._id}
                  r={r}
                  onOpenMap={(reservation) => {
                    setPreviewMapRoute({
                      from: reservation.from || (reservation.routeName ? reservation.routeName.split('➔')[0]?.trim() : 'Départ'),
                      to: reservation.to || (reservation.routeName ? reservation.routeName.split('➔')[1]?.trim() : 'Destination'),
                      duration: reservation.duration || '1h 30m',
                      distance: reservation.distance || '120 km',
                      basePriceTND: reservation.priceTND || 100,
                      fromCoords: reservation.fromCoords,
                      toCoords: reservation.toCoords,
                      routeTrail: reservation.routeTrail,
                      assignedChauffeur: {
                        name: reservation.chauffeurName,
                        avatar: reservation.assignedChauffeur?.avatar || reservation.chauffeurAvatar,
                        vehicleModel: reservation.vehicleModel,
                        rating: 4.95,
                      },
                    });
                  }}
                />
              ))}
          </div>
        )}
      </main>

      {/* Embedded Google Maps Route Trail Modal */}
      {previewMapRoute && (
        <ChauffeurTrailModal
          route={previewMapRoute}
          onClose={() => setPreviewMapRoute(null)}
        />
      )}

      {/* 4. UNIFIED MODERN FOOTER (Matches Accueil) */}
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
