import { ShoppingBag, Tag, Trash2, Truck, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { formatPrice } from '../../lib/format';
import type { PricedLine } from '../../lib/pricing';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Drawer, EmptyState, QuantityInput, SmartImage } from '../ui';

export function CartLineItem({
  item,
  compact = false,
  onNavigate,
}: {
  item: PricedLine;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { updateQuantity, removeLine, restoreLine, maxQty } = useCart();
  const { notify } = useUI();
  const { product, line } = item;
  const url = `/produit/${product.slug}`;

  const remove = () => {
    const removed = removeLine(line.lineId);
    if (removed)
      notify(
        {
          message: `${product.name} retiré du panier`,
          tone: 'info',
          action: { label: 'Annuler', onClick: () => restoreLine(removed) },
        },
        6000,
      );
  };

  return (
    <div className="flex gap-4 py-5">
      <Link to={url} onClick={onNavigate} className="shrink-0 overflow-hidden rounded-xl bg-powder">
        <SmartImage
          src={product.images[0]}
          alt={product.imageAlt}
          className={`${compact ? 'h-24 w-20' : 'h-32 w-28'} object-cover`}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={url}
              onClick={onNavigate}
              className="text-sm font-semibold leading-snug text-cocoa hover:text-berry"
            >
              {product.name}
            </Link>
            {item.label && <p className="mt-1 text-xs leading-relaxed text-muted">{item.label}</p>}
            <p className="mt-1 text-xs text-muted">
              Prix unitaire : <span className="font-semibold text-cocoa">{formatPrice(item.unitPrice)}</span>
              {item.regularPrice > item.unitPrice && (
                <span className="ml-1 line-through">{formatPrice(item.regularPrice)}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={remove}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-blush hover:text-berry"
            aria-label={`Supprimer ${product.name}`}
          >
            {compact ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <QuantityInput
            value={line.quantity}
            max={maxQty}
            size="sm"
            onChange={(q) => updateQuantity(line.lineId, q)}
            label={`Quantité pour ${product.name}`}
          />
          <p className="text-sm font-bold text-cocoa">{formatPrice(item.lineTotal)}</p>
        </div>
      </div>
    </div>
  );
}

export function FreeShippingProgress({ amount }: { amount: number }) {
  const threshold = siteConfig.freeShippingThreshold;
  const left = Math.max(0, threshold - amount);
  const pct = Math.min(100, (amount / threshold) * 100);
  return (
    <div className="rounded-xl bg-blush p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-cocoa">
        <Truck className="h-4 w-4 text-berry" />
        {left > 0 ? (
          <>Plus que {formatPrice(left)} pour la livraison standard offerte*</>
        ) : (
          <>Livraison standard offerte !*</>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-berry transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[10px] text-muted">*Condition fictive de démonstration.</p>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, closeCart } = useUI();
  const { totals } = useCart();
  const navigate = useNavigate();
  const empty = totals.lines.length === 0;

  return (
    <Drawer
      open={cartOpen}
      onClose={closeCart}
      title={`Mon panier${totals.itemCount ? ` (${totals.itemCount})` : ''}`}
      footer={
        !empty && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Sous-total</span>
              <span className="font-bold text-cocoa">{formatPrice(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex items-center justify-between text-sm text-berry">
                <span>Réduction</span>
                <span className="font-semibold">-{formatPrice(totals.discount)}</span>
              </div>
            )}
            <p className="text-xs text-muted">Livraison et code promo calculés dans le panier.</p>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => {
                closeCart();
                navigate('/commande');
              }}
            >
              Passer commande
            </button>
            <button
              type="button"
              className="btn-outline w-full"
              onClick={() => {
                closeCart();
                navigate('/panier');
              }}
            >
              Voir mon panier
            </button>
          </div>
        )
      }
    >
      {empty ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Votre panier est vide"
          text="Laissez-vous inspirer par nos perruques et tissages premium."
        >
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              closeCart();
              navigate('/boutique');
            }}
          >
            Découvrir la boutique
          </button>
        </EmptyState>
      ) : (
        <div className="px-5">
          <div className="pt-4">
            <FreeShippingProgress amount={totals.subtotal - totals.discount} />
          </div>
          <div className="divide-y divide-line">
            {totals.lines.map((l) => (
              <CartLineItem key={l.line.lineId} item={l} compact onNavigate={closeCart} />
            ))}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="mb-6 w-full text-center text-sm font-semibold text-berry hover:underline"
          >
            Continuer mes achats
          </button>
        </div>
      )}
    </Drawer>
  );
}

export function PromoCodeForm() {
  const { promo, applyPromo, removePromo, totals } = useCart();
  const { notify } = useUI();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (promo) {
    return (
      <div className="rounded-xl border border-dashed border-berry/40 bg-blush p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-berry">
            <Tag className="h-4 w-4" /> {promo.code}
          </p>
          <button
            type="button"
            className="text-xs font-semibold text-muted underline hover:text-berry"
            onClick={() => {
              removePromo();
              setMsg(null);
              notify({ message: 'Code promotionnel retiré', tone: 'info' });
            }}
          >
            Retirer
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          {promo.label}
          {totals.eligibleSubtotal === 0 ? ' — aucun article éligible actuellement.' : '.'}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const res = applyPromo(code);
        setMsg({ ok: res.ok, text: res.message });
        if (res.ok) {
          setCode('');
          notify({ message: res.message, tone: 'success' });
        }
      }}
    >
      <label htmlFor="promo" className="label">
        Code promotionnel
      </label>
      <div className="flex gap-2">
        <input
          id="promo"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex. INAHAIR10"
          className="input !py-2.5 uppercase"
          aria-describedby="promo-msg"
        />
        <button type="submit" className="btn-outline shrink-0 !px-4">
          Appliquer
        </button>
      </div>
      <p
        id="promo-msg"
        className={`mt-2 text-xs ${msg ? (msg.ok ? 'text-emerald-700' : 'text-red-600') : 'text-muted'}`}
      >
        {msg ? msg.text : 'Code de démonstration : INAHAIR10 (-10 % perruques & tissages).'}
      </p>
    </form>
  );
}
