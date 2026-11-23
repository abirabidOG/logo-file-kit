// Google Analytics 4 Integration & Event Tracker for Logo File Kit

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-ZF1FSM8N07";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Generic helper to send GA4 events
export function trackEvent(action: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    if (process.env.NODE_ENV === "development") {
      console.log(`[GA4 Event]: ${action}`, params);
    }
    return;
  }

  try {
    window.gtag("event", action, params);
  } catch (error) {
    console.error("Failed to send GA4 event", error);
  }
}

/**
 * Fired when an individual logo size is successfully exported/downloaded
 */
export function trackLogoExported(params: {
  sizeId: string;
  width: number;
  height: number;
  format: "png" | "jpg" | "webp";
  background: "transparent" | "white" | "black" | "custom";
  zoomPercent?: number;
  paddingPercent?: number;
  fileName: string;
}) {
  trackEvent("logo_exported", {
    size_id: params.sizeId,
    dimensions: `${params.width}x${params.height}`,
    export_format: params.format,
    background_type: params.background,
    zoom_percent: params.zoomPercent ?? 100,
    padding_percent: params.paddingPercent ?? (100 - (params.zoomPercent ?? 100)),
    file_name: params.fileName,
  });
}

/**
 * Fired on ZIP download ("Download All as ZIP").
 * Designed to be marked as a Key Event (Conversion) in GA4.
 */
export function trackDownloadAllKit(params: {
  fileCount: number;
  format: "png" | "jpg" | "webp";
  background: "transparent" | "white" | "black" | "custom";
  zoomPercent?: number;
  paddingPercent?: number;
  selectedSizes: string[];
}) {
  trackEvent("download_all_kit", {
    event_category: "Conversion",
    event_label: "ZIP Download All",
    fileCount: params.fileCount,
    export_format: params.format,
    background_type: params.background,
    zoom_percent: params.zoomPercent ?? 100,
    padding_percent: params.paddingPercent ?? (100 - (params.zoomPercent ?? 100)),
    selected_sizes: params.selectedSizes.join(","),
  });
}

/**
 * Phase 2 Events
 */
export function trackIcoDownloaded(sizes: number[] = [16, 32, 48]) {
  trackEvent("ico_downloaded", {
    sizes: sizes.join(","),
    format: "ico",
  });
}

export function trackPreviewViewed(viewType: string = "browser_tab") {
  trackEvent("preview_viewed", {
    view_type: viewType,
  });
}

export function trackSvgDownloaded(fileName: string) {
  trackEvent("svg_downloaded", {
    file_name: fileName,
  });
}
