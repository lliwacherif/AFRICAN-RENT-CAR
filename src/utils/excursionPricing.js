export function hasGroupPricing(excursion) {
  return Array.isArray(excursion?.priceTiers) && excursion.priceTiers.length > 0
}

export function getExcursionStartingPrice(excursion) {
  return hasGroupPricing(excursion)
    ? Math.min(...excursion.priceTiers.map(tier => Number(tier.price)))
    : Number(excursion?.pricePerAdult ?? excursion?.pricePerPersonTND ?? 0)
}

export function getExcursionPriceTier(excursion, people) {
  const count = Number(people)
  if (!Number.isInteger(count) || count < 1) return null
  return excursion?.priceTiers?.find(tier => count >= tier.minPeople && count <= tier.maxPeople) ?? null
}
