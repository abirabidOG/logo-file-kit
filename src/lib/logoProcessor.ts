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

/**
 * Renders the logo onto a new canvas and returns Blob + DataURL
 */
export async function renderLogoToSize(
  logo: LoadedLogo,
  sizeConfig: ExportSizeConfig,
  format: ExportFormat,
  background: BackgroundMode,
  customColor: string,
  zoomPercent: number = 100
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
    ctx.fillStyle = customColor || "#1F8C7F";
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

  ctx.drawImage(
    logo.imageElement,
    rect.x,
    rect.y,
    rect.width,
    rect.height
  );

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
 * Triggers browser download for a single rendered file
 */
export function triggerFileDownload(result: RenderResult): void {
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
