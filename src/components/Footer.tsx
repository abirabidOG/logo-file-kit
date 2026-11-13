import React from "react";
import Link from "next/link";
import { ArrowUpRight, Shield, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E5E1D6] bg-[#F4F2EC] mt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        {/* Brand Identity Pitch Banner Required by User */}
        <div className="mb-10 rounded-2xl border border-[#E5E1D6] bg-white p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F8C7F]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full Brand Systems</span>
            </div>
            <h4 className="text-base sm:text-lg font-extrabold text-[#0B0B0D]">
              Need a full brand identity? See Abid Mahmud&apos;s work
            </h4>
            <p className="text-xs text-[#4F4E55] max-w-lg">
              Bespoke logomarks, typography hierarchies, brand guidelines, and complete luxury packaging systems crafted with mathematical precision.
            </p>
          </div>

          <a
            href="https://www.abidmahmud.cv"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#0B0B0D] hover:bg-[#1F8C7F] text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs"
          >
            <span>Explore Portfolio</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Main Attribution Line Specified by User */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#0B0B0D]">
              Logo File Kit — Free image tools by{" "}
              <a
                href="https://www.abidmahmud.cv"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1F8C7F] hover:underline underline-offset-2 inline-flex items-center gap-0.5"
              >
                <span>Abid Mahmud, Brand Identity Designer</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              {" — "}
              <a
                href="https://www.abidmahmud.cv"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0B0B0D] hover:text-[#1F8C7F]"
              >
                abidmahmud.cv
              </a>
            </p>
            <p className="text-xs text-[#4F4E55]">
              No server uploads • No watermarks • No tracking • Free for personal and commercial usage.
            </p>
          </div>

          {/* Quick Anchor & Cross-Tool Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#4F4E55]">
            <Link href="/" className="hover:text-[#0B0B0D] transition-colors">
              Resizer
            </Link>
            <span>•</span>
            <a href="#why-sizes-matter" className="hover:text-[#0B0B0D] transition-colors">
              Why Sizes Matter
            </a>
            <span>•</span>
            <a href="#faq" className="hover:text-[#0B0B0D] transition-colors">
              FAQ
            </a>
            <span>•</span>
            <a
              href="https://tools.abidmahmud.cv/webptools"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1F8C7F] transition-colors inline-flex items-center gap-1"
            >
              <span>WEBPTools</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <span>•</span>
            <a
              href="https://www.abidmahmud.cv"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1F8C7F] transition-colors inline-flex items-center gap-1"
            >
              <span>abidmahmud.cv</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Bottom Metadata & Privacy */}
        <div className="mt-8 pt-6 border-t border-[#E5E1D6]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#4F4E55]">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-[#1F8C7F]" />
            <span>Built 100% client-side with Next.js, HTML5 Canvas API & WebAssembly</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Logo File Kit by Abid Mahmud. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
