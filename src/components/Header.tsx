import Link from "next/link";
import { Shield, ArrowUpRight, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E1D6] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="Logo File Kit Homepage"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F8C7F] text-white shadow-xs font-bold tracking-tight text-base">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#0B0B0D]">
                Logo File Kit
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#1F8C7F]">
                Free Logo Resizer
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4F4E55]">
          <Link
            href="/"
            className="text-[#1F8C7F] font-semibold transition-colors hover:text-[#0B0B0D]"
          >
            Resizer
          </Link>
          <a
            href="#why-sizes-matter"
            className="transition-colors hover:text-[#0B0B0D]"
          >
            Why Sizes Matter
          </a>
          <a
            href="#faq"
            className="transition-colors hover:text-[#0B0B0D]"
          >
            FAQ
          </a>
          <a
            href="https://tools.abidmahmud.cv/webptools"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F4E55] hover:text-[#1F8C7F] transition-colors"
          >
            <span>WEBPTools</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </nav>

        {/* Right badges & links */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#1F8C7F] bg-[#EBF7F5] px-2.5 py-1 rounded-full border border-[#B6E2DC]">
            <Shield className="h-3 w-3" />
            <span>100% In-Browser</span>
          </div>

          <a
            href="https://www.abidmahmud.cv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F2EC] px-3.5 py-1.5 text-xs font-semibold text-[#0B0B0D] hover:bg-[#E5E1D6] transition-colors border border-[#E5E1D6]"
          >
            <span>Abid Mahmud</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#4F4E55]" />
          </a>
        </div>
      </div>
    </header>
  );
}
