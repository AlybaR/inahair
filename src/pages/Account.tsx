import { Heart, LogOut, Package, Sparkles, User } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, Navigate, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { DemoNotice, EmptyState, SmartImage, TextField, useDocumentTitle } from '../components/ui';
import { getProductById } from '../data/products';
import type { Product } from '../data/types';
import { formatDate, formatPrice, isValidEmail, pluralize } from '../lib/format';
import { useAccount } from '../store/account';
import { useUI } from '../store/ui';
import { useWishlist } from '../store/wishlist';
import { OrderSummary } from './Checkout';
import { orderStatus } from './Info';

/** Redirection sûre : uniquement vers un chemin interne. */
const safeRedirect = (r: string | null) => (r && r.startsWith('/') && !r.startsWith('//') ? r : '/compte');

function AuthShell({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[70vh] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-powder lg:block">
        <SmartImage
          src={`${import.meta.env.BASE_URL}images/model-portrait.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/70 via-transparent" />
        <p className="absolute bottom-10 left-10 max-w-sm font-serif text-3xl leading-snug text-white">
          Votre beauté, votre rituel, votre espace.
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-4xl text-cocoa">{title}</h1>
          <p className="mt-2 text-sm text-muted">{text}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  useDocumentTitle('Connexion');
  const { login, isLoggedIn } = useAccount();
  const { notify } = useUI();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  if (isLoggedIn) return <Navigate to={redirect} replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!isValidEmail(email)) err.email = 'Adresse email invalide.';
    if (password.length < 6) err.password = '6 caractères minimum.';
    setErrors(err);
    if (Object.keys(err).length) return;
    const u = login(email);
    notify({ message: `Bonjour ${u.firstName}, vous êtes connectée (démo).`, tone: 'success' });
    navigate(redirect, { replace: true });
  };

  return (
    <AuthShell title="Connexion" text="Accédez à vos favoris et à vos commandes de démonstration.">
      <DemoNotice>
        Connexion simulée : tout email valide et un mot de passe de 6 caractères minimum conviennent. Aucun mot de passe
        n’est enregistré.
      </DemoNotice>
      <form onSubmit={submit} noValidate className="mt-6 space-y-5">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <TextField
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <button type="submit" className="btn-primary w-full">
          Se connecter
        </button>
        <button
          type="button"
          className="btn-outline w-full"
          onClick={() => {
            const u = login('awa.demo@inahair-demo.com');
            notify({ message: `Bonjour ${u.firstName} (compte de démonstration)`, tone: 'success' });
            navigate(redirect, { replace: true });
          }}
        >
          <Sparkles className="h-4 w-4" /> Utiliser le compte de démonstration
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Pas encore de compte ?{' '}
        <Link
          to={`/inscription${params.get('redirect') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="link"
        >
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  useDocumentTitle('Inscription');
  const { register, isLoggedIn } = useAccount();
  const { notify } = useUI();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: '', accept: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoggedIn) return <Navigate to={redirect} replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (f.firstName.trim().length < 2) err.firstName = 'Indiquez votre prénom.';
    if (f.lastName.trim().length < 2) err.lastName = 'Indiquez votre nom.';
    if (!isValidEmail(f.email)) err.email = 'Adresse email invalide.';
    if (f.password.length < 6) err.password = '6 caractères minimum.';
    if (!f.accept) err.accept = 'Veuillez accepter les conditions de la démonstration.';
    setErrors(err);
    if (Object.keys(err).length) return;
    register({ firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email });
    notify({ message: `Bienvenue ${f.firstName.trim()} ! Votre compte de démonstration est créé.`, tone: 'success' });
    navigate(redirect, { replace: true });
  };

  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  return (
    <AuthShell title="Créer un compte" text="Retrouvez vos favoris et suivez vos commandes simulées.">
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Prénom"
            autoComplete="given-name"
            value={f.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
          />
          <TextField
            label="Nom"
            autoComplete="family-name"
            value={f.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={f.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
        />
        <TextField
          label="Mot de passe de démonstration"
          type="password"
          autoComplete="new-password"
          hint="Non enregistré : sert uniquement à la validation du formulaire."
          value={f.password}
          onChange={(e) => set('password', e.target.value)}
          error={errors.password}
        />
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={f.accept}
            onChange={(e) => set('accept', e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-berry"
            aria-invalid={!!errors.accept}
          />
          <span>
            Je comprends que ce compte est fictif et conservé uniquement dans ce navigateur.{' '}
            <Link to="/confidentialite" className="link">
              Confidentialité
            </Link>
          </span>
        </label>
        {errors.accept && <p className="-mt-3 text-xs font-medium text-red-600">{errors.accept}</p>}
        <button type="submit" className="btn-primary w-full">
          Créer mon compte
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Déjà inscrite ?{' '}
        <Link to="/connexion" className="link">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAccount();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}

function AccountShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAccount();
  const { notify } = useUI();
  const navigate = useNavigate();
  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-berry text-white' : 'text-cocoa hover:bg-blush'}`;
  return (
    <div className="container-site py-10">
      <p className="eyebrow">Mon compte</p>
      <h1 className="mt-2 font-serif text-4xl text-cocoa">Bonjour {user?.firstName} !</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Espace client" className="flex gap-2 overflow-x-auto lg:flex-col">
          <NavLink to="/compte" end className={link}>
            <User className="h-4 w-4" /> Tableau de bord
          </NavLink>
          <NavLink to="/compte/commandes" className={link}>
            <Package className="h-4 w-4" /> Mes commandes
          </NavLink>
          <NavLink to="/favoris" className={link}>
            <Heart className="h-4 w-4" /> Mes favoris
          </NavLink>
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted hover:bg-blush"
            onClick={() => {
              logout();
              notify({ message: 'Vous êtes déconnectée.', tone: 'info' });
              navigate('/');
            }}
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function AccountPage() {
  useDocumentTitle('Mon compte');
  return (
    <RequireAuth>
      <AccountShell>
        <Dashboard />
      </AccountShell>
    </RequireAuth>
  );
}

function Dashboard() {
  const { user, myOrders, updateProfile } = useAccount();
  const { ids } = useWishlist();
  const { notify } = useUI();
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState(user?.firstName ?? '');
  const [last, setLast] = useState(user?.lastName ?? '');
  const favs = ids
    .map(getProductById)
    .filter((p): p is Product => !!p)
    .slice(0, 4);
  if (!user) return null;
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/compte/commandes" className="card p-5 hover:ring-berry/40">
          <p className="text-xs uppercase tracking-wider text-muted">Commandes</p>
          <p className="mt-1 font-serif text-3xl text-berry">{myOrders.length}</p>
        </Link>
        <Link to="/favoris" className="card p-5 hover:ring-berry/40">
          <p className="text-xs uppercase tracking-wider text-muted">Favoris</p>
          <p className="mt-1 font-serif text-3xl text-berry">{ids.length}</p>
        </Link>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Membre depuis</p>
          <p className="mt-2 font-semibold text-cocoa">{formatDate(user.createdAt)}</p>
        </div>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-cocoa">Mes coordonnées</h2>
          {!editing && (
            <button
              type="button"
              className="text-sm font-semibold text-berry hover:underline"
              onClick={() => setEditing(true)}
            >
              Modifier
            </button>
          )}
        </div>
        {editing ? (
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (first.trim().length < 2) return;
              updateProfile({ firstName: first.trim(), lastName: last.trim() });
              setEditing(false);
              notify({ message: 'Coordonnées mises à jour', tone: 'success' });
            }}
          >
            <TextField
              label="Prénom"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              error={first.trim().length < 2 ? 'Prénom requis.' : undefined}
            />
            <TextField label="Nom" value={last} onChange={(e) => setLast(e.target.value)} />
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" className="btn-primary">
                Enregistrer
              </button>
              <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Nom</dt>
              <dd className="font-semibold text-cocoa">
                {user.firstName} {user.lastName || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="font-semibold text-cocoa">{user.email}</dd>
            </div>
          </dl>
        )}
        <p className="mt-5 text-xs text-muted">
          Compte fictif conservé dans ce navigateur. Aucune authentification réelle.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-cocoa">Dernières commandes</h2>
          <Link to="/compte/commandes" className="text-sm font-semibold text-berry hover:underline">
            Tout voir
          </Link>
        </div>
        {myOrders.length ? (
          <OrdersList orders={myOrders.slice(0, 2)} />
        ) : (
          <p className="card p-6 text-sm text-muted">
            Aucune commande pour le moment.{' '}
            <Link to="/boutique" className="link">
              Découvrir la boutique
            </Link>
          </p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-cocoa">Mes favoris</h2>
          <Link to="/favoris" className="text-sm font-semibold text-berry hover:underline">
            Gérer
          </Link>
        </div>
        {favs.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {favs.map((p) => (
              <Link key={p.id} to={`/produit/${p.slug}`} className="group">
                <SmartImage
                  src={p.images[0]}
                  alt={p.imageAlt}
                  className="aspect-[4/5] w-full rounded-xl object-cover"
                />
                <p className="mt-2 text-xs font-semibold text-cocoa group-hover:text-berry">{p.name}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="card p-6 text-sm text-muted">Aucun favori enregistré.</p>
        )}
      </section>
    </div>
  );
}

function OrdersList({ orders }: { orders: ReturnType<typeof useAccount>['orders'] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="space-y-4">
      {orders.map((o) => {
        const st = orderStatus(o);
        return (
          <li key={o.reference} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-cocoa">{o.reference}</p>
                <p className="text-xs text-muted">
                  {formatDate(o.createdAt)} ·{' '}
                  {pluralize(
                    o.lines.reduce((s, l) => s + l.quantity, 0),
                    'article',
                    'articles',
                  )}
                </p>
              </div>
              <span className="rounded-full bg-powder px-3 py-1 text-xs font-bold text-berry">{st.label}</span>
              <p className="font-serif text-xl text-cocoa">{formatPrice(o.total)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <button
                type="button"
                className="font-semibold text-berry hover:underline"
                aria-expanded={open === o.reference}
                onClick={() => setOpen(open === o.reference ? null : o.reference)}
              >
                {open === o.reference ? 'Masquer le détail' : 'Voir le détail'}
              </button>
              <Link to={`/suivi-commande?ref=${o.reference}`} className="font-semibold text-muted hover:text-berry">
                Suivre
              </Link>
            </div>
            {open === o.reference && (
              <div className="mt-5 border-t border-line pt-5">
                <OrderSummary order={o} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function AccountOrdersPage() {
  useDocumentTitle('Mes commandes');
  return (
    <RequireAuth>
      <AccountShell>
        <OrdersContent />
      </AccountShell>
    </RequireAuth>
  );
}

function OrdersContent() {
  const { myOrders, orders, user } = useAccount();
  const others = orders.length - myOrders.length;
  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl text-cocoa">Mes commandes</h2>
      {myOrders.length ? (
        <OrdersList orders={myOrders} />
      ) : (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="Aucune commande"
          text={`Aucune commande de démonstration n’est associée à ${user?.email}.`}
        >
          <Link to="/boutique" className="btn-primary">
            Commencer mes achats
          </Link>
        </EmptyState>
      )}
      {others > 0 && (
        <p className="mt-6 text-xs text-muted">
          {pluralize(others, 'autre commande a été passée', 'autres commandes ont été passées')} avec une autre adresse
          email dans ce navigateur. Retrouvez-les via le{' '}
          <Link to="/suivi-commande" className="link">
            suivi de commande
          </Link>
          .
        </p>
      )}
    </div>
  );
}
