import { ArrowLeft, Heart, Lock, SearchX, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CartLineItem, FreeShippingProgress, PromoCodeForm } from '../components/cart/CartParts';
import { PriceTag, ProductGrid } from '../components/product/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { Breadcrumb, EmptyState, SelectField, SmartImage, useDocumentTitle } from '../components/ui';
import { siteConfig } from '../config/site';
import { categoryLabels } from '../data/catalog';
import { getProductById, products } from '../data/products';
import type { Product } from '../data/types';
import { searchProducts, sortOptions, sortProducts, type SortKey } from '../lib/catalog';
import { formatPrice, pluralize } from '../lib/format';
import { defaultSelections, getFromPrice, getZone } from '../lib/pricing';
import { useCart } from '../store/cart';
import { useUI } from '../store/ui';
import { useWishlist } from '../store/wishlist';

// =================== RECHERCHE ===================
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const sort = (sortOptions.some((s) => s.value === params.get('tri')) ? params.get('tri') : 'pertinence') as SortKey;
  useDocumentTitle(q ? `Recherche « ${q} »` : 'Recherche');
  const { results, relevance } = useMemo(() => searchProducts(q), [q]);
  const sorted = useMemo(() => sortProducts(results, sort, relevance), [results, sort, relevance]);
  const suggestions = useMemo(() => [...products].sort((a, b) => a.salesRank - b.salesRank).slice(0, 4), []);

  return (
    <div className="container-site py-10">
      <Breadcrumb items={[{ label: 'Recherche' }]} />
      <h1 className="mt-6 font-serif text-4xl text-cocoa">
        {q ? <>Résultats pour « {q} »</> : 'Rechercher un produit'}
      </h1>
      <div className="mt-6 max-w-2xl">
        <SearchBar key={q} initial={q} />
      </div>

      {q && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <p className="text-sm text-muted" aria-live="polite">
            <span className="font-bold text-cocoa">{pluralize(sorted.length, 'résultat', 'résultats')}</span>
          </p>
          {sorted.length > 1 && (
            <>
              <label htmlFor="search-sort" className="sr-only">
                Trier par
              </label>
              <select
                id="search-sort"
                value={sort}
                onChange={(e) => {
                  const next = new URLSearchParams(params);
                  if (e.target.value === 'pertinence') next.delete('tri');
                  else next.set('tri', e.target.value);
                  setParams(next, { replace: true });
                }}
                className="input !w-auto !rounded-full !py-2.5 !pr-9 text-sm font-semibold"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    Trier : {o.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      <div className="mt-8">
        {q && sorted.length > 0 && <ProductGrid products={sorted} />}
        {q && sorted.length === 0 && (
          <>
            <EmptyState
              icon={<SearchX className="h-8 w-8" />}
              title="Aucun résultat"
              text={`Nous n’avons trouvé aucun produit pour « ${q} ». Vérifiez l’orthographe ou essayez une texture : body wave, curly, straight…`}
            >
              <Link to="/boutique" className="btn-primary">
                Voir toute la boutique
              </Link>
            </EmptyState>
            <h2 className="section-title mb-8 text-center">Nos meilleures ventes</h2>
            <ProductGrid products={suggestions} />
          </>
        )}
      </div>
    </div>
  );
}

// =================== FAVORIS ===================
export function WishlistPage() {
  useDocumentTitle('Mes favoris');
  const { ids, remove } = useWishlist();
  const { addItem } = useCart();
  const { notify, openCart } = useUI();
  const items = ids.map(getProductById).filter((p): p is Product => !!p);

  const quickAdd = (p: Product) => {
    const res = addItem(p.id, defaultSelections(p), 1);
    notify({ message: res.ok ? `${p.name} ajouté au panier` : res.message, tone: res.ok ? 'success' : 'error' });
    if (res.ok) openCart();
  };

  return (
    <div className="container-site py-10">
      <Breadcrumb items={[{ label: 'Mes favoris' }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl text-cocoa">Mes favoris</h1>
        {items.length > 0 && (
          <p className="text-sm text-muted">{pluralize(items.length, 'article enregistré', 'articles enregistrés')}</p>
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="Aucun favori pour le moment"
          text="Touchez le cœur d’un produit pour le retrouver ici, même après avoir fermé la page."
        >
          <Link to="/boutique" className="btn-primary">
            Découvrir la boutique
          </Link>
        </EmptyState>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {items.map((p) => {
            const { price, regular } = getFromPrice(p);
            const needsChoice = p.options.some((o) => o.values.length > 1);
            return (
              <li key={p.id} className="card flex gap-4 p-4">
                <Link to={`/produit/${p.slug}`} className="shrink-0 overflow-hidden rounded-xl">
                  <SmartImage src={p.images[0]} alt={p.imageAlt} className="h-36 w-28 object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {categoryLabels[p.category]}
                  </p>
                  <Link to={`/produit/${p.slug}`} className="mt-1 font-semibold text-cocoa hover:text-berry">
                    {p.name}
                  </Link>
                  <div className="mt-2">
                    <PriceTag price={price} regular={regular} />
                  </div>
                  {p.stock === 'out_of_stock' && (
                    <p className="mt-1 text-xs font-semibold text-muted">Épuisé temporairement</p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2 pt-3">
                    {needsChoice || p.stock === 'out_of_stock' ? (
                      <Link to={`/produit/${p.slug}`} className="btn-primary !min-h-[38px] !px-4 !py-2 text-xs">
                        Choisir mes options
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => quickAdd(p)}
                        className="btn-primary !min-h-[38px] !px-4 !py-2 text-xs"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> Ajouter au panier
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        remove(p.id);
                        notify({ message: `${p.name} retiré des favoris`, tone: 'info' });
                      }}
                      className="btn-ghost !min-h-[38px] !px-3 !py-2 text-xs text-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Retirer
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// =================== PANIER ===================
export function CartPage() {
  useDocumentTitle('Mon panier');
  const { totals, country, setCountry, clearCart } = useCart();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
  const zone = getZone(country);
  const standard = siteConfig.shippingMethods.find((m) => m.id === 'standard')!;

  if (!totals.lines.length) {
    return (
      <div className="container-site py-10">
        <Breadcrumb items={[{ label: 'Panier' }]} />
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Votre panier est vide"
          text="Parcourez nos collections et ajoutez vos coups de cœur : votre panier est conservé même si vous fermez la page."
        >
          <Link to="/boutique" className="btn-primary">
            Découvrir la boutique
          </Link>
          <Link to="/favoris" className="btn-outline">
            Voir mes favoris
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container-site py-10">
      <Breadcrumb items={[{ label: 'Panier' }]} />
      <h1 className="mt-6 font-serif text-4xl text-cocoa">
        Mon panier <span className="text-xl text-muted">({totals.itemCount})</span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <div className="hidden grid-cols-[1fr_auto] border-b border-line pb-3 text-xs font-bold uppercase tracking-wider text-muted sm:grid">
            <span>Article</span>
            <span>Total</span>
          </div>
          <div className="divide-y divide-line">
            {totals.lines.map((l) => (
              <CartLineItem key={l.line.lineId} item={l} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 text-sm font-semibold text-berry hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Continuer mes achats
            </Link>
            {confirmClear ? (
              <span className="flex items-center gap-2 text-sm">
                Vider le panier ?
                <button
                  type="button"
                  className="font-semibold text-berry hover:underline"
                  onClick={() => {
                    clearCart();
                    setConfirmClear(false);
                  }}
                >
                  Oui, vider
                </button>
                <button type="button" className="text-muted hover:underline" onClick={() => setConfirmClear(false)}>
                  Annuler
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="text-sm text-muted hover:text-berry"
              >
                Vider le panier
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Récapitulatif">
          <div className="card space-y-5 p-6">
            <h2 className="font-serif text-2xl text-cocoa">Récapitulatif</h2>
            <FreeShippingProgress amount={totals.subtotal - totals.discount} />
            <PromoCodeForm />
            <SelectField
              label="Pays de livraison (estimation)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {siteConfig.countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <dl className="space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Sous-total</dt>
                <dd className="font-semibold">{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-berry">
                  <dt>Réduction code promo</dt>
                  <dd className="font-semibold">-{formatPrice(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">
                  Livraison estimée <span className="block text-xs">Standard · {standard.delay[zone]}</span>
                </dt>
                <dd className="font-semibold">{totals.shipping === 0 ? 'Offerte' : formatPrice(totals.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-serif text-2xl text-berry">{formatPrice(totals.total)}</dd>
              </div>
            </dl>
            <button type="button" onClick={() => navigate('/commande')} className="btn-primary w-full">
              <Lock className="h-4 w-4" /> Passer commande
            </button>
            <p className="text-center text-xs text-muted">Paiement simulé : aucun montant ne sera débité.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
