# Logo File Kit

**Get the right logo file for your website, social media, and print in seconds. Free, no upload, your logo never leaves your browser.**

Logo File Kit turns one logo file into a complete set of production ready sizes: website logos, favicons, social avatars, and print masters, all as transparent PNGs. Use it free in your browser, or run it locally from this repo.

- Live tool: https://tools.abidmahmud.cv/logo-kit
- By Abid Mahmud, Brand Identity Designer: https://www.abidmahmud.cv

## What it does

- **Converts SVG, PNG, and JPG logos** up to 10 MB, entirely in your browser. No server upload, no account, no watermark.
- **Exports transparent PNGs** in every size a brand needs, plus JPG and WebP where a solid background fits better.
- **Download All as ZIP** for the full set in one click, or download single sizes.
- **Safe zone padding** from 0 to 30 percent (10 percent by default), so a logo never touches an edge or gets clipped by a circular avatar.
- **Background choices**: transparent, white, black, or any custom colour.
- **One click sample logo** to try every control before uploading your own file.

## Export sizes

| Use | Sizes |
| --- | --- |
| Website logo | 512 x 512, 256 x 256 |
| Favicon | 64 x 64, 48 x 48, 32 x 32, 16 x 16 |
| Social profile (Instagram, X, YouTube, TikTok) | 400 x 400 |
| LinkedIn and Facebook | 300 x 300 |
| Print | 2000 x 2000 print master, 1024 x 1024 |

The print master is 2000 x 2000, ready for large format print, posters, signage, and merchandise. The 1024 size suits pitch decks, business cards, and invoices.

## Use it in the browser

Open https://tools.abidmahmud.cv/logo-kit, drop in your logo, pick a background and padding, and download the sizes you need. Your file is processed with the HTML5 Canvas API on your own device and is never sent anywhere.

## Run it locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Check it works

The repo includes an automated verification suite that runs in headless Chrome or Edge:

```bash
# Generate test SVG, transparent PNG, and JPG assets
node create-test-assets.js

# Run the end to end checks
node verify-logo-kit.js
```

## Claude Code plugin

Logo File Kit also ships as a public Claude Code plugin, in `plugins/logo-file-kit/`. It exports logos to transparent PNG sizes from the terminal with a bundled sharp script. Install it with:

```text
/plugin marketplace add abirabidOG/logo-file-kit
/plugin install logo-file-kit@logo-file-kit
```

See `plugins/logo-file-kit/README.md` for usage.

## Tech

- Next.js 16 (App Router, Turbopack) and TypeScript 5
- Tailwind CSS v4 and Lucide React
- JSZip for Download All as ZIP
- Vercel ready, no backend or environment variables required

## Author

**Abid Mahmud**, Brand Identity Designer

- Website: https://www.abidmahmud.cv
- Free tools: https://tools.abidmahmud.cv

## Licence

MIT. See `LICENSE`.
