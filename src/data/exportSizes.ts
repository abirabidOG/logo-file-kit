export interface ExportSizeConfig {
  id: string;
  category: "Website logo" | "Favicon" | "Social profile" | "LinkedIn / Facebook" | "Print-ready";
  width: number;
  height: number;
  fileBaseName: string;
  description: string;
  recommendedUse: string;
}

export const EXPORT_SIZES: ExportSizeConfig[] = [
  // Website logo
  {
    id: "web-512",
    category: "Website logo",
    width: 512,
    height: 512,
    fileBaseName: "logo-512",
    description: "High-DPI website header & navbar",
    recommendedUse: "Retina desktop & mobile website headers",
  },
  {
    id: "web-256",
    category: "Website logo",
    width: 256,
    height: 256,
    fileBaseName: "logo-256",
    description: "Standard website header & footer",
    recommendedUse: "Standard resolution web headers and sidebars",
  },

  // Favicon
  {
    id: "favicon-64",
    category: "Favicon",
    width: 64,
    height: 64,
    fileBaseName: "logo-favicon-64",
    description: "Retina browser tab & desktop shortcut",
    recommendedUse: "High-res browser tabs, Safari pins & Windows shortcuts",
  },
  {
    id: "favicon-48",
    category: "Favicon",
    width: 48,
    height: 48,
    fileBaseName: "logo-favicon-48",
    description: "Desktop browser shortcut & bookmark",
    recommendedUse: "Browser bookmarks, desktop shortcuts & Chrome tabs",
  },
  {
    id: "favicon-32",
    category: "Favicon",
    width: 32,
    height: 32,
    fileBaseName: "logo-favicon-32",
    description: "Universal browser tab icon",
    recommendedUse: "Standard browser tab icon across all desktop browsers",
  },
  {
    id: "favicon-16",
    category: "Favicon",
    width: 16,
    height: 16,
    fileBaseName: "logo-favicon-16",
    description: "Classic micro favicon",
    recommendedUse: "Address bar micro-icon and bookmark bar listings",
  },

  // Social profile
  {
    id: "social-400",
    category: "Social profile",
    width: 400,
    height: 400,
    fileBaseName: "logo-social-400",
    description: "Instagram, X, YouTube, TikTok",
    recommendedUse: "Universal social avatar for Instagram, X (Twitter), YouTube & TikTok",
  },

  // LinkedIn / Facebook
  {
    id: "social-300",
    category: "LinkedIn / Facebook",
    width: 300,
    height: 300,
    fileBaseName: "logo-square-300",
    description: "LinkedIn company page & Facebook avatar",
    recommendedUse: "LinkedIn company page icon, Facebook Page avatar & Slack icons",
  },

  // Print-ready
  {
    id: "print-2000",
    category: "Print-ready",
    width: 2000,
    height: 2000,
    fileBaseName: "logo-print-master-2000",
    description: "2000px print master high-resolution raster",
    recommendedUse: "Print master file for large-format print, posters, signage, apparel & merchandise",
  },
  {
    id: "print-1024",
    category: "Print-ready",
    width: 1024,
    height: 1024,
    fileBaseName: "logo-print-1024",
    description: "Ultra high-resolution raster",
    recommendedUse: "Pitch decks, business cards, merchandise, invoices & banners",
  },
];
