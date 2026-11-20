#!/usr/bin/env node
/**
 * Logo File Kit CLI: export a logo to transparent PNG sizes, locally.
 *
 * Usage:
 *   node scripts/export.cjs <logo> [--sizes 16,32,48,64,256,300,400,512,1024,2000]
 *     [--out-dir ./logo-kit] [--background transparent|white|black|#hex]
 *     [--padding 0-30]
 *
 * Engine: sharp, runs fully offline. Nothing is uploaded.
 * Default sizes match the web tool's export set. Output names match the web
 * tool's file names where a size maps to one.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// The web tool's full export set (see src/data/exportSizes.ts).
const DEFAULT_SIZES = [16, 32, 48, 64, 256, 300, 400, 512, 1024, 2000];

const NAMES = {
  16: "logo-favicon-16",
  32: "logo-favicon-32",
  48: "logo-favicon-48",
  64: "logo-favicon-64",
  256: "logo-256",
  300: "logo-square-300",
  400: "logo-social-400",
  512: "logo-512",
  1024: "logo-print-1024",
  2000: "logo-print-master-2000",
};

function parseHex(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, alpha: 1 };
}

function parseBackground(value) {
  if (value === "transparent") return { r: 0, g: 0, b: 0, alpha: 0 };
  if (value === "white") return { r: 255, g: 255, b: 255, alpha: 1 };
  if (value === "black") return { r: 0, g: 0, b: 0, alpha: 1 };
  const hex = parseHex(value);
  if (hex) return hex;
  return null;
}

function parseArgs(argv) {
  const opts = {
    sizes: DEFAULT_SIZES,
    outDir: "./logo-kit",
    background: "transparent",
    padding: 10,
  };
  let input = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--sizes") {
      opts.sizes = argv[++i].split(",").map((s) => Number(s.trim()));
    } else if (a === "--out-dir") opts.outDir = argv[++i];
    else if (a === "--background") opts.background = argv[++i];
    else if (a === "--padding") opts.padding = Number(argv[++i]);
    else if (a.startsWith("--")) {
      console.error(`Unknown option: ${a}`);
      process.exit(2);
    } else if (!input) input = a;
    else {
      console.error("Give one logo file per run.");
      process.exit(2);
    }
  }
  return { input, opts };
}

async function main() {
  const { input, opts } = parseArgs(process.argv.slice(2));
  if (!input) {
    console.error(
      "Usage: node scripts/export.cjs <logo> [--sizes 16,32,48,64,256,300,400,512,1024,2000] [--out-dir ./logo-kit] [--background transparent|white|black|#hex] [--padding 0-30]"
    );
    process.exit(2);
  }
  if (!fs.existsSync(input)) {
    console.error(`Not found: ${input}`);
    process.exit(1);
  }
  if (!opts.sizes.length || opts.sizes.some((s) => !Number.isInteger(s) || s < 1)) {
    console.error("--sizes must be a comma list of positive whole numbers.");
    process.exit(2);
  }
  if (!Number.isFinite(opts.padding) || opts.padding < 0 || opts.padding > 30) {
    console.error("--padding must be between 0 and 30.");
    process.exit(2);
  }
  const bg = parseBackground(opts.background);
  if (!bg) {
    console.error(
      '--background must be transparent, white, black, or a hex colour like #1F8C7F.'
    );
    process.exit(2);
  }
  const isSvg = path.extname(input).toLowerCase() === ".svg";
  const loadOpts = isSvg ? { density: 300 } : {};
  fs.mkdirSync(opts.outDir, { recursive: true });

  for (const size of opts.sizes) {
    const name = NAMES[size] || `logo-${size}`;
    const outPath = path.join(opts.outDir, `${name}.png`);
    const content = Math.max(1, Math.round(size * (1 - opts.padding / 100)));
    const pad = size - content;
    const top = Math.floor(pad / 2);
    const bottom = pad - top;
    const left = Math.floor(pad / 2);
    const right = pad - left;
    try {
      let pipeline = sharp(input, loadOpts).resize(content, content, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
      if (pad > 0) {
        pipeline = pipeline.extend({ top, bottom, left, right, background: bg });
      }
      if (bg.alpha === 0) pipeline = pipeline.ensureAlpha();
      else pipeline = pipeline.flatten({ background: bg });
      await pipeline.png().toFile(outPath);
      const meta = await sharp(outPath).metadata();
      const bytes = fs.statSync(outPath).size;
      console.log(
        `${path.basename(outPath)}: ${meta.width}x${meta.height}, ${meta.channels} channels, alpha: ${meta.hasAlpha ? "yes" : "no"}, ${bytes} bytes`
      );
    } catch (err) {
      console.error(`Failed at ${size}px: ${err.message}`);
      process.exit(1);
    }
  }
}

main();
