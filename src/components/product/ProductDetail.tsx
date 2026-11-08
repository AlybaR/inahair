import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import type { OptionKey, Product, Selections } from '../../data/types';
import { formatPrice } from '../../lib/format';
import { isCombinationUnavailable } from '../../lib/pricing';
import { Modal, SmartImage } from '../ui';

// ---------- Galerie ----------
export function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [origin, setOrigin] = useState<string | null>(null);
  const images = product.images;
  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {images.length > 1 && (
        <div
          className="no-scrollbar flex gap-3 overflow-x-auto lg:w-20 lg:flex-col"
          role="list"
          aria-label="Miniatures"
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="listitem"
              onClick={() => setIndex(i)}
              aria-label={`Afficher l’image ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition ${i === index ? 'ring-berry' : 'opacity-70 ring-transparent hover:opacity-100'}`}
            >
              <SmartImage src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative flex-1">
        <div
          className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-2xl bg-powder"
          onMouseMove={onMove}
          onMouseLeave={() => setOrigin(null)}
          onClick={() => setZoomOpen(true)}
        >
          <SmartImage
            key={images[index]}
            src={images[index]}
            alt={`${product.imageAlt} — image ${index + 1} sur ${images.length}`}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-300"
            style={origin ? { transform: 'scale(1.8)', transformOrigin: origin } : undefined}
          />
        </div>
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-cocoa shadow-card hover:bg-white"
        >
          <ZoomIn className="h-4 w-4" /> Agrandir
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card hover:bg-white"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card hover:bg-white"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={`Zoom — ${product.name}`}>
        <div className="relative bg-powder">
          <img src={images[index]} alt={product.imageAlt} className="mx-auto max-h-[88vh] w-auto object-contain" />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-card"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-card"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

// ---------- Variantes ----------
export function ProductVariants({
  product,
  selections,
  onChange,
  onGuide,
}: {
  product: Product;
  selections: Selections;
  onChange: (key: OptionKey, value: string) => void;
  onGuide?: () => void;
}) {
  return (
    <div className="space-y-6">
      {product.options.map((opt) => {
        const current = opt.values.find((v) => v.value === selections[opt.key]);
        const isColor = opt.key === 'color';
        const single = opt.values.length === 1;
        return (
          <fieldset key={opt.key}>
            <legend className="mb-3 flex w-full items-center justify-between text-sm">
              <span>
                <span className="font-semibold text-cocoa">{opt.label}</span>
                <span className="text-muted"> : {current?.label}</span>
              </span>
              {opt.key === 'length' && onGuide && (
                <button
                  type="button"
                  onClick={onGuide}
                  className="text-xs font-semibold text-berry underline-offset-4 hover:underline"
                >
                  Guide des longueurs
                </button>
              )}
            </legend>
            {single && !isColor ? (
              <p className="inline-flex rounded-full bg-blush px-4 py-2 text-sm font-semibold text-cocoa">
                {opt.values[0].label}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={opt.label}>
                {opt.values.map((v) => {
                  const active = selections[opt.key] === v.value;
                  const comboBlocked = isCombinationUnavailable(product, { ...selections, [opt.key]: v.value });
                  const disabled = !!v.unavailable;
                  const delta = v.priceDelta ? ` (+${formatPrice(v.priceDelta)})` : '';
                  const title = `${v.label}${delta}${disabled ? ' — indisponible' : comboBlocked ? ' — indisponible avec vos autres choix' : ''}`;
                  if (isColor) {
                    return (
                      <button
                        key={v.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={title}
                        title={title}
                        disabled={disabled}
                        onClick={() => onChange(opt.key, v.value)}
                        className={`relative grid h-11 w-11 place-items-center rounded-full ring-2 ring-offset-2 transition ${active ? 'ring-berry' : 'ring-transparent hover:ring-line'} disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <span
                          className="h-9 w-9 rounded-full border border-black/10"
                          style={{ background: v.swatch }}
                        />
                        {(disabled || comboBlocked) && (
                          <span className="absolute h-[2px] w-10 rotate-45 bg-muted" aria-hidden />
                        )}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={v.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      title={title}
                      aria-label={title}
                      disabled={disabled}
                      onClick={() => onChange(opt.key, v.value)}
                      className={`relative min-h-[44px] min-w-[56px] rounded-xl border px-3.5 text-sm font-semibold transition ${active ? 'border-berry bg-berry text-white shadow-soft' : 'border-line bg-white text-cocoa hover:border-berry/60'} ${comboBlocked && !active ? 'text-muted line-through decoration-muted/60' : ''} disabled:cursor-not-allowed disabled:bg-blush disabled:text-muted/50 disabled:line-through`}
                    >
                      {v.label}
                      {!!v.priceDelta && !active && (
                        <span className="ml-1 text-[10px] font-medium text-muted">+{v.priceDelta} €</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
