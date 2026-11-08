export type CategoryId = 'perruques' | 'tissages' | 'accessoires';

export type OptionKey = 'length' | 'texture' | 'lace' | 'density' | 'color' | 'weight' | 'size';

export interface OptionValue {
  value: string;
  label: string;
  /** Supplément (€) ajouté au prix de base, avant promotion. */
  priceDelta?: number;
  /** Valeur temporairement indisponible (rupture fictive). */
  unavailable?: boolean;
  /** Couleur d'aperçu pour les pastilles de coloris. */
  swatch?: string;
}

export interface ProductOption {
  key: OptionKey;
  label: string;
  values: OptionValue[];
}

export type Selections = Partial<Record<OptionKey, string>>;

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  slug: string;
  category: CategoryId;
  /** Type de produit (ex. « Lace Front », « Glueless », « Pince »). */
  type: string;
  name: string;
  shortDescription: string;
  description: string[];
  /** Prix de base en euros (pour la première valeur de chaque option). */
  basePrice: number;
  /** Remise promotionnelle en %, appliquée partout de la même façon. */
  discountPercent?: number;
  /** Chemins d'images (remplaçables par les photos officielles). */
  images: string[];
  imageAlt: string;
  texture?: string;
  options: ProductOption[];
  /** Combinaisons d'options indisponibles. */
  unavailableCombos?: Selections[];
  tags: Array<'best-seller' | 'nouveau' | 'exclusif'>;
  stock: StockStatus;
  features: Array<{ label: string; value: string }>;
  care: string[];
  /** Note de démonstration (fictive). */
  rating?: number;
  reviewCount?: number;
  /** Date d'ajout fictive, utilisée pour le tri « Nouveautés ». */
  createdAt: string;
  /** Rang de ventes fictif (1 = meilleure vente). */
  salesRank: number;
  /** Rang éditorial pour le tri « Pertinence ». */
  featuredRank: number;
  related?: string[];
}

export interface CartLine {
  lineId: string;
  productId: string;
  selections: Selections;
  quantity: number;
  addedAt: number;
}

export interface OrderAddress {
  country: string;
  city: string;
  address: string;
  postalCode?: string;
  complement?: string;
}

export interface OrderLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  selectionsLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  reference: string;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  address: OrderAddress;
  shippingMethod: string;
  shippingCost: number;
  paymentMethod: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  total: number;
  isDemo: true;
}

export interface DemoUser {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}
