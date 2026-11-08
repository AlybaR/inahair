// Transforme dist-preview/index.html (document complet) en fragment publiable
// (le service d'hébergement ajoute lui-même doctype/head/body).
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'dist-preview', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const head = html
  .match(/<head>([\s\S]*?)<\/head>/i)[1]
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>Boutique Inahair</title>');
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];
fs.writeFileSync(path.join(__dirname, '..', 'dist-preview', 'inahair.html'), head.trim() + '\n' + body.trim() + '\n');
console.log('fragment ok');
