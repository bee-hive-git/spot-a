// scripts/upload-frames-avif.cjs
require('dotenv').config({ path: '.env.local' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const SRC_DIR = './public/AnimationHero/seq-scroll-avif';
const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  CDN_BASE_PATH,
  CDN_BASE_PATH_AVIF,
} = process.env;

const PREFIX_AVIF = CDN_BASE_PATH_AVIF || CDN_BASE_PATH;

console.log('🚀 upload-frames-avif iniciado');
console.log('🔐 ENV checagem:', { R2_ACCOUNT_ID, R2_BUCKET, CDN_BASE_PATH, CDN_BASE_PATH_AVIF });

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !PREFIX_AVIF) {
  console.error('❌ Faltam variáveis no .env.local (R2_* ou CDN_BASE_PATH/CDN_BASE_PATH_AVIF)');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

function listAvifs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.avif')).sort();
}

async function putWithRetry(params, tries = 3) {
  let lastErr;
  for (let t = 1; t <= tries; t++) {
    try {
      await s3.send(new PutObjectCommand(params));
      return true;
    } catch (err) {
      lastErr = err;
      console.warn(`  ⚠️ tentativa ${t} falhou: ${err.name || ''} ${err.message || err}`);
      await new Promise((r) => setTimeout(r, 400 * t)); // backoff
    }
  }
  console.error('  ❌ falhou após retries:', lastErr);
  return false;
}

(async () => {
  const files = listAvifs(SRC_DIR);
  const total = files.length;
  console.log(`📦 Encontrados ${total} arquivos .avif em ${path.resolve(SRC_DIR)}`);
  if (!total) return;

  let ok = 0,
    fail = 0;
  for (let i = 0; i < total; i++) {
    const file = files[i];
    const Body = fs.readFileSync(path.join(SRC_DIR, file));
    const Key = `${PREFIX_AVIF}/${file}`;
    const ContentType = 'image/avif';
    const CacheControl = 'public, max-age=31536000, immutable';

    process.stdout.write(`\r⏫ [${i + 1}/${total}] ${Key} `);
    const success = await putWithRetry({ Bucket: R2_BUCKET, Key, Body, ContentType, CacheControl });
    if (success) {
      ok++;
      if (i < 5 || i === total - 1) console.log(`\n  ✅ UP: ${Key}`);
    } else {
      fail++;
      console.log(`\n  ❌ FAIL: ${Key}`);
    }
  }

  console.log(`\n🏁 Upload concluído. Sucesso: ${ok} | Falhas: ${fail} | Total: ${total}`);
})();