import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import type { CatalogDefinition } from '../../data/catalog';
import { COLOR_FAMILIES, type Filters } from '../../lib/catalog';
import { formatPrice } from '../../lib/format';

export interface FacetData {
  categories: Array<{ value: string; label: string }>;
  types: string[];
  textures: string[];
  lengths: string[];
  colors: string[];
  maxPrice: number;
}

type ListKey = 'category' | 'type' | 'texture' | 'length' | 'color';

interface Props {
  facets: CatalogDefinition['facets'];
  data: FacetData;
  filters: Filters;
  onToggle: (key: ListKey, value: string) => void;
  onPrice: (min?: number, max?: number) => void;
  onBool: (key: 'stock' | 'promo', value: boolean) => void;
  onReset: () => void;
  activeCount: number;
}

function Group({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-bold text-cocoa"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-cocoa hover:text-berry">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition peer-focus-visible:ring-2 peer-focus-visible:ring-berry ${checked ? 'border-berry bg-berry text-white' : 'border-line bg-white'}`}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      {children}
    </label>
  );
}

export function ProductFilters({ facets, data, filters, onToggle, onPrice, onBool, onReset, activeCount }: Props) {
  const [min, setMin] = useState(filters.min?.toString() ?? '');
  const [max, setMax] = useState(filters.max?.toString() ?? '');
  useEffect(() => {
    setMin(filters.min?.toString() ?? '');
    setMax(filters.max?.toString() ?? '');
  }, [filters.min, filters.max]);

  const submitPrice = (e?: React.FormEvent) => {
    e?.preventDefault();
    const a = min ? Math.max(0, Number(min)) : undefined;
    const b = max ? Math.max(0, Number(max)) : undefined;
    if (a != null && b != null && a > b) onPrice(b, a);
    else onPrice(a, b);
  };

  const presets = [
    { label: 'Moins de 60 €', min: undefined, max: 60 },
    { label: '60 – 140 €', min: 60, max: 140 },
    { label: 'Plus de 140 €', min: 140, max: undefined },
  ];

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa">Filtrer</p>
        {activeCount > 0 && (
          <button type="button" onClick={onReset} className="text-xs font-semibold text-berry hover:underline">
            Réinitialiser ({activeCount})
          </button>
        )}
      </div>

      {facets.includes('category') && data.categories.length > 1 && (
        <Group title="Catégorie">
          {data.categories.map((c) => (
            <CheckRow
              key={c.value}
              checked={filters.category.includes(c.value)}
              onChange={() => onToggle('category', c.value)}
            >
              {c.label}
            </CheckRow>
          ))}
        </Group>
      )}

      {facets.includes('type') && data.types.length > 1 && (
        <Group title="Type">
          {data.types.map((t) => (
            <CheckRow key={t} checked={filters.type.includes(t)} onChange={() => onToggle('type', t)}>
              {t}
            </CheckRow>
          ))}
        </Group>
      )}

      {facets.includes('texture') && data.textures.length > 0 && (
        <Group title="Texture">
          {data.textures.map((t) => (
            <CheckRow key={t} checked={filters.texture.includes(t)} onChange={() => onToggle('texture', t)}>
              {t}
            </CheckRow>
          ))}
        </Group>
      )}

      {facets.includes('price') && (
        <Group title="Prix">
          <form onSubmit={submitPrice} className="space-y-3">
            <div className="flex items-end gap-2">
              <label className="flex-1 text-xs text-muted">
                Min (€)
                <input
                  type="number"
                  min={0}
                  step={5}
                  inputMode="numeric"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  placeholder="0"
                  className="input mt-1 !px-3 !py-2"
                />
              </label>
              <label className="flex-1 text-xs text-muted">
                Max (€)
                <input
                  type="number"
                  min={0}
                  step={5}
                  inputMode="numeric"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  placeholder={String(data.maxPrice)}
                  className="input mt-1 !px-3 !py-2"
                />
              </label>
            </div>
            <button type="submit" className="btn-outline !min-h-[38px] w-full !py-2 text-xs">
              Appliquer le prix
            </button>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => {
                const active = filters.min === p.min && filters.max === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onPrice(active ? undefined : p.min, active ? undefined : p.max)}
                    className={`chip ${active ? '!border-berry !bg-berry !text-white' : ''}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted">Jusqu’à {formatPrice(data.maxPrice)} dans cette sélection.</p>
          </form>
        </Group>
      )}

      {facets.includes('length') && data.lengths.length > 0 && (
        <Group title="Longueur (pouces)">
          <div className="flex flex-wrap gap-2">
            {data.lengths.map((l) => {
              const active = filters.length.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggle('length', l)}
                  className={`h-10 min-w-[48px] rounded-xl border px-2 text-sm font-semibold transition ${active ? 'border-berry bg-berry text-white' : 'border-line bg-white hover:border-berry/60'}`}
                >
                  {l}"
                </button>
              );
            })}
          </div>
        </Group>
      )}

      {facets.includes('color') && data.colors.length > 1 && (
        <Group title="Couleur">
          {data.colors.map((c) => (
            <CheckRow key={c} checked={filters.color.includes(c)} onChange={() => onToggle('color', c)}>
              <span
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ background: COLOR_FAMILIES[c].swatch }}
              />
              {COLOR_FAMILIES[c].label}
            </CheckRow>
          ))}
        </Group>
      )}

      {(facets.includes('stock') || facets.includes('promo')) && (
        <Group title="Disponibilité & offres">
          {facets.includes('stock') && (
            <CheckRow checked={filters.stock} onChange={() => onBool('stock', !filters.stock)}>
              En stock uniquement
            </CheckRow>
          )}
          {facets.includes('promo') && (
            <CheckRow checked={filters.promo} onChange={() => onBool('promo', !filters.promo)}>
              En promotion
            </CheckRow>
          )}
        </Group>
      )}
    </div>
  );
}
