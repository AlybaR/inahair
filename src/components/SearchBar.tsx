import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryLabels } from '../data/catalog';
import { searchProducts } from '../lib/catalog';
import { formatPrice } from '../lib/format';
import { getFromPrice } from '../lib/pricing';
import { SmartImage } from './ui';

const POPULAR = ['Body Wave', 'Curly', 'Bob', 'Glueless', 'Straight', 'Pince'];

/** Barre de recherche avec suggestions en direct (clavier + souris). */
export function SearchBar({
  autoFocus = false,
  onDone,
  initial = '',
}: {
  autoFocus?: boolean;
  onDone?: () => void;
  initial?: string;
}) {
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const suggestions = useMemo(() => (q.trim().length >= 2 ? searchProducts(q).results.slice(0, 6) : []), [q]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const goSearch = (term = q) => {
    const t = term.trim();
    if (!t) return;
    setOpen(false);
    navigate(`/recherche?q=${encodeURIComponent(t)}`);
    onDone?.();
  };

  const goProduct = (slug: string) => {
    setOpen(false);
    navigate(`/produit/${slug}`);
    onDone?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(suggestions.length, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && active < suggestions.length) goProduct(suggestions[active].slug);
      else goSearch();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          goSearch();
        }}
        className="relative"
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Rechercher un produit
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          value={q}
          autoComplete="off"
          placeholder="Rechercher une perruque, une texture…"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-24 text-sm text-cocoa placeholder:text-muted/70 focus:border-berry focus:outline-none focus:ring-2 focus:ring-berry/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setActive(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-14 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-blush hover:text-cocoa"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 grid h-9 w-11 -translate-y-1/2 place-items-center rounded-full bg-berry text-white hover:bg-berry-dark"
          aria-label="Lancer la recherche"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {!q && open && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">Recherches populaires :</span>
          {POPULAR.map((p) => (
            <button key={p} type="button" className="chip" onClick={() => goSearch(p)}>
              {p}
            </button>
          ))}
        </div>
      )}

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-line">
          {suggestions.length ? (
            <ul id={listId} role="listbox" aria-label="Suggestions">
              {suggestions.map((p, i) => (
                <li key={p.id} id={`${listId}-opt-${i}`} role="option" aria-selected={active === i}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => goProduct(p.slug)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${active === i ? 'bg-blush' : ''}`}
                  >
                    <SmartImage src={p.images[0]} alt="" className="h-12 w-10 shrink-0 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-cocoa">{p.name}</span>
                      <span className="text-xs text-muted">
                        {categoryLabels[p.category]}
                        {p.texture ? ` · ${p.texture}` : ''}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-berry">{formatPrice(getFromPrice(p).price)}</span>
                  </button>
                </li>
              ))}
              <li
                role="option"
                aria-selected={active === suggestions.length}
                id={`${listId}-opt-${suggestions.length}`}
              >
                <button
                  type="button"
                  onClick={() => goSearch()}
                  className={`flex w-full items-center justify-between border-t border-line px-4 py-3 text-sm font-semibold text-berry ${active === suggestions.length ? 'bg-blush' : ''}`}
                >
                  Voir tous les résultats pour « {q.trim()} »
                  <ArrowRight className="h-4 w-4" />
                </button>
              </li>
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">
              Aucun produit ne correspond à « {q.trim()} ». Essayez « body wave », « curly » ou « bob ».
            </p>
          )}
        </div>
      )}
    </div>
  );
}
