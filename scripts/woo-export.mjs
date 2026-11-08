/**
 * Génère woocommerce/inahair-produits.csv à partir du catalogue src/data/products.ts,
 * au format de l'importateur natif WooCommerce (Produits → Importer).
 *
 *   npm run woo:export
 *   IMAGE_BASE_URL=https://www.inahair.fr/ npm run woo:export   (photos servies par votre site)
 *
 * Chaque produit à options devient un « produit variable » (UGS = slug du site) et chaque
 * combinaison d'options une « variation » avec son prix, sa promotion et son stock.
 */
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';

const IMAGE_BASE = (process.env.IMAGE_BASE_URL || 'https://alybar.github.io/inahair/').replace(/\/?$/, '/');
const OUT_DIR = 'woocommerce';
const OUT_FILE = `${OUT_DIR}/inahair-produits.csv`;

// Compile le catalogue TypeScript du site pour le lire depuis Node.
const bundle = await build({
  stdin: {
    contents: "export * from './src/data/products.ts'; export * from './src/lib/pricing.ts';",
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'error',
  define: {
    'import.meta.env.BASE_URL': JSON.stringify(IMAGE_BASE),
    'import.meta.env.VITE_WOO_URL': '""',
    'import.meta.env.VITE_WOO_ACCOUNT_PATH': '""',
    __PREVIEW_MODE__: 'false',
  },
});
const mod = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const { products, getRegularPrice, getUnitPrice, isSelectionAvailable, defaultSelections } = mod;

const CATEGORY = { perruques: 'Perruques', tissages: 'Boules de tissage', accessoires: 'Accessoires' };
const WEIGHT_KG = { perruques: '0.4', tissages: '0.12', accessoires: '0.1' };
const MAX_ATTR = Math.max(...products.map((p) => p.options.length), 1);

const escapeValue = (v) => String(v).replace(/,/g, '\\,'); // virgule = séparateur de valeurs WooCommerce
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const html = (paragraphs) => paragraphs.map((p) => `<p>${p}</p>`).join('');
const skuPart = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');

const headers = [
  'Type',
  'SKU',
  'Name',
  'Parent',
  'Published',
  'Is featured?',
  'Visibility in catalog',
  'Short description',
  'Description',
  'Tax status',
  'In stock?',
  'Stock',
  'Backorders allowed?',
  'Weight (kg)',
  'Sale price',
  'Regular price',
  'Categories',
  'Tags',
  'Images',
];
for (let i = 1; i <= MAX_ATTR; i++) {
  headers.push(
    `Attribute ${i} name`,
    `Attribute ${i} value(s)`,
    `Attribute ${i} visible`,
    `Attribute ${i} global`,
    `Attribute ${i} default`,
  );
}

/** Toutes les combinaisons d'options d'un produit. */
function combinations(options) {
  return options.reduce(
    (acc, opt) => acc.flatMap((sel) => opt.values.map((v) => ({ ...sel, [opt.key]: v.value }))),
    [{}],
  );
}

const stockFor = (p, sel) => (isSelectionAvailable(p, sel) ? (p.stock === 'low_stock' ? 3 : 10) : 0);
const label = (opt, value) => opt.values.find((v) => v.value === value)?.label ?? value;

const rows = [];
let variationCount = 0;

for (const p of products) {
  const variable = p.options.some((o) => o.values.length > 1);
  const def = defaultSelections(p);
  const tags = [...p.tags, p.type, p.texture].filter(Boolean).join(', ');
  const base = {
    Name: p.name,
    Published: 1,
    'Is featured?': p.salesRank <= 4 ? 1 : 0,
    'Visibility in catalog': 'visible',
    'Short description': p.shortDescription,
    Description: html(p.description),
    'Tax status': 'taxable',
    'Backorders allowed?': 0,
    'Weight (kg)': WEIGHT_KG[p.category],
    Categories: CATEGORY[p.category],
    Tags: tags,
    Images: p.images.join(', '),
  };

  const parent = { ...base, Type: variable ? 'variable' : 'simple', SKU: p.slug };
  p.options.forEach((opt, i) => {
    const n = i + 1;
    parent[`Attribute ${n} name`] = opt.label;
    parent[`Attribute ${n} value(s)`] = opt.values.map((v) => escapeValue(v.label)).join(', ');
    parent[`Attribute ${n} visible`] = 1;
    parent[`Attribute ${n} global`] = 0;
    parent[`Attribute ${n} default`] = label(opt, def[opt.key]);
  });
  if (!variable) {
    const regular = getRegularPrice(p, def);
    const price = getUnitPrice(p, def);
    const stock = stockFor(p, def);
    Object.assign(parent, {
      'Regular price': regular,
      'Sale price': price < regular ? price : '',
      Stock: stock,
      'In stock?': stock > 0 ? 1 : 0,
    });
  }
  rows.push(parent);

  if (!variable) continue;
  for (const sel of combinations(p.options)) {
    const regular = getRegularPrice(p, sel);
    const price = getUnitPrice(p, sel);
    const stock = stockFor(p, sel);
    const v = {
      Type: 'variation',
      SKU: `${p.slug}_${p.options.map((o) => skuPart(sel[o.key])).join('-')}`,
      Name: `${p.name} - ${p.options.map((o) => label(o, sel[o.key])).join(', ')}`,
      Parent: p.slug,
      Published: 1,
      'Visibility in catalog': 'visible',
      'Tax status': 'taxable',
      'Regular price': regular,
      'Sale price': price < regular ? price : '',
      Stock: stock,
      'In stock?': stock > 0 ? 1 : 0,
      'Backorders allowed?': 0,
    };
    p.options.forEach((opt, i) => {
      v[`Attribute ${i + 1} name`] = opt.label;
      v[`Attribute ${i + 1} value(s)`] = escapeValue(label(opt, sel[opt.key]));
    });
    rows.push(v);
    variationCount++;
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const csv = [headers.map(csvCell).join(','), ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(','))].join(
  '\n',
);
writeFileSync(OUT_FILE, csv + '\n', 'utf8');
console.log(`${OUT_FILE} : ${products.length} produits, ${variationCount} variations (photos : ${IMAGE_BASE}images/…)`);
