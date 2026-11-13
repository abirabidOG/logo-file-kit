import React from "react";
import {
  Globe,
  Share2,
  Printer,
  Sparkles,
  Maximize2,
  FileQuestion,
  Eye,
  AlertTriangle,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";

export default function SeoSection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
      {/* SECTION 1: H2 Get the right logo size for every place you use it */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF7F5] px-3.5 py-1 text-xs font-bold text-[#1F8C7F] border border-[#B6E2DC]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Multi-Platform Logo Standards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0B0B0D]">
            Get the right logo size for every place you use it
          </h2>
          <p className="text-xs sm:text-base text-[#4F4E55] leading-relaxed">
            Every digital channel and physical collateral requires a specific logo resolution and aspect ratio.
            Logo File Kit transforms a single vector SVG or high-res PNG into production-ready dimensions in seconds.
          </p>
        </div>

        {/* 4 Cards: Website, Favicons, Social, Print */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Website & Mobile */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1F8C7F] shadow-xs">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B0B0D]">Website & Headers</h3>
            <p className="text-xs font-mono font-semibold text-[#1F8C7F]">
              512 × 512 • 256 × 256
            </p>
            <p className="text-xs text-[#4F4E55] leading-relaxed">
              Provides crisp 2x Retina density for desktop navigation bars, sticky headers, mobile app headers, and footer marks without blur.
            </p>
          </div>

          {/* 2. Favicons */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1F8C7F] shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B0B0D]">Browser Favicons</h3>
            <p className="text-xs font-mono font-semibold text-[#1F8C7F]">
              64 • 48 • 32 • 16 px
            </p>
            <p className="text-xs text-[#4F4E55] leading-relaxed">
              Precision rasterization for desktop browser tabs, address bar icons, Safari pinned tabs, and mobile home screen shortcuts.
            </p>
          </div>

          {/* 3. Social Media */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1F8C7F] shadow-xs">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B0B0D]">Social Avatars</h3>
            <p className="text-xs font-mono font-semibold text-[#1F8C7F]">
              400 × 400 • 300 × 300
            </p>
            <p className="text-xs text-[#4F4E55] leading-relaxed">
              Built with safe-zone padding so Instagram, LinkedIn, X (Twitter), YouTube, and Facebook never crop your logo inside circular frames.
            </p>
          </div>

          {/* 4. Print & Decks */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1F8C7F] shadow-xs">
              <Printer className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B0B0D]">Print & Pitch Decks</h3>
            <p className="text-xs font-mono font-semibold text-[#1F8C7F]">
              1024 × 1024 px
            </p>
            <p className="text-xs text-[#4F4E55] leading-relaxed">
              Ultra high-density master export ideal for investor pitch decks, invoices, event programs, packaging mockups, and merchandise.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: H2 Why logos look blurry, and how to fix it */}
      <div id="why-sizes-matter" className="scroll-mt-24 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Brand Visual Quality Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0B0B0D]">
            Why logos look blurry, and how to fix it
          </h2>
          <p className="text-xs sm:text-base text-[#4F4E55] leading-relaxed">
            A poorly prepared logo makes even the most sophisticated brand look amateur. Three common mistakes cause 95% of blurry, distorted logos online:
          </p>
        </div>

        {/* The 3 Short Points Required by Prompt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Point 1: Wrong size */}
          <div className="rounded-3xl border border-[#E5E1D6] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF7F5] text-[#1F8C7F]">
              <Maximize2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B0B0D]">1. Wrong size</h3>
              <p className="text-xs sm:text-sm text-[#4F4E55] leading-relaxed">
                When you upload a small 100px logo into a modern 400px profile slot, the browser stretches and interpolates the pixels, resulting in severe pixelation and blurry curves.
              </p>
            </div>
            <div className="rounded-xl bg-[#F4F2EC] p-3 text-xs text-[#0B0B0D] font-medium border border-[#E5E1D6]">
              <strong className="text-[#1F8C7F]">The Fix:</strong> Export directly at native pixel dimensions (like 512px or 400px) so the browser never has to upscale.
            </div>
          </div>

          {/* Point 2: Wrong background */}
          <div className="rounded-3xl border border-[#E5E1D6] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF7F5] text-[#1F8C7F]">
              <Eye className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B0B0D]">2. Wrong background</h3>
              <p className="text-xs sm:text-sm text-[#4F4E55] leading-relaxed">
                Using a logo with an accidental white background on a dark website navigation bar or colored header creates an ugly &ldquo;white sticker box&rdquo; around your brand.
              </p>
            </div>
            <div className="rounded-xl bg-[#F4F2EC] p-3 text-xs text-[#0B0B0D] font-medium border border-[#E5E1D6]">
              <strong className="text-[#1F8C7F]">The Fix:</strong> Always use transparent PNG or WebP files with an intact alpha channel so backgrounds show through cleanly.
            </div>
          </div>

          {/* Point 3: Wrong file type */}
          <div className="rounded-3xl border border-[#E5E1D6] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF7F5] text-[#1F8C7F]">
              <FileQuestion className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B0B0D]">3. Wrong file type</h3>
              <p className="text-xs sm:text-sm text-[#4F4E55] leading-relaxed">
                JPEGs use lossy DCT compression engineered for continuous-tone photography. On logos with sharp vector edges, JPEG introduces &ldquo;ringing artifacts&rdquo; and muddy borders.
              </p>
            </div>
            <div className="rounded-xl bg-[#F4F2EC] p-3 text-xs text-[#0B0B0D] font-medium border border-[#E5E1D6]">
              <strong className="text-[#1F8C7F]">The Fix:</strong> Use lossless PNG or WebP for razor-sharp geometric lines, perfect vector typography, and lossless compression.
            </div>
          </div>
        </div>
      </div>

      {/* CROSS-LINK TO WEBPTOOLS: Explicitly requested by prompt */}
      <div className="rounded-3xl border border-[#B6E2DC] bg-[#EBF7F5] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F8C7F]">
            <Zap className="h-4 w-4" />
            <span>Complementary Free Tool</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#0B0B0D]">
            Need lighter images too? Try WEBPTools
          </h3>
          <p className="text-xs sm:text-sm text-[#4F4E55] max-w-xl">
            Convert JPG, PNG, and SVG images into next-generation WebP format in seconds. Shrink website file sizes by up to 35% without losing visual clarity.
          </p>
        </div>

        <a
          href="https://tools.abidmahmud.cv/webptools"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#1F8C7F] hover:bg-[#176E64] text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <span>Open WEBPTools</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
