import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { siteConfig, type PromoCode } from '../config/site';
import { getProductById } from '../data/products';
import type { CartLine, Selections } from '../data/types';
import { computeTotals, findPromoCode, isSelectionAvailable, makeLineId, type CartTotals } from '../lib/pricing';
import { readStorage, writeStorage } from '../lib/storage';

const MAX_QTY = 10;

interface CartContextValue {
  lines: CartLine[];
  totals: CartTotals;
  promo: PromoCode | null;
  country: string;
  setCountry: (code: string) => void;
  addItem: (productId: string, selections: Selections, quantity: number) => { ok: boolean; message: string };
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => CartLine | undefined;
  restoreLine: (line: CartLine) => void;
  clearCart: () => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  removePromo: () => void;
  maxQty: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const sanitize = (lines: CartLine[]) =>
  Array.isArray(lines) ? lines.filter((l) => l && getProductById(l.productId) && l.quantity > 0) : [];

export function CartProvider({ children }: { children: ReactNode }) {
  const keys = siteConfig.storageKeys;
  const [lines, setLines] = useState<CartLine[]>(() => sanitize(readStorage<CartLine[]>(keys.cart, [])));
  const [promoCode, setPromoCode] = useState<string | null>(() => readStorage<string | null>(keys.promo, null));
  const [country, setCountry] = useState<string>(() => readStorage(keys.shippingCountry, siteConfig.defaultCountry));

  useEffect(() => {
    writeStorage(keys.cart, lines);
  }, [lines, keys.cart]);
  useEffect(() => {
    writeStorage(keys.promo, promoCode);
  }, [promoCode, keys.promo]);
  useEffect(() => {
    writeStorage(keys.shippingCountry, country);
  }, [country, keys.shippingCountry]);

  // Synchronisation entre onglets.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === keys.cart) setLines(sanitize(readStorage<CartLine[]>(keys.cart, [])));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [keys.cart]);

  const promo = useMemo(() => (promoCode ? (findPromoCode(promoCode) ?? null) : null), [promoCode]);
  const totals = useMemo(() => computeTotals(lines, promo, country), [lines, promo, country]);

  const addItem = useCallback<CartContextValue['addItem']>((productId, selections, quantity) => {
    const product = getProductById(productId);
    if (!product) return { ok: false, message: 'Produit introuvable.' };
    if (!isSelectionAvailable(product, selections))
      return { ok: false, message: 'Cette combinaison est indisponible.' };
    const qty = Math.max(1, Math.min(MAX_QTY, Math.floor(quantity)));
    const lineId = makeLineId(productId, selections);
    let capped = false;
    setLines((prev) => {
      const existing = prev.find((l) => l.lineId === lineId);
      if (existing) {
        const next = Math.min(MAX_QTY, existing.quantity + qty);
        capped = existing.quantity + qty > MAX_QTY;
        return prev.map((l) => (l.lineId === lineId ? { ...l, quantity: next } : l));
      }
      return [...prev, { lineId, productId, selections: { ...selections }, quantity: qty, addedAt: Date.now() }];
    });
    return { ok: true, message: capped ? `Quantité limitée à ${MAX_QTY} par article.` : 'Ajouté au panier' };
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    const q = Math.max(1, Math.min(MAX_QTY, Math.floor(quantity) || 1));
    setLines((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, quantity: q } : l)));
  }, []);

  const removeLine = useCallback(
    (lineId: string) => {
      const removed = lines.find((l) => l.lineId === lineId);
      setLines((prev) => prev.filter((l) => l.lineId !== lineId));
      return removed;
    },
    [lines],
  );

  const restoreLine = useCallback((line: CartLine) => {
    setLines((prev) =>
      prev.some((l) => l.lineId === line.lineId) ? prev : [...prev, line].sort((a, b) => a.addedAt - b.addedAt),
    );
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setPromoCode(null);
  }, []);

  const applyPromo = useCallback<CartContextValue['applyPromo']>(
    (code) => {
      const found = findPromoCode(code);
      if (!code.trim()) return { ok: false, message: 'Saisissez un code promotionnel.' };
      if (!found) return { ok: false, message: 'Ce code n’est pas valide.' };
      if (promoCode === found.code) return { ok: false, message: 'Ce code est déjà appliqué à votre panier.' };
      if (promoCode) return { ok: false, message: 'Un seul code promotionnel par commande.' };
      const eligible = computeTotals(lines, found, country).eligibleSubtotal;
      if (eligible === 0)
        return {
          ok: false,
          message: 'Aucun article de votre panier n’est éligible à ce code (perruques et tissages uniquement).',
        };
      setPromoCode(found.code);
      return { ok: true, message: `Code ${found.code} appliqué : ${found.label}.` };
    },
    [promoCode, lines, country],
  );

  const removePromo = useCallback(() => setPromoCode(null), []);

  const value = useMemo(
    () => ({
      lines,
      totals,
      promo,
      country,
      setCountry,
      addItem,
      updateQuantity,
      removeLine,
      restoreLine,
      clearCart,
      applyPromo,
      removePromo,
      maxQty: MAX_QTY,
    }),
    [
      lines,
      totals,
      promo,
      country,
      addItem,
      updateQuantity,
      removeLine,
      restoreLine,
      clearCart,
      applyPromo,
      removePromo,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider');
  return ctx;
}
