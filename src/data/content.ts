import { img } from '../lib/assets';

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  primary: { label: string; to: string };
  secondary: { label: string; to: string };
  image: string;
  imageAlt: string;
  imagePosition?: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'decouverte',
    eyebrow: 'Perruques & tissages premium',
    title: 'Sublimez votre beauté avec des cheveux d’exception.',
    text: 'Perruques, tissages et accessoires pensés pour sublimer votre style, chaque jour.',
    primary: { label: 'Découvrir nos collections', to: '/boutique' },
    secondary: { label: 'Explorer les perruques', to: '/perruques' },
    image: img('model-bodywave'),
    imageAlt: 'Femme aux longs cheveux ondulés',
    imagePosition: 'center 20%',
  },
  {
    id: 'perruques',
    eyebrow: 'Collection perruques',
    title: 'Lace, glueless ou bob : la perruque qui vous ressemble.',
    text: 'Des textures lisses, ondulées ou bouclées, et une pose adaptée à votre rythme.',
    primary: { label: 'Voir les perruques', to: '/perruques' },
    secondary: { label: 'Bien choisir sa perruque', to: '/guide-cheveux#perruque' },
    image: img('model-straight-long'),
    imageAlt: 'Femme aux cheveux longs et lisses',
    imagePosition: 'center 15%',
  },
  {
    id: 'tissages',
    eyebrow: 'Collection tissages',
    title: 'Des boules de tissage pour créer votre longueur idéale.',
    text: 'Straight, Body Wave, Deep Wave, Curly… combinez les longueurs pour un résultat sur mesure.',
    primary: { label: 'Voir les tissages', to: '/tissages' },
    secondary: { label: 'Combien de boules choisir ?', to: '/guide-cheveux#longueur' },
    image: img('bundles-closeup'),
    imageAlt: 'Boules de tissage noires et colorées',
  },
];

/** Témoignages FICTIFS, fournis uniquement pour la démonstration. */
export const testimonials = [
  {
    id: 't1',
    name: 'Aïcha K.',
    city: 'Abidjan',
    rating: 5,
    text: 'La Body Wave est exactement comme je l’imaginais : légère, facile à coiffer, et la lace se fond bien. Je me suis sentie belle dès la première pose.',
    product: 'Perruque Body Wave Lace Front 13x4',
    isDemo: true,
  },
  {
    id: 't2',
    name: 'Grâce M.',
    city: 'Paris',
    rating: 5,
    text: 'Commande simple, conseils clairs pour choisir la longueur. Le carré Bob est devenu ma perruque de tous les jours.',
    product: 'Perruque Bob Straight',
    isDemo: true,
  },
  {
    id: 't3',
    name: 'Fatou D.',
    city: 'Dakar',
    rating: 4,
    text: 'J’ai pris trois boules Deep Curly pour une tête complète : les boucles tiennent bien avec un peu de sérum. Je recommande.',
    product: 'Boule de tissage Deep Curly 100 g',
    isDemo: true,
  },
  {
    id: 't4',
    name: 'Nadège T.',
    city: 'Bruxelles',
    rating: 5,
    text: 'Le guide m’a aidée à comprendre la différence entre les laces. La Glueless est parfaite pour mes matins pressés.',
    product: 'Perruque Curly Glueless',
    isDemo: true,
  },
];

export const faqItems = [
  {
    q: 'Quelle est la différence entre une perruque et un tissage ?',
    a: 'Une perruque est une pièce complète que l’on pose et retire facilement. Le tissage consiste à coudre ou fixer des mèches (boules de tissage) sur des tresses. Notre guide détaille les avantages de chaque option.',
  },
  {
    q: 'Combien de boules de tissage faut-il pour une tête complète ?',
    a: 'En général, 3 boules de 100 g suffisent jusqu’à 20 pouces. Au-delà, ou pour plus de volume, comptez 4 boules. Ces repères sont indicatifs.',
  },
  {
    q: 'Comment choisir la bonne longueur ?',
    a: 'La longueur est mesurée en pouces (1" ≈ 2,5 cm), cheveux tendus. Une texture bouclée paraît plus courte qu’une texture lisse de même longueur. Consultez notre guide visuel des longueurs.',
  },
  {
    q: 'Qu’est-ce qu’une perruque glueless ?',
    a: 'C’est une perruque conçue pour être portée sans colle, grâce à un bonnet ajustable, des peignes et une bande élastique. Elle est idéale pour débuter.',
  },
  {
    q: 'Dans quels pays livrez-vous ?',
    a: 'La démonstration propose plusieurs pays d’Afrique de l’Ouest, d’Afrique centrale et d’Europe. La liste définitive des zones desservies sera précisée avant le lancement commercial.',
  },
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'Les délais affichés sur le site sont indicatifs et fictifs dans cette maquette. Ils dépendent du pays et du mode de livraison choisis.',
  },
  {
    q: 'Puis-je retourner un article ?',
    a: 'Pour des raisons d’hygiène, les conditions de retour des produits capillaires doivent être précisément définies. La page Livraison & retours présente la structure prévue, à valider avant commercialisation.',
  },
  {
    q: 'Quels moyens de paiement seront acceptés ?',
    a: 'La maquette simule la carte bancaire et le Mobile Money. Aucun paiement réel n’est effectué et aucune donnée bancaire n’est demandée.',
  },
  {
    q: 'Comment utiliser le code INAHAIR10 ?',
    a: 'Saisissez INAHAIR10 dans votre panier : 10 % de réduction s’appliquent aux perruques et aux tissages (hors accessoires). Le code n’est utilisable qu’une fois par commande.',
  },
  {
    q: 'Dois-je créer un compte pour commander ?',
    a: 'Non. Vous pouvez commander en invitée. Le compte (simulé dans cette démo) permet simplement de retrouver vos favoris et vos commandes.',
  },
  {
    q: 'Comment entretenir ma perruque ?',
    a: 'Démêlez avec un peigne à dents larges, lavez avec un shampoing doux toutes les 2 à 3 semaines et laissez sécher sur une tête de présentation. Plus de conseils dans notre guide.',
  },
];

export const guideTeasers = [
  {
    title: 'Comment choisir sa perruque ?',
    text: 'Lace, glueless, densité : les repères essentiels pour faire le bon choix.',
    to: '/guide-cheveux#perruque',
    image: img('model-curly-studio'),
  },
  {
    title: 'Quelle longueur choisir ?',
    text: 'Notre guide visuel des longueurs, du carré aux 26 pouces.',
    to: '/guide-cheveux#longueur',
    image: img('model-straight-window'),
  },
  {
    title: 'Comment entretenir ses extensions ?',
    text: 'Les bons gestes pour garder des cheveux beaux plus longtemps.',
    to: '/guide-cheveux#entretien',
    image: img('acc-tools'),
  },
];
