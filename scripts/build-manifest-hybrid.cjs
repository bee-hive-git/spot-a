#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const CDN = process.env.CDN_PUBLIC_URL; // e.g. https://pub-xxxx.r2.dev
const PREFIX = process.env.CDN_BASE_PATH || 'spot/hero/v1/seq-scroll';
const PREFIX_AVIF = process.env.CDN_BASE_PATH_AVIF || PREFIX;
const SRC_WEBP = path.resolve('./public/AnimationHero/seq-scroll');
const SRC_AVIF = path.resolve('./public/AnimationHero/seq-scroll-avif');
const LOCAL_PREFIX_WEBP = '/AnimationHero/seq-scroll';
const LOCAL_PREFIX_AVIF = '/AnimationHero/seq-scroll-avif'; // served by Next.js from public
const LOCAL_FIRST = Number(process.env.SEQ_LOCAL_FIRST || 20);

function main() {
  if (!CDN) {
    console.warn('⚠ CDN_PUBLIC_URL não definido em .env.local. Usando apenas caminhos locais.');
  }

  if (!fs.existsSync(SRC_WEBP)) {
    console.error('✗ Pasta de origem WEBP não existe:', SRC_WEBP);
    process.exit(1);
  }

  const webpFiles = fs.existsSync(SRC_WEBP)
    ? fs.readdirSync(SRC_WEBP).filter((f) => /\.webp$/i.test(f)).sort((a, b) => a.localeCompare(b))
    : [];
  const avifFiles = fs.existsSync(SRC_AVIF)
    ? fs.readdirSync(SRC_AVIF).filter((f) => /\.avif$/i.test(f)).sort((a, b) => a.localeCompare(b))
    : [];

  if (webpFiles.length === 0 && avifFiles.length === 0) {
    console.error('✗ Nenhum arquivo .webp ou .avif encontrado em', SRC_WEBP, 'ou', SRC_AVIF);
    process.exit(1);
  }

  // Decide extensão principal conforme os arquivos disponíveis
  const hasAvif = avifFiles.length > 0;
  const hasWebp = webpFiles.length > 0;

  const buildListWebp = () => {
    return webpFiles.map((f, i) => {
      if (i < LOCAL_FIRST) {
        return `${LOCAL_PREFIX_WEBP}/${f}`;
      }
      if (CDN) {
        return `${CDN}/${PREFIX}/${f}`;
      }
      return `${LOCAL_PREFIX_WEBP}/${f}`;
    });
  };

  const buildListAvif = () => {
    return avifFiles.map((f, i) => {
      if (i < LOCAL_FIRST) {
        return `${LOCAL_PREFIX_AVIF}/${f}`;
      }
      if (CDN) {
        return `${CDN}/${PREFIX_AVIF}/${f}`;
      }
      return `${LOCAL_PREFIX_AVIF}/${f}`;
    });
  };

  const webp = hasWebp ? buildListWebp() : [];
  const avif = hasAvif ? buildListAvif() : [];

  const manifest = {
    width: 1600,
    height: 900,
    totalFrames: Math.max(webp.length, avif.length),
    sources: { avif, webp },
  };

  const outPath = path.resolve('./public/sequence.manifest.json');
  fs.writeFileSync(outPath, JSON.stringify(manifest));
  console.log(`✅ Manifest híbrido gerado: ${outPath}`);
  console.log(`   • Locais: ${LOCAL_FIRST} | CDN: ${Math.max(webp.length, avif.length) - LOCAL_FIRST}`);
  console.log(`   • Extensões: webp=${webp.length} avif=${avif.length}`);
  if (hasAvif && !process.env.CDN_BASE_PATH_AVIF) {
    console.warn('⚠ AVIF encontrado localmente, mas CDN_BASE_PATH_AVIF não está definido. Entradas CDN AVIF usarão PREFIX padrão.');
  }
}

main();