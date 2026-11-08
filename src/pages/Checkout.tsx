import {
  Check,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Lock,
  Package,
  ShoppingBag,
  Smartphone,
  Clock3,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PromoCodeForm } from '../components/cart/CartParts';
import { DemoNotice, EmptyState, SelectField, SmartImage, TextField, useDocumentTitle } from '../components/ui';
import { siteConfig, type ShippingMethod } from '../config/site';
import type { Order } from '../data/types';
import { formatDateTime, formatPrice, isValidEmail, isValidPhone } from '../lib/format';
import { availableShippingMethods, computeTotals, getShippingCost, getZone } from '../lib/pricing';
import { useAccount } from '../store/account';
import { useCart } from '../store/cart';

const STEPS = ['Coordonnées', 'Livraison', 'Paiement', 'Récapitulatif'];

export function CheckoutStepper({ step, onGo }: { step: number; onGo: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label="Étapes de la commande">
      {STEPS.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!done}
              onClick={() => onGo(i)}
              aria-current={current ? 'step' : undefined}
              className={`flex items-center gap-2 text-left disabled:cursor-default ${done ? 'hover:text-berry' : ''}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${current ? 'bg-berry text-white shadow-soft' : done ? 'bg-powder text-berry' : 'bg-white text-muted ring-1 ring-line'}`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`hidden text-sm font-semibold md:inline ${current ? 'text-cocoa' : 'text-muted'}`}>
                {s}
              </span>
            </button>
            {i < STEPS.length - 1 && <span className={`h-px flex-1 ${done ? 'bg-berry' : 'bg-line'}`} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  complement: string;
  shipping: ShippingMethod['id'];
  payment: 'card' | 'mobile-money' | 'later' | '';
  operator: string;
  accept: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

export default function Checkout() {
  useDocumentTitle('Commande');
  const { lines, promo, country: cartCountry, setCountry, clearCart } = useCart();
  const { user, addOrder } = useAccount();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: '',
    country: cartCountry,
    city: '',
    address: '',
    postalCode: '',
    complement: '',
    shipping: 'standard',
    payment: '',
    operator: siteConfig.mobileMoneyOperators[0],
    accept: false,
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const methods = availableShippingMethods(form.country);
  useEffect(() => {
    if (!methods.some((m) => m.id === form.shipping)) set('shipping', 'standard');
    setCountry(form.country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country]);

  const totals = useMemo(
    () => computeTotals(lines, promo, form.country, form.shipping),
    [lines, promo, form.country, form.shipping],
  );
  const countryInfo = siteConfig.countries.find((c) => c.code === form.country)!;
  const zone = getZone(form.country);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  if (!lines.length && !submitting) {
    return (
      <div className="container-site py-10">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Votre panier est vide"
          text="Ajoutez au moins un article pour passer commande."
        >
          <Link to="/boutique" className="btn-primary">
            Retour à la boutique
          </Link>
        </EmptyState>
      </div>
    );
  }

  const validate = (s: number): boolean => {
    const e: Errors = {};
    if (s === 0) {
      if (form.firstName.trim().length < 2) e.firstName = 'Indiquez votre prénom.';
      if (form.lastName.trim().length < 2) e.lastName = 'Indiquez votre nom.';
      if (!isValidEmail(form.email)) e.email = 'Adresse email invalide (ex. nom@exemple.com).';
      if (!isValidPhone(form.phone)) e.phone = 'Numéro invalide : 8 chiffres minimum, indicatif accepté (+225…).';
    }
    if (s === 1) {
      if (form.city.trim().length < 2) e.city = 'Indiquez votre ville.';
      if (form.address.trim().length < 5) e.address = 'Indiquez une adresse complète.';
      if (countryInfo.postalCodeRequired && !/^[A-Za-z0-9 -]{4,10}$/.test(form.postalCode.trim()))
        e.postalCode = 'Code postal requis pour ce pays.';
    }
    if (s === 2) {
      if (!form.payment) e.payment = 'Choisissez un mode de paiement (simulation).';
    }
    if (s === 3) {
      if (!form.accept) e.accept = 'Veuillez confirmer qu’il s’agit d’une commande de démonstration.';
    }
    setErrors(e);
    if (Object.keys(e).length) {
      window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 30);
      return false;
    }
    return true;
  };

  const next = () => validate(step) && setStep((s) => Math.min(3, s + 1));

  const paymentLabel =
    form.payment === 'card'
      ? 'Carte bancaire (simulation)'
      : form.payment === 'mobile-money'
        ? `Mobile Money – ${form.operator} (simulation)`
        : 'Méthode à définir ultérieurement';
  const shippingMethod = siteConfig.shippingMethods.find((m) => m.id === form.shipping)!;

  const confirm = () => {
    if (!validate(3)) return;
    setSubmitting(true);
    window.setTimeout(() => {
      const order = addOrder({
        customer: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
        },
        address: {
          country: countryInfo.name,
          city: form.city.trim(),
          address: form.address.trim(),
          postalCode: form.postalCode.trim() || undefined,
          complement: form.complement.trim() || undefined,
        },
        shippingMethod: `${shippingMethod.label} (${shippingMethod.delay[zone]})`,
        shippingCost: totals.shipping,
        paymentMethod: paymentLabel,
        lines: totals.lines.map((l) => ({
          productId: l.product.id,
          slug: l.product.slug,
          name: l.product.name,
          image: l.product.images[0],
          selectionsLabel: l.label,
          unitPrice: l.unitPrice,
          quantity: l.line.quantity,
          lineTotal: l.lineTotal,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        promoCode: totals.discount > 0 ? promo?.code : undefined,
        total: totals.total,
      });
      clearCart();
      navigate(`/commande/confirmation?ref=${order.reference}`, { replace: true });
    }, 900);
  };

  return (
    <div className="bg-blush/60">
      <div className="container-site py-8 sm:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/panier"
            className="inline-flex items-center gap-1 text-sm font-semibold text-berry hover:underline"
          >
            <ChevronLeft className="h-4 w-4" /> Retour au panier
          </Link>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Lock className="h-3.5 w-3.5" /> Commande de démonstration
          </p>
        </div>
        <h1 className="sr-only">Passer commande</h1>
        <CheckoutStepper step={step} onGo={setStep} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form
            noValidate
            className="card p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 3) next();
              else confirm();
            }}
          >
            <h2 className="mb-6 font-serif text-2xl text-cocoa">
              {step + 1}. {STEPS[step]}
            </h2>

            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Prénom"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  error={errors.firstName}
                />
                <TextField
                  label="Nom"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  error={errors.lastName}
                />
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  error={errors.email}
                  className="sm:col-span-2"
                  hint="Sert à retrouver la commande dans ce navigateur. Aucun email n’est envoyé."
                />
                <TextField
                  label="Téléphone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+225 07 00 00 00"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  error={errors.phone}
                  className="sm:col-span-2"
                />
                {!user && (
                  <p className="text-xs text-muted sm:col-span-2">
                    Vous commandez en invitée.{' '}
                    <Link to="/connexion?redirect=/commande" className="link">
                      Se connecter
                    </Link>{' '}
                    pour retrouver vos commandes dans votre compte.
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="Pays"
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    className="sm:col-span-2"
                  >
                    {(['afrique-ouest', 'afrique-centrale', 'europe'] as const).map((z) => (
                      <optgroup key={z} label={siteConfig.zones[z]}>
                        {siteConfig.countries
                          .filter((c) => c.zone === z)
                          .map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </SelectField>
                  <TextField
                    label="Ville"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    error={errors.city}
                  />
                  <TextField
                    label="Code postal"
                    autoComplete="postal-code"
                    optional={!countryInfo.postalCodeRequired}
                    value={form.postalCode}
                    onChange={(e) => set('postalCode', e.target.value)}
                    error={errors.postalCode}
                  />
                  <TextField
                    label="Adresse"
                    autoComplete="street-address"
                    placeholder="Rue, quartier, repère…"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    error={errors.address}
                    className="sm:col-span-2"
                  />
                  <TextField
                    label="Complément d’adresse"
                    optional
                    value={form.complement}
                    onChange={(e) => set('complement', e.target.value)}
                    className="sm:col-span-2"
                  />
                </div>
                <fieldset>
                  <legend className="label">Mode de livraison</legend>
                  <div className="space-y-3">
                    {methods.map((m) => {
                      const cost = getShippingCost(form.country, m.id, totals.subtotal - totals.discount);
                      const active = form.shipping === m.id;
                      return (
                        <label
                          key={m.id}
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${active ? 'border-berry bg-blush' : 'border-line bg-white hover:border-berry/40'}`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={m.id}
                            checked={active}
                            onChange={() => set('shipping', m.id)}
                            className="h-4 w-4 accent-berry"
                          />
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-cocoa">{m.label}</span>
                            <span className="text-xs text-muted">
                              {m.description} · {m.delay[zone]}
                            </span>
                          </span>
                          <span className="text-sm font-bold text-cocoa">
                            {cost === 0 ? 'Offerte' : formatPrice(cost)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    Barème et délais fictifs ({siteConfig.zones[zone]}), modifiables dans la configuration.
                  </p>
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <DemoNotice tone="warning">
                  <strong>Paiement simulé.</strong> Aucune donnée bancaire n’est demandée et aucun montant ne sera
                  débité.
                </DemoNotice>
                <fieldset>
                  <legend className="sr-only">Mode de paiement</legend>
                  <div className="space-y-3" role="radiogroup" aria-invalid={!!errors.payment} tabIndex={-1}>
                    {[
                      {
                        id: 'card' as const,
                        icon: CreditCard,
                        title: 'Carte bancaire — simulation',
                        text: 'Le paiement réel sera branché ultérieurement via un prestataire sécurisé.',
                      },
                      {
                        id: 'mobile-money' as const,
                        icon: Smartphone,
                        title: 'Mobile Money — simulation',
                        text: 'Orange Money, MTN MoMo, Wave, Moov… (aucune transaction).',
                      },
                      {
                        id: 'later' as const,
                        icon: Clock3,
                        title: 'Autre méthode — à définir',
                        text: 'Paiement à la livraison, virement… selon les options retenues.',
                      },
                    ].map(({ id, icon: Icon, title, text }) => {
                      const active = form.payment === id;
                      return (
                        <label
                          key={id}
                          className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${active ? 'border-berry bg-blush' : 'border-line bg-white hover:border-berry/40'}`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={active}
                            onChange={() => set('payment', id)}
                            className="mt-1 h-4 w-4 accent-berry"
                          />
                          <Icon className="mt-0.5 h-5 w-5 text-berry" />
                          <span>
                            <span className="block text-sm font-semibold text-cocoa">{title}</span>
                            <span className="text-xs text-muted">{text}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.payment && <p className="mt-2 text-xs font-medium text-red-600">{errors.payment}</p>}
                </fieldset>
                {form.payment === 'mobile-money' && (
                  <SelectField
                    label="Opérateur (simulation)"
                    value={form.operator}
                    onChange={(e) => set('operator', e.target.value)}
                  >
                    {siteConfig.mobileMoneyOperators.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </SelectField>
                )}
                {form.payment === 'card' && (
                  <p className="rounded-xl bg-cream p-4 text-sm text-muted ring-1 ring-line">
                    Dans la version commerciale, vous serez redirigée vers une page de paiement sécurisée. Ici, aucun
                    champ de carte n’est affiché volontairement.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      t: 'Coordonnées',
                      s: 0,
                      body: (
                        <>
                          {form.firstName} {form.lastName}
                          <br />
                          {form.email}
                          <br />
                          {form.phone}
                        </>
                      ),
                    },
                    {
                      t: 'Livraison',
                      s: 1,
                      body: (
                        <>
                          {form.address}
                          {form.complement && <>, {form.complement}</>}
                          <br />
                          {form.postalCode} {form.city}, {countryInfo.name}
                          <br />
                          <span className="text-xs">{shippingMethod.label}</span>
                        </>
                      ),
                    },
                    { t: 'Paiement', s: 2, body: <>{paymentLabel}</> },
                  ].map((b) => (
                    <div key={b.t} className="rounded-xl bg-cream p-4 text-sm ring-1 ring-line">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-bold text-cocoa">{b.t}</p>
                        <button
                          type="button"
                          className="text-xs font-semibold text-berry hover:underline"
                          onClick={() => setStep(b.s)}
                        >
                          Modifier
                        </button>
                      </div>
                      <p className="leading-relaxed text-muted">{b.body}</p>
                    </div>
                  ))}
                </div>
                <ul className="divide-y divide-line rounded-xl ring-1 ring-line">
                  {totals.lines.map((l) => (
                    <li key={l.line.lineId} className="flex items-center gap-4 p-4">
                      <SmartImage src={l.product.images[0]} alt="" className="h-16 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-semibold text-cocoa">{l.product.name}</p>
                        {l.label && <p className="text-xs text-muted">{l.label}</p>}
                        <p className="text-xs text-muted">
                          {l.line.quantity} × {formatPrice(l.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(l.lineTotal)}</p>
                    </li>
                  ))}
                </ul>
                <label
                  className={`flex items-start gap-3 rounded-xl p-4 text-sm ring-1 ${errors.accept ? 'bg-red-50 ring-red-300' : 'ring-line'}`}
                >
                  <input
                    type="checkbox"
                    checked={form.accept}
                    onChange={(e) => set('accept', e.target.checked)}
                    aria-invalid={!!errors.accept}
                    className="mt-0.5 h-4 w-4 accent-berry"
                  />
                  <span>
                    J’ai compris qu’il s’agit d’une <strong>commande de démonstration</strong> : aucun paiement ne sera
                    effectué et aucune commande ne sera expédiée.{' '}
                    <Link to="/cgv" className="link">
                      CGV (modèle)
                    </Link>
                  </span>
                </label>
                {errors.accept && <p className="-mt-4 text-xs font-medium text-red-600">{errors.accept}</p>}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
              {step > 0 ? (
                <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Étape précédente
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="btn-primary sm:min-w-[260px]" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{' '}
                    Validation…
                  </>
                ) : step < 3 ? (
                  'Continuer'
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Confirmer ma commande de démonstration
                  </>
                )}
              </button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Récapitulatif de commande">
            <div className="card p-6">
              <h2 className="font-serif text-xl text-cocoa">Votre commande</h2>
              <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                {totals.lines.map((l) => (
                  <li key={l.line.lineId} className="flex gap-3">
                    <div className="relative shrink-0">
                      <SmartImage src={l.product.images[0]} alt="" className="h-16 w-14 rounded-lg object-cover" />
                      <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-cocoa px-1 text-[10px] font-bold text-white">
                        {l.line.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-semibold text-cocoa">{l.product.name}</p>
                      <p className="text-muted">{l.label}</p>
                    </div>
                    <p className="text-xs font-bold">{formatPrice(l.lineTotal)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-line pt-5">
                <PromoCodeForm />
              </div>
              <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Sous-total</dt>
                  <dd>{formatPrice(totals.subtotal)}</dd>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-berry">
                    <dt>Réduction</dt>
                    <dd>-{formatPrice(totals.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Livraison · {countryInfo.name}</dt>
                  <dd>{totals.shipping === 0 ? 'Offerte' : formatPrice(totals.shipping)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <dt className="font-bold">Total</dt>
                  <dd className="font-serif text-2xl text-berry">{formatPrice(totals.total)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// =================== CONFIRMATION ===================
export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="space-y-5">
      <ul className="divide-y divide-line rounded-xl ring-1 ring-line">
        {order.lines.map((l, i) => (
          <li key={i} className="flex items-center gap-4 p-4">
            <SmartImage src={l.image} alt="" className="h-16 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1 text-sm">
              <Link to={`/produit/${l.slug}`} className="font-semibold text-cocoa hover:text-berry">
                {l.name}
              </Link>
              {l.selectionsLabel && <p className="text-xs text-muted">{l.selectionsLabel}</p>}
              <p className="text-xs text-muted">
                {l.quantity} × {formatPrice(l.unitPrice)}
              </p>
            </div>
            <p className="text-sm font-bold">{formatPrice(l.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Sous-total</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-berry">
            <dt>Réduction {order.promoCode}</dt>
            <dd>-{formatPrice(order.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">Livraison</dt>
          <dd>{order.shippingCost === 0 ? 'Offerte' : formatPrice(order.shippingCost)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 font-bold">
          <dt>Total</dt>
          <dd className="text-berry">{formatPrice(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ConfirmationPage() {
  useDocumentTitle('Commande confirmée');
  const [params] = useSearchParams();
  const { findOrder, orders } = useAccount();
  const order = findOrder(params.get('ref') ?? '') ?? (params.get('ref') ? undefined : orders[0]);

  if (!order) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8" />}
        title="Commande introuvable"
        text="Cette référence n’existe pas dans ce navigateur."
      >
        <Link to="/suivi-commande" className="btn-primary">
          Suivre une commande
        </Link>
        <Link to="/boutique" className="btn-outline">
          Retour à la boutique
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="container-site max-w-3xl py-14">
      <div className="text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-powder text-berry">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <p className="eyebrow mt-6">Merci {order.customer.firstName} !</p>
        <h1 className="mt-2 font-serif text-4xl text-cocoa">Votre commande de démonstration est confirmée</h1>
        <p className="mt-3 text-muted">
          Référence <strong className="text-cocoa">{order.reference}</strong> · {formatDateTime(order.createdAt)}
        </p>
      </div>
      <div className="mt-8">
        <DemoNotice>
          Aucun paiement n’a été effectué et aucune commande n’a été transmise. La commande est uniquement enregistrée
          dans ce navigateur.
        </DemoNotice>
      </div>
      <div className="card mt-8 p-6 sm:p-8">
        <div className="mb-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-bold text-cocoa">Livraison</p>
            <p className="text-muted">
              {order.address.address}, {order.address.postalCode} {order.address.city}, {order.address.country}
              <br />
              {order.shippingMethod}
            </p>
          </div>
          <div>
            <p className="font-bold text-cocoa">Paiement</p>
            <p className="text-muted">{order.paymentMethod}</p>
          </div>
        </div>
        <OrderSummary order={order} />
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/compte/commandes" className="btn-primary">
          Voir mes commandes
        </Link>
        <Link to={`/suivi-commande?ref=${order.reference}`} className="btn-outline">
          Suivre la commande
        </Link>
        <Link to="/boutique" className="btn-ghost">
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
