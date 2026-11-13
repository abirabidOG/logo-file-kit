# Logo File Kit — Free Logo Resizer and Transparent PNG Exporter

> **"Get the right logo file for your website, social media and print in seconds. Free, no upload, your logo never leaves your browser."**

Logo File Kit is a high-performance, privacy-first single-page web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It enables founders, designers, and developers to convert, resize, pad, and export production-ready logo packages across all standard digital and print dimensions entirely inside the client browser using the **HTML5 Canvas API**.

---

## 💎 Features & Capabilities

- **100% Client-Side Processing**: No remote server uploads, no databases, no tracking, and no file retention. Your proprietary brand marks never leave your device.
- **Multi-Format Input**: Accepts **SVG**, **PNG**, and **JPG** logo files up to **10 MB**.
- **Vector Designer Guidance**: Helpful export tips for Illustrator AI and EPS files.
- **1-Click "Try a sample logo"**: Instant vector sample logo loading for first-time visitors to test all controls in one click.
- **Interactive Live Preview**: Real-time rendering on an alpha transparency checkerboard grid (`.bg-transparency-grid`).
- **Flexible Background Options**:
  - **Transparent** (Default for PNG and WebP)
  - **White** (`#FFFFFF`)
  - **Black** (`#000000`)
  - **Custom Color Picker** with hex display
- **Safe-Zone Padding Slider**: Adjustable from **0% to 30%** (default: **10%**) to ensure logos never touch edges or get clipped by circular social media avatars.
- **Production Export Sizes**:
  - **Website logo**: `512 × 512` (`logo-512.png`), `256 × 256` (`logo-256.png`)
  - **Browser Favicons**: `64 × 64` (`logo-favicon-64.png`), `48 × 48` (`logo-favicon-48.png`), `32 × 32` (`logo-favicon-32.png`), `16 × 16` (`logo-favicon-16.png`)
  - **Social profile**: `400 × 400` (`logo-social-400.png` for Instagram, X, YouTube, TikTok)
  - **LinkedIn / Facebook**: `300 × 300` (`logo-square-300.png` for Company Pages)
  - **Print-ready**: `1024 × 1024` (`logo-print-1024.png` for pitch decks, merchandise, and invoices)
- **Format Options**:
  - **Transparent PNG** (Default)
  - **JPG** (Solid background)
  - **WebP** (Modern lightweight web format)
- **Export Options**:
  - **Download All as ZIP**: Instant `.zip` archive creation using `jszip`.
  - **Download per size**: Instant single-file downloads.
- **Design System**: Matches WEBPTools design language:
  - White background (`#FFFFFF`), Ink text (`#0B0B0D`), Muted text (`#4F4E55`), Accent Teal (`#1F8C7F`), and Soft background (`#F4F2EC`).
  - Mobile-first responsive design down to **390px** (iPhone).
- **Comprehensive SEO & Schema**:
  - Native `FAQPage` JSON-LD Schema (5 questions).
  - Native `WebApplication` JSON-LD Schema.
  - Open Graph tags & Twitter Cards.
  - Educational sections on logo sizing and blur elimination.
- **Google Analytics 4**:
  - Placeholder `G-XXXXXXXXXX` (configurable via `NEXT_PUBLIC_GA_ID`).
  - Fires `logo_exported` on single downloads.
  - Fires `download_all_kit` on ZIP downloads (optimized for GA4 Key Event marking).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Packaging**: JSZip
- **Deployment**: Vercel-ready (zero backend functions or environment dependencies required)

---

## 🚀 Getting Started

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

---

## 🧪 Verification & Automated Testing

Run the included automated verification suite using headless Chrome / Edge:

```bash
# Generate test SVG, transparent PNG, and JPG assets
node create-test-assets.js

# Execute comprehensive verification (runs 7 end-to-end tests)
node verify-logo-kit.js
```

---

## 👤 Author & Attribution

**Abid Mahmud** — Brand Identity Designer & Logo Specialist  
- Website: [https://www.abidmahmud.cv](https://www.abidmahmud.cv)  
- Free Tools: [https://tools.abidmahmud.cv](https://tools.abidmahmud.cv)  
- WEBPTools: [https://tools.abidmahmud.cv/webptools](https://tools.abidmahmud.cv/webptools)
