import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export interface ToastItem {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
  action?: { label: string; onClick: () => void };
  link?: { label: string; to: string };
}

interface UIContextValue {
  toasts: ToastItem[];
  notify: (t: Omit<ToastItem, 'id'>, duration?: number) => void;
  dismiss: (id: number) => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const notify = useCallback(
    (t: Omit<ToastItem, 'id'>, duration = 4000) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toasts,
      notify,
      dismiss,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      menuOpen,
      setMenuOpen,
      searchOpen,
      setSearchOpen,
    }),
    [toasts, notify, dismiss, cartOpen, menuOpen, searchOpen],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI doit être utilisé dans UIProvider');
  return ctx;
}
