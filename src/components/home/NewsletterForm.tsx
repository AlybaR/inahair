import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { siteConfig } from '../../config/site';
import { isValidEmail } from '../../lib/format';
import { readStorage, writeStorage } from '../../lib/storage';

/** Inscription simulée : l'email est seulement mémorisé dans ce navigateur. */
export function NewsletterForm() {
  const key = siteConfig.storageKeys.newsletter;
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError('Veuillez saisir une adresse email valide.');
    if (!consent) return setError('Merci de cocher la case de consentement.');
    const list = readStorage<string[]>(key, []);
    const already = list.includes(email.toLowerCase());
    if (!already) writeStorage(key, [...list, email.toLowerCase()]);
    setDone(
      already
        ? 'Vous êtes déjà inscrite à la newsletter (démonstration).'
        : 'Merci ! Votre inscription est confirmée (simulation, aucun email ne sera envoyé).',
    );
    setError('');
    setEmail('');
  };

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-card" role="status">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-berry" />
        <div>
          <p className="font-semibold text-cocoa">Bienvenue dans l’univers Inahair</p>
          <p className="mt-1 text-sm text-muted">{done}</p>
          <button
            type="button"
            className="mt-3 text-xs font-semibold text-berry hover:underline"
            onClick={() => setDone(null)}
          >
            Inscrire une autre adresse
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Adresse email
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          className={`input h-12 flex-1 !rounded-full !px-5 ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? 'newsletter-error' : undefined}
        />
        <button type="submit" className="btn-primary h-12 shrink-0">
          Je m’inscris
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-berry"
        />
        J’accepte de recevoir les actualités d’Inahair. Désinscription possible à tout moment.
      </label>
      {error && (
        <p id="newsletter-error" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
