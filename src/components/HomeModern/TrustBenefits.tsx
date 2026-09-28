import React from 'react';
import { ShieldCheck, BadgePercent, Clock, Headphones, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { TRUST_BENEFITS } from '../data/mockData';

export const TrustBenefits: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#A84A3B]" />;
      case 'BadgePercent':
        return <BadgePercent className="w-6 h-6 text-[#2C3E56]" />;
      case 'ClockCheck':
        return <Clock className="w-6 h-6 text-[#A84A3B]" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-[#2C3E56]" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-[#A84A3B]" />;
    }
  };

  return (
    <section id="trust-benefits" className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 pt-14 sm:pt-20 mb-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A84A3B]/10 text-[#A84A3B] text-xs font-extrabold uppercase tracking-wider mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>L'Excellence Sans Compromis</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191C1F] tracking-tight font-display">
          Pourquoi réserver avec African Rent Car ?
        </h2>
        <p className="mt-3 text-base text-[#4A525A] font-medium">
          Une expérience de voyage pensée dans les moindres détails pour vous offrir sérénité, transparence et liberté en Tunisie.
        </p>
      </div>

      {/* 4 Horizontal Modern Apple Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TRUST_BENEFITS.map((item, index) => (
          <div
            key={item.id}
            className="group apple-glass-subtle hover:bg-white/90 rounded-3xl p-6 transition-all duration-300 transform hover:-translate-y-1 relative flex flex-col justify-between"
          >
            <div>
              {/* Icon Container with pastel circular badge */}
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${
                    index % 2 === 0
                      ? 'bg-[#A84A3B]/10 border border-[#A84A3B]/20'
                      : 'bg-[#2C3E56]/10 border border-[#2C3E56]/20'
                  }`}
                >
                  {getIcon(item.icon)}
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-[#2C3E56] border border-white/90 shadow-sm">
                  {item.badge}
                </span>
              </div>

              {/* Text content */}
              <h3 className="text-lg font-extrabold text-[#191C1F] mb-1 group-hover:text-[#A84A3B] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs font-bold text-[#A84A3B] mb-2.5">
                {item.highlight}
              </p>
              <p className="text-sm text-[#4A525A] leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Bottom micro-indicator */}
            <div className="mt-6 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs font-bold text-[#2C3E56] group-hover:text-[#A84A3B] transition-colors">
              <span>Norme de qualité</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
