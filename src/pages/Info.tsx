import {
  CheckCircle2,
  Clock,
  Gem,
  HeartHandshake,
  Leaf,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Search,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  DemoNotice,
  PageHeader,
  SelectField,
  SmartImage,
  TextAreaField,
  TextField,
  useDocumentTitle,
} from '../components/ui';
import { siteConfig } from '../config/site';
import { faqItems } from '../data/content';
import type { Order } from '../data/types';
import { img } from '../lib/assets';
import { formatDateTime, formatPrice, isValidEmail } from '../lib/format';
import { useAccount } from '../store/account';
import { OrderSummary } from './Checkout';

// =================== À PROPOS ===================
export function AboutPage() {
  useDocumentTitle('À propos', 'Inahair, marque de beauté capillaire : perruques, tissages et accessoires.');
  const values = [
    { icon: Gem, t: 'Exigence', d: 'Chaque référence est sélectionnée pour son rendu, son toucher et sa tenue.' },
    {
      icon: HeartHandshake,
      t: 'Accompagnement',
      d: 'Des conseils clairs pour choisir sa texture, sa longueur et sa lace.',
    },
    { icon: Sparkles, t: 'Élégance', d: 'Une beauté contemporaine, féminine et sans ostentation.' },
    { icon: Leaf, t: 'Transparence', d: 'Des informations honnêtes, sans promesses techniques non vérifiées.' },
  ];
  return (
    <>
      <section className="bg-powder">
        <div className="container-site grid items-center gap-10 py-14 md:grid-cols-2">
          <div>
            <p className="eyebrow">À propos</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-cocoa sm:text-5xl">
              Des cheveux d’exception, pour toutes les beautés.
            </h1>
            <p className="mt-5 max-w-lg leading-relaxed text-muted">
              Inahair est une marque de beauté capillaire dédiée aux femmes africaines et afrodescendantes, en Afrique
              comme en Europe. Nous sélectionnons des perruques, des boules de tissage et des accessoires pensés pour
              sublimer chaque style, avec une expérience d’achat simple et rassurante.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/boutique" className="btn-primary">
                Découvrir la boutique
              </Link>
              <Link to="/contact" className="btn-outline">
                Nous contacter
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-b-3xl rounded-t-[999px]">
            <SmartImage
              src={img('model-portrait')}
              alt="Portrait d’une femme"
              loading="eager"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
      <section className="container-site py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Notre approche</p>
          <h2 className="section-title mt-2">Une boutique premium, accessible et attentive</h2>
          <p className="mt-4 text-muted">
            Nous croyons qu’une belle chevelure se choisit sereinement : en comprenant les textures, en sachant quelle
            longueur adopter et comment en prendre soin. C’est pourquoi chaque fiche produit est accompagnée de
            conseils, et notre guide capillaire répond aux questions essentielles.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, t, d }) => (
            <div key={t} className="card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-blush text-berry">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-xl text-cocoa">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-blush py-16">
        <div className="container-site grid items-center gap-10 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <SmartImage
              src={img('model-curly-hoops')}
              alt=""
              className="aspect-[4/5] w-full rounded-2xl object-cover"
            />
            <SmartImage src={img('model-bob')} alt="" className="mt-10 aspect-[4/5] w-full rounded-2xl object-cover" />
          </div>
          <div>
            <h2 className="section-title">Afrique & Europe</h2>
            <p className="mt-4 text-muted">
              Inahair s’adresse à une clientèle répartie entre plusieurs pays d’Afrique et d’Europe. Les zones de
              livraison, délais et modalités définitives seront précisés avant le lancement commercial.
            </p>
            <Link to="/livraison-retours" className="link mt-6 inline-block">
              Livraison & retours →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// =================== LIVRAISON & RETOURS ===================
export function ShippingPage() {
  useDocumentTitle('Livraison & retours');
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Livraison & retours' }]}
        eyebrow="Service client"
        title="Livraison & retours"
        text="Zones desservies, délais indicatifs, frais et processus de retour."
      />
      <div className="container-site max-w-4xl py-12">
        <DemoNotice tone="warning">
          Les zones, délais, tarifs et conditions ci-dessous sont <strong>fictifs</strong>. Ils devront être définis et
          validés (logistique, juridique) avant toute commercialisation.
        </DemoNotice>
        <h2 className="mt-12 font-serif text-3xl text-cocoa">Zones et tarifs indicatifs</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-blush text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Mode</th>
                {(['afrique-ouest', 'afrique-centrale', 'europe'] as const).map((z) => (
                  <th key={z} className="px-4 py-3">
                    {siteConfig.zones[z]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {siteConfig.shippingMethods.map((m) => (
                <tr key={m.id} className="border-t border-line bg-white align-top">
                  <td className="px-4 py-3 font-semibold text-cocoa">{m.label}</td>
                  {(['afrique-ouest', 'afrique-centrale', 'europe'] as const).map((z) => (
                    <td key={z} className="px-4 py-3">
                      {m.rates[z] == null ? (
                        <span className="text-muted">Non disponible</span>
                      ) : (
                        <>
                          <span className="font-semibold">{formatPrice(m.rates[z]!)}</span>
                          <br />
                          <span className="text-xs text-muted">{m.delay[z]}</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          Livraison standard offerte dès {formatPrice(siteConfig.freeShippingThreshold)} d’achat (après réduction).
        </p>

        <h2 className="mt-12 font-serif text-3xl text-cocoa">Pays proposés dans la démonstration</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(['afrique-ouest', 'afrique-centrale', 'europe'] as const).map((z) => (
            <div key={z} className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-cocoa">
                <MapPin className="h-4 w-4 text-berry" />
                {siteConfig.zones[z]}
              </p>
              <p className="mt-2 text-sm text-muted">
                {siteConfig.countries
                  .filter((c) => c.zone === z)
                  .map((c) => c.name)
                  .join(', ')}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-serif text-3xl text-cocoa">Processus de retour (structure proposée)</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Mail, t: 'Demande', d: 'Contactez le service client avec votre référence de commande.' },
            {
              icon: Package,
              t: 'Vérification',
              d: 'Le produit doit être non porté, non lavé, avec ses protections d’origine.',
            },
            { icon: Truck, t: 'Renvoi', d: 'Modalités et prise en charge des frais à définir.' },
            { icon: PackageCheck, t: 'Remboursement', d: 'Délai et mode de remboursement à préciser.' },
          ].map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="card p-5">
              <span className="text-xs font-bold text-rose">Étape {i + 1}</span>
              <Icon className="mt-3 h-6 w-6 text-berry" />
              <p className="mt-3 font-semibold text-cocoa">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted">
          Pour des raisons d’hygiène, les conditions de retour des produits capillaires portés ou dont la lace a été
          découpée devront être explicitement encadrées dans les CGV définitives.
        </p>

        <h2 className="mb-4 mt-12 font-serif text-3xl text-cocoa">Questions fréquentes</h2>
        <Accordion
          items={faqItems.filter((f) => /livr|retour|délai/i.test(f.q)).map((f) => ({ title: f.q, content: f.a }))}
        />
        <p className="mt-6 text-sm">
          <Link to="/faq" className="link">
            Toutes les questions fréquentes →
          </Link>
        </p>
      </div>
    </>
  );
}

// =================== FAQ ===================
export function FaqPage() {
  useDocumentTitle('Questions fréquentes');
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'FAQ' }]}
        eyebrow="Aide"
        title="Questions fréquentes"
        text="Les réponses aux questions les plus courantes sur nos produits, la commande et la livraison."
      />
      <div className="container-site grid max-w-5xl gap-12 py-12 lg:grid-cols-[1fr_280px]">
        <Accordion items={faqItems.map((f) => ({ title: f.q, content: f.a }))} defaultOpen={0} />
        <aside className="card h-fit p-6">
          <p className="font-serif text-xl text-cocoa">Vous ne trouvez pas votre réponse ?</p>
          <p className="mt-2 text-sm text-muted">Notre équipe vous répond du lundi au samedi.</p>
          <Link to="/contact" className="btn-primary mt-5 w-full">
            Nous contacter
          </Link>
          <Link to="/guide-cheveux" className="btn-outline mt-3 w-full">
            Lire le guide
          </Link>
        </aside>
      </div>
    </>
  );
}

// =================== CONTACT ===================
export function ContactPage() {
  useDocumentTitle('Contact');
  const [f, setF] = useState({ name: '', email: '', subject: '', orderRef: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const set = (k: keyof typeof f, v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (f.name.trim().length < 2) err.name = 'Indiquez votre nom.';
    if (!isValidEmail(f.email)) err.email = 'Adresse email invalide.';
    if (!f.subject) err.subject = 'Choisissez un sujet.';
    if (f.message.trim().length < 15) err.message = 'Votre message doit contenir au moins 15 caractères.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Contact' }]}
        eyebrow="Service client"
        title="Nous contacter"
        text="Une question sur un produit, une commande ou un conseil de style ? Écrivez-nous."
      />
      <div className="container-site grid gap-10 py-12 lg:grid-cols-[1fr_340px]">
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="py-10 text-center" role="status">
              <CheckCircle2 className="mx-auto h-14 w-14 text-berry" />
              <h2 className="mt-4 font-serif text-3xl text-cocoa">Message bien reçu</h2>
              <p className="mx-auto mt-3 max-w-md text-muted">
                Merci {f.name.split(' ')[0]} ! Ceci est une confirmation simulée : aucun email n’a été envoyé dans cette
                démonstration.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setSent(false);
                    setF({ name: '', email: '', subject: '', orderRef: '', message: '' });
                  }}
                >
                  Envoyer un autre message
                </button>
                <Link to="/boutique" className="btn-primary">
                  Retour à la boutique
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Nom"
                autoComplete="name"
                value={f.name}
                onChange={(e) => set('name', e.target.value)}
                error={errors.name}
              />
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                value={f.email}
                onChange={(e) => set('email', e.target.value)}
                error={errors.email}
              />
              <SelectField
                label="Sujet"
                value={f.subject}
                onChange={(e) => set('subject', e.target.value)}
                error={errors.subject}
              >
                <option value="">Choisir…</option>
                <option>Conseil produit</option>
                <option>Ma commande</option>
                <option>Livraison</option>
                <option>Retour</option>
                <option>Autre demande</option>
              </SelectField>
              <TextField
                label="Référence de commande"
                optional
                placeholder="INA-2026-0001"
                value={f.orderRef}
                onChange={(e) => set('orderRef', e.target.value)}
              />
              <TextAreaField
                label="Message"
                value={f.message}
                onChange={(e) => set('message', e.target.value)}
                error={errors.message}
                className="sm:col-span-2"
              />
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">
                  Formulaire de démonstration : aucun message n’est réellement envoyé.
                </p>
                <button type="submit" className="btn-primary" disabled={sending}>
                  {sending ? 'Envoi…' : 'Envoyer le message'}
                </button>
              </div>
            </form>
          )}
        </div>
        <aside className="space-y-4">
          {[
            { icon: Mail, t: 'Email', d: siteConfig.contact.email },
            { icon: Phone, t: 'Téléphone / WhatsApp', d: siteConfig.contact.phone },
            { icon: Clock, t: 'Horaires', d: siteConfig.contact.hours },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="card flex gap-4 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blush text-berry">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-cocoa">{t}</p>
                <p className="select-all text-sm text-muted">{d}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted">Coordonnées de démonstration, à remplacer dans la configuration.</p>
        </aside>
      </div>
    </>
  );
}

// =================== SUIVI DE COMMANDE ===================
const STATUS_STEPS = [
  { label: 'Commande confirmée', minutes: 0 },
  { label: 'En préparation', minutes: 2 },
  { label: 'Expédiée', minutes: 10 },
  { label: 'En cours de livraison', minutes: 30 },
  { label: 'Livrée', minutes: 120 },
];

/** Statut simulé, calculé à partir du temps écoulé depuis la commande. */
export function orderStatus(order: Order) {
  const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  let index = 0;
  STATUS_STEPS.forEach((s, i) => {
    if (elapsed >= s.minutes) index = i;
  });
  return { index, label: STATUS_STEPS[index].label };
}

export function TrackingPage() {
  useDocumentTitle('Suivi de commande');
  const [params, setParams] = useSearchParams();
  const { findOrder, orders } = useAccount();
  const [ref, setRef] = useState(params.get('ref') ?? '');
  const [error, setError] = useState('');
  const current = params.get('ref') ? findOrder(params.get('ref')!) : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^INA-\d{4}-\d{4}$/i.test(ref.trim())) return setError('Format attendu : INA-2026-0001.');
    if (!findOrder(ref)) return setError('Aucune commande avec cette référence dans ce navigateur.');
    setError('');
    setParams({ ref: ref.trim().toUpperCase() });
  };

  const status = current ? orderStatus(current) : null;

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Suivi de commande' }]}
        eyebrow="Service client"
        title="Suivre une commande"
        text="Saisissez la référence reçue lors de votre commande de démonstration."
      />
      <div className="container-site max-w-3xl py-12">
        <form onSubmit={submit} noValidate className="card flex flex-col gap-3 p-6 sm:flex-row sm:items-start">
          <TextField
            label="Référence de commande"
            placeholder="INA-2026-0001"
            value={ref}
            onChange={(e) => {
              setRef(e.target.value);
              setError('');
            }}
            error={error}
            className="flex-1"
          />
          <button type="submit" className="btn-primary sm:mt-[30px]">
            <Search className="h-4 w-4" /> Rechercher
          </button>
        </form>
        {orders.length > 0 && !current && (
          <p className="mt-4 text-sm text-muted">
            Commandes enregistrées dans ce navigateur :{' '}
            {orders.slice(0, 5).map((o, i) => (
              <span key={o.reference}>
                {i > 0 && ', '}
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    setRef(o.reference);
                    setParams({ ref: o.reference });
                  }}
                >
                  {o.reference}
                </button>
              </span>
            ))}
          </p>
        )}
        {orders.length === 0 && (
          <p className="mt-4 text-sm text-muted">
            Aucune commande n’a encore été passée dans ce navigateur.{' '}
            <Link to="/boutique" className="link">
              Passer une commande de démonstration
            </Link>
          </p>
        )}

        {current && status && (
          <div className="card mt-8 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Commande</p>
                <p className="font-serif text-2xl text-cocoa">{current.reference}</p>
                <p className="text-xs text-muted">Passée le {formatDateTime(current.createdAt)}</p>
              </div>
              <span className="rounded-full bg-powder px-4 py-1.5 text-sm font-bold text-berry">{status.label}</span>
            </div>
            <ol className="mt-8 space-y-0">
              {STATUS_STEPS.map((s, i) => {
                const done = i <= status.index;
                return (
                  <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < STATUS_STEPS.length - 1 && (
                      <span
                        className={`absolute left-[11px] top-6 h-full w-0.5 ${i < status.index ? 'bg-berry' : 'bg-line'}`}
                        aria-hidden
                      />
                    )}
                    <span
                      className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? 'bg-berry text-white' : 'bg-white ring-2 ring-line'}`}
                    >
                      {done && <CheckCircle2 className="h-4 w-4" />}
                    </span>
                    <span className={`text-sm ${done ? 'font-semibold text-cocoa' : 'text-muted'}`}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 text-xs text-muted">
              Statut simulé : il évolue automatiquement avec le temps écoulé depuis la commande (démonstration).
            </p>
            <div className="mt-6 border-t border-line pt-6">
              <OrderSummary order={current} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// =================== PAGES LÉGALES (modèles) ===================
const LEGAL = {
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      {
        h: 'Éditeur du site',
        p: 'Raison sociale : [à compléter]. Forme juridique et capital : [à compléter]. Siège social : [à compléter]. Numéro d’immatriculation : [à compléter]. Directeur·rice de la publication : [à compléter].',
      },
      {
        h: 'Contact',
        p: 'Email et téléphone de contact : [à compléter]. Les coordonnées affichées sur ce prototype sont fictives.',
      },
      { h: 'Hébergement', p: 'Nom, adresse et coordonnées de l’hébergeur : [à compléter].' },
      {
        h: 'Propriété intellectuelle',
        p: 'Les contenus (textes, logo, éléments graphiques) sont la propriété d’Inahair ou de leurs auteurs respectifs. Les photographies de ce prototype sont des visuels d’illustration issus d’Unsplash et seront remplacées par les visuels officiels.',
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    sections: [
      {
        h: 'Dans ce prototype',
        p: 'Aucune donnée n’est transmise à un serveur. Le panier, les favoris, le compte fictif et les commandes simulées sont stockés uniquement dans le localStorage de votre navigateur. Vous pouvez les effacer à tout moment en vidant les données du site.',
      },
      { h: 'Responsable du traitement', p: '[à compléter avant mise en ligne].' },
      {
        h: 'Données collectées et finalités',
        p: '[à compléter] : gestion des commandes, service client, newsletter (avec consentement), mesure d’audience éventuelle.',
      },
      { h: 'Durées de conservation', p: '[à compléter selon la réglementation applicable].' },
      {
        h: 'Vos droits',
        p: 'Accès, rectification, effacement, opposition, portabilité : modalités d’exercice [à compléter].',
      },
    ],
  },
  cgv: {
    title: 'Conditions générales de vente',
    sections: [
      {
        h: 'Objet',
        p: 'Les présentes conditions régissent les ventes réalisées sur la boutique Inahair. [Modèle à rédiger et valider par un professionnel du droit.]',
      },
      {
        h: 'Prix',
        p: 'Les prix affichés dans ce prototype sont des données de démonstration et ne constituent pas une offre commerciale.',
      },
      {
        h: 'Commande et paiement',
        p: 'Processus de commande, moyens de paiement acceptés et sécurisation : [à compléter]. Aucun paiement n’est effectué dans ce prototype.',
      },
      {
        h: 'Livraison',
        p: 'Zones, délais et frais : [à compléter]. Voir la page Livraison & retours pour la structure proposée.',
      },
      {
        h: 'Droit de rétractation et retours',
        p: 'Conditions applicables aux produits capillaires (hygiène, produits personnalisés) : [à compléter selon le droit applicable dans chaque pays de vente].',
      },
      { h: 'Litiges', p: 'Droit applicable, médiation et juridiction compétente : [à compléter].' },
    ],
  },
} as const;

export function LegalPage({ page }: { page: keyof typeof LEGAL }) {
  const data = LEGAL[page];
  useDocumentTitle(data.title);
  return (
    <>
      <PageHeader crumbs={[{ label: data.title }]} eyebrow="Informations" title={data.title} />
      <div className="container-site max-w-3xl py-12">
        <DemoNotice tone="warning">
          Document modèle à compléter et à faire valider avant toute mise en ligne. Aucune mention ci-dessous n’a de
          valeur juridique.
        </DemoNotice>
        <div className="mt-10 space-y-8">
          {data.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-serif text-2xl text-cocoa">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-muted">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm">
          Autres documents :{' '}
          {(Object.keys(LEGAL) as Array<keyof typeof LEGAL>)
            .filter((k) => k !== page)
            .map((k, i) => (
              <span key={k}>
                {i > 0 && ' · '}
                <Link to={`/${k}`} className="link">
                  {LEGAL[k].title}
                </Link>
              </span>
            ))}
        </p>
      </div>
    </>
  );
}
