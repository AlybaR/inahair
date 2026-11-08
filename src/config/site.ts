/**
 * Configuration centrale d'Inahair.
 * Toutes les valeurs ci-dessous sont des données de DÉMONSTRATION :
 * modifiez-les ici sans toucher aux composants.
 */

export type ZoneId = 'afrique-ouest' | 'afrique-centrale' | 'europe';

export interface Country {
  code: string;
  name: string;
  zone: ZoneId;
  postalCodeRequired: boolean;
}

export interface ShippingMethod {
  id: 'standard' | 'express' | 'retrait';
  label: string;
  description: string;
  /** Tarif par zone, en euros. `null` = méthode indisponible pour la zone. */
  rates: Record<ZoneId, number | null>;
  delay: Record<ZoneId, string>;
}

export interface PromoCode {
  code: string;
  percent: number;
  label: string;
  /** Catégories concernées par la réduction. */
  eligibleCategories: Array<'perruques' | 'tissages' | 'accessoires'>;
}

export const siteConfig = {
  brand: {
    name: 'Inahair',
    tagline: 'Perruques & tissages premium',
    description:
      'Inahair sélectionne des perruques, des boules de tissage et des accessoires pensés pour sublimer votre style, au quotidien comme pour les grandes occasions.',
  },

  /** Palette de référence (également déclarée dans tailwind.config.js). */
  colors: {
    powder: '#F8E4E9',
    blush: '#FFF0F3',
    berry: '#A7194A',
    rose: '#CF4774',
    cream: '#FFFAF9',
    cocoa: '#321A22',
    muted: '#74666C',
  },

  /** Coordonnées fictives : à remplacer avant mise en ligne. */
  contact: {
    email: 'contact@inahair-demo.com',
    phone: '+225 00 00 00 00',
    whatsapp: '+225 00 00 00 00',
    hours: 'Du lundi au samedi, 9 h – 18 h (GMT)',
    isDemo: true,
  },

  /**
   * Réseaux sociaux : laissez `url` vide tant que les comptes n'existent pas.
   * Les entrées sans URL ne sont pas affichées comme liens.
   */
  socials: [
    { id: 'instagram', label: 'Instagram', url: '' },
    { id: 'tiktok', label: 'TikTok', url: '' },
    { id: 'facebook', label: 'Facebook', url: '' },
  ] as Array<{ id: 'instagram' | 'tiktok' | 'facebook'; label: string; url: string }>,

  currency: {
    code: 'EUR',
    label: '€',
    locale: 'fr-FR',
  },

  announcements: ['Livraison en Afrique & en Europe', 'Paiement sécurisé', 'Collections premium'],

  /** Seuil de livraison standard offerte (€). */
  freeShippingThreshold: 300,

  countries: [
    { code: 'CI', name: "Côte d'Ivoire", zone: 'afrique-ouest', postalCodeRequired: false },
    { code: 'SN', name: 'Sénégal', zone: 'afrique-ouest', postalCodeRequired: false },
    { code: 'BJ', name: 'Bénin', zone: 'afrique-ouest', postalCodeRequired: false },
    { code: 'TG', name: 'Togo', zone: 'afrique-ouest', postalCodeRequired: false },
    { code: 'BF', name: 'Burkina Faso', zone: 'afrique-ouest', postalCodeRequired: false },
    { code: 'ML', name: 'Mali', zone: 'afrique-ouest', postalCodeRequired: false },
    { code: 'CM', name: 'Cameroun', zone: 'afrique-centrale', postalCodeRequired: false },
    { code: 'GA', name: 'Gabon', zone: 'afrique-centrale', postalCodeRequired: false },
    { code: 'CG', name: 'Congo', zone: 'afrique-centrale', postalCodeRequired: false },
    { code: 'FR', name: 'France', zone: 'europe', postalCodeRequired: true },
    { code: 'BE', name: 'Belgique', zone: 'europe', postalCodeRequired: true },
    { code: 'CH', name: 'Suisse', zone: 'europe', postalCodeRequired: true },
    { code: 'LU', name: 'Luxembourg', zone: 'europe', postalCodeRequired: true },
    { code: 'DE', name: 'Allemagne', zone: 'europe', postalCodeRequired: true },
    { code: 'ES', name: 'Espagne', zone: 'europe', postalCodeRequired: true },
    { code: 'IT', name: 'Italie', zone: 'europe', postalCodeRequired: true },
  ] as Country[],

  zones: {
    'afrique-ouest': 'Afrique de l’Ouest',
    'afrique-centrale': 'Afrique centrale',
    europe: 'Europe',
  } as Record<ZoneId, string>,

  /** Barème de livraison FICTIF. */
  shippingMethods: [
    {
      id: 'standard',
      label: 'Livraison standard',
      description: 'Suivi inclus',
      rates: { 'afrique-ouest': 5, 'afrique-centrale': 8, europe: 6.9 },
      delay: {
        'afrique-ouest': '3 à 5 jours ouvrés',
        'afrique-centrale': '5 à 8 jours ouvrés',
        europe: '5 à 10 jours ouvrés',
      },
    },
    {
      id: 'express',
      label: 'Livraison express',
      description: 'Prioritaire, suivi inclus',
      rates: { 'afrique-ouest': 12, 'afrique-centrale': 15, europe: 14.9 },
      delay: { 'afrique-ouest': '24 à 48 h', 'afrique-centrale': '2 à 4 jours ouvrés', europe: '3 à 5 jours ouvrés' },
    },
    {
      id: 'retrait',
      label: 'Retrait en point relais',
      description: 'Point relais partenaire (à définir)',
      rates: { 'afrique-ouest': 2.5, 'afrique-centrale': null, europe: 4.9 },
      delay: { 'afrique-ouest': '3 à 6 jours ouvrés', 'afrique-centrale': '—', europe: '6 à 10 jours ouvrés' },
    },
  ] as ShippingMethod[],

  defaultCountry: 'CI',

  promoCodes: [
    {
      code: 'INAHAIR10',
      percent: 10,
      label: '10 % sur les perruques et les tissages',
      eligibleCategories: ['perruques', 'tissages'],
    },
  ] as PromoCode[],

  mobileMoneyOperators: ['Orange Money', 'MTN Mobile Money', 'Wave', 'Moov Money'],

  orderPrefix: 'INA',

  /** Clés localStorage (préfixées pour éviter les collisions). */
  storageKeys: {
    cart: 'inahair.cart.v1',
    promo: 'inahair.promo.v1',
    wishlist: 'inahair.wishlist.v1',
    session: 'inahair.session.v1',
    users: 'inahair.users.v1',
    orders: 'inahair.orders.v1',
    newsletter: 'inahair.newsletter.v1',
    shippingCountry: 'inahair.shipping-country.v1',
  },
};

export type SiteConfig = typeof siteConfig;
