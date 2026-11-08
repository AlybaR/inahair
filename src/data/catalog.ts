import { img } from '../lib/assets';
import type { CategoryId } from './types';

export interface CatalogDefinition {
  id: 'boutique' | CategoryId | 'promotions' | 'nouveautes';
  path: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  imagePosition?: string;
  /** Filtres proposés pour ce catalogue. */
  facets: Array<'category' | 'price' | 'length' | 'texture' | 'color' | 'type' | 'stock' | 'promo'>;
}

export const catalogs: Record<CatalogDefinition['id'], CatalogDefinition> = {
  boutique: {
    id: 'boutique',
    path: '/boutique',
    title: 'La boutique',
    eyebrow: 'Toutes nos collections',
    description: 'Perruques, boules de tissage et accessoires : explorez toute la sélection Inahair.',
    image: img('lifestyle-street'),
    imagePosition: 'center 25%',
    facets: ['category', 'price', 'texture', 'length', 'color', 'stock', 'promo'],
  },
  perruques: {
    id: 'perruques',
    path: '/perruques',
    title: 'Perruques',
    eyebrow: 'Lace Front, Glueless, Bob…',
    description:
      'Des perruques pensées pour un rendu naturel, une pose simple et un confort qui dure toute la journée.',
    image: img('model-straight-long'),
    imagePosition: 'center 20%',
    facets: ['price', 'type', 'texture', 'length', 'color', 'stock', 'promo'],
  },
  tissages: {
    id: 'tissages',
    path: '/tissages',
    title: 'Boules de tissage',
    eyebrow: 'Straight, Body Wave, Curly…',
    description: 'Des boules de 100 g à combiner librement pour créer la longueur et le volume qui vous ressemblent.',
    image: img('bundles-colors'),
    imagePosition: 'center 40%',
    facets: ['price', 'texture', 'length', 'color', 'stock', 'promo'],
  },
  accessoires: {
    id: 'accessoires',
    path: '/accessoires',
    title: 'Accessoires',
    eyebrow: 'Entretien & finitions',
    description: 'Pinces, chouchous en satin et outils de coiffage pour prendre soin de vos cheveux et de vos pièces.',
    image: img('acc-scrunchies'),
    facets: ['price', 'type', 'color', 'stock', 'promo'],
  },
  promotions: {
    id: 'promotions',
    path: '/promotions',
    title: 'Offres du moment',
    eyebrow: 'Promotions',
    description:
      'Une sélection de pièces à prix doux. Code INAHAIR10 : -10 % supplémentaires sur les perruques et les tissages.',
    image: img('lifestyle-pink'),
    imagePosition: 'center 30%',
    facets: ['category', 'price', 'texture', 'length', 'stock'],
  },
  nouveautes: {
    id: 'nouveautes',
    path: '/nouveautes',
    title: 'Nouveautés',
    eyebrow: 'Fraîchement arrivées',
    description: 'Les dernières textures et coupes entrées dans la collection Inahair.',
    image: img('model-curly-studio'),
    imagePosition: 'center 25%',
    facets: ['category', 'price', 'texture', 'length', 'color', 'stock', 'promo'],
  },
};

export const categoryLabels: Record<CategoryId, string> = {
  perruques: 'Perruques',
  tissages: 'Tissages',
  accessoires: 'Accessoires',
};

export const categoryPaths: Record<CategoryId, string> = {
  perruques: '/perruques',
  tissages: '/tissages',
  accessoires: '/accessoires',
};

/** Nombre de jours pendant lesquels un produit est considéré comme « nouveau ». */
export const NEW_PRODUCT_DAYS = 60;
/** Date de référence de la démo (pour garder un catalogue stable). */
export const CATALOG_REFERENCE_DATE = '2026-11-08';

export interface NavItem {
  label: string;
  to: string;
  columns?: Array<{ title: string; links: Array<{ label: string; to: string }> }>;
  feature?: { title: string; text: string; to: string; image: string };
}

export const mainNav: NavItem[] = [
  { label: 'Accueil', to: '/' },
  {
    label: 'Perruques',
    to: '/perruques',
    columns: [
      {
        title: 'Par type',
        links: [
          { label: 'Lace Front', to: '/perruques?type=Lace+Front' },
          { label: 'Glueless', to: '/perruques?type=Glueless' },
          { label: 'Bob', to: '/perruques?type=Bob' },
        ],
      },
      {
        title: 'Par texture',
        links: [
          { label: 'Straight', to: '/perruques?texture=Straight' },
          { label: 'Body Wave', to: '/perruques?texture=Body+Wave' },
          { label: 'Deep Wave', to: '/perruques?texture=Deep+Wave' },
          { label: 'Curly', to: '/perruques?texture=Curly' },
          { label: 'Kinky Curly', to: '/perruques?texture=Kinky+Curly' },
        ],
      },
    ],
    feature: {
      title: 'Toutes les perruques',
      text: 'Voir la collection complète',
      to: '/perruques',
      image: img('model-bodywave'),
    },
  },
  {
    label: 'Tissages',
    to: '/tissages',
    columns: [
      {
        title: 'Par texture',
        links: [
          { label: 'Straight', to: '/tissages?texture=Straight' },
          { label: 'Body Wave', to: '/tissages?texture=Body+Wave' },
          { label: 'Deep Wave', to: '/tissages?texture=Deep+Wave' },
          { label: 'Curly', to: '/tissages?texture=Curly' },
          { label: 'Kinky Curly', to: '/tissages?texture=Kinky+Curly' },
        ],
      },
      {
        title: 'Conseils',
        links: [
          { label: 'Combien de boules ?', to: '/guide-cheveux#longueur' },
          { label: 'Choisir sa texture', to: '/guide-cheveux#textures' },
        ],
      },
    ],
    feature: {
      title: 'Toutes les boules de tissage',
      text: 'Voir la collection',
      to: '/tissages',
      image: img('bundles-closeup'),
    },
  },
  {
    label: 'Accessoires',
    to: '/accessoires',
    columns: [
      {
        title: 'Accessoires',
        links: [
          { label: 'Pinces', to: '/accessoires?type=Pinces' },
          { label: 'Chouchous', to: '/accessoires?type=Chouchous' },
          { label: 'Peignes', to: '/accessoires?type=Peignes' },
          { label: 'Nœuds', to: '/accessoires?type=N%C5%93uds' },
          { label: 'Kits', to: '/accessoires?type=Kits' },
        ],
      },
    ],
    feature: {
      title: 'Prendre soin de ses cheveux',
      text: 'Nos conseils d’entretien',
      to: '/guide-cheveux#entretien',
      image: img('acc-tools'),
    },
  },
  { label: 'Nouveautés', to: '/nouveautes' },
  { label: 'Promotions', to: '/promotions' },
];
