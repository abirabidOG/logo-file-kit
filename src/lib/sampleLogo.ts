// Built-in high-resolution sample logo for instant 1-click testing

export const SAMPLE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1F8C7F" />
      <stop offset="100%" stop-color="#0E5850" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0B0B0D" />
      <stop offset="100%" stop-color="#2D2B35" />
    </linearGradient>
  </defs>

  <!-- Modern Geometric Architectural Logomark -->
  <g transform="translate(50, 40)">
    <!-- Primary Diamond / Prism Structure -->
    <path
      d="M200 40 L340 120 L340 280 L200 360 L60 280 L60 120 Z"
      fill="none"
      stroke="url(#gemGrad)"
      stroke-width="24"
      stroke-linejoin="round"
    />
    
    <!-- Dynamic Inner Fold -->
    <path
      d="M200 40 L200 360 M60 120 L200 200 L340 120 M60 280 L200 200 L340 280"
      fill="none"
      stroke="url(#accentGrad)"
      stroke-width="16"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Focal Center Core Gem -->
    <polygon
      points="200,150 250,200 200,250 150,200"
      fill="url(#gemGrad)"
    />

    <!-- Brand Typography Subtext -->
    <text
      x="200"
      y="410"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="28"
      font-weight="800"
      letter-spacing="6"
      text-anchor="middle"
      fill="#0B0B0D"
    >
      NEXUS
    </text>
    <text
      x="200"
      y="435"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="12"
      font-weight="600"
      letter-spacing="4"
      text-anchor="middle"
      fill="#1F8C7F"
    >
      STUDIOS
    </text>
  </g>
</svg>`;

export function createSampleLogoFile(): File {
  const blob = new Blob([SAMPLE_LOGO_SVG], { type: "image/svg+xml" });
  return new File([blob], "sample-nexus-logo.svg", { type: "image/svg+xml" });
}
