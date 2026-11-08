import { Mail, Phone, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { NewsletterForm } from '../home/NewsletterForm';
import { Logo } from '../ui';

const columns = [
  {
    title: 'Collections',
    links: [
      { label: 'Perruques', to: '/perruques' },
      { label: 'Boules de tissage', to: '/tissages' },
      { label: 'Accessoires', to: '/accessoires' },
      { label: 'Nouveautés', to: '/nouveautes' },
      { label: 'Promotions', to: '/promotions' },
    ],
  },
  {
    title: 'Aide & service client',
    links: [
      { label: 'Guide capillaire', to: '/guide-cheveux' },
      { label: 'Questions fréquentes', to: '/faq' },
      { label: 'Livraison & retours', to: '/livraison-retours' },
      { label: 'Suivi de commande', to: '/suivi-commande' },
      { label: 'Nous contacter', to: '/contact' },
    ],
  },
  {
    title: 'Informations',
    links: [
      { label: 'À propos d’Inahair', to: '/a-propos' },
      { label: 'Mon compte', to: '/compte' },
      { label: 'Mentions légales', to: '/mentions-legales' },
      { label: 'Confidentialité', to: '/confidentialite' },
      { label: 'Conditions générales de vente', to: '/cgv' },
    ],
  },
];

export function Footer() {
  const socials = siteConfig.socials;
  const configured = socials.filter((s) => s.url);
  return (
    <footer className="mt-auto bg-cocoa text-white/80">
      <div className="bg-blush text-cocoa">
        <div className="container-site grid items-center gap-8 py-14 md:grid-cols-2">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Entrez dans l’univers Inahair</h2>
            <p className="mt-3 max-w-md text-sm text-muted">
              Nouveautés, conseils d’entretien et offres réservées : recevez le meilleur d’Inahair, sans excès.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">{siteConfig.brand.description}</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-powder" /> {siteConfig.contact.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-powder" /> {siteConfig.contact.phone}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-powder" /> {siteConfig.contact.hours}
            </li>
          </ul>
          {siteConfig.contact.isDemo && (
            <p className="mt-3 text-[11px] uppercase tracking-wider text-white/40">Coordonnées de démonstration</p>
          )}
        </div>
        {columns.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white">{col.title}</p>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-powder">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="lg:col-span-2">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white">Réseaux sociaux</p>
          {configured.length ? (
            <ul className="space-y-2.5 text-sm">
              {configured.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-powder">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm">
              <ul className="space-y-2.5">
                {socials.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-white/50">
                    {s.label}{' '}
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      bientôt
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-white/40">Comptes non encore configurés.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Inahair. Maquette de démonstration : aucune transaction réelle.</p>
          <p>Paiements simulés · Données fictives · Visuels d’illustration (Unsplash)</p>
        </div>
      </div>
    </footer>
  );
}
