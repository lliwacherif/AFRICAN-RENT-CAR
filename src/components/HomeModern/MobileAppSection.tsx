import { useText } from '../../context/LanguageContext'
import React, { useState } from 'react';
import { 
  Smartphone, 
  QrCode, 
  Key, 
  Camera, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Check, 
  CheckCircle2,
  Bell,
  MapPin
} from 'lucide-react';

export const MobileAppSection: React.FC = () => {
  const tr = useText()

  const [scanned, setScanned] = useState(false);

  const features = [
    {
      icon: Key,
      title: 'Ouverture sans clé via Bluetooth',
      desc: 'Déverrouillez votre véhicule directement depuis votre smartphone sans attendre au comptoir.',
    },
    {
      icon: MapPin,
      title: 'Suivi GPS Chauffeur en direct',
      desc: 'Suivez sur la carte interactive l\'approche en temps réel de votre chauffeur privé à l\'aéroport.',
    },
    {
      icon: ShieldCheck,
      title: 'Code serrure connectée Villa',
      desc: 'Accédez instantanément au code sécurisé de la serrure numérique de votre villa ou appartement.',
    },
    {
      icon: Sparkles,
      title: 'Conciergerie & Clé Digitale 24/7',
      desc: 'Assistance instantanée, prolongation en 1 clic et support prioritaire WhatsApp intégré.',
    },
  ];

  return (
    <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 mb-24">
      <div className="bg-gradient-to-br from-[#1F2C3D] via-[#2C3E56] to-[#1F2C3D] rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-[0_25px_60px_rgba(44,62,86,0.18)] border border-[#2C3E56] relative overflow-hidden">
        {/* Decorative blur glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A84A3B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Text, Features, Download Badges */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold uppercase tracking-wider text-[#F8F7EE]">
              <Smartphone className="w-3.5 h-3.5 text-[#C25847]" />
              <span>{tr("Application Officielle African Rent Car")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
              {tr("Emportez l'Excellence")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F8F7EE] to-[#C25847]">
                {tr("au creux de votre main.")}
              </span>
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
              {tr("Gérez votre réservation, activez votre clé digitale et accédez aux meilleures recommandations d'itinéraires en Tunisie avec l'application mobile dédiée.")}
            </p>

            {/* 4 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-[#A84A3B]/25 text-[#C25847] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">{tr(feat.title)}</h3>
                      <p className="text-[11px] text-white/70 leading-snug">{tr(feat.desc)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Store Badges and QR Code Trigger */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-4">
              {/* App Store button */}
              <a
                href="#download"
                className="flex items-center gap-3 bg-black/60 hover:bg-black text-white px-5 py-2.5 rounded-2xl border border-white/20 transition-all hover:scale-102"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .61-2.65 1.37-.56.65-.98 1.7-0.86 2.73 1 .08 1.98-.5 2.59-1.25z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/60 leading-none">{tr("Disponible sur")}</p>
                  <p className="text-xs font-bold leading-tight">App Store</p>
                </div>
              </a>

              {/* Google Play button */}
              <a
                href="#download"
                className="flex items-center gap-3 bg-black/60 hover:bg-black text-white px-5 py-2.5 rounded-2xl border border-white/20 transition-all hover:scale-102"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186c-.36-.36-.61-.92-.61-1.6V3.414c0-.68.25-1.24.61-1.6zm11.3 11.3l2.5 2.5-12.8 7.37 10.3-9.87zm0-2.23L4.609.914l12.8 7.37-2.5 2.6zm1.7 1.11l3.58 2.06c.9.52.9 1.36 0 1.88l-3.58 2.06-2.14-2.14 2.14-2.14z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/60 leading-none">{tr("Disponible sur")}</p>
                  <p className="text-xs font-bold leading-tight">Google Play</p>
                </div>
              </a>

              {/* Scan simulation button */}
              <button
                onClick={() => setScanned(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#F8F7EE] hover:text-white bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20"
              >
                <QrCode className="w-4 h-4 text-[#C25847]" />
                <span>{tr("Tester le scan QR")}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Modern Smartphone Mockup with Redesigned Brand UI */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-72 sm:w-80">
              {/* Phone Frame */}
              <div className="bg-[#191C1F] rounded-[48px] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.5)] border-4 border-[#3A495E] relative">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-end px-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A84A3B]"></span>
                </div>

                {/* Smartphone Screen Content styled with strict brand palette */}
                <div className="bg-[#FFFFF0] text-[#191C1F] rounded-[40px] overflow-hidden pt-8 pb-6 px-4 space-y-4 border border-[#EBE6DC]">
                  {/* In-app Mini Header */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-[10px] text-[#727D88] font-bold uppercase">African Rent Car</p>
                      <p className="text-xs font-extrabold text-[#191C1F]">{tr("Bienvenue, Ahmed")}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#A84A3B] text-white flex items-center justify-center text-[10px] font-bold">
                      VIP
                    </div>
                  </div>

                  {/* Active Key Card */}
                  <div className="bg-white rounded-2xl p-3.5 border border-[#EBE6DC] shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#2C3E56]">
                      <span className="flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-[#A84A3B]" />
                        <span>{tr("Clé Mobile Active")}</span>
                      </span>
                      <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px]">{tr("Connectée")}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80"
                        alt="Mini Car"
                        className="w-16 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-[#191C1F]">Porsche Macan GTS</p>
                        <p className="text-[10px] text-[#727D88]">{tr("Immatriculation : 241 TUN 8800")}</p>
                      </div>
                    </div>

                    {/* Unlock button in app */}
                    <button className="w-full py-2 bg-[#A84A3B] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5">
                      <span>{tr("Déverrouiller le véhicule")}</span>
                    </button>
                  </div>

                  {/* Trip progress */}
                  <div className="bg-[#F8F7EE] rounded-2xl p-3 border border-[#EBE6DC] text-xs space-y-1.5">
                    <div className="flex justify-between font-bold text-[#191C1F]">
                      <span>{tr("Séjour Tunis - Djerba")}</span>
                      <span className="text-[#A84A3B]">{tr("Jour 3 / 7")}</span>
                    </div>
                    <div className="w-full bg-[#EBE6DC] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#A84A3B] h-full w-[45%]" />
                    </div>
                    <p className="text-[10px] text-[#727D88]">{tr("Restitution prévue : Aéroport Djerba-Zarzis")}</p>
                  </div>

                  {/* Interactive QR box on phone */}
                  <div className="bg-white p-3 rounded-2xl border border-[#EBE6DC] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#191C1F]">{tr("Passager Aéroport")}</p>
                      <p className="text-[9px] text-[#727D88]">{tr("Scannez au comptoir VIP")}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#191C1F] p-1 rounded-lg flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating QR Card over the phone */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-3.5 shadow-2xl border border-[#EBE6DC] flex items-center gap-3 text-[#191C1F] z-30">
                <div className="w-12 h-12 bg-[#F8F7EE] p-1.5 rounded-xl border border-[#DAD3C5] flex items-center justify-center">
                  <QrCode className="w-9 h-9 text-[#A84A3B]" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#191C1F]">{tr("Scannez pour installer")}</p>
                  <p className="text-[10px] text-[#727D88]">{tr("iOS & Android • Gratuit")}</p>
                </div>
              </div>

              {/* Scan notification modal/toast */}
              {scanned && (
                <div className="absolute top-10 inset-x-2 bg-emerald-700 text-white p-3 rounded-2xl shadow-2xl text-xs flex items-center justify-between z-40 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr("Lien d'installation de l'application envoyé !")}</span>
                  </div>
                  <button onClick={() => setScanned(false)} className="text-white/80 hover:text-white font-bold ml-2">
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
