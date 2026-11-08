import { Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { buildCheckoutLink, isWooReady } from '../lib/woocommerce';
import { useCart } from '../store/cart';

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="container-site grid min-h-[50vh] place-items-center py-16 text-center">
      <div className="max-w-md">
        <ShieldCheck className="mx-auto h-10 w-10 text-berry" strokeWidth={1.5} />
        <h1 className="mt-4 font-serif text-3xl text-cocoa">{title}</h1>
        <div className="mt-3 text-muted">{children}</div>
      </div>
    </section>
  );
}

/** /commande en mode boutique réelle : envoie le panier vers la page de paiement WooCommerce. */
export function WooCheckout() {
  const { totals, promo } = useCart();
  const link = useMemo(
    () =>
      isWooReady()
        ? buildCheckoutLink(
            totals.lines.map((l) => ({ product: l.product, selections: l.line.selections, quantity: l.line.quantity })),
            promo?.code,
          )
        : null,
    [totals.lines, promo],
  );

  useEffect(() => {
    document.title = 'Paiement sécurisé | Inahair';
    if (link) window.location.assign(link);
  }, [link]);

  if (!totals.lines.length) return <Navigate to="/panier" replace />;

  if (!link) {
    return (
      <Panel title="Paiement momentanément indisponible">
        <p>
          {isWooReady()
            ? 'Un article de votre panier n’est plus disponible dans cette configuration. Vérifiez votre panier avant de recommencer.'
            : 'La boutique ne répond pas pour le moment. Votre panier est conservé : réessayez dans quelques instants.'}
        </p>
        <Link to="/panier" className="btn-primary mt-6">
          Retour au panier
        </Link>
      </Panel>
    );
  }

  return (
    <Panel title="Redirection vers le paiement sécurisé…">
      <p className="flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Votre panier est transmis à notre page de paiement.
      </p>
      <a href={link} className="link mt-4 inline-block">
        Continuer si rien ne se passe
      </a>
    </Panel>
  );
}

/** Redirige vers une page de la boutique WooCommerce (compte client, commandes…). */
export function ExternalRedirect({ to, title }: { to: string; title: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return (
    <Panel title={title}>
      <p className="flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Redirection en cours…
      </p>
      <a href={to} className="link mt-4 inline-block">
        Continuer si rien ne se passe
      </a>
    </Panel>
  );
}
