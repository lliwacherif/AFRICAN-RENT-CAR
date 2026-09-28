import React, { useState } from 'react';
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
  ChevronRight,
  Plane,
  Building2,
  Navigation
} from 'lucide-react';
import { Currency, ChauffeurRoute } from '../types';
import { CHAUFFEUR_ROUTES, CHAUFFEUR_FLEET, formatPrice } from '../data/mockData';

interface ChauffeurServiceSectionProps {
  currency: Currency;
  onBookRoute: (route: ChauffeurRoute) => void;
  onCustomChauffeurRequest: () => void;
}

export const ChauffeurServiceSection: React.FC<ChauffeurServiceSectionProps> = ({
  currency,
  onBookRoute,
  onCustomChauffeurRequest,
}) => {
  const [selectedFleetId, setSelectedFleetId] = useState('business-sedan');

  return (
    <section id="chauffeur-service" className="py-20 bg-[#FFFFF0] border-t border-[#EBE6DC]">
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C3E56]/10 text-[#2C3E56] text-xs font-black tracking-wide uppercase">
              <UserCheck className="w-3.5 h-3.5 text-[#2C3E56]" />
              <span>Service Chauffeur Privé & Transferts VIP</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191C1F] font-display tracking-tight leading-[1.15]">
              Laissez-vous conduire d'un point A à un point B{' '}
              <span className="text-[#A84A3B]">en toute sérénité.</span>
            </h2>

            <p className="text-base text-[#4A525A] font-medium leading-relaxed">
              Fini le stress des taxis et des négociations d'aéroports. Voyagez dans le calme d'une berline ou d'un van haut de gamme avec un chauffeur professionnel bilingue, au tarif fixe garanti avant le départ.
            </p>
          </div>

          <button
            onClick={onCustomChauffeurRequest}
            className="self-start md:self-auto px-6 py-3.5 rounded-2xl bg-[#2C3E56] hover:bg-[#1F2C3D] text-white text-sm font-extrabold shadow-md transition-all flex items-center gap-2"
          >
            <span>Calculer un itinéraire sur-mesure</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Pillars of the Chauffeur Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          <div className="bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#2C3E56]/10 text-[#2C3E56] flex items-center justify-center mb-4">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#191C1F] mb-2">Accueil Pancarte Nominative</h3>
            <p className="text-xs text-[#4A525A] leading-relaxed">
              Dès la sortie des bagages dans tous les aéroports tunisiens (Tunis-Carthage, Djerba, Enfidha, Monastir). Suivi des retards de vol sans surcoût.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#191C1F] mb-2">Tarif Fixe & Tout Inclus</h3>
            <p className="text-xs text-[#4A525A] leading-relaxed">
              Prix convenu à la réservation comprenant les péages d'autoroutes, le carburant, les pourboires et 60 minutes d'attente à l'aéroport.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#2C3E56]/10 text-[#2C3E56] flex items-center justify-center mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#191C1F] mb-2">Chauffeurs Certifiés Bilingues</h3>
            <p className="text-xs text-[#4A525A] leading-relaxed">
              Chauffeurs d'élite en tenue soignée, ponctuels, discrets et formés aux exigences des clientèles d'affaires et de tourisme international.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBE6DC] shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#A84A3B]/10 text-[#A84A3B] flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#191C1F] mb-2">Transferts & Mise à Disposition</h3>
            <p className="text-xs text-[#4A525A] leading-relaxed">
              Disponible pour des trajets directs A ➔ B ou pour des mises à disposition à la demi-journée ou journée complète (séminaires, mariages, visites).
            </p>
          </div>
        </div>

        {/* Popular Route Cards Grid (Point A -> Point B with clear prices) */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#191C1F] font-display">
                Liaisons & Transferts Fréquents les Plus Demandés
              </h3>
              <p className="text-xs sm:text-sm text-[#4A525A]">
                Réservation garantie instantanée au tarif fixe sans supplément bagages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHAUFFEUR_ROUTES.slice(0, 3).map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-3xl border border-[#EBE6DC] shadow-[0_12px_30px_rgba(44,62,86,0.06)] hover:shadow-[0_20px_40px_rgba(44,62,86,0.12)] transition-all overflow-hidden flex flex-col group"
              >
                {/* Image & Popular Badge */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={route.image}
                    alt={`${route.from} vers ${route.to}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  
                  {route.popular && (
                    <div className="absolute top-4 left-4 bg-[#A84A3B] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md">
                      Itinéraire Préféré
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-[#F8F7EE]" />
                      <span>{route.duration}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      <Navigation className="w-3.5 h-3.5 text-[#F8F7EE]" />
                      <span>{route.distance}</span>
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    {/* Route Flow */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2.5 text-xs font-bold text-[#191C1F]">
                        <span className="w-5 h-5 rounded-full bg-[#2C3E56]/15 text-[#2C3E56] flex items-center justify-center text-[10px] shrink-0 mt-0.5">A</span>
                        <span>{route.from}</span>
                      </div>
                      <div className="w-0.5 h-4 bg-[#EBE6DC] ml-2.5"></div>
                      <div className="flex items-start gap-2.5 text-xs font-extrabold text-[#A84A3B]">
                        <span className="w-5 h-5 rounded-full bg-[#A84A3B]/15 text-[#A84A3B] flex items-center justify-center text-[10px] shrink-0 mt-0.5">B</span>
                        <span>{route.to}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#727D88] font-medium mb-3">
                      Véhicule : <strong className="text-[#191C1F]">{route.recommendedVehicle}</strong>
                    </p>

                    {/* Includes checklist */}
                    <div className="space-y-1.5 text-[11px] text-[#4A525A]">
                      {route.includes.slice(0, 3).map((inc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-[#EBE6DC] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#727D88] block">Tarif Fixe Tout Inclus</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-[#4A525A] font-medium">dès</span>
                        <span className="text-2xl font-black text-[#A84A3B]">
                          {formatPrice(route.basePriceTND, currency)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onBookRoute(route)}
                      className="px-4 py-2.5 bg-[#A84A3B] hover:bg-[#8A372A] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Réserver</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chauffeur Vehicle Fleet Showcase */}
        <div className="bg-[#2C3E56] text-white rounded-3xl p-8 sm:p-10 border border-[#1F2C3D]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-[#C25847] text-xs font-black uppercase tracking-wider">Flotte Chauffeur Exclusive</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                Choisissez votre standing de transport
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-white/75 max-w-md">
              Véhicules de moins de 2 ans, climatisés, équipés de bornes wifi 5G, chargeurs et bouteilles d'eau minérale offertes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHAUFFEUR_FLEET.map((f) => (
              <div
                key={f.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="h-36 rounded-xl overflow-hidden mb-4 border border-white/20">
                    <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-lg font-black text-white">{f.name}</h4>
                  <p className="text-xs text-white/70 mb-3">{f.models}</p>

                  <div className="flex items-center gap-4 text-xs font-bold text-white/90 mb-4 pb-3 border-b border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#C25847]" />
                      <span>{f.passengers} passagers max</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#C25847]" />
                      <span>{f.luggage} bagages</span>
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-white/75">
                    {f.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onCustomChauffeurRequest}
                    className="w-full py-2.5 rounded-xl bg-white text-[#2C3E56] hover:bg-[#F8F7EE] text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Sélectionner cette classe</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A84A3B]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
