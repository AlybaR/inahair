import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../data/types';
import { isNew, isOnSale } from '../../lib/catalog';
import { formatPrice } from '../../lib/format';
import { defaultSelections, getFromPrice, hasMultiplePrices } from '../../lib/pricing';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { useWishlist } from '../../store/wishlist';
import { Rating, SmartImage } from '../ui';

export function PriceTag({
  price,
  regular,
  from = false,
  size = 'md',
}: {
  price: number;
  regular?: number;
  from?: boolean;
  size?: 'md' | 'lg';
}) {
  const onSale = regular != null && regular > price;
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      {from && <span className="text-xs text-muted">À partir de</span>}
      <span
        className={`font-bold ${onSale ? 'text-berry' : 'text-cocoa'} ${size === 'lg' ? 'text-2xl' : 'text-[15px]'}`}
      >
        {formatPrice(price)}
      </span>
      {onSale && (
        <span className={`text-muted line-through ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
          <span className="sr-only">Prix initial : </span>
          {formatPrice(regular!)}
        </span>
      )}
    </div>
  );
}

export function WishlistButton({ product, className = '' }: { product: Product; className?: string }) {
  const { has, toggle } = useWishlist();
  const { notify } = useUI();
  const active = has(product.id);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(product.id);
        notify({
          message: added ? 'Ajouté à vos favoris' : 'Retiré de vos favoris',
          tone: added ? 'success' : 'info',
          link: added ? { label: 'Voir', to: '/favoris' } : undefined,
        });
      }}
      className={`grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-card transition hover:scale-105 ${className}`}
    >
      <Heart className={`h-[18px] w-[18px] transition ${active ? 'fill-berry text-berry' : 'text-cocoa'}`} />
    </button>
  );
}

export function ProductBadges({ product }: { product: Product }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {isOnSale(product) && (
        <span className="rounded-full bg-berry px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          -{product.discountPercent} %
        </span>
      )}
      {isNew(product) && (
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-berry shadow-card">
          Nouveau
        </span>
      )}
      {product.tags.includes('best-seller') && (
        <span className="rounded-full bg-cocoa px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Best-seller
        </span>
      )}
      {product.tags.includes('exclusif') && (
        <span className="rounded-full bg-powder px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-berry">
          Exclusif
        </span>
      )}
      {product.stock === 'out_of_stock' && (
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Épuisé
        </span>
      )}
    </div>
  );
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { price, regular } = getFromPrice(product);
  const { addItem } = useCart();
  const { notify, openCart } = useUI();
  const needsChoice = product.options.some((o) => o.values.length > 1);
  const url = `/produit/${product.slug}`;
  const soldOut = product.stock === 'out_of_stock';

  const quickAdd = () => {
    const res = addItem(product.id, defaultSelections(product), 1);
    notify({ message: res.ok ? `${product.name} ajouté au panier` : res.message, tone: res.ok ? 'success' : 'error' });
    if (res.ok) openCart();
  };

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-powder">
        <Link to={url} className="block aspect-[4/5]" aria-label={product.name}>
          <SmartImage
            src={product.images[0]}
            alt={product.imageAlt}
            loading={priority ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
          {product.images[1] && (
            <SmartImage
              src={product.images[1]}
              alt=""
              aria-hidden
              className="absolute inset-0 hidden h-full w-full object-cover !opacity-0 transition duration-500 group-hover:!opacity-100 md:block"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3">
          <ProductBadges product={product} />
        </div>
        <WishlistButton product={product} className="absolute right-3 top-3 z-10" />
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          {needsChoice || soldOut ? (
            <Link
              to={url}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-white/95 text-sm font-semibold text-cocoa shadow-soft backdrop-blur hover:bg-white"
            >
              <Eye className="h-4 w-4" /> {soldOut ? 'Voir le produit' : 'Choisir mes options'}
            </Link>
          ) : (
            <button
              type="button"
              onClick={quickAdd}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-berry text-sm font-semibold text-white shadow-soft hover:bg-berry-dark"
            >
              <ShoppingBag className="h-4 w-4" /> Ajouter au panier
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {product.type}
          {product.texture && product.category !== 'accessoires' ? ` · ${product.texture}` : ''}
        </p>
        <h3 className="text-[15px] font-semibold leading-snug text-cocoa">
          <Link to={url} className="after:absolute after:inset-0 after:content-[''] hover:text-berry md:after:hidden">
            {product.name}
          </Link>
        </h3>
        {product.rating && (
          <div className="mt-1.5">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>
        )}
        <div className="mt-2">
          <PriceTag price={price} regular={regular} from={hasMultiplePrices(product)} />
        </div>
        <div className="relative z-10 mt-3 md:hidden">
          <Link to={url} className="btn-outline w-full !py-2 text-xs">
            {soldOut ? 'Voir le produit' : 'Voir les détails'}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, cols = 4 }: { products: Product[]; cols?: 3 | 4 }) {
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 ${cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}

export function EmptyHeart() {
  return <Heart className="h-8 w-8" />;
}
