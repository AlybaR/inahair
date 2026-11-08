import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Catalog from './pages/Catalog';
import { AccountOrdersPage, AccountPage, LoginPage, RegisterPage } from './pages/Account';
import Checkout, { ConfirmationPage } from './pages/Checkout';
import { AboutPage, ContactPage, FaqPage, LegalPage, ShippingPage, TrackingPage } from './pages/Info';
import { CartPage, SearchPage, WishlistPage } from './pages/Shop';
import Guide from './pages/Guide';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProductPage from './pages/ProductPage';
import { ExternalRedirect, WooCheckout } from './pages/WooRedirects';
import { isWooConfigured, wooAccountUrl } from './lib/woocommerce';
import { AccountProvider } from './store/account';
import { CartProvider } from './store/cart';
import { UIProvider } from './store/ui';
import { WishlistProvider } from './store/wishlist';

// MemoryRouter pour la prévisualisation hébergée (fichier unique), BrowserRouter sinon.
const Router = __PREVIEW_MODE__ ? MemoryRouter : BrowserRouter;
// Sous-dossier éventuel (ex. GitHub Pages : /inahair), défini par BASE_PATH au build.
const basename = __PREVIEW_MODE__ ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export default function App() {
  // Boutique réelle (WooCommerce) : paiement et espace client sont gérés par WooCommerce.
  const woo = isWooConfigured();
  const account = <ExternalRedirect to={wooAccountUrl()} title="Votre espace client" />;
  return (
    <Router basename={basename}>
      <UIProvider>
        <AccountProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="boutique" element={<Catalog id="boutique" />} />
                  <Route path="perruques" element={<Catalog id="perruques" />} />
                  <Route path="tissages" element={<Catalog id="tissages" />} />
                  <Route path="accessoires" element={<Catalog id="accessoires" />} />
                  <Route path="promotions" element={<Catalog id="promotions" />} />
                  <Route path="nouveautes" element={<Catalog id="nouveautes" />} />
                  <Route path="produit/:slug" element={<ProductPage />} />
                  <Route path="guide-cheveux" element={<Guide />} />
                  <Route path="recherche" element={<SearchPage />} />
                  <Route path="favoris" element={<WishlistPage />} />
                  <Route path="panier" element={<CartPage />} />
                  <Route path="commande" element={woo ? <WooCheckout /> : <Checkout />} />
                  <Route path="commande/confirmation" element={woo ? account : <ConfirmationPage />} />
                  <Route path="connexion" element={woo ? account : <LoginPage />} />
                  <Route path="inscription" element={woo ? account : <RegisterPage />} />
                  <Route path="compte" element={woo ? account : <AccountPage />} />
                  <Route path="compte/commandes" element={woo ? account : <AccountOrdersPage />} />
                  <Route path="a-propos" element={<AboutPage />} />
                  <Route path="livraison-retours" element={<ShippingPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="suivi-commande" element={woo ? account : <TrackingPage />} />
                  <Route path="mentions-legales" element={<LegalPage page="mentions-legales" />} />
                  <Route path="confidentialite" element={<LegalPage page="confidentialite" />} />
                  <Route path="cgv" element={<LegalPage page="cgv" />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </AccountProvider>
      </UIProvider>
    </Router>
  );
}
