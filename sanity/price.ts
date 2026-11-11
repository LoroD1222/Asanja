import type {OptionalExperience, TripPricingOption} from './page-types'

export type QuoteSelection = {date: string; adults: number; children: number; days: number; option: TripPricingOption | null; extras: OptionalExperience[]}

export function lowestPublishedRate(option: TripPricingOption) {
  const rates = [option.pricePerPerson, ...(option.groupPrices || []).map((item) => item.pricePerPerson), ...(option.seasonalPrices || []).map((item) => item.pricePerPerson)]
    .filter((rate): rate is number => typeof rate === 'number' && Number.isFinite(rate) && rate >= 0)
  return rates.length ? Math.min(...rates) : null
}

export function indicativePrice(selection: QuoteSelection, publishedDays: number) {
  const {date, adults, children, days, option, extras} = selection
  if (!option || days !== publishedDays || adults < 1 || children < 0) return null
  let adultRate = option.pricePerPerson
  if (option.seasonalPrices?.length) {
    if (!date) return null
    const season = option.seasonalPrices.find((item) => item.from && item.to && date >= item.from && date <= item.to)
    if (!season || typeof season.pricePerPerson !== 'number') return null
    adultRate = season.pricePerPerson
  } else if (option.groupPrices?.length) {
    const group = option.groupPrices.find((item) => adults >= item.minAdults && adults <= item.maxAdults)
    if (group) adultRate = group.pricePerPerson
  }
  if (typeof adultRate !== 'number' || !Number.isFinite(adultRate)) return null
  if (children && (typeof option.childPrice !== 'number' || !Number.isFinite(option.childPrice))) return null
  if (extras.some((extra) => typeof extra.pricePerPerson !== 'number' || !Number.isFinite(extra.pricePerPerson))) return null
  const total = adultRate * adults + (option.childPrice || 0) * children + extras.reduce((sum, extra) => sum + extra.pricePerPerson! * (adults + children), 0)
  return Number.isFinite(total) && total >= 0 ? total : null
}
