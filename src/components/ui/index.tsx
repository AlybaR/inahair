import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, ChevronRight, Info, Minus, Plus, Star, X, AlertCircle } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ImgHTMLAttributes,
} from 'react';
import { Link } from 'react-router-dom';
import { FALLBACK_IMAGE } from '../../lib/assets';
import { useUI } from '../../store/ui';

// ---------- Logo ----------
export function Logo({ className = '', light = false }: { className?: string; light?: boolean }) {
  const color = light ? '#FFF0F3' : '#A7194A';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Inahair">
      <svg viewBox="0 0 32 40" className="h-8 w-auto" aria-hidden="true">
        <path
          d="M10 36c1-11 3.2-20 6-25 2.8 5 5 14 6 25"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M13.5 36c.8-8 2-14 2.5-17"
          fill="none"
          stroke={light ? '#F8E4E9' : '#CF4774'}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M18.5 36c-.4-5-1-9-1.6-12"
          fill="none"
          stroke={light ? '#F8E4E9' : '#CF4774'}
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity=".8"
        />
        <circle cx="16" cy="6.5" r="2.2" fill={color} />
      </svg>
      <span className="font-serif text-[1.65rem] font-semibold leading-none tracking-tight" style={{ color }}>
        Ina<span className="font-medium italic">hair</span>
      </span>
    </span>
  );
}

// ---------- Image avec repli ----------
export function SmartImage({ src, alt, className = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      {...rest}
      src={failed || !src ? FALLBACK_IMAGE : src}
      alt={alt}
      loading={rest.loading ?? 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} bg-powder`}
    />
  );
}

// ---------- Fil d'Ariane ----------
export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="Fil d’Ariane" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link to="/" className="hover:text-berry">
            Accueil
          </Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
            {it.to ? (
              <Link to={it.to} className="hover:text-berry">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-cocoa">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ---------- Accordéon ----------
export function Accordion({
  items,
  defaultOpen = -1,
}: {
  items: Array<{ title: string; content: ReactNode; id?: string }>;
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState<number>(defaultOpen);
  const base = useId();
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} id={it.id}>
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-semibold text-cocoa hover:text-berry"
                aria-expanded={isOpen}
                aria-controls={`${base}-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                {it.title}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-berry transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
            </h3>
            <div id={`${base}-${i}`} role="region" hidden={!isOpen} className="pb-6 text-sm leading-relaxed text-muted">
              {it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Onglets ----------
export function Tabs({ tabs }: { tabs: Array<{ id: string; label: string; content: ReactNode }> }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const base = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div>
      <div
        role="tablist"
        aria-label="Informations produit"
        className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line"
      >
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${active === t.id ? 'text-berry' : 'text-muted hover:text-cocoa'}`}
          >
            {t.label}
            {active === t.id && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded bg-berry" />}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={active !== t.id}
          className="pt-8"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}

// ---------- Quantité ----------
export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 10,
  label = 'Quantité',
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md';
}) {
  const h = size === 'sm' ? 'h-9' : 'h-12';
  return (
    <div
      className={`inline-flex items-center rounded-full border border-line bg-white ${h}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={`grid ${h} w-10 place-items-center rounded-l-full text-cocoa hover:text-berry disabled:opacity-30`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        className="w-10 bg-transparent text-center text-sm font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        className={`grid ${h} w-10 place-items-center rounded-r-full text-cocoa hover:text-berry disabled:opacity-30`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------- Champs de formulaire ----------
type FieldBase = { label: string; error?: string; hint?: string; optional?: boolean };

export function TextField({
  label,
  error,
  hint,
  optional,
  id,
  className = '',
  ...rest
}: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">
        {label} {optional && <span className="font-normal text-muted">(facultatif)</span>}
      </label>
      <input
        id={fid}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        {...rest}
      />
      {hint && !error && (
        <p id={`${fid}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fid}-err`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  error,
  hint,
  optional,
  id,
  className = '',
  children,
  ...rest
}: FieldBase & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">
        {label} {optional && <span className="font-normal text-muted">(facultatif)</span>}
      </label>
      <div className="relative">
        <select
          id={fid}
          className={`input appearance-none pr-10 ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  id,
  className = '',
  ...rest
}: FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">
        {label}
      </label>
      <textarea
        id={fid}
        className={`input min-h-[140px] ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        {...rest}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

// ---------- Notes ----------
export function Rating({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-1.5" aria-label={`Note de démonstration : ${value.toFixed(1)} sur 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${s} ${i <= Math.round(value) ? 'fill-rose text-rose' : 'text-line'}`}
            aria-hidden
          />
        ))}
      </div>
      {count != null && <span className="text-xs text-muted">({count})</span>}
    </div>
  );
}

// ---------- État vide ----------
export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-powder text-berry">{icon}</div>
      <h2 className="mb-2 font-serif text-2xl text-cocoa">{title}</h2>
      <p className="mb-8 text-sm leading-relaxed text-muted">{text}</p>
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

// ---------- Bandeau d'information démo ----------
export function DemoNotice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' }) {
  return (
    <div
      className={`flex gap-3 rounded-xl p-4 text-sm leading-relaxed ${tone === 'warning' ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200' : 'bg-blush text-cocoa ring-1 ring-line'}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

// ---------- Drawer (panneau latéral) ----------
export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  footer,
  widthClass = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useModalBehavior(open, onClose, panelRef);
  const x = side === 'right' ? '100%' : '-100%';
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-cocoa/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`absolute top-0 ${side === 'right' ? 'right-0' : 'left-0'} flex h-full w-full ${widthClass} flex-col bg-cream shadow-2xl focus:outline-none`}
            initial={reduce ? { opacity: 0 } : { x }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-serif text-xl text-cocoa">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-blush"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-line bg-white px-5 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ---------- Modale ----------
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useModalBehavior(open, onClose, panelRef);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-cocoa/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl focus:outline-none"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow hover:bg-blush"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Échap pour fermer, focus piégé, scroll verrouillé, focus restauré. */
function useModalBehavior(open: boolean, onClose: () => void, ref: React.RefObject<HTMLDivElement>) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => ref.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [open, ref]);
}

// ---------- Toasts ----------
export function ToastViewport() {
  const { toasts, dismiss } = useUI();
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-cocoa px-4 py-3 text-sm text-white shadow-2xl"
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${t.tone === 'error' ? 'bg-red-500' : t.tone === 'info' ? 'bg-white/15' : 'bg-rose'}`}
            >
              {t.tone === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : t.tone === 'info' ? (
                <Info className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </span>
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="font-semibold text-powder underline underline-offset-2"
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            {t.link && (
              <Link
                to={t.link.to}
                className="font-semibold text-powder underline underline-offset-2"
                onClick={() => dismiss(t.id)}
              >
                {t.link.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Fermer la notification"
              className="text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------- En-tête de page ----------
export function PageHeader({
  eyebrow,
  title,
  text,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  crumbs: Array<{ label: string; to?: string }>;
}) {
  return (
    <div className="bg-blush">
      <div className="container-site py-10 sm:py-14">
        <Breadcrumb items={crumbs} />
        {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
        <h1 className="mt-2 font-serif text-4xl text-cocoa sm:text-5xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-muted">{text}</p>}
      </div>
    </div>
  );
}

// ---------- Titre de document ----------
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Inahair` : 'Inahair — Perruques & tissages premium';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
