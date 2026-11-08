# Inahair — prototype e-commerce (front-end uniquement)

Maquette interactive d'une boutique de perruques, boules de tissage et accessoires.
**100 % navigateur** : pas de backend, pas de paiement réel, pas d'authentification réelle.
Panier, favoris, compte fictif et commandes simulées sont conservés dans `localStorage`.

## Lancer le projet

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # build de production dans dist/ (BrowserRouter)
npm run preview        # sert dist/ avec retour SPA (toutes les routes fonctionnent après actualisation)
npm run build:preview  # fichier HTML unique (MemoryRouter) pour une prévisualisation hébergée
npm run format         # met en forme le code (Prettier + tri des classes Tailwind)
npm run lint           # vérifie le code (ESLint)
```

Node 18+ recommandé. En production, servez `dist/` avec un retour vers `index.html`
(`public/_redirects` pour Netlify et `vercel.json` sont fournis).

## Boutique réelle (backend WooCommerce)

Le site peut être branché sur **WooCommerce** (gratuit, auto-hébergé sur OVH) : catalogue, stocks,
commandes, clients et paiement réels. Sans configuration, il reste en mode démonstration.
Guide complet : [docs/WOOCOMMERCE.md](docs/WOOCOMMERCE.md).

```bash
npm run woo:export       # génère woocommerce/inahair-produits.csv (import natif WooCommerce)
npm run woo:test-server  # WooCommerce de test local sur http://127.0.0.1:9400
```

## Mise en ligne

### OVH (hébergement mutualisé Apache)

1. `npm run build` : le dossier `dist/` contient tout le site, y compris le fichier `.htaccess`
   qui renvoie toutes les routes vers `index.html` (actualisation et liens directs fonctionnels).
2. Envoyez **le contenu** de `dist/` (et non le dossier lui-même) dans le dossier `www/` de
   l'hébergement, par FTP (FileZilla) ou via le gestionnaire de fichiers OVH.
   Pensez à afficher les fichiers cachés pour bien transférer `.htaccess`.
3. Le site est servi à la racine du domaine : aucune autre configuration n'est nécessaire.
   Pour un sous-dossier (ex. `mondomaine.fr/boutique/`), construisez avec `BASE_PATH=/boutique/ npm run build`
   et adaptez `RewriteBase` dans `.htaccess`.

### GitHub Pages (lien de démonstration)

Le workflow `.github/workflows/deploy-pages.yml` construit et publie le site à chaque push sur `main`,
sous `https://<compte>.github.io/<dépôt>/`. Il faut activer Pages une fois :
**Settings → Pages → Source : GitHub Actions**. Sur un compte GitHub gratuit, Pages exige un dépôt public.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router 6 · Lucide React · Framer Motion.

## Structure

```
src/
  config/site.ts        Marque, couleurs, contacts fictifs, devise (EUR), pays, barème de livraison,
                        codes promo, clés localStorage — TOUT se modifie ici
  data/
    products.ts         Catalogue fictif (26 produits : 13 perruques, 8 tissages, 5 accessoires)
    catalog.ts          Catalogues, filtres proposés, menus de navigation
    content.ts          Slides du hero, témoignages fictifs, FAQ, guide
    types.ts            Types (Product, CartLine, Order…)
  lib/
    pricing.ts          Logique commerciale unique : prix des variantes, promos, livraison, totaux
    catalog.ts          Filtres, tri, recherche
    format.ts, storage.ts, assets.ts
  store/                Contextes : panier, favoris, compte + commandes, interface (toasts, tiroirs)
  components/           layout/ (Header, Footer), product/, cart/, home/, ui/ (Drawer, Modal, Tabs…)
  pages/                Home, Catalog, ProductPage, Shop (recherche/favoris/panier), Checkout,
                        Account, Info (à propos, livraison, FAQ, contact, suivi, légal), Guide, NotFound
public/images/          Visuels d'illustration (WebP) — à remplacer par les photos officielles
```

Pour remplacer les visuels : déposez vos fichiers dans `public/images/` et modifiez la propriété
`images` de chaque produit dans `src/data/products.ts`.

## Fonctionnalités vérifiées (tests automatisés Playwright, desktop + iPhone 13)

- A. Perruques → filtre Body Wave → fiche → 20" + densité 180 % (prix recalculé 145 € → 187 €) → panier →
  quantité → checkout 4 étapes → Mobile Money simulé → confirmation `INA-2026-0001`.
- B. Tissages → filtre texture → 18" → 3 boules → total correct → continuer les achats.
- C. Favoris : ajout ×3, compteur, retrait, fiche, ajout au panier.
- D. Recherche « curly » : suggestions en direct, Entrée, tri par prix, ouverture d'un produit.
- E. Promotions → produit remisé → `INAHAIR10` (recalcul, non cumulable, retirable, code invalide refusé).
- F. Inscription fictive → tableau de bord → commandes → favoris → déconnexion → redirection protégée.
- G. Guide → FAQ (accordéons) → contact (validation + confirmation simulée).
- H. Mobile : menu hamburger → catégorie → filtres en panneau latéral → fiche → mini-panier → checkout.
- Suivi de commande, page 404, persistance après actualisation, aucun débordement horizontal à 390 px,
  aucune erreur JavaScript.

## Limites propres à la démonstration

- Prix, stocks, notes, avis, caractéristiques et barèmes de livraison sont **fictifs**.
- Aucun paiement : aucune donnée bancaire n'est demandée ; aucune commande n'est transmise.
- Compte simulé : aucun mot de passe n'est stocké, les données restent dans le navigateur.
- Newsletter et contact : confirmations simulées, aucun email envoyé.
- Pages légales : modèles à compléter et à faire valider juridiquement.
- Photos : visuels d'illustration Unsplash (voir `public/images/CREDITS.txt`) ; les teintes des
  variantes ne changent pas la photo affichée.
- Les réseaux sociaux ne sont pas affichés comme liens tant qu'aucune URL n'est configurée.
