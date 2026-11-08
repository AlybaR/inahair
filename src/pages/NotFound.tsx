import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { useDocumentTitle } from '../components/ui';

export default function NotFound() {
  useDocumentTitle('Page introuvable');
  return (
    <section className="container-site flex flex-col items-center py-20 text-center">
      <p className="font-serif text-[7rem] leading-none text-powder sm:text-[9rem]">404</p>
      <h1 className="-mt-6 font-serif text-3xl text-cocoa sm:text-4xl">Cette page s’est fait la belle</h1>
      <p className="mt-4 max-w-md text-muted">
        Le lien est peut-être erroné, ou la page n’existe plus. Retrouvez votre chemin grâce à la recherche ou à nos
        collections.
      </p>
      <div className="mt-8 w-full max-w-lg">
        <SearchBar />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/boutique" className="btn-primary">
          Retour à la boutique
        </Link>
        <Link to="/" className="btn-outline">
          Page d’accueil
        </Link>
      </div>
    </section>
  );
}
