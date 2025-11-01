#!/usr/bin/env node
// Script simples para converter WEBP → AVIF com @squoosh/cli
// Pré-requisito: npm i -D @squoosh/cli

const { spawn } = require('child_process');
const path = require('path');

const SRC_DIR = path.resolve('./public/AnimationHero/seq-scroll');
const OUT_DIR = path.resolve('./public/AnimationHero/seq-scroll-avif');
const WIDTH = Number(process.env.SEQ_AVIF_WIDTH || 1280);
const QUALITY = Number(process.env.SEQ_AVIF_QUALITY || 55);

const args = [
  'squoosh-cli',
  '--resize', JSON.stringify({ enabled: true, width: WIDTH }),
  '--avif', JSON.stringify({ quality: QUALITY }),
  '-d', OUT_DIR,
  `${SRC_DIR}/*.webp`
];

console.log('⚙️  Convertendo WEBP → AVIF…');
const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, { stdio: 'inherit' });
child.on('exit', (code) => {
  if (code === 0) {
    console.log(`✅ AVIF gerado em ${OUT_DIR}`);
  } else {
    console.error('✗ Falha na conversão AVIF (código', code, ')');
    process.exit(code || 1);
  }
});