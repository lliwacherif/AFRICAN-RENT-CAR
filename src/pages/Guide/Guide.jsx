import { useText } from '../../context/LanguageContext'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Key,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Car,
  CreditCard,
  FileText,
  HelpCircle,
  Check,
  MapPin,
  Phone,
} from 'lucide-react';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';
import { AIConciergeModal } from '../../components/HomeModern/AIConciergeModal';
import { useLanguage } from '../../context/LanguageContext';

export default function Guide() {
  const tr = useText()

  const [activeFaq, setActiveFaq] = useState(0);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const { t } = useLanguage();

  const steps = [
    {
      step: '01',
      badge: t('guide.step1Badge', '0 TND Débité'),
      badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
      title: t('guide.step1Title', '1. Choisissez votre véhicule & Réservez en ligne'),
      desc: t(
        'guide.step1Desc',
        'Parcourez notre flotte de véhicules récents (2025/2026), choisissez vos dates et sélectionnez votre lieu de prise en charge (aéroports Tunis, Djerba, Monastir ou agences en ville). Aucun paiement par carte bancaire n\'est requis à cette étape.'
      ),
      img: '/guide_car_selection.png',
      fallbackImg: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      icon: Car,
    },
    {
      step: '02',
      badge: t('guide.step2Badge', 'Vérification Express'),
      badgeColor: 'bg-[#A84A3B]/10 text-[#A84A3B] border-[#A84A3B]/30',
      title: t('guide.step2Title', '2. Validation par notre équipe & Attribution du code'),
      desc: t(
        'guide.step2Desc',
        'Notre équipe vérifie instantanément la disponibilité et valide votre demande. Votre réservation passe au statut "En attente ⏳". Vous recevez instantanément un e-mail et un SMS contenant votre code unique #TCR-XXXXXX.'
      ),
      img: '/guide_approval_notification.png',
      fallbackImg: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
      icon: Clock,
    },
    {
      step: '03',
      badge: t('guide.step3Badge', 'Paiement Sécurisé'),
      badgeColor: 'bg-[#2C3E56]/10 text-[#2C3E56] border-[#2C3E56]/30',
      title: t('guide.step3Title', '3. Règlement de l\'acompte en agence ou en ligne'),
      desc: t(
        'guide.step3Desc',
        'Rendez-vous dans l\'une de nos agences ou au comptoir aéroport muni(e) de votre code de réservation #TCR-XXXXXX. Vous pouvez régler l\'acompte en toute sécurité par carte bancaire (Click to Pay), espèces ou virement.'
      ),
      img: '/guide_agency_payment.png',
      fallbackImg: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
      icon: CreditCard,
    },
    {
      step: '04',
      badge: t('guide.step4Badge', 'Véhicule Prêt'),
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
      title: t('guide.step4Title', '4. État des lieux numérique & Remise des clés'),
      desc: t(
        'guide.step4Desc',
        'Dès la validation de l\'acompte, la réservation passe en statut "Confirmée ✅". Votre véhicule est astiqué, contrôlé en 40 points et vous attend avec le plein fait. Les clés vous sont remises en main propre en moins de 5 minutes !'
      ),
      img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      fallbackImg: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      icon: Key,
    },
  ];

  const statusList = [
    {
      key: 'recu',
      badge: `📥 ${t('historique.statusRecu', 'Reçu')}`,
      color: 'text-blue-700',
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
      title: t('guide.recuTitle', 'Demande Enregistrée'),
      text: t('guide.recuText', 'Votre demande est prise en compte sur la plateforme. Notre service logistique contrôle vos critères.'),
    },
    {
      key: 'pending',
      badge: `⏳ ${t('historique.statusPending', 'En attente')}`,
      color: 'text-[#A84A3B]',
      bg: 'bg-[#FDF4F2]',
      border: 'border-[#F3D7D2]',
      title: t('guide.approvedTitle', 'Réservation Approuvée'),
      text: t('guide.approvedText', 'Véhicule pré-réservé ! Présentez votre code #TCR-XXXXXX et réglez l\'acompte requis pour bloquer la date.'),
    },
    {
      key: 'confirmed',
      badge: `✅ ${t('historique.statusConfirmed', 'Confirmée')}`,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200',
      title: t('guide.confirmedTitle', 'Véhicule Verrouillé'),
      text: t('guide.confirmedText', 'Acompte versé. Le véhicule est officiellement bloqué pour vos dates et prêt pour votre départ.'),
    },
    {
      key: 'completed',
      badge: `🏁 ${t('historique.statusCompleted', 'Terminée')}`,
      color: 'text-purple-700',
      bg: 'bg-purple-50/80',
      border: 'border-purple-200',
      title: t('guide.completedTitle', 'Location Effectuée'),
      text: t('guide.completedText', 'Restitution du véhicule enregistrée, check-out rapide et caution restituée instantanément.'),
    },
    {
      key: 'cancelled',
      badge: `❌ ${t('historique.statusCancelled', 'Annulée')}`,
      color: 'text-red-700',
      bg: 'bg-red-50/80',
      border: 'border-red-200',
      title: t('guide.cancelledTitle', 'Réservation Annulée'),
      text: t('guide.cancelledText', 'Annulation demandée par le client ou indisponibilité du véhicule avec proposition d\'alternative.'),
    },
  ];

  const faqs = [
    {
      q: t('guide.faq1Q', 'Est-ce que je paye quelque chose lors de la réservation en ligne ?'),
      a: t(
        'guide.faq1A',
        'Absolument rien ! La réservation sur notre site web est 100% gratuite et sans engagement financier immédiat. Aucune empreinte bancaire n\'est exigée lors de votre demande en ligne.'
      ),
    },
    {
      q: t('guide.faq2Q', 'Comment est calculé le montant de mon acompte ?'),
      a: t(
        'guide.faq2A',
        'L\'acompte est déterminé selon la catégorie du véhicule et la durée de location (généralement entre 15% et 30% du montant total). Le montant exact est affiché en toute clarté dans votre e-mail de confirmation.'
      ),
    },
    {
      q: t('guide.faq3Q', 'Que dois-je ramener avec moi à l\'agence ou à l\'aéroport ?'),
      a: t(
        'guide.faq3A',
        'Il vous suffit de présenter votre code de réservation (#TCR-XXXXXX), votre permis de conduire original (valide depuis plus de 2 ans) ainsi qu\'un passeport ou une carte nationale d\'identité en cours de validité.'
      ),
    },
    {
      q: t('guide.faq4Q', 'Que faire si mon vol arrive en retard ou en pleine nuit ?'),
      a: t(
        'guide.faq4A',
        'Nos agents de comptoir aéroport suivent votre numéro de vol en temps réel. En cas de retard, un agent vous attend avec une pancarte personnalisée dans le hall des arrivées, 24h/24 et 7j/7, sans supplément.'
      ),
    },
  ];

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
            <Sparkles className="w-3.5 h-3.5 text-[#F4A261]" />
            <span>{tr("Guide Pas à Pas • Processus Transparent & Sans Frais Cachés")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            {tr("Comment Ça Marche ?")}
          </h1>
          <p className="text-sm sm:text-base text-white/75 mt-2 max-w-2xl">
            {tr("Du clic sur notre plateforme jusqu'à la remise des clés en agence ou au terminal aéroport : transparence totale, 0 TND prélevé en ligne.")}
          </p>

          {/* Quick Anchor Pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            <a
              href="#steps"
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#A84A3B] text-white shadow-md hover:bg-[#8F3E31] transition-colors"
            >
              {tr("1. Les 4 Étapes Simples")}
            </a>
            <a
              href="#statuses"
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white/90 border border-white/10 transition-colors"
            >
              {tr("2. Statuts de Réservation")}
            </a>
            <a
              href="#faq"
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white/90 border border-white/10 transition-colors"
            >
              {tr("3. Questions Fréquentes")}
            </a>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-20">

        {/* ================= SECTION 1: 4 STEPS ================= */}
        <section id="steps" className="scroll-mt-24 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A84A3B] bg-[#A84A3B]/10 px-3 py-1 rounded-full">
              {tr("Processus Client 100% Simplifié")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] font-display mt-3">
              {tr("Votre Véhicule en 4 Étapes Claires")}
            </h2>
            <p className="text-sm text-[#727D88] mt-1.5">
              {tr("Une expérience fluide conçue pour vous faire gagner du temps dès votre arrivée en Tunisie.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-[#EBE6DC] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2C3E56] to-[#1F2C3D] text-white flex items-center justify-center font-black text-sm shadow-md">
                        {tr(s.step)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${s.badgeColor}`}>
                        {tr(s.badge)}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-[#191C1F] font-display group-hover:text-[#A84A3B] transition-colors">
                      {tr(s.title)}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#727D88] mt-2.5 leading-relaxed">
                      {tr(s.desc)}
                    </p>
                  </div>

                  {/* Step Image */}
                  <div className="h-48 sm:h-52 w-full bg-neutral-900 relative overflow-hidden mt-auto">
                    <img
                      src={s.img}
                      onError={(e) => {
                        e.currentTarget.src = s.fallbackImg;
                      }}
                      alt={tr(s.title)}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white text-xs font-bold drop-shadow-md">
                      <Icon className="w-4 h-4 text-[#F4A261]" />
                      <span>{tr("Étape")} {tr(s.step)} {tr("• Service Garanti")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 2: STATUSES ================= */}
        <section id="statuses" className="scroll-mt-24 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2C3E56] bg-[#2C3E56]/10 px-3 py-1 rounded-full">
              {tr("Suivi en Temps Réel")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] font-display mt-3">
              {tr("Guide des Statuts de Réservation")}
            </h2>
            <p className="text-sm text-[#727D88] mt-1.5">
              {tr("Consultez l'état exact de votre dossier à tout moment depuis votre espace client ou par e-mail.")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statusList.map((st) => (
              <div
                key={st.key}
                className={`bg-white rounded-2xl p-5 border ${st.border} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-full text-xs font-black mb-3">
                    {tr(st.badge)}
                  </div>
                  <h4 className={`text-sm font-extrabold ${st.color}`}>
                    {tr(st.title)}
                  </h4>
                  <p className="text-xs text-[#727D88] mt-2 leading-relaxed">
                    {tr(st.text)}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EBE6DC]/80 flex items-center gap-1.5 text-[11px] font-bold text-[#4A525A]">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{tr("Notification auto")}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 3: FAQ ACCORDION ================= */}
        <section id="faq" className="scroll-mt-24 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A84A3B] bg-[#A84A3B]/10 px-3 py-1 rounded-full">
              {tr("Réponses Claires")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] font-display mt-3">
              {tr("Questions Fréquentes")}
            </h2>
            <p className="text-sm text-[#727D88] mt-1.5">
              {tr("Tout ce que vous devez savoir avant de prendre la route en Tunisie.")}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#EBE6DC] shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-[#191C1F] hover:text-[#A84A3B] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#A84A3B] shrink-0" />
                    {tr(f.q)}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#727D88] transition-transform duration-300 shrink-0 ${
                      activeFaq === i ? 'rotate-180 text-[#A84A3B]' : ''
                    }`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#727D88] leading-relaxed border-t border-[#EBE6DC]/60 animate-in fade-in duration-200">
                    {tr(f.a)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================= CTA BANNER ================= */}
        <section className="bg-gradient-to-r from-[#2C3E56] to-[#1F2C3D] rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#A84A3B]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F4A261]">
              {tr("Flotte Récente 2025 / 2026")}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 font-display">
              {tr("Prêt à réserver votre véhicule en toute sérénité ?")}
            </h3>
            <p className="text-sm text-white/75 mt-2">
              {tr("Profitez du kilométrage adapté, de la prise en charge VIP aux aéroports et d'une annulation gratuite.")}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to="/voitures"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>{tr("Voir les véhicules disponibles")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

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
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{tr("Concierge VIP")}</p>
            <p className="text-xs font-extrabold text-white">{tr("Conseiller Voyage IA")}</p>
          </div>
        </button>
      </div>

      <AIConciergeModal isOpen={isConciergeOpen} onClose={() => setIsConciergeOpen(false)} />
      <Footer />
    </div>
  );
}
