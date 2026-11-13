import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import LogoResizerTool from "@/components/LogoResizerTool";
import SeoSection from "@/components/SeoSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import { FAQS } from "@/data/faqs";

export const metadata: Metadata = {
  title: "Logo File Kit — Free Logo Resizer and Transparent PNG Exporter",
  description:
    "Get the right logo file for your website, Instagram, LinkedIn and print. Free transparent PNG exporter, no Photoshop, no upload, no sign-up.",
  keywords: [
    "logo resizer",
    "transparent png exporter",
    "free logo resizer",
    "favicon generator from logo",
    "social media logo size",
    "website logo 512x512",
    "transparent logo background",
    "logo file kit",
    "Abid Mahmud",
    "no photoshop logo resize",
  ],
  authors: [{ name: "Abid Mahmud", url: "https://www.abidmahmud.cv" }],
  creator: "Abid Mahmud",
  publisher: "Logo File Kit",
  metadataBase: new URL("https://tools.abidmahmud.cv"),
  alternates: {
    canonical: "/logo-kit",
  },
  openGraph: {
    title: "Logo File Kit — Free Logo Resizer and Transparent PNG Exporter",
    description:
      "Get the right logo file for your website, Instagram, LinkedIn and print. Free transparent PNG exporter, no Photoshop, no upload, no sign-up.",
    url: "https://tools.abidmahmud.cv/logo-kit",
    siteName: "Logo File Kit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logo File Kit — Free Logo Resizer and Transparent PNG Exporter",
    description:
      "Get the right logo file for your website, social media and print in seconds. Free, no upload, your logo never leaves your browser.",
    creator: "@abidmahmud",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  // Structured Data (JSON-LD) for SEO: FAQPage & WebApplication
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Logo File Kit — Free Logo Resizer and Transparent PNG Exporter",
    applicationCategory: "DesignApplication",
    operatingSystem: "All (Browser-based)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Get the right logo file for your website, social media and print in seconds. Free, no upload, your logo never leaves your browser. Multi-size export, transparent PNG, padding slider, and ZIP archive.",
    browserRequirements:
      "Requires HTML5 Canvas capable browser (Chrome, Safari, Firefox, Edge).",
    author: {
      "@type": "Person",
      name: "Abid Mahmud",
      url: "https://www.abidmahmud.cv",
      jobTitle: "Brand Identity Designer",
    },
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] flex flex-col justify-between selection:bg-[#EBF7F5] selection:text-[#1F8C7F]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />

      {/* Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 sm:pt-28 md:pt-32">
        {/* Navigation Breadcrumb matching abidmahmud.cv tools */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-4 sm:mb-6 flex items-center justify-between">
          <a
            href="https://tools.abidmahmud.cv/"
            className="inline-flex items-center gap-2 rounded-full border border-[#0B0B0D]/10 bg-[#F4F2EC] px-4 py-2 font-mono text-xs font-semibold text-[#0B0B0D] transition-colors hover:border-[#0B0B0D]/30 hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Free Tools</span>
          </a>

          <span className="inline-flex items-center gap-2 font-mono text-xs font-medium text-[#4F4E55]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            v1.0 Client-Side Ready
          </span>
        </div>

        {/* Hero Section */}
        <div className="pt-2 sm:pt-4 pb-6 sm:pb-8 text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F2EC] px-3.5 py-1 text-xs font-semibold text-[#4F4E55] border border-[#E5E1D6]">
            <span className="h-2 w-2 rounded-full bg-[#1F8C7F]" />
            <span>100% In-Browser • Zero Upload • Privacy First</span>
          </div>

          {/* User-Specified H1 */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0B0B0D]">
            Free Logo Resizer and Transparent PNG Exporter
          </h1>

          {/* User-Specified Tagline */}
          <p className="text-sm sm:text-lg md:text-xl text-[#4F4E55] max-w-2xl mx-auto font-medium leading-relaxed">
            Get the right logo file for your website, social media and print in seconds. Free, no upload, your logo never leaves your browser.
          </p>
        </div>

        {/* Core Interactive Tool */}
        <LogoResizerTool />

        {/* SEO Educational & Size Standards Section */}
        <SeoSection />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
