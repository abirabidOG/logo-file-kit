---
name: logo-file-kit
description: Export a logo (SVG, PNG, JPG) to transparent PNG sizes for website, favicon, social, and print, locally, with sharp. Use when the user asks to resize, export, or convert a logo to PNG sizes, favicons, or a print master, or when they invoke /export-logo.
license: MIT
version: 0.1.0
tags: [logo, favicon, png, export, branding, transparent]
---

# Logo File Kit

Export one logo file into a complete set of transparent PNG sizes. Everything
runs locally on the user's machine. Nothing is uploaded anywhere, there is no
sign-in, no credit system, and no watermark.

## First run setup

The export script lives in this plugin at `scripts/export.cjs` and needs the
`sharp` package. On first use in a project, install it once from the plugin
directory:

```bash
cd <plugin-dir>
npm install
```

`<plugin-dir>` is the installed plugin folder, for example
`~/.claude/plugins/logo-file-kit/logo-file-kit` or the
`plugins/logo-file-kit` folder of the cloned repo. If
`node_modules/sharp` already exists, skip the install.

## How to export

Run the script with the logo file. It writes the PNG set into `./logo-kit`
unless `--out-dir` is given:

```bash
node scripts/export.cjs logo.svg
node scripts/export.cjs logo.png --sizes 16,32,180,512,1024,2000 --out-dir ./exports
node scripts/export.cjs logo.jpg --background white --padding 10
```

Accepted inputs: SVG, PNG, JPG, JPEG, WebP. One logo per run.

### Options

| Flag | What it does |
| --- | --- |
| `--sizes 16,32,...` | Comma list of square sizes in pixels. Default is the web tool's full set: 16, 32, 48, 64, 256, 300, 400, 512, 1024, 2000. |
| `--out-dir <folder>` | Where the PNGs go (default `./logo-kit`). |
| `--background transparent \| white \| black \| #hex` | Background of the safe zone padding (default `transparent`). |
| `--padding 0-30` | Safe zone padding as a percent of the size (default `10`). |

### Output names

Sizes map to the same file names as the web tool: `logo-512.png`,
`logo-256.png`, `logo-favicon-16.png`, `logo-favicon-32.png`,
`logo-favicon-48.png`, `logo-favicon-64.png`, `logo-social-400.png`,
`logo-square-300.png`, `logo-print-1024.png`, and
`logo-print-master-2000.png`. A size with no mapped name becomes
`logo-<size>.png`, for example `logo-180.png`.

### What each size is for

- 512 and 256: website logo, headers and footers
- 64, 48, 32, 16: browser favicons
- 400: social profile (Instagram, X, YouTube, TikTok)
- 300: LinkedIn company page and Facebook avatar
- 2000: print master for large format print, posters, signage, and merchandise
- 1024: pitch decks, business cards, invoices, and banners

## After exporting

1. Confirm each expected `.png` exists in the output folder.
2. Check one file's metadata (width, height, channels, alpha) and report the
   sizes and file sizes. These are real numbers from the files.
3. If a logo looks clipped at small sizes, retry with a higher `--padding`.
   If a thin mark disappears at 16 px, say so plainly and suggest the user
   keep the 16 px favicon as a simplified mark.
4. If the input is a JPG with no transparency, the outputs keep a solid
   background unless `--background` is set; transparency can only be kept
   from an input that already has it, or from an SVG.

## What never to claim

Never state an invented quality or sharpness claim for an export. The only
numbers to report are the ones the script prints: dimensions, channels,
alpha, and file sizes. Do not promise a size the script did not produce.

## What this skill does not do

- No JPG or WebP output in v1. The script exports PNG only. If the user
  needs JPG or WebP, point them to the web tool.
- No batch of several logos in one run. Export one logo at a time.
- No accounts, no history, no server. The script is the whole engine.

## Web version

The same export set with a visual interface, live preview, background and
padding controls, and Download All as ZIP:
https://tools.abidmahmud.cv/logo-kit
