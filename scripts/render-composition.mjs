#!/usr/bin/env node
/**
 * Remotion server-side renderer.
 *
 * Usage:
 *   node scripts/render-composition.mjs <compositionJsonPath> <outputMp4Path> [exportOptionsJsonPath]
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, '..');

const compositionJsonPath = process.argv[2];
const outputPath = process.argv[3];
const exportOptionsPath = process.argv[4];

if (!compositionJsonPath || !outputPath) {
  console.error('Usage: render-composition.mjs <compositionJsonPath> <outputMp4Path> [exportOptionsJsonPath]');
  process.exit(1);
}

let composition;
try {
  composition = JSON.parse(readFileSync(compositionJsonPath, 'utf-8'));
} catch (e) {
  console.error(`Failed to parse composition JSON: ${e.message}`);
  process.exit(2);
}

/** @type {{ resolution?: string; quality?: string; fps?: number; format?: string }} */
let exportOptions = {};
if (exportOptionsPath && existsSync(exportOptionsPath)) {
  try {
    exportOptions = JSON.parse(readFileSync(exportOptionsPath, 'utf-8'));
  } catch (e) {
    console.warn(`[remotion-render] export options ignored: ${e.message}`);
  }
}

const format = composition.format ?? '9:16';
const customW = composition.customAspectW ?? 0;
const customH = composition.customAspectH ?? 0;
const fps = exportOptions.fps ?? composition.fps ?? 30;

const RESOLUTION_LONG_EDGE = {
  '480p': 854,
  '720p': 1280,
  '1080p': 1920,
};

const QUALITY_CRF = {
  recommended: 18,
  high: 15,
  low: 23,
};

function getRemotionDimensions(fmt, cW, cH, resolution) {
  const RATIOS = {
    '9:16': { w: 9, h: 16 },
    '16:9': { w: 16, h: 9 },
    '1:1': { w: 1, h: 1 },
    '4:5': { w: 4, h: 5 },
  };
  const r = RATIOS[fmt] ?? { w: 9, h: 16 };
  const w = fmt === 'custom' && cW > 0 ? cW : r.w;
  const h = fmt === 'custom' && cH > 0 ? cH : r.h;
  const longEdge = RESOLUTION_LONG_EDGE[resolution] ?? RESOLUTION_LONG_EDGE['720p'];
  if (h >= w) {
    return { width: Math.round((longEdge * w) / h), height: longEdge };
  }
  return { width: longEdge, height: Math.round((longEdge * h) / w) };
}

const resolution = exportOptions.resolution ?? '720p';
const quality = exportOptions.quality ?? 'recommended';
const crf = QUALITY_CRF[quality] ?? 18;

const { width, height } = getRemotionDimensions(format, customW, customH, resolution);
const durationInFrames = Math.max(1, Math.ceil((composition.duration ?? 1) * fps));

console.log(
  `[remotion-render] Format=${format} ${width}x${height} fps=${fps} crf=${crf} resolution=${resolution} frames=${durationInFrames}`
);

console.log('[remotion-render] Bundling...');
const bundleLocation = await bundle({
  entryPoint: resolve(frontendRoot, 'remotion/index.ts'),
  webpackOverride: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        '@': frontendRoot,
      },
    };
    config.resolve.fallback = {
      ...(config.resolve?.fallback ?? {}),
      fs: false,
      path: false,
      canvas: false,
    };
    return config;
  },
});
console.log('[remotion-render] Bundle ready.');

const comp = await selectComposition({
  serveUrl: bundleLocation,
  id: 'StudioComposition',
  inputProps: { composition },
});

const finalComp = {
  ...comp,
  width,
  height,
  fps,
  durationInFrames,
};

console.log('[remotion-render] Rendering...');
let lastPct = -1;
await renderMedia({
  composition: finalComp,
  serveUrl: bundleLocation,
  codec: 'h264',
  outputLocation: outputPath,
  inputProps: { composition },
  crf,
  muted: false,
  onProgress: ({ progress }) => {
    const pct = Math.round(progress * 100);
    if (pct !== lastPct) {
      process.stdout.write(`[remotion-render] progress=${pct}\n`);
      lastPct = pct;
    }
  },
  browserExecutable: process.env.REMOTION_CHROMIUM ?? undefined,
  concurrency: Math.max(1, (os.cpus?.()?.length ?? 4) - 1),
});

console.log(`[remotion-render] Done → ${outputPath}`);
process.exit(0);
