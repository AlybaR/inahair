/** Construit le chemin d'une image locale (fonctionne en build classique et en fichier unique). */
export const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;

/** Image de repli élégante (SVG inline) si une photo ne se charge pas. */
export const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#F8E4E9"/><path d="M150 330c10-80 30-150 50-190 20 40 40 110 50 190" fill="none" stroke="#CF4774" stroke-width="3" stroke-linecap="round"/><path d="M170 330c5-60 18-110 30-140 12 30 25 80 30 140" fill="none" stroke="#A7194A" stroke-width="2" stroke-linecap="round" opacity=".6"/><text x="200" y="390" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#A7194A">Inahair</text></svg>`,
  );
