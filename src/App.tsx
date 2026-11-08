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
import { AccountProvider } from './store/account';
import { CartProvider } from './store/cart';
import { UIProvider } from './store/ui';
import { WishlistProvider } from './store/wishlist';

// MemoryRouter pour la prévisualisation hébergée (fichier unique), BrowserRouter sinon.
const Router = __PREVIEW_MODE__ ? MemoryRouter : BrowserRouter;

export default function App() {
  return (
    <Router>
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
                  <Route path="commande" element={<Checkout />} />
                  <Route path="commande/confirmation" element={<ConfirmationPage />} />
                  <Route path="connexion" element={<LoginPage />} />
                  <Route path="inscription" element={<RegisterPage />} />
                  <Route path="compte" element={<AccountPage />} />
                  <Route path="compte/commandes" element={<AccountOrdersPage />} />
                  <Route path="a-propos" element={<AboutPage />} />
                  <Route path="livraison-retours" element={<ShippingPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="suivi-commande" element={<TrackingPage />} />
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
