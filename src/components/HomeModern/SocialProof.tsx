import React from 'react';
import { Star, ShieldCheck, Users, MapPin, ThumbsUp, Clock, Quote } from 'lucide-react';
import { REVIEWS } from '../data/mockData';

export const SocialProof: React.FC = () => {
  const stats = [
    {
      value: '+5 000',
      label: 'Voyageurs Comblés',
      detail: 'En Tunisie depuis 2018',
      icon: Users,
    },
    {
      value: '12',
      label: 'Agences & Aéroports',
      detail: 'Tunis, Djerba, Monastir, Enfidha...',
      icon: MapPin,
    },
    {
      value: '99.8%',
      label: 'Avis Positifs',
      detail: 'Note moyenne de 4.96/5',
      icon: ThumbsUp,
    },
    {
      value: '15 min',
      label: 'Prise en Main Express',
      detail: 'Contrat dématérialisé rapide',
      icon: Clock,
    },
  ];

  return (
    <section className="bg-[#2C3E56] text-white py-20 my-16 relative overflow-hidden">
      {/* Subtle background luxury geometry */}
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-[#A84A3B]/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Animated Key Metrics Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pb-16 border-b border-white/10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-center flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#A84A3B]/20 text-[#C25847] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-white/90 mb-0.5">
                  {stat.label}
                </div>
                <div className="text-xs text-white/60">
                  {stat.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials Header */}
        <div className="mt-16 text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F8F7EE] text-xs font-extrabold uppercase tracking-wider mb-3">
            <Quote className="w-3.5 h-3.5 text-[#C25847]" />
            <span>Retours d'Expérience</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Ce que disent nos clients privilégiés
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/70">
            Découvrez les témoignages certifiés de voyageurs d'affaires, familles et vacanciers ayant fait confiance à African Rent Car.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 text-[#191C1F] border border-[#EBE6DC] shadow-lg flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300"
            >
              <div>
                {/* Review Header with Stars & Verified badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Vérifié</span>
                    </span>
                  )}
                </div>

                {/* Review Title & Content */}
                <h3 className="font-extrabold text-sm text-[#191C1F] mb-2 leading-snug">
                  "{rev.title}"
                </h3>
                <p className="text-xs sm:text-sm text-[#4A525A] leading-relaxed mb-4">
                  {rev.comment}
                </p>
              </div>

              {/* Reviewer Bio & Service Info */}
              <div className="pt-4 border-t border-[#EBE6DC] flex items-center gap-3">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-10 h-10 rounded-full object-cover border border-[#DAD3C5]"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-xs text-[#191C1F] truncate">
                      {rev.author}
                    </p>
                    <span className="text-xs">{rev.flag}</span>
                  </div>
                  <p className="text-[11px] text-[#727D88] truncate">{rev.location}</p>
                  <p className="text-[10px] text-[#A84A3B] font-semibold truncate mt-0.5">
                    {rev.serviceUsed}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
