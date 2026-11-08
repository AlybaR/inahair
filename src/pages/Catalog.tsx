import { SlidersHorizontal, SearchX, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductCard';
import { ProductFilters } from '../components/product/ProductFilters';
import { Breadcrumb, Drawer, EmptyState, SmartImage, useDocumentTitle } from '../components/ui';
import { catalogs, categoryLabels, type CatalogDefinition } from '../data/catalog';
import {
  applyFilters,
  COLOR_FAMILIES,
  countActiveFilters,
  facetValues,
  filtersFromParams,
  paramNames,
  productsForCatalog,
  sortOptions,
  sortProducts,
  type Filters,
  type SortKey,
} from '../lib/catalog';
import { formatPrice, pluralize } from '../lib/format';

const PAGE_SIZE = 12;
type ListKey = 'category' | 'type' | 'texture' | 'length' | 'color';

export default function Catalog({ id }: { id: CatalogDefinition['id'] }) {
  const def = catalogs[id];
  useDocumentTitle(def.title, def.description);
  const [params, setParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const base = useMemo(() => productsForCatalog(id), [id]);
  const facets = useMemo(() => facetValues(base), [base]);
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const sort = (sortOptions.some((s) => s.value === params.get('tri')) ? params.get('tri') : 'pertinence') as SortKey;
  const results = useMemo(() => sortProducts(applyFilters(base, filters), sort), [base, filters, sort]);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [params, id]);

  const update = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next, { replace: true });
  };

  const onToggle = (key: ListKey, value: string) =>
    update((p) => {
      const name = paramNames[key];
      const current = (filters[key] as string[]) ?? [];
      const nextList = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (nextList.length) p.set(name, nextList.join(','));
      else p.delete(name);
    });

  const onPrice = (min?: number, max?: number) =>
    update((p) => {
      if (min != null) p.set('min', String(min));
      else p.delete('min');
      if (max != null) p.set('max', String(max));
      else p.delete('max');
    });

  const onBool = (key: 'stock' | 'promo', v: boolean) =>
    update((p) => (v ? p.set(paramNames[key], '1') : p.delete(paramNames[key])));

  const onReset = () => update((p) => Object.values(paramNames).forEach((n) => p.delete(n)));

  const chips = buildChips(filters);
  const filterPanel = (
    <ProductFilters
      facets={def.facets}
      data={facets}
      filters={filters}
      onToggle={onToggle}
      onPrice={onPrice}
      onBool={onBool}
      onReset={onReset}
      activeCount={activeCount}
    />
  );

  return (
    <>
      {/* Bannière */}
      <section className="relative overflow-hidden bg-powder">
        <div className="container-site grid items-center gap-6 py-8 md:grid-cols-[1.2fr_1fr] md:py-0">
          <div className="md:py-14">
            <Breadcrumb items={[{ label: def.title }]} />
            <p className="eyebrow mt-6">{def.eyebrow}</p>
            <h1 className="mt-2 font-serif text-4xl text-cocoa sm:text-5xl">{def.title}</h1>
            <p className="mt-4 max-w-xl text-muted">{def.description}</p>
          </div>
          <div className="relative hidden h-full min-h-[260px] md:block">
            <div className="absolute inset-y-6 right-0 w-full overflow-hidden rounded-b-3xl rounded-t-[999px] lg:w-[80%]">
              <SmartImage
                src={def.image}
                alt=""
                loading="eager"
                className="h-full w-full object-cover"
                style={{ objectPosition: def.imagePosition ?? 'center' }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-site py-10">
        {/* Barre d'outils */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <p className="text-sm text-muted" aria-live="polite">
            <span className="font-bold text-cocoa">{pluralize(results.length, 'produit', 'produits')}</span>
            {activeCount > 0 && ` sur ${base.length}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="btn-outline !min-h-[42px] !py-2 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filtres{' '}
              {activeCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-berry px-1 text-[10px] text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <label htmlFor="sort" className="sr-only">
              Trier par
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) =>
                update((p) => (e.target.value === 'pertinence' ? p.delete('tri') : p.set('tri', e.target.value)))
              }
              className="input !w-auto !rounded-full !py-2.5 !pr-9 text-sm font-semibold"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  Trier : {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key + c.value}
                type="button"
                className="chip !border-berry/30 !bg-blush"
                onClick={() => {
                  if (c.key === 'min' || c.key === 'max')
                    onPrice(c.key === 'min' ? undefined : filters.min, c.key === 'max' ? undefined : filters.max);
                  else if (c.key === 'stock' || c.key === 'promo') onBool(c.key, false);
                  else onToggle(c.key as ListKey, c.value);
                }}
                aria-label={`Retirer le filtre ${c.label}`}
              >
                {c.label} <X className="h-3 w-3" />
              </button>
            ))}
            <button type="button" onClick={onReset} className="ml-1 text-xs font-semibold text-berry hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block" aria-label="Filtres">
            <div className="sticky top-24">{filterPanel}</div>
          </aside>

          <div>
            {results.length ? (
              <>
                <ProductGrid products={results.slice(0, visible)} cols={3} />
                {visible < results.length && (
                  <div className="mt-12 flex flex-col items-center gap-3">
                    <p className="text-xs text-muted">
                      {visible} produits affichés sur {results.length}
                    </p>
                    <div className="h-1 w-48 overflow-hidden rounded-full bg-powder">
                      <div className="h-full bg-berry" style={{ width: `${(visible / results.length) * 100}%` }} />
                    </div>
                    <button
                      type="button"
                      className="btn-outline mt-2 px-10"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    >
                      Voir plus
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<SearchX className="h-8 w-8" />}
                title="Aucun produit ne correspond"
                text="Essayez d’assouplir vos critères ou de réinitialiser les filtres pour voir toute la sélection."
              >
                <button type="button" onClick={onReset} className="btn-primary">
                  Réinitialiser les filtres
                </button>
                <Link to="/boutique" className="btn-outline">
                  Voir toute la boutique
                </Link>
              </EmptyState>
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        title="Filtres"
        widthClass="max-w-[380px]"
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-outline flex-1" onClick={onReset} disabled={!activeCount}>
              Réinitialiser
            </button>
            <button type="button" className="btn-primary flex-1" onClick={() => setMobileOpen(false)}>
              Voir {results.length} résultat{results.length > 1 ? 's' : ''}
            </button>
          </div>
        }
      >
        <div className="px-5 pb-6 pt-2">{filterPanel}</div>
      </Drawer>
    </>
  );
}

function buildChips(f: Filters) {
  const chips: Array<{ key: string; value: string; label: string }> = [];
  f.category.forEach((v) =>
    chips.push({ key: 'category', value: v, label: categoryLabels[v as keyof typeof categoryLabels] ?? v }),
  );
  f.type.forEach((v) => chips.push({ key: 'type', value: v, label: v }));
  f.texture.forEach((v) => chips.push({ key: 'texture', value: v, label: v }));
  f.length.forEach((v) => chips.push({ key: 'length', value: v, label: `${v}"` }));
  f.color.forEach((v) => chips.push({ key: 'color', value: v, label: COLOR_FAMILIES[v]?.label ?? v }));
  if (f.min != null) chips.push({ key: 'min', value: '', label: `Min ${formatPrice(f.min)}` });
  if (f.max != null) chips.push({ key: 'max', value: '', label: `Max ${formatPrice(f.max)}` });
  if (f.stock) chips.push({ key: 'stock', value: '', label: 'En stock' });
  if (f.promo) chips.push({ key: 'promo', value: '', label: 'En promotion' });
  return chips;
}
