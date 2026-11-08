import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { mainNav, type NavItem } from '../../data/catalog';
import { useAccount } from '../../store/account';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { useWishlist } from '../../store/wishlist';
import { SearchBar } from '../SearchBar';
import { Drawer, Logo, SmartImage } from '../ui';

export function AnnouncementBar() {
  const items = siteConfig.announcements;
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % items.length), 4000);
    return () => window.clearInterval(t);
  }, [items.length]);
  return (
    <div className="bg-berry text-white">
      <div className="container-site flex h-9 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.18em]">
        <ul className="hidden items-center gap-6 md:flex">
          {items.map((t, idx) => (
            <li key={t} className="flex items-center gap-6">
              {idx > 0 && <span className="h-1 w-1 rounded-full bg-white/50" aria-hidden />}
              {t}
            </li>
          ))}
        </ul>
        <p className="md:hidden" aria-live="off">
          {items[i]}
        </p>
      </div>
    </div>
  );
}

function CountBadge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-berry px-1 text-[10px] font-bold text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}

function MegaMenu({ item, onClose }: { item: NavItem; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-x-0 top-full border-t border-line bg-cream shadow-soft"
    >
      <div className="container-site grid grid-cols-12 gap-8 py-8">
        {item.columns?.map((col) => (
          <div key={col.title} className="col-span-3">
            <p className="eyebrow mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} onClick={onClose} className="text-sm text-cocoa hover:text-berry">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {item.feature && (
          <Link
            to={item.feature.to}
            onClick={onClose}
            className="group col-span-5 col-start-8 flex overflow-hidden rounded-2xl bg-powder"
          >
            <SmartImage
              src={item.feature.image}
              alt=""
              className="h-40 w-40 object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="flex flex-col justify-center p-6">
              <p className="font-serif text-xl text-cocoa">{item.feature.title}</p>
              <p className="mt-1 text-sm font-semibold text-berry">{item.feature.text} →</p>
            </div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export function Header() {
  const { totals } = useCart();
  const { ids } = useWishlist();
  const { isLoggedIn, user } = useAccount();
  const { openCart, menuOpen, setMenuOpen, searchOpen, setSearchOpen } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();
  const closeTimer = useRef<number>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search, setMenuOpen, setSearchOpen]);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openMenu]);

  const enter = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 120);
  };

  const iconBtn =
    'relative grid h-11 w-11 place-items-center rounded-full text-cocoa transition hover:bg-blush hover:text-berry';
  const activeItem = mainNav.find((n) => n.label === openMenu);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-cream/95 backdrop-blur transition-shadow duration-300 ${scrolled ? 'shadow-card' : ''}`}
        onMouseLeave={leave}
      >
        <div
          className={`container-site flex items-center gap-4 transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}
        >
          <div className="flex flex-1 items-center gap-1 lg:hidden">
            <button
              type="button"
              className={iconBtn}
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={iconBtn}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <Link to="/" className="shrink-0" aria-label="Inahair — accueil">
            <Logo />
          </Link>

          <nav className="hidden flex-1 justify-center lg:flex" aria-label="Navigation principale">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.label} onMouseEnter={() => (item.columns ? enter(item.label) : setOpenMenu(null))}>
                  <div className="flex items-center">
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `relative rounded-full px-3.5 py-2 text-[14px] font-semibold transition hover:text-berry ${isActive ? 'text-berry' : 'text-cocoa'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {item.label}
                          {isActive && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded bg-berry" />}
                        </>
                      )}
                    </NavLink>
                    {item.columns && (
                      <button
                        type="button"
                        className="-ml-2 grid h-8 w-6 place-items-center text-muted hover:text-berry"
                        aria-label={`Afficher le sous-menu ${item.label}`}
                        aria-expanded={openMenu === item.label}
                        onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition ${openMenu === item.label ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-0.5 lg:flex-none">
            <button
              type="button"
              className={`${iconBtn} hidden lg:grid`}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to={isLoggedIn ? '/compte' : '/connexion'}
              className={`${iconBtn} hidden sm:grid`}
              aria-label={isLoggedIn ? `Mon compte (${user?.firstName})` : 'Se connecter'}
            >
              <User className="h-5 w-5" />
              {isLoggedIn && (
                <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-cream" />
              )}
            </Link>
            <Link to="/favoris" className={iconBtn} aria-label={`Favoris (${ids.length})`}>
              <Heart className="h-5 w-5" />
              <CountBadge n={ids.length} />
            </Link>
            <button
              type="button"
              className={iconBtn}
              onClick={openCart}
              aria-label={`Panier (${totals.itemCount} article${totals.itemCount > 1 ? 's' : ''})`}
            >
              <ShoppingBag className="h-5 w-5" />
              <CountBadge n={totals.itemCount} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeItem && (
            <div onMouseEnter={() => enter(activeItem.label)}>
              <MegaMenu item={activeItem} onClose={() => setOpenMenu(null)} />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-line bg-cream"
            >
              <div className="container-site flex items-start gap-3 py-5">
                <div className="mx-auto w-full max-w-2xl">
                  <SearchBar autoFocus onDone={() => setSearchOpen(false)} />
                </div>
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => setSearchOpen(false)}
                  aria-label="Fermer la recherche"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu />
    </>
  );
}

function MobileMenu() {
  const { menuOpen, setMenuOpen } = useUI();
  const { isLoggedIn, user } = useAccount();
  const [expanded, setExpanded] = useState<string | null>(null);
  const close = () => setMenuOpen(false);

  return (
    <Drawer open={menuOpen} onClose={close} side="left" title="Menu" widthClass="max-w-[360px]">
      <div className="px-5 py-4">
        <SearchBar onDone={close} />
      </div>
      <nav aria-label="Navigation mobile">
        <ul className="border-t border-line">
          {mainNav.map((item) => (
            <li key={item.label} className="border-b border-line">
              <div className="flex items-center">
                <Link to={item.to} onClick={close} className="flex-1 px-5 py-4 text-[15px] font-semibold text-cocoa">
                  {item.label}
                </Link>
                {item.columns && (
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                    className="grid h-14 w-14 place-items-center text-muted"
                    aria-expanded={expanded === item.label}
                    aria-label={`Sous-menu ${item.label}`}
                  >
                    <ChevronDown className={`h-4 w-4 transition ${expanded === item.label ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {item.columns && expanded === item.label && (
                <div className="bg-blush px-5 pb-4 pt-1">
                  {item.columns.map((col) => (
                    <div key={col.title} className="mt-3">
                      <p className="eyebrow mb-2">{col.title}</p>
                      <ul className="grid grid-cols-2 gap-x-3">
                        {col.links.map((l) => (
                          <li key={l.label}>
                            <Link to={l.to} onClick={close} className="block py-2 text-sm text-cocoa">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-1 px-5 py-6 text-sm">
        <Link
          to={isLoggedIn ? '/compte' : '/connexion'}
          onClick={close}
          className="flex items-center gap-3 py-2.5 font-semibold text-cocoa"
        >
          <User className="h-4 w-4 text-berry" />{' '}
          {isLoggedIn ? `Mon compte (${user?.firstName})` : 'Se connecter / Créer un compte'}
        </Link>
        <Link to="/favoris" onClick={close} className="flex items-center gap-3 py-2.5 font-semibold text-cocoa">
          <Heart className="h-4 w-4 text-berry" /> Mes favoris
        </Link>
        <Link to="/guide-cheveux" onClick={close} className="block py-2.5 text-muted">
          Guide capillaire
        </Link>
        <Link to="/suivi-commande" onClick={close} className="block py-2.5 text-muted">
          Suivre une commande
        </Link>
        <Link to="/faq" onClick={close} className="block py-2.5 text-muted">
          Questions fréquentes
        </Link>
        <Link to="/contact" onClick={close} className="block py-2.5 text-muted">
          Contact
        </Link>
      </div>
    </Drawer>
  );
}
