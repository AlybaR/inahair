import { CATALOG_REFERENCE_DATE, categoryLabels, NEW_PRODUCT_DAYS, type CatalogDefinition } from '../data/catalog';
import { products } from '../data/products';
import type { Product } from '../data/types';
import { normalize } from './format';
import { getFromPrice } from './pricing';

export const isNew = (p: Product) => {
  const age = (new Date(CATALOG_REFERENCE_DATE).getTime() - new Date(p.createdAt).getTime()) / 86400000;
  return p.tags.includes('nouveau') || age <= NEW_PRODUCT_DAYS;
};

export const isOnSale = (p: Product) => !!p.discountPercent;

export function productsForCatalog(id: CatalogDefinition['id']): Product[] {
  switch (id) {
    case 'boutique':
      return products;
    case 'promotions':
      return products.filter(isOnSale);
    case 'nouveautes':
      return products.filter(isNew);
    default:
      return products.filter((p) => p.category === id);
  }
}

export type SortKey = 'pertinence' | 'prix-asc' | 'prix-desc' | 'nouveautes' | 'meilleures-ventes';

export const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
  { value: 'nouveautes', label: 'Nouveautés' },
  { value: 'meilleures-ventes', label: 'Meilleures ventes' },
];

export function sortProducts(list: Product[], sort: SortKey, relevance?: Map<string, number>): Product[] {
  const arr = [...list];
  switch (sort) {
    case 'prix-asc':
      return arr.sort((a, b) => getFromPrice(a).price - getFromPrice(b).price);
    case 'prix-desc':
      return arr.sort((a, b) => getFromPrice(b).price - getFromPrice(a).price);
    case 'nouveautes':
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'meilleures-ventes':
      return arr.sort((a, b) => a.salesRank - b.salesRank);
    default:
      if (relevance)
        return arr.sort(
          (a, b) => (relevance.get(b.id) ?? 0) - (relevance.get(a.id) ?? 0) || a.featuredRank - b.featuredRank,
        );
      return arr.sort((a, b) => a.featuredRank - b.featuredRank);
  }
}

// ---------- Filtres ----------

export interface Filters {
  category: string[];
  type: string[];
  texture: string[];
  length: string[];
  color: string[];
  min?: number;
  max?: number;
  stock: boolean;
  promo: boolean;
}

export const emptyFilters: Filters = {
  category: [],
  type: [],
  texture: [],
  length: [],
  color: [],
  stock: false,
  promo: false,
};

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);
const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);

export function filtersFromParams(params: URLSearchParams): Filters {
  return {
    category: list(params.get('categorie')),
    type: list(params.get('type')),
    texture: list(params.get('texture')),
    length: list(params.get('longueur')),
    color: list(params.get('couleur')),
    min: num(params.get('min')),
    max: num(params.get('max')),
    stock: params.get('dispo') === '1',
    promo: params.get('promo') === '1',
  };
}

export const paramNames: Record<keyof Filters, string> = {
  category: 'categorie',
  type: 'type',
  texture: 'texture',
  length: 'longueur',
  color: 'couleur',
  min: 'min',
  max: 'max',
  stock: 'dispo',
  promo: 'promo',
};

export function countActiveFilters(f: Filters) {
  return (
    f.category.length +
    f.type.length +
    f.texture.length +
    f.length.length +
    f.color.length +
    (f.min != null ? 1 : 0) +
    (f.max != null ? 1 : 0) +
    (f.stock ? 1 : 0) +
    (f.promo ? 1 : 0)
  );
}

const optionValues = (p: Product, key: 'length' | 'color') => p.options.find((o) => o.key === key)?.values ?? [];

export function applyFilters(list: Product[], f: Filters): Product[] {
  return list.filter((p) => {
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.type.length && !f.type.includes(p.type)) return false;
    if (f.texture.length && !(p.texture && f.texture.includes(p.texture))) return false;
    if (f.length.length && !optionValues(p, 'length').some((v) => !v.unavailable && f.length.includes(v.value)))
      return false;
    if (f.color.length && !optionValues(p, 'color').some((v) => f.color.includes(colorFamily(v.value)))) return false;
    const price = getFromPrice(p).price;
    if (f.min != null && price < f.min) return false;
    if (f.max != null && price > f.max) return false;
    if (f.stock && p.stock === 'out_of_stock') return false;
    if (f.promo && !isOnSale(p)) return false;
    return true;
  });
}

/** Regroupe les codes couleur en familles lisibles pour les filtres. */
export const COLOR_FAMILIES: Record<string, { label: string; swatch: string }> = {
  noir: { label: 'Noir naturel', swatch: '#1E1416' },
  brun: { label: 'Brun', swatch: '#4A2E24' },
  blond: { label: 'Blond', swatch: '#D2AE73' },
  cuivre: { label: 'Cuivré / Auburn', swatch: '#8E4A25' },
  bordeaux: { label: 'Bordeaux', swatch: '#5E1A2B' },
  fantaisie: { label: 'Fantaisie / Multi', swatch: 'conic-gradient(#1E1416,#C08A4B,#E5D6B5,#C0612B,#1C3A5E,#1E1416)' },
  rose: { label: 'Rose', swatch: '#E9B9C6' },
};

export function colorFamily(value: string): string {
  const map: Record<string, string> = {
    '1b': 'noir',
    noir: 'noir',
    '2': 'brun',
    '4': 'brun',
    taupe: 'brun',
    '27': 'blond',
    '613': 'blond',
    ombre27: 'blond',
    '30': 'cuivre',
    ombre: 'cuivre',
    '99j': 'bordeaux',
    multi: 'fantaisie',
    rose: 'rose',
  };
  return map[value] ?? 'fantaisie';
}

/** Valeurs de facettes disponibles dans une liste de produits. */
export function facetValues(list: Product[]) {
  const types = new Set<string>();
  const textures = new Set<string>();
  const lengths = new Set<number>();
  const colorsSet = new Set<string>();
  const categories = new Set<string>();
  let maxPrice = 0;
  for (const p of list) {
    types.add(p.type);
    categories.add(p.category);
    if (p.texture) textures.add(p.texture);
    optionValues(p, 'length').forEach((v) => lengths.add(Number(v.value)));
    optionValues(p, 'color').forEach((v) => colorsSet.add(colorFamily(v.value)));
    maxPrice = Math.max(maxPrice, getFromPrice(p).price);
  }
  const textureOrder = ['Straight', 'Body Wave', 'Deep Wave', 'Curly', 'Kinky Curly'];
  return {
    categories: [...categories].map((c) => ({ value: c, label: categoryLabels[c as keyof typeof categoryLabels] })),
    types: [...types].sort(),
    textures: [...textures].sort((a, b) => textureOrder.indexOf(a) - textureOrder.indexOf(b)),
    lengths: [...lengths].sort((a, b) => a - b).map(String),
    colors: Object.keys(COLOR_FAMILIES).filter((c) => colorsSet.has(c)),
    maxPrice,
  };
}

// ---------- Recherche ----------

export function searchProducts(query: string): { results: Product[]; relevance: Map<string, number> } {
  const q = normalize(query);
  const relevance = new Map<string, number>();
  if (!q) return { results: [], relevance };
  const terms = q.split(/\s+/).filter(Boolean);
  for (const p of products) {
    const name = normalize(p.name);
    const hay = normalize(
      [
        p.name,
        categoryLabels[p.category],
        p.category,
        p.type,
        p.texture ?? '',
        p.shortDescription,
        ...p.options.flatMap((o) => o.values.map((v) => v.label)),
      ].join(' '),
    );
    let score = 0;
    let all = true;
    for (const t of terms) {
      const singular = t.replace(/s$/, '');
      if (name.includes(t) || name.includes(singular)) score += 3;
      else if (hay.includes(t) || hay.includes(singular)) score += 1;
      else all = false;
    }
    if (all && score > 0) relevance.set(p.id, score + (name.startsWith(terms[0]) ? 1 : 0));
  }
  const results = products.filter((p) => relevance.has(p.id));
  return { results: sortProducts(results, 'pertinence', relevance), relevance };
}
