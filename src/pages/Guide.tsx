import { Link } from 'react-router-dom';
import { PageHeader, SmartImage, useDocumentTitle } from '../components/ui';
import { img } from '../lib/assets';

const LENGTHS = [
  { inch: 10, zone: 'Menton', note: 'Carré court, bob' },
  { inch: 12, zone: 'Sous le menton', note: 'Carré plongeant' },
  { inch: 14, zone: 'Épaules', note: 'Mi-long, très facile à porter' },
  { inch: 16, zone: 'Sous les épaules', note: 'Polyvalent' },
  { inch: 18, zone: 'Haut du dos', note: 'Le plus demandé' },
  { inch: 20, zone: 'Omoplates', note: 'Long et naturel' },
  { inch: 22, zone: 'Milieu du dos', note: 'Effet glamour' },
  { inch: 24, zone: 'Bas du dos', note: 'Très long' },
  { inch: 26, zone: 'Taille', note: 'Spectaculaire' },
];

/** Guide visuel des longueurs (réutilisé dans la fiche produit). */
export function LengthGuide() {
  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <div className="relative mx-auto h-[300px] w-[180px]" aria-hidden>
        <svg viewBox="0 0 180 300" className="h-full w-full">
          <circle cx="90" cy="40" r="26" fill="#F8E4E9" stroke="#CF4774" strokeWidth="1.5" />
          <path d="M60 80 Q90 66 120 80 L132 210 Q90 222 48 210 Z" fill="#FFF0F3" stroke="#CF4774" strokeWidth="1.5" />
          {LENGTHS.map((l, i) => {
            const y = 58 + i * 26;
            return (
              <g key={l.inch}>
                <line
                  x1="20"
                  x2="160"
                  y1={y}
                  y2={y}
                  stroke="#A7194A"
                  strokeOpacity={0.25 + i * 0.07}
                  strokeDasharray="3 3"
                />
                <text x="164" y={y + 4} fontSize="10" fill="#A7194A" fontFamily="Manrope, sans-serif">
                  {l.inch}"
                </text>
              </g>
            );
          })}
          <path d="M66 34 C 40 60, 44 120, 40 250" fill="none" stroke="#321A22" strokeWidth="2" opacity=".5" />
          <path d="M114 34 C 140 60, 136 120, 140 250" fill="none" stroke="#321A22" strokeWidth="2" opacity=".5" />
        </svg>
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-line">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Correspondance des longueurs</caption>
          <thead className="bg-blush text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Longueur</th>
              <th className="px-4 py-3">≈ cm</th>
              <th className="px-4 py-3">Tombe au niveau</th>
              <th className="hidden px-4 py-3 sm:table-cell">Style</th>
            </tr>
          </thead>
          <tbody>
            {LENGTHS.map((l) => (
              <tr key={l.inch} className="border-t border-line bg-white">
                <td className="px-4 py-2.5 font-semibold text-berry">{l.inch}"</td>
                <td className="px-4 py-2.5 text-muted">{Math.round(l.inch * 2.54)} cm</td>
                <td className="px-4 py-2.5 text-cocoa">{l.zone}</td>
                <td className="hidden px-4 py-2.5 text-muted sm:table-cell">{l.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: 'perruque-ou-tissage', label: 'Perruque ou tissage ?' },
  { id: 'longueur', label: 'Choisir sa longueur' },
  { id: 'textures', label: 'Les textures' },
  { id: 'perruque', label: 'Comprendre les laces' },
  { id: 'densite', label: 'Choisir une densité' },
  { id: 'entretien', label: 'Conseils d’entretien' },
];

export default function Guide() {
  useDocumentTitle(
    'Guide capillaire',
    'Perruque ou tissage, longueurs, textures, laces, densité et entretien : le guide Inahair.',
  );
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Guide capillaire' }]}
        eyebrow="Conseils Inahair"
        title="Le guide capillaire"
        text="Tout ce qu’il faut savoir pour choisir la perruque ou le tissage qui vous ressemble, et en prendre soin."
      />
      <div className="container-site grid gap-12 py-14 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Sommaire du guide" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow mb-4">Sommaire</p>
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible">
            {SECTIONS.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <Link
                  to={`/guide-cheveux#${s.id}`}
                  className="block rounded-full px-3 py-2 text-sm text-cocoa ring-1 ring-line hover:bg-blush hover:text-berry lg:rounded-lg lg:ring-0"
                >
                  <span className="mr-2 text-xs text-rose">{String(i + 1).padStart(2, '0')}</span>
                  {s.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <article className="prose-ina min-w-0 max-w-3xl">
          <section id="perruque-ou-tissage">
            <h2 className="!mt-0">Perruque ou tissage ?</h2>
            <div className="not-prose mb-6 grid gap-4 sm:grid-cols-2">
              <div className="card p-6">
                <h3 className="font-serif text-xl text-cocoa">La perruque</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  <li>• Se pose et se retire facilement</li>
                  <li>• Protège vos cheveux naturels</li>
                  <li>• Permet de changer de style rapidement</li>
                  <li>• Idéale pour débuter (modèles glueless)</li>
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="font-serif text-xl text-cocoa">Le tissage</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  <li>• Fixé sur des tresses, pour plusieurs semaines</li>
                  <li>• Grande liberté de longueur et de volume</li>
                  <li>• Se combine avec une closure ou un leave-out</li>
                  <li>• Pose recommandée par un·e professionnel·le</li>
                </ul>
              </div>
            </div>
            <p>
              Les deux options sont complémentaires : beaucoup de clientes alternent selon les saisons et les occasions.
              Si vous débutez, une perruque glueless est souvent la solution la plus simple.
            </p>
          </section>

          <section id="longueur">
            <h2>Choisir sa longueur</h2>
            <p>
              Les longueurs sont exprimées en pouces (″) et mesurées cheveux tendus. Pour un tissage complet, comptez en
              général <strong className="text-cocoa">3 boules jusqu’à 20″</strong> et{' '}
              <strong className="text-cocoa">4 boules au-delà</strong> ou pour plus de volume.
            </p>
            <div className="not-prose my-6">
              <LengthGuide />
            </div>
            <p>
              Astuce : une texture bouclée ou ondulée paraît plus courte qu’une texture lisse de même longueur, car les
              boucles « remontent ».
            </p>
          </section>

          <section id="textures">
            <h2>Les principales textures</h2>
            <div className="not-prose grid gap-4 sm:grid-cols-2">
              {[
                { t: 'Straight', d: 'Lisse et fluide, pour un style net et élégant.', i: img('model-straight-long') },
                { t: 'Body Wave', d: 'Ondulations amples et souples, la plus polyvalente.', i: img('model-bodywave') },
                { t: 'Deep Wave', d: 'Vagues profondes et marquées, effet volume.', i: img('model-deepwave') },
                {
                  t: 'Curly & Kinky Curly',
                  d: 'Boucles définies ou texture afro naturelle.',
                  i: img('model-curly-afro'),
                },
              ].map((x) => (
                <Link
                  key={x.t}
                  to={`/boutique?texture=${encodeURIComponent(x.t.split(' & ')[0])}`}
                  className="group flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-line hover:ring-berry/40"
                >
                  <SmartImage src={x.i} alt="" className="h-24 w-20 shrink-0 rounded-xl object-cover" />
                  <span className="py-1">
                    <span className="block font-serif text-lg text-cocoa group-hover:text-berry">{x.t}</span>
                    <span className="mt-1 block text-sm text-muted">{x.d}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section id="perruque">
            <h2>Comprendre les types de lace</h2>
            <p>
              La « lace » est le tulle fin situé à l’avant de la perruque, sur lequel les cheveux sont noués un à un.
              Plus elle est large, plus vous avez de liberté pour placer votre raie.
            </p>
            <ul>
              <li>
                <strong className="text-cocoa">4x4 / 5x5 (closure)</strong> : zone centrale, raie au milieu ou
                légèrement décalée. Facile à poser.
              </li>
              <li>
                <strong className="text-cocoa">13x4 (frontale)</strong> : d’une oreille à l’autre, raie libre et front
                dégagé.
              </li>
              <li>
                <strong className="text-cocoa">13x6</strong> : frontale plus profonde, pour une raie encore plus libre.
              </li>
              <li>
                <strong className="text-cocoa">Glueless</strong> : conçue pour être portée sans colle, grâce à des
                sangles et des peignes.
              </li>
            </ul>
          </section>

          <section id="densite">
            <h2>Choisir une densité</h2>
            <p>La densité correspond à la quantité de cheveux sur la perruque.</p>
            <ul>
              <li>
                <strong className="text-cocoa">150 %</strong> : naturel et léger, idéal au quotidien.
              </li>
              <li>
                <strong className="text-cocoa">180 %</strong> : plus de volume, très polyvalent.
              </li>
              <li>
                <strong className="text-cocoa">200 %</strong> : volume généreux, effet glamour.
              </li>
            </ul>
          </section>

          <section id="entretien">
            <h2>Conseils d’entretien</h2>
            <h3>Au quotidien</h3>
            <ul>
              <li>Démêlez avec un peigne à dents larges, des pointes vers les racines.</li>
              <li>Dormez avec un bonnet ou une taie en satin pour limiter les frottements.</li>
              <li>Utilisez un protecteur thermique avant tout coiffage à chaud.</li>
            </ul>
            <h3>Le lavage</h3>
            <ul>
              <li>Toutes les 2 à 3 semaines selon l’usage, avec un shampoing doux sans sulfate.</li>
              <li>Appliquez un après-shampoing sur les longueurs, en évitant les nœuds de la lace.</li>
              <li>Séchez à l’air libre, sur une tête de présentation.</li>
            </ul>
            <p>Ces conseils sont généraux : suivez toujours les recommandations propres à chaque produit.</p>
            <div className="not-prose mt-8 flex flex-wrap gap-3">
              <Link to="/accessoires" className="btn-primary">
                Voir les accessoires d’entretien
              </Link>
              <Link to="/faq" className="btn-outline">
                Questions fréquentes
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
