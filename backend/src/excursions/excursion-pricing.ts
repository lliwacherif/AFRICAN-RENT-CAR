import { BadRequestException } from '@nestjs/common';

export interface ExcursionPriceTier {
  minPeople: number;
  maxPeople: number;
  price: number; // Total group price in TND.
}

export function normalizePriceTiers(tiers: ExcursionPriceTier[]): ExcursionPriceTier[] {
  if (!Array.isArray(tiers) || !tiers.length) {
    throw new BadRequestException('Ajoutez au moins une tranche de prix.');
  }
  const sorted = tiers.map(tier => {
    if (!tier || !Number.isInteger(tier.minPeople) || !Number.isInteger(tier.maxPeople) ||
      tier.minPeople < 1 || tier.maxPeople < tier.minPeople ||
      !Number.isFinite(tier.price) || tier.price < 0.01) {
      throw new BadRequestException('Chaque tranche doit avoir des nombres entiers de personnes et un prix positif.');
    }
    return { minPeople: tier.minPeople, maxPeople: tier.maxPeople, price: Math.round(tier.price * 100) / 100 };
  }).sort((a, b) => a.minPeople - b.minPeople);
  sorted.forEach((tier, index) => {
    if (index > 0 && tier.minPeople <= sorted[index - 1].maxPeople) {
      throw new BadRequestException('Les tranches de personnes ne doivent pas se chevaucher (ex. : 1–4, puis 5–6).');
    }
  });
  return sorted;
}

export function findPriceTier(tiers: ExcursionPriceTier[], people: number) {
  return tiers.find(tier => people >= tier.minPeople && people <= tier.maxPeople);
}
