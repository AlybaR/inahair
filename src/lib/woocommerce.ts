/**
 * CONNECTEUR WOOCOMMERCE (backend gratuit, auto-hébergé sur OVH).
 *
 * - Le catalogue (prix, variantes, stocks, images) est lu via la Store API publique
 *   de WooCommerce : aucune clé secrète n'est exposée dans le site.
 * - Le paiement se fait sur la page de commande WooCommerce, ouverte avec un
 *   « lien de commande » qui remplit le panier : /checkout-link/?products=ID:QTE,...&coupon=CODE
 *
 * Activation : définir VITE_WOO_URL (ex. https://www.inahair.fr/wp) dans un fichier .env.
 * Sans cette variable, le site fonctionne en mode démonstration (catalogue local).
 *
 * Les textes éditoriaux (caractéristiques, conseils, rang de ventes…) restent dans
 * src/data/products.ts : un produit WooCommerce est relié au produit local par son UGS (SKU),
 * qui doit être égale au slug local (ex. « perruque-bob-straight »).
 */
import { products } from '../data/products';
import type { CategoryId, OptionKey, OptionValue, Product, ProductOption, Selections } from '../data/types';

export interface WooVariant {
  /** ID WooCommerce de la variation (ou du produit simple). */
  id: number;
  selections: Selections;
  price: number;
  regularPrice: number;
  inStock: boolean;
}

/* ---------------------------------------------------------------- */
/* Configuration                                                     */
/* ---------------------------------------------------------------- */

const rawUrl = (import.meta.env.VITE_WOO_URL as string | undefined)?.trim() ?? '';
export const WOO_URL = rawUrl.replace(/\/+$/, '');
const ACCOUNT_PATH = ((import.meta.env.VITE_WOO_ACCOUNT_PATH as string | undefined) || '/mon-compte/').trim();

type WooState = 'off' | 'loading' | 'ready' | 'error';
let state: WooState = WOO_URL ? 'loading' : 'off';

/** Une boutique WooCommerce est configurée (mode production). */
export const isWooConfigured = () => state !== 'off';
/** Le catalogue WooCommerce a bien été chargé. */
export const isWooReady = () => state === 'ready';
export const wooAccountUrl = () => `${WOO_URL}${ACCOUNT_PATH.startsWith('/') ? '' : '/'}${ACCOUNT_PATH}`;

/* ---------------------------------------------------------------- */
/* Types de la Store API (champs utilisés uniquement)                */
/* ---------------------------------------------------------------- */

interface StorePrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_minor_unit: number;
}
interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  type: string;
  short_description: string;
  description: string;
  prices: StorePrices;
  images: Array<{ src: string; alt: string }>;
  categories: Array<{ name: string; slug: string }>;
  attributes: Array<{ name: string; has_variations: boolean; terms: Array<{ name: string; slug: string }> }>;
  variations: Array<{ id: number; attributes: Array<{ name: string; value: string }> }>;
  is_in_stock: boolean;
  is_purchasable: boolean;
  average_rating?: string;
  review_count?: number;
}

/* ---------------------------------------------------------------- */
/* Utilitaires                                                       */
/* ---------------------------------------------------------------- */

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

const money = (value: string, minorUnit: number) => Number(value) / 10 ** minorUnit;

function decodeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.documentElement.textContent?.trim() ?? '';
}

function htmlToParagraphs(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks = [...doc.body.querySelectorAll('p, li')].map((el) => el.textContent?.trim() ?? '').filter(Boolean);
  return blocks.length ? blocks : [doc.body.textContent?.trim() ?? ''].filter(Boolean);
}

async function getAll(path: string): Promise<StoreProduct[]> {
  const out: StoreProduct[] = [];
  for (let page = 1; page <= 20; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${WOO_URL}/wp-json/wc/store/v1/${path}${sep}per_page=100&page=${page}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`WooCommerce Store API : HTTP ${res.status} sur ${path}`);
    const batch = (await res.json()) as StoreProduct[];
    out.push(...batch);
    const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? '1');
    if (batch.length < 100 || page >= totalPages) break;
  }
  return out;
}

/** Correspondance nom d'attribut WooCommerce → clé d'option du site. */
const ATTRIBUTE_KEYS: Record<string, OptionKey> = {
  longueur: 'length',
  length: 'length',
  texture: 'texture',
  typedelace: 'lace',
  lace: 'lace',
  densite: 'density',
  density: 'density',
  couleur: 'color',
  color: 'color',
  teinte: 'color',
  poids: 'weight',
  weight: 'weight',
  taille: 'size',
  format: 'size',
  size: 'size',
};

function categoryOf(p: StoreProduct): CategoryId {
  const slugs = p.categories.map((c) => norm(c.slug || c.name));
  if (slugs.some((s) => s.includes('perruque'))) return 'perruques';
  if (slugs.some((s) => s.includes('tissage') || s.includes('bundle'))) return 'tissages';
  return 'accessoires';
}

/** Options du produit : celles du catalogue local si le produit est connu, sinon celles de WooCommerce. */
function buildOptions(p: StoreProduct, local?: Product): ProductOption[] {
  if (local) return local.options.map((o) => ({ ...o, values: o.values.map((v) => ({ ...v })) }));
  return p.attributes
    .filter((a) => a.has_variations && ATTRIBUTE_KEYS[norm(a.name)])
    .map((a) => ({
      key: ATTRIBUTE_KEYS[norm(a.name)],
      label: a.name,
      values: a.terms.map<OptionValue>((t) => ({ value: t.name, label: t.name })),
    }));
}

function resolveSelections(options: ProductOption[], attrs: Array<{ name: string; value: string }>): Selections {
  const sel: Selections = {};
  for (const a of attrs) {
    if (!a.value) continue; // « n'importe quelle valeur »
    const key = ATTRIBUTE_KEYS[norm(a.name)];
    const opt = options.find((o) => o.key === key || norm(o.label) === norm(a.name));
    const val = opt?.values.find((v) => norm(v.label) === norm(a.value) || norm(v.value) === norm(a.value));
    if (opt && val) sel[opt.key] = val.value;
  }
  return sel;
}

const matches = (variant: WooVariant, sel: Selections) =>
  (Object.keys(variant.selections) as OptionKey[]).every((k) => sel[k] === variant.selections[k]);

export const findWooVariant = (product: Product, sel: Selections) => product.woo?.variants.find((v) => matches(v, sel));

/* ---------------------------------------------------------------- */
/* Construction du catalogue                                         */
/* ---------------------------------------------------------------- */

function toProduct(p: StoreProduct, local: Product | undefined, variationPrices: Map<number, StoreProduct>): Product {
  const minor = p.prices.currency_minor_unit ?? 2;
  const options = buildOptions(p, local);

  const variants: WooVariant[] =
    p.type === 'variable'
      ? p.variations.map((v) => {
          const vp = variationPrices.get(v.id);
          const prices = vp?.prices ?? p.prices;
          return {
            id: v.id,
            selections: resolveSelections(options, v.attributes),
            price: money(prices.price, minor),
            regularPrice: money(prices.regular_price || prices.price, minor),
            inStock: vp ? vp.is_in_stock && vp.is_purchasable : p.is_in_stock,
          };
        })
      : [
          {
            id: p.id,
            selections: {},
            price: money(p.prices.price, minor),
            regularPrice: money(p.prices.regular_price || p.prices.price, minor),
            inStock: p.is_in_stock && p.is_purchasable,
          },
        ];

  // Valeurs d'option sans aucune variante en stock → indisponibles.
  for (const opt of options) {
    for (const val of opt.values) {
      val.unavailable = !variants.some((v) => v.inStock && (v.selections[opt.key] ?? val.value) === val.value);
    }
  }

  // Variante de référence (la moins chère en stock) pour le prix « à partir de » et les suppléments affichés.
  const ref = [...variants].filter((v) => v.inStock).sort((a, b) => a.price - b.price)[0] ?? variants[0];
  for (const opt of options) {
    for (const val of opt.values) {
      const candidate = variants.find((v) =>
        (Object.keys(ref?.selections ?? {}) as OptionKey[]).every((k) =>
          k === opt.key ? v.selections[k] === val.value : v.selections[k] === ref.selections[k],
        ),
      );
      val.priceDelta = candidate && ref ? candidate.regularPrice - ref.regularPrice : undefined;
    }
  }

  const regular = ref?.regularPrice ?? 0;
  const price = ref?.price ?? 0;
  const discountPercent = regular > price ? Math.round((1 - price / regular) * 100) : undefined;
  const inStock = variants.some((v) => v.inStock);

  return {
    ...(local ?? {
      id: `woo-${p.id}`,
      type: p.categories[0]?.name ?? 'Produit',
      features: [],
      care: [],
      tags: [],
      createdAt: new Date().toISOString().slice(0, 10),
      salesRank: 999,
      featuredRank: 999,
      imageAlt: decodeHtml(p.name),
    }),
    slug: local?.slug ?? p.slug,
    category: local?.category ?? categoryOf(p),
    name: decodeHtml(p.name),
    shortDescription: decodeHtml(p.short_description) || local?.shortDescription || '',
    description: p.description ? htmlToParagraphs(p.description) : (local?.description ?? []),
    images: p.images.length ? p.images.map((i) => i.src) : (local?.images ?? []),
    basePrice: regular,
    discountPercent,
    options,
    unavailableCombos: [],
    stock: inStock ? (local?.stock === 'low_stock' ? 'low_stock' : 'in_stock') : 'out_of_stock',
    rating: Number(p.average_rating) > 0 ? Number(p.average_rating) : local?.rating,
    reviewCount: (p.review_count ?? 0) > 0 ? p.review_count : local?.reviewCount,
    woo: { productId: p.id, variants },
  } as Product;
}

/**
 * Convertit les réponses de la Store API (produits + variations) en catalogue du site,
 * en reprenant les textes éditoriaux des produits locaux de même UGS.
 */
export function buildCatalog(parents: StoreProduct[], variations: StoreProduct[], local: Product[]): Product[] {
  const variationPrices = new Map(variations.map((v) => [v.id, v]));
  const bySku = new Map(local.map((p) => [p.slug, p]));
  return parents
    .filter((p) => p.type === 'variable' || p.type === 'simple')
    .map((p) => toProduct(p, bySku.get(p.sku) ?? bySku.get(p.slug), variationPrices));
}

/**
 * Charge le catalogue WooCommerce et remplace le catalogue de démonstration.
 * À appeler une fois au démarrage, avant le premier rendu.
 */
export async function loadWooCatalog(): Promise<void> {
  if (state === 'off') return;
  try {
    const [parents, variations] = await Promise.all([getAll('products'), getAll('products?type=variation')]);
    const next = buildCatalog(parents, variations, products);
    products.splice(0, products.length, ...next);
    state = 'ready';
  } catch (err) {
    console.error('[Inahair] Catalogue WooCommerce indisponible :', err);
    state = 'error';
  }
}

/* ---------------------------------------------------------------- */
/* Paiement                                                          */
/* ---------------------------------------------------------------- */

/**
 * Construit le lien qui remplit le panier WooCommerce et ouvre la page de paiement.
 * Renvoie null si une ligne ne correspond à aucune variante WooCommerce.
 */
export function buildCheckoutLink(
  lines: Array<{ product: Product; selections: Selections; quantity: number }>,
  coupon?: string | null,
): string | null {
  const items: string[] = [];
  for (const l of lines) {
    const v = findWooVariant(l.product, l.selections);
    if (!v || !v.inStock) return null;
    items.push(`${v.id}:${l.quantity}`);
  }
  if (!items.length) return null;
  const params = new URLSearchParams({ products: items.join(',') });
  if (coupon) params.set('coupon', coupon);
  return `${WOO_URL}/checkout-link/?${params.toString().replace(/%2C/g, ',').replace(/%3A/g, ':')}`;
}
