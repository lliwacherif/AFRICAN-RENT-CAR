import { useText } from '../../context/LanguageContext'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AGENCIES } from '../data/mockData';

export const Footer: React.FC = () => {
  const tr = useText()

  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <footer id="footer" className="bg-[#1F2C3D] text-[#EBE6DC] pt-16 pb-12 border-t border-[#2C3E56]">
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Top Newsletter & Assistance Callout */}
        <div className="bg-[#2C3E56] rounded-3xl p-8 sm:p-10 border border-[#3A495E] mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#F8F7EE]">
              <Sparkles className="w-3.5 h-3.5 text-[#C25847]" />
              <span>{tr("Offres Privilèges & Itinéraires Secrets")}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {tr("Rejoignez le Cercle African Rent Car")}
            </h3>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              {tr("Recevez en avant-première nos tarifs exclusifs sur les nouveautés de la flotte et nos guides confidentiels de Tunisie.")}
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="bg-emerald-800/60 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3 text-white text-sm">
                <Check className="w-5 h-5 text-emerald-300 shrink-0" />
                <span>{tr("Merci ! Vous êtes désormais inscrit(e) à nos invitations exclusives.")}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder={tr("Votre adresse e-mail professionnelle ou personnelle")}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#C25847]"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#A84A3B] hover:bg-[#8A372A] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{tr("S'inscrire")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Links & Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#A84A3B] text-white flex items-center justify-center font-black">
                ARC
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight text-white">
                  <span>AFRICAN</span>
                  <span className="text-[#C25847]">RENT CAR</span>
                </div>
                <span className="text-[10px] text-white/60 tracking-wider uppercase font-semibold">
                  {tr("Excellence & Mobilité en Tunisie")}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
              {tr("Leader de la mobilité haut de gamme en Tunisie. Véhicules d'exception révisés en concession officielle, hébergements de prestige et conciergerie sur mesure.")}
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <a href="tel:+21627908060" className="flex items-center gap-2 text-white hover:text-[#C25847] transition-colors">
                <Phone className="w-4 h-4 text-[#A84A3B]" />
                <span className="font-bold">+216 27 908 060 / +216 20 834 429</span>
              </a>
              <div className="flex items-center gap-2 text-white/80">
                <Mail className="w-4 h-4 text-[#A84A3B]" />
                <span>contact@africanrentcar.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li><Link to="/" className="hover:text-white transition-colors">{tr("Accueil")}</Link></li>
              <li><Link to="/voitures" className="hover:text-white transition-colors">{tr("Voitures & Flotte")}</Link></li>
              <li><Link to="/appartements" className="hover:text-white transition-colors">{tr("Hébergements & Villas")}</Link></li>
              <li><Link to="/excursions" className="hover:text-white transition-colors">{tr("Circuits & Excursions")}</Link></li>
              <li><Link to="/guide" className="hover:text-white transition-colors">{tr("Guide Tunisie")}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{tr("À Propos & Contact")}</Link></li>
            </ul>
          </div>

          {/* Key Airports & Agencies */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              {tr("Comptoirs Aéroports (24/7)")}
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C25847]" />
                <span>{tr("Tunis-Carthage (Terminal VIP)")}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C25847]" />
                <span>{tr("Djerba-Zarzis (Hall Arrivées)")}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C25847]" />
                <span>Enfidha-Hammamet (NBE)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C25847]" />
                <span>Monastir Habib Bourguiba (MIR)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C25847]" />
                <span>{tr("Agences Sousse, Hammamet & Bizerte")}</span>
              </li>
            </ul>
          </div>

          {/* Legal & Reassurance */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              {tr("Engagements & Sécurité")}
            </h4>
            <div className="space-y-2 text-xs text-white/75">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{tr("Assurances tous risques tous contrats")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{tr("Paiement sécurisé ou sur place")}</span>
              </div>
              <p className="text-[11px] text-white/60 pt-2 leading-relaxed">
                {tr("Agrément du Ministère du Tourisme et de l'Artisanat de Tunisie. Membre de la Chambre Syndicale Nationale des Loueurs de Voitures.")}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar: Copyright & Payment badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            © {new Date().getFullYear()} {tr("African Rent Car Tunisie. Tous droits réservés.")}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/50">{tr("Moyens de paiement acceptés :")}</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white">VISA</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white">Mastercard</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white">Konnect</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white">ClicToPay</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white">{tr("Espèces")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
