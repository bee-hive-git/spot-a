#!/usr/bin/env node
// Fallback AVIF encoder using sharp (works well on Windows)
// Usage: node scripts/encode-avif-sharp.cjs
// Config via env: SEQ_AVIF_WIDTH=1280 SEQ_AVIF_QUALITY=55

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.resolve('./public/AnimationHero/seq-scroll');
const OUT_DIR = path.resolve('./public/AnimationHero/seq-scroll-avif');
const WIDTH = Number(process.env.SEQ_AVIF_WIDTH || 1280);
const QUALITY = Number(process.env.SEQ_AVIF_QUALITY || 55);

function listWebps(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.webp')).sort();
}

async function ensureDir(d) {
  await fs.promises.mkdir(d, { recursive: true });
}

async function convertOne(file) {
  const srcPath = path.join(SRC_DIR, file);
  const base = file.replace(/\.webp$/i, '');
  const outPath = path.join(OUT_DIR, `${base}.avif`);
  try {
    const img = sharp(srcPath);
    await img.resize({ width: WIDTH }).toFormat('avif', { quality: QUALITY }).toFile(outPath);
    return { file, ok: true };
  } catch (err) {
    return { file, ok: false, err };
  }
}

(async () => {
  console.log(`⚙️  Convertendo WEBP → AVIF com sharp (width=${WIDTH}, quality=${QUALITY})`);
  const files = listWebps(SRC_DIR);
  console.log(`🧮 Encontrados ${files.length} .webp em ${SRC_DIR}`);
  if (!files.length) process.exit(0);

  await ensureDir(OUT_DIR);
  let ok = 0, fail = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    process.stdout.write(`\r⏳ [${i+1}/${files.length}] ${f}`);
    const res = await convertOne(f);
    if (res.ok) { ok++; if (i < 3 || i === files.length - 1) console.log(`\n  ✅ ${f}`); }
    else { fail++; console.log(`\n  ❌ ${f} → ${res.err?.message || res.err}`); }
  }

  console.log(`\n🏁 Conversão concluída. Sucesso: ${ok} | Falhas: ${fail} | Total: ${files.length}`);
})();