import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { siteConfig } from '../config/site';
import type { DemoUser, Order } from '../data/types';
import { readStorage, writeStorage } from '../lib/storage';

/**
 * COMPTE SIMULÉ — aucune authentification réelle.
 * Aucun mot de passe n'est stocké : seuls prénom, nom et email de démonstration
 * sont conservés dans ce navigateur.
 */

interface AccountContextValue {
  user: DemoUser | null;
  isLoggedIn: boolean;
  login: (email: string) => DemoUser;
  register: (data: Omit<DemoUser, 'createdAt'>) => { ok: boolean; message?: string };
  logout: () => void;
  updateProfile: (data: Partial<Omit<DemoUser, 'createdAt' | 'email'>>) => void;
  orders: Order[];
  myOrders: Order[];
  addOrder: (order: Omit<Order, 'reference' | 'createdAt' | 'isDemo'>) => Order;
  findOrder: (reference: string) => Order | undefined;
}

const AccountContext = createContext<AccountContextValue | null>(null);

const nameFromEmail = (email: string) => {
  const local = email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .trim();
  const first = local.split(' ')[0] || 'Cliente';
  return first.charAt(0).toUpperCase() + first.slice(1);
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const keys = siteConfig.storageKeys;
  const [user, setUser] = useState<DemoUser | null>(() => readStorage<DemoUser | null>(keys.session, null));
  const [users, setUsers] = useState<DemoUser[]>(() => readStorage<DemoUser[]>(keys.users, []));
  const [orders, setOrders] = useState<Order[]>(() => readStorage<Order[]>(keys.orders, []));

  useEffect(() => {
    writeStorage(keys.session, user);
  }, [user, keys.session]);
  useEffect(() => {
    writeStorage(keys.users, users);
  }, [users, keys.users]);
  useEffect(() => {
    writeStorage(keys.orders, orders);
  }, [orders, keys.orders]);

  const login = useCallback(
    (email: string) => {
      const e = email.trim().toLowerCase();
      const existing = users.find((u) => u.email === e);
      const u: DemoUser = existing ?? {
        firstName: nameFromEmail(e),
        lastName: '',
        email: e,
        createdAt: new Date().toISOString(),
      };
      if (!existing) setUsers((prev) => [...prev, u]);
      setUser(u);
      return u;
    },
    [users],
  );

  const register = useCallback<AccountContextValue['register']>((data) => {
    const email = data.email.trim().toLowerCase();
    const u: DemoUser = { ...data, email, createdAt: new Date().toISOString() };
    setUsers((prev) => [...prev.filter((x) => x.email !== email), u]);
    setUser(u);
    return { ok: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateProfile = useCallback<AccountContextValue['updateProfile']>((data) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      setUsers((list) => list.map((u) => (u.email === next.email ? next : u)));
      return next;
    });
  }, []);

  const addOrder = useCallback<AccountContextValue['addOrder']>(
    (data) => {
      const year = new Date().getFullYear();
      const sameYear = orders.filter((o) => o.reference.startsWith(`${siteConfig.orderPrefix}-${year}-`));
      const next = sameYear.reduce((max, o) => Math.max(max, Number(o.reference.split('-')[2]) || 0), 0) + 1;
      const order: Order = {
        ...data,
        reference: `${siteConfig.orderPrefix}-${year}-${String(next).padStart(4, '0')}`,
        createdAt: new Date().toISOString(),
        isDemo: true,
      };
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [orders],
  );

  const findOrder = useCallback(
    (reference: string) => orders.find((o) => o.reference.toUpperCase() === reference.trim().toUpperCase()),
    [orders],
  );

  const myOrders = useMemo(
    () => (user ? orders.filter((o) => o.customer.email.toLowerCase() === user.email) : []),
    [orders, user],
  );

  const value = useMemo(
    () => ({ user, isLoggedIn: !!user, login, register, logout, updateProfile, orders, myOrders, addOrder, findOrder }),
    [user, login, register, logout, updateProfile, orders, myOrders, addOrder, findOrder],
  );
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount doit être utilisé dans AccountProvider');
  return ctx;
}
