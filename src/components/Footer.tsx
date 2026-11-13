import React from 'react';
import { AbidMahmudLogo } from './Header';

export default function Footer() {
  const CURRENT_YEAR = new Date().getFullYear();

  return (
    <footer className="border-t border-[#0B0B0D]/10 bg-white mt-20">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="https://www.abidmahmud.cv/" aria-label="Abid Mahmud Home">
              <AbidMahmudLogo height={28} className="text-[#0B0B0D]" />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#0B0B0D]/75">
              Abid Mahmud is a premium logo designer and brand identity specialist based in Dhaka, Bangladesh. 8+ years of design discipline, 450+ delivered projects, and 100% Job Success on Upwork.
            </p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0B0B0D] font-semibold">Navigation</p>
            <ul className="space-y-2.5">
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/#work">
                  Selected Work
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/services">
                  Services &amp; Pricing
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/#process">
                  Design Process
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/about">
                  About Me
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/blog">
                  Insights &amp; Guides
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5 font-medium text-[#5846f6]" href="https://tools.abidmahmud.cv/">
                  Free Tools Suite
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/#reviews">
                  Client Reviews
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/#contact">
                  Start a Project
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0B0B0D] font-semibold">Services</p>
            <ul className="space-y-2.5">
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/services/logo-design">
                  Logo Design ($200+)
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/services/brand-identity">
                  Brand Identity ($650+)
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/services/pitch-decks">
                  Pitch Decks ($400+)
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/services/product-label-packaging">
                  Product Packaging ($250+)
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/services/digital-experience">
                  Social Media &amp; Digital ($100+)
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/services/video-editing">
                  Video Editing &amp; Motion ($300+)
                </a>
              </li>
              <li>
                <a className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5" href="https://www.abidmahmud.cv/services/print-production">
                  Print Production ($150+)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0B0B0D] font-semibold">Direct Links</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://www.upwork.com/freelancers/~0196a016d6dd8f59af"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] font-medium py-0.5"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Upwork Profile (Top Rated)
                </a>
              </li>
              <li>
                <a
                  href="https://calendly.com/abidmahmud/consultation-on-graphic-design-or-brand-development"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  Calendly Booking
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8801521320097"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  WhatsApp: +880 1521 320097
                </a>
              </li>
              <li>
                <a
                  href="mailto:abir.abid.43@gmail.com"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  abir.abid.43@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/abidmahmudpro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.behance.net/abidmahmud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  Behance
                </a>
              </li>
              <li>
                <a
                  href="https://dribbble.com/abidmahmud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  Dribbble
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-[#0B0B0D]/10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#0B0B0D]/70">
          <span>&copy; {CURRENT_YEAR} Abid Mahmud. All rights reserved.</span>
          <span>Crafted with mathematical vector precision · Dhaka, Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}
