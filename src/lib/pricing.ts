import { siteConfig, type PromoCode, type ShippingMethod } from '../config/site';
import { getProductById } from '../data/products';
import type { CartLine, OptionKey, Product, Selections } from '../data/types';
import { findWooVariant } from './woocommerce';

/**
 * LOGIQUE COMMERCIALE CENTRALISÉE (fictive).
 * Toutes les pages (catalogue, fiche, panier, commande) passent par ces fonctions
 * pour garantir des prix identiques partout.
 */

/** Arrondi : à l'euro pour les prix promo, au centime pour les réductions. */
const roundTo = (value: number, step = 1) => Math.round(value / step) * step;
const cents = (value: number) => Math.round(value * 100) / 100;

/** Sélection par défaut : première valeur disponible de chaque option. */
export function defaultSelections(product: Product): Selections {
  const sel: Selections = {};
  for (const opt of product.options) {
    const first = opt.values.find((v) => !v.unavailable) ?? opt.values[0];
    sel[opt.key] = first.value;
  }
  // Évite de démarrer sur une combinaison indisponible.
  if (isCombinationUnavailable(product, sel)) {
    for (const opt of product.options) {
      for (const v of opt.values) {
        const candidate = { ...sel, [opt.key]: v.value };
        if (!v.unavailable && !isCombinationUnavailable(product, candidate)) return candidate;
      }
    }
  }
  return sel;
}

export function isCombinationUnavailable(product: Product, sel: Selections): boolean {
  if (product.woo) return !findWooVariant(product, sel)?.inStock;
  return (product.unavailableCombos ?? []).some((combo) =>
    (Object.keys(combo) as OptionKey[]).every((k) => sel[k] === combo[k]),
  );
}

export function isSelectionAvailable(product: Product, sel: Selections): boolean {
  if (product.woo) return !!findWooVariant(product, sel)?.inStock;
  if (product.stock === 'out_of_stock') return false;
  for (const opt of product.options) {
    const v = opt.values.find((x) => x.value === sel[opt.key]);
    if (!v || v.unavailable) return false;
  }
  return !isCombinationUnavailable(product, sel);
}

/** Prix avant promotion pour une sélection donnée. */
export function getRegularPrice(product: Product, sel: Selections): number {
  if (product.woo) return findWooVariant(product, sel)?.regularPrice ?? product.basePrice;
  let price = product.basePrice;
  for (const opt of product.options) {
    const v = opt.values.find((x) => x.value === sel[opt.key]);
    price += v?.priceDelta ?? 0;
  }
  return price;
}

/** Prix payé (après promotion produit). */
export function getUnitPrice(product: Product, sel: Selections): number {
  // Boutique réelle : le prix payé est celui de la variante WooCommerce (promotions comprises).
  if (product.woo) return findWooVariant(product, sel)?.price ?? product.basePrice;
  const regular = getRegularPrice(product, sel);
  if (!product.discountPercent) return regular;
  return roundTo(regular * (1 - product.discountPercent / 100));
}

/** Prix « à partir de » affiché sur les cartes produits. */
export function getFromPrice(product: Product) {
  const sel = defaultSelections(product);
  return { price: getUnitPrice(product, sel), regular: getRegularPrice(product, sel) };
}

export function hasMultiplePrices(product: Product) {
  if (product.woo) return new Set(product.woo.variants.map((v) => v.price)).size > 1;
  return product.options.some((o) => o.values.some((v) => (v.priceDelta ?? 0) > 0));
}

export function describeSelections(product: Product, sel: Selections): string {
  return product.options
    .filter((o) => o.values.length > 1 || o.key === 'length')
    .map((o) => {
      const v = o.values.find((x) => x.value === sel[o.key]);
      return v ? `${o.label} : ${v.label}` : null;
    })
    .filter(Boolean)
    .join(' · ');
}

export function makeLineId(productId: string, sel: Selections) {
  const keys = Object.keys(sel).sort() as OptionKey[];
  return `${productId}|${keys.map((k) => `${k}=${sel[k]}`).join('&')}`;
}

// ---------- Panier ----------

export interface PricedLine {
  line: CartLine;
  product: Product;
  unitPrice: number;
  regularPrice: number;
  lineTotal: number;
  eligibleForPromo: boolean;
  label: string;
}

export function priceLines(lines: CartLine[], promo?: PromoCode | null): PricedLine[] {
  return lines
    .map((line) => {
      const product = getProductById(line.productId);
      if (!product) return null;
      const unitPrice = getUnitPrice(product, line.selections);
      return {
        line,
        product,
        unitPrice,
        regularPrice: getRegularPrice(product, line.selections),
        lineTotal: unitPrice * line.quantity,
        eligibleForPromo: !!promo && promo.eligibleCategories.includes(product.category),
        label: describeSelections(product, line.selections),
      } satisfies PricedLine;
    })
    .filter((x): x is PricedLine => x !== null);
}

export function findPromoCode(code: string): PromoCode | undefined {
  return siteConfig.promoCodes.find((p) => p.code === code.trim().toUpperCase());
}

export function getZone(countryCode: string) {
  return siteConfig.countries.find((c) => c.code === countryCode)?.zone ?? 'afrique-ouest';
}

export function availableShippingMethods(countryCode: string): ShippingMethod[] {
  const zone = getZone(countryCode);
  return siteConfig.shippingMethods.filter((m) => m.rates[zone] !== null);
}

export function getShippingCost(
  countryCode: string,
  methodId: ShippingMethod['id'],
  subtotalAfterDiscount: number,
): number {
  const zone = getZone(countryCode);
  const method = siteConfig.shippingMethods.find((m) => m.id === methodId);
  const rate = method?.rates[zone];
  if (rate == null) return 0;
  if (methodId === 'standard' && subtotalAfterDiscount >= siteConfig.freeShippingThreshold) return 0;
  return rate;
}

export interface CartTotals {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  eligibleSubtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export function computeTotals(
  lines: CartLine[],
  promo: PromoCode | null,
  countryCode: string,
  methodId: ShippingMethod['id'] = 'standard',
): CartTotals {
  const priced = priceLines(lines, promo);
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const eligibleSubtotal = priced.filter((l) => l.eligibleForPromo).reduce((s, l) => s + l.lineTotal, 0);
  const discount = promo ? cents((eligibleSubtotal * promo.percent) / 100) : 0;
  const shipping = priced.length ? getShippingCost(countryCode, methodId, subtotal - discount) : 0;
  return {
    lines: priced,
    itemCount: priced.reduce((s, l) => s + l.line.quantity, 0),
    subtotal,
    eligibleSubtotal,
    discount,
    shipping,
    total: cents(subtotal - discount + shipping),
  };
}
