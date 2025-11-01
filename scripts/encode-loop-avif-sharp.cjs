// scripts/encode-loop-avif-sharp.cjs
// Converte seq-loop para AVIF com menor resolução para aliviar decodificação
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.resolve('./public/AnimationHero/seq-loop');
const OUT_DIR = path.resolve('./public/AnimationHero/seq-loop-avif');
const args = process.argv.slice(2);
const argNum = (name, def) => {
  const a = args.find((s) => s.startsWith(`--${name}=`));
  if (!a) return def;
  const v = Number(a.split('=')[1]);
  return Number.isFinite(v) ? v : def;
};
const WIDTH = argNum('width', Number(process.env.SEQ_LOOP_AVIF_WIDTH || 960));
const QUALITY = argNum('quality', Number(process.env.SEQ_LOOP_AVIF_QUALITY || 50));

function listInputs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f))
    .sort((a, b) => a.localeCompare(b));
}

(async () => {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('✗ Pasta de origem não existe:', SRC_DIR);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const inputs = listInputs(SRC_DIR);
  console.log(`📦 Encontrados ${inputs.length} frames para converter → ${OUT_DIR}`);
  if (!inputs.length) process.exit(0);

  let ok = 0,
    fail = 0;
  for (let i = 0; i < inputs.length; i++) {
    const f = inputs[i];
    const src = path.join(SRC_DIR, f);
    const out = path.join(OUT_DIR, f.replace(/\.(webp|png|jpg|jpeg)$/i, '.avif'));
    process.stdout.write(`\r🎞️ [${i + 1}/${inputs.length}] ${path.basename(out)} `);
    try {
      const buf = await sharp(src).resize({ width: WIDTH, withoutEnlargement: true }).avif({ quality: QUALITY }).toBuffer();
      fs.writeFileSync(out, buf);
      if (i < 3 || i === inputs.length - 1) console.log(`\n  ✅ ${path.basename(out)}`);
      ok++;
    } catch (err) {
      fail++;
      console.log(`\n  ❌ ${path.basename(out)} → ${err.message || err}`);
    }
  }
  console.log(`\n🏁 AVIF loop concluído. Sucesso: ${ok} | Falhas: ${fail} | Total: ${inputs.length}`);
})();