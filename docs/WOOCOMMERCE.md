# Brancher la boutique réelle (WooCommerce sur OVH)

Le site Inahair (React) reste la vitrine. **WooCommerce**, gratuit et sans abonnement, sert de backend :
catalogue, prix, stocks par variante, commandes, clients, emails, factures, coupons et paiement.

```
www.inahair.fr/        → site Inahair (dossier dist/)
www.inahair.fr/wp/     → WordPress + WooCommerce (back-office, paiement, compte client)
```

Le site lit le catalogue via l'API publique de WooCommerce (aucune clé secrète dans le site).
Au moment de payer, le panier est transmis à la page de paiement WooCommerce
(`/wp/checkout-link/?products=…&coupon=…`).

Coûts : uniquement l'hébergement OVH et les frais par transaction du moyen de paiement
(Stripe ou PayPal, sans abonnement). Tous les modules ci-dessous sont gratuits.

---

## 1. Installer WordPress dans le dossier `/wp/` (OVH)

1. Espace client OVH → Hébergements → votre offre → **Modules en 1 clic** → Ajouter un module.
2. Choisir **WordPress**, installation **en mode avancé** pour indiquer le dossier **`wp`**
   (chemin d'installation : `www/wp`).
3. Langue : français. Notez l'identifiant et le mot de passe administrateur.
4. Le back-office est alors sur `https://www.inahair.fr/wp/wp-admin/`.

## 2. Installer WooCommerce et les extensions gratuites

Dans `wp-admin` → Extensions → Ajouter :

| Extension                                                                 | Rôle                                                                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **WooCommerce**                                                           | La boutique (obligatoire). Assistant : France, euro, produits physiques.                 |
| **WooCommerce Stripe Payment Gateway** ou **WooCommerce PayPal Payments** | Paiement CB, Apple Pay, Google Pay (Stripe) ou PayPal. Frais par transaction uniquement. |

Puis :

- Réglages → **Permaliens** → « Titre de la publication » (indispensable pour l'API et le lien de paiement).
- WooCommerce → Réglages → Général : pays de vente **France**, devise **Euro (€)**.
- WooCommerce → Réglages → Taxes : activer la TVA, taux standard **20 %** pour la France, prix saisis **TTC**.
- WooCommerce → Réglages → Expédition : créer une zone « France » avec vos tarifs (Colissimo, Mondial Relay…).
- WooCommerce → Réglages → Avancé → Pages : vérifier les pages Panier, Commande, Mon compte.
- WooCommerce → Réglages → Visibilité du site : **Live** (sinon l'API ne renvoie rien aux visiteurs).

## 3. Importer les 26 produits et leurs 452 variantes

1. Sur votre ordinateur, dans le projet : `npm run woo:export`
   → crée `woocommerce/inahair-produits.csv` (prix, promos, stocks, photos, catégories).
   Les photos sont téléchargées depuis le site en ligne ; pour utiliser votre domaine :
   `IMAGE_BASE_URL=https://www.inahair.fr/ npm run woo:export` (une fois le site publié).
2. `wp-admin` → Produits → **Importer** → choisir le CSV → Continuer.
   Les colonnes sont reconnues automatiquement → **Lancer l'importateur**.
3. Chaque produit est relié au site par son **UGS** (SKU) : ne la modifiez pas
   (ex. `perruque-bob-straight`). Pour un nouveau produit, l'UGS peut être libre :
   il apparaîtra automatiquement sur le site (sans caractéristiques éditoriales).

Ensuite, **tout se gère dans WooCommerce** : prix, promotions (prix soldé), stock de chaque
combinaison longueur/densité/couleur, photos, nouveaux produits. Le site se met à jour seul.

Les textes éditoriaux (caractéristiques, conseils d'entretien, produits associés, badges)
restent dans `src/data/products.ts`.

## 4. Créer le code promo INAHAIR10

WooCommerce → Marketing → Codes promo → Ajouter :
code `INAHAIR10`, type « Remise en pourcentage », montant `10`,
Restrictions d'usage → Catégories de produits : _Perruques_, _Boules de tissage_.

## 5. Connecter le site et le publier

1. Dans le projet, copier `.env.example` en `.env` et renseigner :
   ```
   VITE_WOO_URL=https://www.inahair.fr/wp
   ```
2. `npm run build`, puis envoyer le **contenu** de `dist/` dans `www/` par FTP
   (sans toucher au dossier `www/wp/`). Le fichier `.htaccess` fourni laisse `/wp/` fonctionner normalement.

En mode boutique réelle :

- **Commander** ouvre la page de paiement WooCommerce avec le panier et le code promo.
- **Mon compte**, **Connexion**, **Suivi de commande** ouvrent l'espace client WooCommerce
  (`/wp/mon-compte/`) : commandes, adresses, factures.
- Si WooCommerce ne répond pas, le site reste consultable et la commande affiche un message
  « paiement momentanément indisponible » (aucune commande fictive n'est possible).

## Tester en local avant OVH (facultatif)

`npm run woo:test-server` démarre un WordPress + WooCommerce temporaire sur
`http://127.0.0.1:9400` (WordPress Playground, sans installation), importe le CSV et crée le
coupon INAHAIR10. Ensuite, créez un fichier `.env` contenant `VITE_WOO_URL=http://127.0.0.1:9400`
et lancez `npm run dev` : le site utilise alors ce WooCommerce de test. Supprimez `.env` pour
revenir au mode démonstration. Tout est effacé à l'arrêt du serveur de test.

Ce banc de test a servi à valider l'intégration avec WooCommerce 11.2 :
26 produits et 452 variantes importés sans erreur, prix et stocks identiques au catalogue,
lien de paiement avec variantes et coupon fonctionnel.

## Avant l'ouverture au public

- Remplacer les textes « démonstration » (bandeaux, pied de page, pages légales) par vos contenus.
- Mentions légales, CGV (dont l'exception au droit de rétractation pour les articles d'hygiène
  portés/déballés) et politique de confidentialité à faire valider.
- Faire une commande test en mode test Stripe/PayPal, puis passer en mode réel.
