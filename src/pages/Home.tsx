import { ArrowRight, Gem, HeartHandshake, MousePointerClick, Quote, Truck } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { ProductGrid } from '../components/product/ProductCard';
import { Rating, SmartImage, useDocumentTitle } from '../components/ui';
import { guideTeasers, testimonials } from '../data/content';
import { products } from '../data/products';
import { img } from '../lib/assets';
import { isNew } from '../lib/catalog';

function SectionHead({ eyebrow, title, to, cta }: { eyebrow: string; title: string; to?: string; cta?: string }) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title mt-2">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="group inline-flex items-center gap-2 text-sm font-semibold text-berry">
          {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

const reassurance = [
  { icon: Truck, title: 'Livraison Afrique & Europe', text: 'Expédition suivie vers de nombreux pays' },
  { icon: MousePointerClick, title: 'Commande simplifiée', text: 'Un parcours clair, en quelques étapes' },
  { icon: Gem, title: 'Sélection premium', text: 'Des pièces choisies avec exigence' },
  { icon: HeartHandshake, title: 'Accompagnement client', text: 'Des conseils pour bien choisir' },
];

export default function Home() {
  useDocumentTitle('', 'Inahair : perruques, tissages et accessoires capillaires premium.');
  const bestSellers = useMemo(() => [...products].sort((a, b) => a.salesRank - b.salesRank).slice(0, 4), []);
  const newest = useMemo(
    () =>
      products
        .filter(isNew)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 4),
    [],
  );

  return (
    <>
      <HeroCarousel />

      {/* Réassurance */}
      <section aria-label="Nos engagements" className="border-b border-line bg-cream">
        <div className="container-site grid grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4">
          {reassurance.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush text-berry">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-cocoa">{title}</p>
                <p className="hidden text-xs text-muted sm:block">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Catégories */}
      <section className="container-site py-16 sm:py-20" aria-labelledby="cats-title">
        <h2 id="cats-title" className="sr-only">
          Nos catégories
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: 'Perruques',
              text: 'Lace, Glueless, Bob, Curly, Body Wave…',
              cta: 'Voir les perruques',
              to: '/perruques',
              image: img('model-straight-casual'),
              pos: 'center 20%',
            },
            {
              title: 'Boules de tissage',
              text: 'Straight, Body Wave, Deep Wave, Curly…',
              cta: 'Voir les tissages',
              to: '/tissages',
              image: img('bundles-colors'),
              pos: 'center 35%',
            },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative grid min-h-[300px] overflow-hidden rounded-[1.75rem] bg-powder sm:grid-cols-2"
            >
              <div className="relative z-10 flex flex-col justify-center p-8 sm:p-10">
                <p className="eyebrow">Collection</p>
                <h3 className="mt-2 font-serif text-3xl text-cocoa lg:text-4xl">{c.title}</h3>
                <p className="mt-3 text-sm text-muted">{c.text}</p>
                <span className="btn-primary mt-6 self-start">{c.cta}</span>
              </div>
              <div className="relative min-h-[260px] overflow-hidden">
                <SmartImage
                  src={c.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  style={{ objectPosition: c.pos }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Meilleures ventes */}
      <section className="container-site pb-20" aria-labelledby="best-title">
        <SectionHead
          eyebrow="Plébiscitées"
          title="Nos meilleures ventes"
          to="/boutique?tri=meilleures-ventes"
          cta="Tout voir"
        />
        <span id="best-title" className="sr-only">
          Nos meilleures ventes
        </span>
        <ProductGrid products={bestSellers} />
      </section>

      {/* Bannière éditoriale */}
      <section className="bg-cocoa" aria-labelledby="editorial-title">
        <div className="container-site grid items-center gap-10 py-16 md:grid-cols-2 md:py-0">
          <div className="relative order-2 md:order-1 md:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-powder/80">Collection signature</p>
            <h2 id="editorial-title" className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl">
              Votre style.
              <br />
              <span className="italic text-powder">Votre couronne.</span>
            </h2>
            <p className="mt-5 max-w-md text-white/70">
              Des textures choisies pour célébrer toutes les beautés, du lissé le plus net aux boucles les plus libres.
              Chaque pièce est pensée pour se porter avec assurance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/nouveautes" className="btn-light px-8">
                Découvrir la collection
              </Link>
              <Link to="/a-propos" className="btn border border-white/30 text-white hover:bg-white/10">
                Notre univers
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[1.75rem] md:my-12">
              <SmartImage
                src={img('model-ponytail')}
                alt="Profil d’une femme coiffée d’une longue queue de cheval lisse"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      <section className="container-site py-20" aria-label="Nouveautés">
        <SectionHead eyebrow="Fraîchement arrivées" title="Nouveautés" to="/nouveautes" cta="Toutes les nouveautés" />
        <ProductGrid products={newest} />
      </section>

      {/* Guide */}
      <section className="bg-blush py-20" aria-label="Guide capillaire">
        <div className="container-site">
          <SectionHead
            eyebrow="Guide capillaire"
            title="Bien choisir, bien entretenir"
            to="/guide-cheveux"
            cta="Lire le guide complet"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {guideTeasers.map((g) => (
              <Link
                key={g.title}
                to={g.to}
                className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <SmartImage
                    src={g.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl text-cocoa">{g.title}</h3>
                  <p className="mt-2 text-sm text-muted">{g.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-berry">
                    Lire la rubrique <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="container-site py-20" aria-labelledby="reviews-title">
        <div className="mb-10 text-center">
          <p className="eyebrow">Elles en parlent</p>
          <h2 id="reviews-title" className="section-title mt-2">
            Avis clientes
          </h2>
          <p className="mt-2 text-xs text-muted">Témoignages fictifs fournis à titre de démonstration.</p>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {testimonials.map((t) => (
            <figure key={t.id} className="card flex w-[82%] shrink-0 snap-center flex-col p-6 sm:w-[45%] lg:w-auto">
              <Quote className="h-7 w-7 text-powder" fill="#F8E4E9" aria-hidden />
              <Rating value={t.rating} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-cocoa">« {t.text} »</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-powder font-serif text-berry">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-cocoa">
                    {t.name} · {t.city}
                  </span>
                  <span className="block text-xs text-muted">{t.product}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
