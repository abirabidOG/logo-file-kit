import JSZip from "jszip";
import { ExportSizeConfig } from "@/data/exportSizes";

export type BackgroundMode = "transparent" | "white" | "black" | "custom";
export type ExportFormat = "png" | "jpg" | "webp";

export interface LoadedLogo {
  file: File;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  aspectRatio: number;
  imageElement: HTMLImageElement;
  objectUrl: string;
  isSvg: boolean;
}

export interface RenderResult {
  sizeConfig: ExportSizeConfig;
  format: ExportFormat;
  fileName: string;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const SUPPORTED_MIME_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export const SUPPORTED_EXTENSIONS = [".svg", ".png", ".jpg", ".jpeg"];

/**
 * Format bytes into human readable KB or MB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  const hasValidMime = SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase());

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload an SVG, PNG, or JPG file.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds 10 MB limit (${formatBytes(file.size)}). Please compress or export a lighter version first.`,
    };
  }

  return { valid: true };
}

/**
 * Loads a File into an HTMLImageElement with dimension metadata
 */
export async function loadLogoFile(file: File): Promise<LoadedLogo> {
  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

  return new Promise((resolve, reject) => {
    let objectUrl: string;

    if (isSvg) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const blob = new Blob([text], { type: "image/svg+xml;charset=utf-8" });
        objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth || 800;
          const h = img.naturalHeight || 800;
          resolve({
            file,
            name: file.name,
            size: file.size,
            type: file.type || "image/svg+xml",
            width: w,
            height: h,
            aspectRatio: w / h,
            imageElement: img,
            objectUrl,
            isSvg: true,
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load SVG logo. Ensure the SVG file is valid."));
        };
        img.src = objectUrl;
      };
      reader.onerror = () => reject(new Error("Could not read SVG file."));
      reader.readAsText(file);
    } else {
      objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 800;
        const h = img.naturalHeight || 800;
        resolve({
          file,
          name: file.name,
          size: file.size,
          type: file.type || "image/png",
          width: w,
          height: h,
          aspectRatio: w / h,
          imageElement: img,
          objectUrl,
          isSvg: false,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image. Ensure it is a valid PNG or JPG."));
      };
      img.src = objectUrl;
    }
  });
}

/**
 * Calculates drawing coordinates to center the logo with adjustable zoom and safe padding.
 * zoomPercent = 100 is default comfortable fit (80% box size / 10% safe padding).
 * zoomPercent < 100 zooms out (shrinks logo, increases padding).
 * zoomPercent > 100 zooms in (enlarges logo).
 */
export function calculateFitRect(
  targetWidth: number,
  targetHeight: number,
  sourceWidth: number,
  sourceHeight: number,
  zoomPercent: number = 100
): { x: number; y: number; width: number; height: number } {
  // Base available box at 100% zoom provides 10% safe zone padding on each side (80% of canvas)
  const baseAvailWidth = targetWidth * 0.8;
  const baseAvailHeight = targetHeight * 0.8;

  const baseScale = Math.min(
    baseAvailWidth / sourceWidth,
    baseAvailHeight / sourceHeight
  );

  // Zoom factor: 100% = 1.0x, 40% = 0.4x, 160% = 1.6x
  const zoomFactor = Math.max(0.1, zoomPercent / 100);
  const effectiveScale = baseScale * zoomFactor;

  const drawWidth = sourceWidth * effectiveScale;
  const drawHeight = sourceHeight * effectiveScale;

  const drawX = (targetWidth - drawWidth) / 2;
  const drawY = (targetHeight - drawHeight) / 2;

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
  };
}

export function applyWhiteRemoval(canvas: HTMLCanvasElement, threshold: number) {
  if (threshold <= 0) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const limit = Math.max(0, 255 - threshold);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a > 0 && r >= limit && g >= limit && b >= limit) {
      const minVal = Math.min(r, g, b);
      if (minVal >= 255) {
        data[i + 3] = 0;
      } else {
        const factor = (255 - minVal) / threshold;
        data[i + 3] = Math.max(0, Math.min(255, Math.round(a * factor)));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Renders the logo onto a new canvas and returns Blob + DataURL
 */
export async function renderLogoToSize(
  logo: LoadedLogo,
  sizeConfig: ExportSizeConfig,
  format: ExportFormat,
  background: BackgroundMode,
  customColor: string,
  zoomPercent: number = 100,
  removeWhiteThreshold: number = 0
): Promise<RenderResult> {
  const canvas = document.createElement("canvas");
  canvas.width = sizeConfig.width;
  canvas.height = sizeConfig.height;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas 2D context could not be created.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Clear background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Fill background color
  if (background === "white") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (background === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (background === "custom") {
    ctx.fillStyle = customColor || "#5846F6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (background === "transparent" && format === "jpg") {
    // JPG does not support alpha channel; fallback to white background for clean rendering
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 3. Draw scaled and centered logo
  const rect = calculateFitRect(
    canvas.width,
    canvas.height,
    logo.width,
    logo.height,
    zoomPercent
  );

  if (removeWhiteThreshold > 0) {
    // Draw on intermediate canvas to strip white background
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d", { alpha: true });
    if (tempCtx) {
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = "high";
      tempCtx.drawImage(
        logo.imageElement,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );
      applyWhiteRemoval(tempCanvas, removeWhiteThreshold);
      ctx.drawImage(tempCanvas, 0, 0);
    }
  } else {
    ctx.drawImage(
      logo.imageElement,
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );
  }

  // 4. Output MIME & extension
  let mimeType = "image/png";
  let extension = "png";
  let quality: number | undefined = undefined;

  if (format === "jpg") {
    mimeType = "image/jpeg";
    extension = "jpg";
    quality = 0.95;
  } else if (format === "webp") {
    mimeType = "image/webp";
    extension = "webp";
    quality = 0.95;
  }

  const fileName = `${sizeConfig.fileBaseName}.${extension}`;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to generate ${fileName}`));
          return;
        }

        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({
          sizeConfig,
          format,
          fileName,
          blob,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          sizeBytes: blob.size,
        });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Creates a real binary multi-size ICO file containing PNG streams for 16, 32, 48 px.
 */
export async function createMultiSizeIcoBlob(
  pngBlobs: { width: number; height: number; blob: Blob }[]
): Promise<Blob> {
  const pngBuffers: { width: number; height: number; data: Uint8Array }[] = [];
  for (const item of pngBlobs) {
    const arrayBuf = await item.blob.arrayBuffer();
    pngBuffers.push({
      width: item.width,
      height: item.height,
      data: new Uint8Array(arrayBuf),
    });
  }

  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalHeaderSize = headerSize + count * dirEntrySize;

  let totalSize = totalHeaderSize;
  for (const item of pngBuffers) {
    totalSize += item.data.length;
  }

  const output = new Uint8Array(totalSize);
  const view = new DataView(output.buffer);

  // ICONHEADER
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // 1 = ICO
  view.setUint16(4, count, true); // Number of images

  let currentOffset = totalHeaderSize;
  for (let i = 0; i < count; i++) {
    const item = pngBuffers[i];
    const entryOffset = headerSize + i * dirEntrySize;

    // ICONDIRENTRY
    view.setUint8(entryOffset + 0, item.width >= 256 ? 0 : item.width);
    view.setUint8(entryOffset + 1, item.height >= 256 ? 0 : item.height);
    view.setUint8(entryOffset + 2, 0); // Color count (0 = >=8bpp)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32bpp RGBA)
    view.setUint32(entryOffset + 8, item.data.length, true); // Size of image data
    view.setUint32(entryOffset + 12, currentOffset, true); // Offset of image data

    output.set(item.data, currentOffset);
    currentOffset += item.data.length;
  }

  return new Blob([output], { type: "image/x-icon" });
}

/**
 * Generates a real multi-size favicon.ico with 16, 32, 48 px icons.
 */
export async function generateFaviconIco(
  logo: LoadedLogo,
  zoomPercent: number = 100,
  background: BackgroundMode = "transparent",
  customColor: string = "#5846F6",
  removeWhiteThreshold: number = 0
): Promise<Blob> {
  const sizes = [16, 32, 48];
  const pngBlobs: { width: number; height: number; blob: Blob }[] = [];

  for (const size of sizes) {
    const res = await renderLogoToSize(
      logo,
      {
        id: `ico-${size}`,
        category: "Favicon",
        width: size,
        height: size,
        fileBaseName: `favicon-${size}`,
        description: `${size}px Favicon frame`,
        recommendedUse: "Favicon ICO frame",
      },
      "png",
      background,
      customColor,
      zoomPercent,
      removeWhiteThreshold
    );
    pngBlobs.push({ width: size, height: size, blob: res.blob });
  }

  return createMultiSizeIcoBlob(pngBlobs);
}

/**
 * Cleans and optimizes SVG markup by removing XML comments, editor metadata and empty tags.
 */
export function cleanAndOptimizeSvg(svgText: string): string {
  let clean = svgText.replace(/<!--[\s\S]*?-->/g, "");
  clean = clean.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
  clean = clean.replace(/<desc[\s\S]*?<\/desc>/gi, "");
  clean = clean.replace(/\s*(xmlns:(inkscape|sodipodi|sketch|adobe|i|graph)="[^"]*")/gi, "");
  clean = clean.replace(/\s*((inkscape|sodipodi|sketch|adobe|i|graph):[a-zA-Z0-9_-]+="[^"]*")/gi, "");
  clean = clean.replace(/<g\s*>\s*<\/g>/gi, "");
  clean = clean.replace(/<defs>\s*<\/defs>/gi, "");
  return clean.trim();
}

/**
 * Extracts dominant colors from logo image for brand kit palette
 */
export async function extractDominantColors(logo: LoadedLogo, maxColors = 5): Promise<string[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return ["#0B0B0D", "#5846F6", "#F4F2EC"];

  canvas.width = 120;
  canvas.height = 120;
  ctx.drawImage(logo.imageElement, 0, 0, 120, 120);

  const imgData = ctx.getImageData(0, 0, 120, 120);
  const data = imgData.data;
  const colorBuckets: Record<string, number> = {};

  for (let i = 0; i < data.length; i += 8) { // sample every other pixel
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue; // ignore transparent pixels
    // Round to nearest 16 for clustering
    const qr = Math.round(r / 20) * 20;
    const qg = Math.round(g / 20) * 20;
    const qb = Math.round(b / 20) * 20;
    const hex = `#${Math.min(255, qr).toString(16).padStart(2, "0")}${Math.min(255, qg).toString(16).padStart(2, "0")}${Math.min(255, qb).toString(16).padStart(2, "0")}`.toUpperCase();

    colorBuckets[hex] = (colorBuckets[hex] || 0) + 1;
  }

  const sorted = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  if (sorted.length === 0) {
    return ["#0B0B0D", "#5846F6", "#FFFFFF"];
  }

  return sorted.slice(0, maxColors);
}

/**
 * Generates palette.txt content
 */
export function generatePaletteTxt(logoName: string, colors: string[]): string {
  const lines = [
    `Brand Color Palette`,
    `===================`,
    `Tool: Logo File Kit — tools.abidmahmud.cv`,
    `Logo Source: ${logoName}`,
    `Generated: ${new Date().toISOString().split("T")[0]}`,
    ``,
    `Primary & Accent Colors:`,
  ];

  colors.forEach((hex, idx) => {
    // Parse RGB
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    lines.push(`  ${idx + 1}. ${hex}  (rgb(${r}, ${g}, ${b}))`);
  });

  lines.push(``);
  lines.push(`CSS Variables:`);
  lines.push(`:root {`);
  colors.forEach((hex, idx) => {
    lines.push(`  --brand-color-${idx + 1}: ${hex};`);
  });
  lines.push(`}`);

  return lines.join("\n");
}

/**
 * Generates a one-page Brand Identity Sheet (1920x1080 PNG)
 */
export async function generateBrandSheetPng(
  logo: LoadedLogo,
  colors: string[],
  brandName?: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context for brand sheet");

  const name = brandName || logo.name.replace(/\.[^/.]+$/, "");

  // Background
  ctx.fillStyle = "#F4F2EC"; // Brand paper
  ctx.fillRect(0, 0, 1920, 1080);

  // Top header bar
  ctx.fillStyle = "#0B0B0D"; // Brand ink
  ctx.font = "bold 44px 'Inter Tight', system-ui, sans-serif";
  ctx.fillText(`${name} — Brand Identity Guide`, 100, 120);

  ctx.fillStyle = "#4F4E55"; // Smoke
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.fillText("Generated with Logo File Kit • tools.abidmahmud.cv • Client-side Free Tool", 100, 165);

  // Decorative divider
  ctx.strokeStyle = "#C9C7C1"; // Fog
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(100, 200);
  ctx.lineTo(1820, 200);
  ctx.stroke();

  // Left card: Logo display
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#E5E1D6";
  ctx.lineWidth = 2;
  ctx.roundRect(100, 240, 960, 680, 24);
  ctx.fill();
  ctx.stroke();

  // Label inside logo card
  ctx.fillStyle = "#4F4E55";
  ctx.font = "bold 16px Inter, system-ui, sans-serif";
  ctx.fillText("PRIMARY LOGO MARK & SAFE ZONE", 140, 290);

  // Draw logo centered in box
  const boxW = 800;
  const boxH = 500;
  const boxX = 180;
  const boxY = 340;
  const scale = Math.min((boxW * 0.75) / logo.width, (boxH * 0.75) / logo.height);
  const dw = logo.width * scale;
  const dh = logo.height * scale;
  const dx = boxX + (boxW - dw) / 2;
  const dy = boxY + (boxH - dh) / 2;

  ctx.drawImage(logo.imageElement, dx, dy, dw, dh);

  // Right column: Color Palette Card
  ctx.fillStyle = "#FFFFFF";
  ctx.roundRect(1100, 240, 720, 360, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#4F4E55";
  ctx.font = "bold 16px Inter, system-ui, sans-serif";
  ctx.fillText("DETECTED BRAND COLOR PALETTE", 1140, 290);

  // Swatches
  const swatchWidth = 100;
  colors.slice(0, 5).forEach((hex, i) => {
    const sx = 1140 + i * (swatchWidth + 20);
    const sy = 330;
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.roundRect(sx, sy, swatchWidth, 120, 16);
    ctx.fill();
    ctx.strokeStyle = "#C9C7C1";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#0B0B0D";
    ctx.font = "bold 15px monospace";
    ctx.fillText(hex, sx, sy + 155);

    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    ctx.fillStyle = "#4F4E55";
    ctx.font = "12px monospace";
    ctx.fillText(`${r},${g},${b}`, sx, sy + 180);
  });

  // Right column: Production Asset Checklist Card
  ctx.fillStyle = "#FFFFFF";
  ctx.roundRect(1100, 640, 720, 280, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#4F4E55";
  ctx.font = "bold 16px Inter, system-ui, sans-serif";
  ctx.fillText("EXPORTED DIGITAL KIT ASSETS", 1140, 690);

  const assets = [
    "✓ Multi-Size Favicon (16, 32, 48 px binary .ico)",
    "✓ Apple Touch Icon (180×180 px)",
    "✓ Android Chrome & PWA (192×192 & 512×512 px)",
    "✓ Social Open Graph Card (1200×630 px)",
    "✓ Web Headers (512×512 & 256×256 px)",
    "✓ Print Master (2000×2000 px 300 DPI ready)",
  ];

  ctx.fillStyle = "#0B0B0D";
  ctx.font = "500 16px Inter, system-ui, sans-serif";
  assets.forEach((item, idx) => {
    const col = idx < 3 ? 0 : 1;
    const row = idx % 3;
    ctx.fillText(item, 1140 + col * 340, 740 + row * 45);
  });

  // Footer notes
  ctx.fillStyle = "#4F4E55";
  ctx.font = "14px Inter, system-ui, sans-serif";
  ctx.fillText("Free, unlimited, private. Made entirely client-side with Logo File Kit.", 100, 970);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export brand sheet"));
    }, "image/png");
  });
}

/**
 * Triggers browser download for a single rendered file
 */
export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function triggerFileDownload(result: RenderResult): void {
  triggerBlobDownload(result.blob, result.fileName);
}

/**
 * Packages multiple logos where each logo is its own ZIP archive inside the master ZIP.
 */
export async function downloadBatchLogosZip(
  logoKits: { logoName: string; zipBlob: Blob }[],
  masterZipName = "batch-logo-kits.zip"
): Promise<{ count: number; totalBytes: number }> {
  const masterZip = new JSZip();
  let totalBytes = 0;

  for (const kit of logoKits) {
    const safeName = kit.logoName.replace(/[^a-zA-Z0-9_-]/g, "_");
    masterZip.file(`${safeName}-kit.zip`, kit.zipBlob);
    totalBytes += kit.zipBlob.size;
  }

  const finalBlob = await masterZip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  triggerBlobDownload(finalBlob, masterZipName);

  return {
    count: logoKits.length,
    totalBytes: finalBlob.size,
  };
}

/**
 * Packages all rendered sizes into a ZIP archive and initiates download
 */
export async function downloadAllSizesZip(
  results: RenderResult[],
  zipName = "logo-file-kit.zip"
): Promise<{ success: boolean; count: number; totalBytes: number }> {
  if (results.length === 0) {
    return { success: false, count: 0, totalBytes: 0 };
  }

  const zip = new JSZip();
  let totalBytes = 0;

  for (const item of results) {
    totalBytes += item.sizeBytes;
    zip.file(item.fileName, item.blob);
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return {
    success: true,
    count: results.length,
    totalBytes: zipBlob.size,
  };
}
