require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const SRC_DIR = './public/AnimationHero/seq-scroll';
const { CDN_PUBLIC_URL, CDN_BASE_PATH } = process.env;

console.log('🚀 build-manifest iniciado');
console.log('🔐 ENV checagem:', { CDN_PUBLIC_URL, CDN_BASE_PATH });

if (!CDN_PUBLIC_URL || !CDN_BASE_PATH) {
  console.error('❌ Faltam CDN_PUBLIC_URL/CDN_BASE_PATH no .env.local');
  process.exit(1);
}

function list(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.webp')).sort()
    .map(f => `${CDN_PUBLIC_URL}/${CDN_BASE_PATH}/${f}`);
}

const webp = list(SRC_DIR);
const manifest = {
  width: 1600,
  height: 900,
  totalFrames: webp.length,
  chunks: 40,
  sources: { avif: [], webp }
};

const out = path.join('./public', 'sequence.manifest.json');
fs.writeFileSync(out, JSON.stringify(manifest));
console.log('✅ Manifest gerado em:', out);
console.log('🧮 Frames no manifest:', webp.length);

