// scripts/build-manifest-loop.cjs
// Gera manifest simples para a sequência de loop usando recursos locais (preferência AVIF)
const fs = require('fs');
const path = require('path');

const SRC_AVIF = path.resolve('./public/AnimationHero/seq-loop-avif');
const SRC_WEBP = path.resolve('./public/AnimationHero/seq-loop');
const LOCAL_PREFIX_AVIF = '/AnimationHero/seq-loop-avif';
const LOCAL_PREFIX_WEBP = '/AnimationHero/seq-loop';

function read(dir, rx) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => rx.test(f)).sort((a, b) => a.localeCompare(b)) : [];
}

function main() {
  const avifs = read(SRC_AVIF, /\.avif$/i);
  const webps = read(SRC_WEBP, /\.webp$/i);
  const sourcesAvif = avifs.map((f) => `${LOCAL_PREFIX_AVIF}/${f}`);
  const sourcesWebp = webps.map((f) => `${LOCAL_PREFIX_WEBP}/${f}`);
  const out = {
    totalFrames: sourcesAvif.length || sourcesWebp.length,
    sources: { avif: sourcesAvif, webp: sourcesWebp },
  };
  const outPath = path.resolve('./public/loop.manifest.json');
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log(`✅ Manifest de loop gerado: ${outPath}`);
  console.log(`   • avif=${sourcesAvif.length} | webp=${sourcesWebp.length}`);
}

main();