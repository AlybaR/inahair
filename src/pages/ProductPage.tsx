import { AlertCircle, Check, PackageX, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductBadges, PriceTag, ProductGrid, WishlistButton } from '../components/product/ProductCard';
import { ProductGallery, ProductVariants } from '../components/product/ProductDetail';
import { Breadcrumb, EmptyState, Modal, QuantityInput, Rating, Tabs, useDocumentTitle } from '../components/ui';
import { siteConfig } from '../config/site';
import { categoryLabels, categoryPaths } from '../data/catalog';
import { getProductBySlug, products } from '../data/products';
import type { OptionKey, Product, Selections } from '../data/types';
import { formatPrice } from '../lib/format';
import {
  defaultSelections,
  getRegularPrice,
  getUnitPrice,
  isCombinationUnavailable,
  isSelectionAvailable,
} from '../lib/pricing';
import { useCart } from '../store/cart';
import { useUI } from '../store/ui';
import { LengthGuide } from './Guide';

const DEMO_REVIEWS = [
  { name: 'Mariam S.', rating: 5, text: 'Très belle qualité visuelle, la pose a été facile et le rendu naturel.' },
  {
    name: 'Christelle A.',
    rating: 5,
    text: 'Conforme à la description, j’ai suivi le guide des longueurs et c’était parfait.',
  },
  {
    name: 'Awa N.',
    rating: 4,
    text: 'Très satisfaite. Il faut juste prendre le temps de bien coiffer à la première utilisation.',
  },
];

export default function ProductPage() {
  const { slug = '' } = useParams();
  const product = getProductBySlug(slug);
  if (!product) {
    return (
      <EmptyState
        icon={<PackageX className="h-8 w-8" />}
        title="Produit introuvable"
        text="Ce produit n’existe pas ou n’est plus disponible dans la démonstration."
      >
        <Link to="/boutique" className="btn-primary">
          Retour à la boutique
        </Link>
      </EmptyState>
    );
  }
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }: { product: Product }) {
  useDocumentTitle(product.name, product.shortDescription);
  const [selections, setSelections] = useState<Selections>(() => defaultSelections(product));
  const [quantity, setQuantity] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const { addItem, maxQty } = useCart();
  const { notify, openCart } = useUI();

  const unit = getUnitPrice(product, selections);
  const regular = getRegularPrice(product, selections);
  const available = isSelectionAvailable(product, selections);
  const comboBlocked = isCombinationUnavailable(product, selections);
  const isBundle = product.category === 'tissages';

  useEffect(() => {
    setQuantity(1);
  }, [product.id]);

  const onChange = (key: OptionKey, value: string) => setSelections((s) => ({ ...s, [key]: value }));

  const add = () => {
    const res = addItem(product.id, selections, quantity);
    if (!res.ok) return notify({ message: res.message, tone: 'error' });
    notify({
      message: `${product.name} ajouté au panier${quantity > 1 ? ` (×${quantity})` : ''}`,
      tone: 'success',
      link: { label: 'Panier', to: '/panier' },
    });
    openCart();
  };

  const related = useMemo(
    () => (product.related ?? []).map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p),
    [product],
  );
  const similar = useMemo(
    () =>
      products
        .filter((p) => p.id !== product.id && p.category === product.category && !related.some((r) => r.id === p.id))
        .sort(
          (a, b) =>
            (a.texture === product.texture ? -1 : 0) - (b.texture === product.texture ? -1 : 0) ||
            a.featuredRank - b.featuredRank,
        )
        .slice(0, 4),
    [product, related],
  );

  const stockLabel = {
    in_stock: { text: 'En stock', cls: 'text-emerald-700', dot: 'bg-emerald-500' },
    low_stock: { text: 'Stock limité', cls: 'text-amber-700', dot: 'bg-amber-500' },
    out_of_stock: { text: 'Épuisé temporairement', cls: 'text-muted', dot: 'bg-muted' },
  }[product.stock];

  return (
    <>
      <div className="container-site pb-16 pt-6">
        <Breadcrumb
          items={[
            { label: categoryLabels[product.category], to: categoryPaths[product.category] },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="relative">
            <ProductGallery product={product} />
            <div className="pointer-events-none absolute left-3 top-3 lg:left-[6.5rem]">
              <ProductBadges product={product} />
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow">
              {product.type}
              {product.texture && product.category !== 'accessoires' ? ` · ${product.texture}` : ''}
            </p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="font-serif text-3xl leading-tight text-cocoa sm:text-4xl">{product.name}</h1>
              <WishlistButton product={product} className="mt-1 shrink-0 ring-1 ring-line" />
            </div>
            {product.rating && (
              <a
                href="#avis"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('avis')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-3 inline-block"
              >
                <Rating value={product.rating} count={product.reviewCount} size="md" />
              </a>
            )}
            <div className="mt-5" aria-live="polite">
              <PriceTag price={unit} regular={regular} size="lg" />
              {product.discountPercent && (
                <p className="mt-1 text-xs font-semibold text-berry">
                  Économisez {formatPrice(regular - unit)} (-{product.discountPercent} %)
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                Prix TTC de démonstration{isBundle ? ', par boule de 100 g' : ''}.
              </p>
            </div>
            <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${stockLabel.cls}`}>
              <span className={`h-2 w-2 rounded-full ${stockLabel.dot}`} /> {stockLabel.text}{' '}
              <span className="font-normal text-muted">(disponibilité fictive)</span>
            </p>
            <p className="mt-5 leading-relaxed text-muted">{product.shortDescription}</p>

            <div className="mt-8">
              <ProductVariants
                product={product}
                selections={selections}
                onChange={onChange}
                onGuide={product.options.some((o) => o.key === 'length') ? () => setGuideOpen(true) : undefined}
              />
            </div>

            {comboBlocked && (
              <p
                className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" /> Cette combinaison est momentanément indisponible. Modifiez
                la longueur ou une autre option.
              </p>
            )}

            <div className="mt-8">
              <p className="label">{isBundle ? 'Nombre de boules' : 'Quantité'}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <QuantityInput
                  value={quantity}
                  onChange={setQuantity}
                  max={maxQty}
                  label={isBundle ? 'Nombre de boules' : 'Quantité'}
                />
                <button type="button" onClick={add} disabled={!available} className="btn-primary h-12 flex-1">
                  <ShoppingBag className="h-4 w-4" />
                  {product.stock === 'out_of_stock'
                    ? 'Épuisé'
                    : available
                      ? `Ajouter au panier · ${formatPrice(unit * quantity)}`
                      : 'Indisponible'}
                </button>
              </div>
              {isBundle && (
                <p className="mt-3 text-xs text-muted">
                  Conseil : 3 boules pour une tête complète jusqu’à 20", 4 au-delà (repère indicatif).
                </p>
              )}
            </div>

            <ul className="mt-8 grid gap-3 rounded-2xl bg-blush p-5 text-sm sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-berry" /> Livraison Afrique & Europe
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-berry" /> Paiement simulé
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-berry" />{' '}
                <Link to="/livraison-retours" className="hover:text-berry">
                  Retours : voir conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20" id="details">
          <Tabs
            tabs={[
              {
                id: 'description',
                label: 'Description',
                content: (
                  <div className="max-w-3xl space-y-4 leading-relaxed text-muted">
                    {product.description.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    <p className="text-xs">
                      Visuels d’illustration : la teinte peut varier selon l’écran et l’option choisie.
                    </p>
                  </div>
                ),
              },
              {
                id: 'caracteristiques',
                label: 'Caractéristiques',
                content: (
                  <dl className="grid max-w-3xl overflow-hidden rounded-2xl ring-1 ring-line sm:grid-cols-2">
                    {product.features.map((f) => (
                      <div
                        key={f.label}
                        className="flex justify-between gap-4 border-b border-line bg-white px-5 py-4 text-sm odd:bg-cream"
                      >
                        <dt className="font-semibold text-cocoa">{f.label}</dt>
                        <dd className="text-right text-muted">{f.value}</dd>
                      </div>
                    ))}
                    <div className="px-5 py-3 text-xs text-muted sm:col-span-2">
                      Caractéristiques de démonstration, à vérifier avant commercialisation.
                    </div>
                  </dl>
                ),
              },
              {
                id: 'entretien',
                label: 'Conseils d’entretien',
                content: (
                  <ul className="max-w-3xl space-y-3">
                    {product.care.map((c) => (
                      <li key={c} className="flex gap-3 text-sm text-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-berry" />
                        {c}
                      </li>
                    ))}
                    <li>
                      <Link to="/guide-cheveux#entretien" className="link text-sm">
                        Tous nos conseils d’entretien →
                      </Link>
                    </li>
                  </ul>
                ),
              },
              {
                id: 'livraison',
                label: 'Livraison & retours',
                content: (
                  <div className="max-w-3xl space-y-3 text-sm text-muted">
                    <ul className="space-y-2">
                      {siteConfig.shippingMethods.map((m) => (
                        <li key={m.id}>
                          <span className="font-semibold text-cocoa">{m.label}</span> — à partir de{' '}
                          {formatPrice(Math.min(...Object.values(m.rates).filter((r): r is number => r != null)))}
                        </li>
                      ))}
                    </ul>
                    <p>
                      Livraison standard offerte dès {formatPrice(siteConfig.freeShippingThreshold)} d’achat (condition
                      fictive).
                    </p>
                    <p>
                      Tarifs et délais indicatifs de démonstration.{' '}
                      <Link to="/livraison-retours" className="link">
                        Voir le détail
                      </Link>
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <section id="avis" className="mt-20" aria-labelledby="avis-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="avis-title" className="section-title">
                Avis clientes
              </h2>
              <p className="mt-1 text-xs text-muted">Avis fictifs fournis pour la démonstration.</p>
            </div>
            {product.rating && (
              <div className="flex items-center gap-3">
                <span className="font-serif text-4xl text-berry">{product.rating.toFixed(1)}</span>
                <Rating value={product.rating} count={product.reviewCount} size="md" />
              </div>
            )}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {DEMO_REVIEWS.map((r) => (
              <figure key={r.name} className="card p-6">
                <Rating value={r.rating} />
                <blockquote className="mt-3 text-sm leading-relaxed text-cocoa">« {r.text} »</blockquote>
                <figcaption className="mt-4 text-xs font-semibold text-muted">
                  {r.name} · Achat de démonstration
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="bg-blush py-16" aria-labelledby="related-title">
          <div className="container-site">
            <h2 id="related-title" className="section-title mb-8">
              Complétez votre look
            </h2>
            <ProductGrid products={related.slice(0, 4)} />
          </div>
        </section>
      )}
      {similar.length > 0 && (
        <section className="container-site py-16" aria-labelledby="similar-title">
          <h2 id="similar-title" className="section-title mb-8">
            Vous aimerez aussi
          </h2>
          <ProductGrid products={similar} />
        </section>
      )}

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Guide des longueurs">
        <div className="p-6 sm:p-10">
          <h2 className="font-serif text-2xl text-cocoa">Guide des longueurs</h2>
          <p className="mt-2 text-sm text-muted">
            Longueurs mesurées cheveux tendus. 1 pouce ≈ 2,5 cm. Les textures bouclées paraissent plus courtes.
          </p>
          <div className="mt-6">
            <LengthGuide />
          </div>
          <Link
            to="/guide-cheveux#longueur"
            className="link mt-6 inline-block text-sm"
            onClick={() => setGuideOpen(false)}
          >
            Ouvrir le guide complet →
          </Link>
        </div>
      </Modal>
    </>
  );
}
