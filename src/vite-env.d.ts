/// <reference types="vite/client" />
declare const __PREVIEW_MODE__: boolean;

interface ImportMetaEnv {
  /** Adresse de la boutique WooCommerce (ex. https://www.inahair.fr/wp). Vide = mode démonstration. */
  readonly VITE_WOO_URL?: string;
  /** Chemin de l'espace client WooCommerce (défaut : /mon-compte/). */
  readonly VITE_WOO_ACCOUNT_PATH?: string;
}
