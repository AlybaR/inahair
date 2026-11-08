import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CartDrawer } from '../cart/CartParts';
import { ToastViewport } from '../ui';
import { Footer } from './Footer';
import { AnnouncementBar, Header } from './Header';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <button
        type="button"
        onClick={() => document.getElementById('contenu')?.focus()}
        className="sr-only z-[90] rounded-full bg-berry px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Aller au contenu
      </button>
      <ScrollManager />
      <AnnouncementBar />
      <Header />
      <main id="contenu" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ToastViewport />
    </div>
  );
}
