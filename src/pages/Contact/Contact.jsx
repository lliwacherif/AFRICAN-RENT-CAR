import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  Car,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CreditCard,
  Building2,
  Calendar,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Header } from '../../components/HomeModern/Header';
import { Footer } from '../../components/HomeModern/Footer';
import { AIConciergeModal } from '../../components/HomeModern/AIConciergeModal';
import { useLanguage } from '../../context/LanguageContext';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 4000);
  };

  const contactCards = [
    {
      icon: Phone,
      color: 'text-[#A84A3B] bg-[#A84A3B]/10',
      label: t('contact.phoneLabel', 'Téléphone 24/7 & WhatsApp'),
      content: (
        <div className="flex flex-col gap-1 text-sm font-extrabold text-[#191C1F]">
          <a href="tel:+21627908060" className="hover:text-[#A84A3B] transition-colors">
            +216 27 908 060
          </a>
          <a href="tel:+21620834429" className="hover:text-[#A84A3B] transition-colors">
            +216 20 834 429
          </a>
        </div>
      ),
      sub: 'Ligne directe assistance & réservation',
    },
    {
      icon: Mail,
      color: 'text-[#2C3E56] bg-[#2C3E56]/10',
      label: t('contact.emailLabel', 'Email Professionnel'),
      content: (
        <div className="flex flex-col gap-1 text-sm font-extrabold text-[#191C1F]">
          <a href="mailto:contact@africanrentcar.com" className="hover:text-[#A84A3B] transition-colors truncate">
            contact@africanrentcar.com
          </a>
          <a href="mailto:bensalem.rentalcar@gmail.com" className="text-xs text-[#727D88] hover:text-[#A84A3B] transition-colors truncate">
            bensalem.rentalcar@gmail.com
          </a>
        </div>
      ),
      sub: 'Réponse sous 2 heures',
    },
    {
      icon: MapPin,
      color: 'text-[#A84A3B] bg-[#A84A3B]/10',
      label: t('contact.addressLabel', 'Siège & Aéroports'),
      content: (
        <div className="text-xs sm:text-sm font-bold text-[#191C1F] leading-snug">
          Avenue Habib Bourguiba, Bizerte 7000
          <span className="block text-[11px] text-[#727D88] font-medium mt-0.5">
            + Comptoirs aéroports TUN, DJE, MIR
          </span>
        </div>
      ),
      sub: 'Accueil hall des arrivées',
    },
    {
      icon: Clock,
      color: 'text-[#2C3E56] bg-[#2C3E56]/10',
      label: t('contact.hoursLabel', 'Horaires de Prise en Charge'),
      content: (
        <div className="text-sm font-extrabold text-[#191C1F]">
          24h / 24 • 7j / 7
          <span className="block text-xs font-semibold text-emerald-700 mt-0.5">
            Suivi des vols en temps réel
          </span>
        </div>
      ),
      sub: 'Agences en ville : 08h00 – 20h00',
    },
  ];

  const features = [
    {
      icon: Car,
      title: t('features.fleetTitle', 'Flotte Exclusive 2025/2026'),
      desc: t('features.fleetDesc', 'Véhicules récents certifiés, contrôlés en 40 points avant chaque livraison et méticuleusement désinfectés.'),
    },
    {
      icon: ShieldCheck,
      title: t('features.priceTitle', 'Tarifs Clairs & Zéro Caution Démesurée'),
      desc: t('features.priceDesc', 'Transparence totale, conditions d’assurance souples et aucune retenue de caution injustifiée.'),
    },
    {
      icon: RotateCcw,
      title: t('features.cancelTitle', 'Annulation Gratuite 48h'),
      desc: t('features.cancelDesc', 'Modifiez ou annulez sans frais jusqu’à 48 heures avant votre prise en charge sans pénalités.'),
    },
    {
      icon: Headphones,
      title: t('features.supportTitle', 'Conciergerie & Assistance 24/7'),
      desc: t('features.supportDesc', 'Une équipe multilingue dédiée pour vous assister partout en Tunisie, du nord au Grand Sud saharien.'),
    },
    {
      icon: CreditCard,
      title: t('guide.step3Badge', 'Paiement Flexible'),
      desc: t('guide.step3Desc', 'Réservez 100% gratuitement en ligne et choisissez de régler l’acompte en ligne ou directement en agence.'),
    },
    {
      icon: Building2,
      title: t('guide.statusSectionTitle', 'Réseau National Étendu'),
      desc: t('guide.statusSectionSub', '12 agences et comptoirs de livraison express à Tunis, Hammamet, Sousse, Djerba, Monastir et Tozeur.'),
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
            <span>À Propos & Agences • Mobilité & Séjours d'Exception en Tunisie</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            African Rent Car Tunisie
          </h1>
          <p className="text-sm sm:text-base text-white/75 mt-2 max-w-2xl">
            Votre partenaire de confiance pour la location de véhicules récents, de villas de charme et d'excursions d'exception depuis plus de 15 ans.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 max-w-3xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <p className="text-xl sm:text-2xl font-black text-white">12</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-white/70 uppercase tracking-wider">Agences & Aéroports</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <p className="text-xl sm:text-2xl font-black text-[#F4A261]">100%</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-white/70 uppercase tracking-wider">Flotte 2025/2026</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <p className="text-xl sm:text-2xl font-black text-white">24/7</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-white/70 uppercase tracking-wider">Assistance Dédiée</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
              <p className="text-xl sm:text-2xl font-black text-emerald-400">4.98★</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-white/70 uppercase tracking-wider">Avis Clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-20">
        
        {/* ================= 4 INFO CARDS ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-[#EBE6DC] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4 shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#727D88]">
                    {card.label}
                  </span>
                  <div className="mt-2">{card.content}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EBE6DC]/80 text-[11px] font-medium text-[#727D88]">
                  {card.sub}
                </div>
              </div>
            );
          })}
        </section>

        {/* ================= SHOWROOM STORY BANNER ================= */}
        <section className="bg-white rounded-3xl border border-[#EBE6DC] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full min-h-[300px] bg-neutral-900 overflow-hidden">
            <img
              src="/agency_team_showroom.png"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1200&q=80';
              }}
              alt="L'équipe African Rent Car"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#A84A3B] text-white inline-block mb-2">
                📍 Présents Partout en Tunisie
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold font-display">
                Une Équipe Dévouée à Votre Mobilité
              </h3>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#A84A3B] bg-[#A84A3B]/10 px-3 py-1 rounded-full">
              Notre Philosophie
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] font-display">
              La location sans stress, sans surprise et sans file d'attente
            </h2>
            <p className="text-xs sm:text-sm text-[#727D88] leading-relaxed">
              Fondée avec la volonté de moderniser les standards de location en Tunisie, <strong>African Rent Car</strong> vous propose une expérience haut de gamme combinant flotte récente certifiée, assistance VIP aux aéroports et digitalisation complète.
            </p>
            <p className="text-xs sm:text-sm text-[#727D88] leading-relaxed">
              Que vous veniez pour des vacances en famille, un voyage d'affaires à Tunis ou une traversée du Sahara, nos conseillers dédiés vous accompagnent avec réactivité et professionnalisme.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-3 text-xs font-bold text-[#2C3E56]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Accueil nominatif aéroport</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Véhicules révisés 40 points</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kilométrage adapté</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Paiement en ligne ou à l'arrivée</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY CHOOSE US (6 FEATURE CARDS) ================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2C3E56] bg-[#2C3E56]/10 px-3 py-1 rounded-full">
              Nos Engagements Qualité
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] font-display mt-3">
              Pourquoi Choisir African Rent Car ?
            </h2>
            <p className="text-sm text-[#727D88] mt-1.5">
              Des garanties solides pour sécuriser chaque kilomètre de votre séjour en Tunisie.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EBE6DC] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#F8F7EE] border border-[#EBE6DC] text-[#A84A3B] flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#191C1F] font-display">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#727D88] mt-2 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= BOTTOM: MAP EMBED + CONTACT FORM ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Map & Agency Hubs */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE6DC] shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84A3B]">
                Implantation Géographique
              </span>
              <h3 className="text-xl font-extrabold text-[#191C1F] font-display mt-1">
                Notre Siège & Nos Comptoirs
              </h3>
              <p className="text-xs text-[#727D88] mt-1">
                Comptoirs express dans tous les aéroports internationaux de Tunisie.
              </p>
            </div>

            {/* Clean Map Embed */}
            <div className="w-full h-56 rounded-2xl overflow-hidden border border-[#EBE6DC] shadow-xs">
              <iframe
                title="African Rent Car Bizerte"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12688.97559440015!2d9.8535!3d37.2746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12e31b050b5e88bf%3A0x9f78e0b6edb9f1b9!2sBizerte%2C%20Tunisia!5e0!3m2!1sfr!2stn!4v1680000000000!5m2!1sfr!2stn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>

            <div className="space-y-3 pt-2 text-xs text-[#4A525A]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A84A3B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#191C1F]">Aéroport International Tunis-Carthage (TUN)</p>
                  <p className="text-[#727D88]">Terminal 1, Hall des arrivées VIP • Prise en charge 24/7</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#2C3E56] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#191C1F]">Aéroport Djerba-Zarzis (DJE) & Monastir (MIR)</p>
                  <p className="text-[#727D88]">Livraison directe parking ou hôtel sélectionné</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#727D88] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#191C1F]">Siège Social Bizerte</p>
                  <p className="text-[#727D88]">Avenue Habib Bourguiba, 7000 Bizerte</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Modern Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 sm:p-10 border border-[#EBE6DC] shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84A3B]">
                Formulaire Direct
              </span>
              <h3 className="text-xl font-extrabold text-[#191C1F] font-display mt-1">
                Envoyez un Message à Nos Conseillers
              </h3>
              <p className="text-xs text-[#727D88] mt-1">
                Besoin d'un devis sur mesure pour une longue durée, un pack hôtel ou un véhicule VIP ? Nous vous répondons sous 2h.
              </p>
            </div>

            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Votre message a été envoyé avec succès !</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Notre service client vous contactera dans les plus brefs délais.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#727D88] mb-1.5">
                      Nom & Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ahmed Ben Salem"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F8F7EE] border border-[#EBE6DC] focus:border-[#A84A3B] rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#191C1F] focus:outline-hidden transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#727D88] mb-1.5">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="votre.email@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#F8F7EE] border border-[#EBE6DC] focus:border-[#A84A3B] rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#191C1F] focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#727D88] mb-1.5">
                    Numéro de Téléphone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+216 27 908 060"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#F8F7EE] border border-[#EBE6DC] focus:border-[#A84A3B] rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#191C1F] focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#727D88] mb-1.5">
                    Comment pouvons-nous vous aider ? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Précisez vos dates, vos destinations ou vos souhaits particuliers..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#F8F7EE] border border-[#EBE6DC] focus:border-[#A84A3B] rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#191C1F] focus:outline-hidden transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#A84A3B] hover:bg-[#8F3E31] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer votre message</span>
                </button>
              </form>
            )}
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
