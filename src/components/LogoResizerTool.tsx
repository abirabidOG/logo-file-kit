"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Shield,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Palette,
  FileCheck,
  FileArchive,
  CheckCircle2,
  X,
  ZoomIn,
  ZoomOut,
  Globe,
  User,
  Sun,
  Moon,
  FileCode,
  FileText,
  Layers,
  Wand2,
} from "lucide-react";
import {
  LoadedLogo,
  BackgroundMode,
  ExportFormat,
  RenderResult,
  loadLogoFile,
  validateFile,
  renderLogoToSize,
  triggerFileDownload,
  triggerBlobDownload,
  downloadAllSizesZip,
  downloadBatchLogosZip,
  generateFaviconIco,
  cleanAndOptimizeSvg,
  extractDominantColors,
  generatePaletteTxt,
  generateBrandSheetPng,
  formatBytes,
} from "@/lib/logoProcessor";
import { EXPORT_SIZES, ExportSizeConfig } from "@/data/exportSizes";
import { createSampleLogoFile } from "@/lib/sampleLogo";
import {
  trackLogoExported,
  trackDownloadAllKit,
  trackIcoDownloaded,
  trackPreviewViewed,
  trackSvgDownloaded,
} from "@/lib/analytics";

export default function LogoResizerTool() {
  // Batch & Active logo state
  const [logos, setLogos] = useState<LoadedLogo[]>([]);
  const [activeLogoIndex, setActiveLogoIndex] = useState<number>(0);
  const logo = logos[activeLogoIndex] || null;

  // Customization state
  const [background, setBackground] = useState<BackgroundMode>("transparent");
  const [customColor, setCustomColor] = useState<string>("#5846F6");
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>(
    EXPORT_SIZES.map((s) => s.id)
  );

  // Phase 2 state: Experimental white removal & live preview mode
  const [removeWhiteBg, setRemoveWhiteBg] = useState<boolean>(false);
  const [whiteThreshold, setWhiteThreshold] = useState<number>(25);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [previewTab, setPreviewTab] = useState<"canvas" | "browser" | "avatar">("canvas");

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "info";
  } | null>(null);

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [isDownloadingBatch, setIsDownloadingBatch] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isExportingFavicon, setIsExportingFavicon] = useState<boolean>(false);
  const [isExportingBrandSheet, setIsExportingBrandSheet] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => setFeedbackMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  const effectiveThreshold = removeWhiteBg ? whiteThreshold : 0;

  // Update live preview when logo or controls change
  useEffect(() => {
    if (!logo) {
      setPreviewDataUrl(null);
      return;
    }

    let isMounted = true;
    const sampleConfig: ExportSizeConfig = {
      id: "preview",
      category: "Website logo",
      width: 512,
      height: 512,
      fileBaseName: "preview",
      description: "Live Preview",
      recommendedUse: "Preview",
    };

    renderLogoToSize(
      logo,
      sampleConfig,
      exportFormat,
      background,
      customColor,
      zoomPercent,
      effectiveThreshold
    )
      .then((res) => {
        if (isMounted) {
          setPreviewDataUrl(res.dataUrl);
        }
      })
      .catch((err) => {
        console.error("Preview render failed:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [logo, background, customColor, zoomPercent, exportFormat, effectiveThreshold]);

  // Process incoming file(s)
  const handleProcessFiles = useCallback(async (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else if (files.length === 1) {
        setErrorMessage(validation.error || "Invalid file format.");
        return;
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage("No valid SVG, PNG, or JPG files found in selection.");
      return;
    }

    setIsLoading(true);
    try {
      const loadedList: LoadedLogo[] = [];
      for (const file of validFiles) {
        const loaded = await loadLogoFile(file);
        loadedList.push(loaded);
      }

      setLogos((prev) => {
        const combined = [...prev, ...loadedList];
        return combined.slice(0, 20); // up to 20 logos in batch
      });

      if (logos.length === 0 && loadedList.length > 0) {
        setActiveLogoIndex(0);
      }

      setFeedbackMessage({
        text: `Loaded ${loadedList.length} logo${loadedList.length > 1 ? "s" : ""} successfully. Ready for export!`,
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load logo file.");
    } finally {
      setIsLoading(false);
    }
  }, [logos.length]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
      e.target.value = "";
    }
  };

  // Try sample logo
  const handleTrySampleLogo = () => {
    const sample = createSampleLogoFile();
    handleProcessFiles([sample]);
  };

  // Checkbox toggles
  const handleToggleSize = (id: string) => {
    setSelectedSizeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSizeIds.length === EXPORT_SIZES.length) {
      setSelectedSizeIds([]);
    } else {
      setSelectedSizeIds(EXPORT_SIZES.map((s) => s.id));
    }
  };

  // Download single size
  const handleDownloadSingle = async (sizeConfig: ExportSizeConfig) => {
    if (!logo) return;
    setDownloadingId(sizeConfig.id);
    try {
      const result = await renderLogoToSize(
        logo,
        sizeConfig,
        exportFormat,
        background,
        customColor,
        zoomPercent,
        effectiveThreshold
      );
      triggerFileDownload(result);
      trackLogoExported({
        sizeId: sizeConfig.id,
        width: sizeConfig.width,
        height: sizeConfig.height,
        format: exportFormat,
        background,
        zoomPercent,
        fileName: result.fileName,
      });
      setFeedbackMessage({
        text: `Exported ${result.fileName} (${formatBytes(result.sizeBytes)}) successfully!`,
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to download image.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Download All as ZIP for active logo
  const handleDownloadZip = async () => {
    if (!logo) return;
    const selectedConfigs = EXPORT_SIZES.filter((s) =>
      selectedSizeIds.includes(s.id)
    );
    if (selectedConfigs.length === 0) {
      setErrorMessage("Please select at least one logo size to export.");
      return;
    }

    setIsDownloadingZip(true);
    try {
      const renderPromises = selectedConfigs.map((cfg) =>
        renderLogoToSize(
          logo,
          cfg,
          exportFormat,
          background,
          customColor,
          zoomPercent,
          effectiveThreshold
        )
      );
      const results = await Promise.all(renderPromises);
      const cleanBaseName = logo.name.replace(/\.[^/.]+$/, "");
      const zipRes = await downloadAllSizesZip(results, `${cleanBaseName}-kit.zip`);

      trackDownloadAllKit({
        fileCount: results.length,
        format: exportFormat,
        background,
        zoomPercent,
        selectedSizes: selectedConfigs.map((c) => c.id),
      });

      setFeedbackMessage({
        text: `All ${zipRes.count} logo files downloaded in ${cleanBaseName}-kit.zip (${formatBytes(zipRes.totalBytes)})!`,
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create ZIP package.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Phase 2: Download favicon.ico (real multi-size 16, 32, 48 px binary)
  const handleDownloadFaviconIco = async () => {
    if (!logo) return;
    setIsExportingFavicon(true);
    try {
      const icoBlob = await generateFaviconIco(
        logo,
        zoomPercent,
        background,
        customColor,
        effectiveThreshold
      );
      triggerBlobDownload(icoBlob, "favicon.ico");
      trackIcoDownloaded([16, 32, 48]);
      setFeedbackMessage({
        text: "Downloaded real multi-size favicon.ico (16, 32, 48 px combined)!",
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate favicon.ico");
    } finally {
      setIsExportingFavicon(false);
    }
  };

  // Phase 2: Download Optimized SVG
  const handleDownloadOptimizedSvg = async () => {
    if (!logo) return;
    if (!logo.isSvg) {
      setErrorMessage("The active logo is a raster image (PNG/JPG). Upload an SVG to export an optimized vector file.");
      return;
    }
    try {
      const svgText = await logo.file.text();
      const cleaned = cleanAndOptimizeSvg(svgText);
      const blob = new Blob([cleaned], { type: "image/svg+xml;charset=utf-8" });
      const cleanName = `${logo.name.replace(/\.svg$/i, "")}-optimized.svg`;
      triggerBlobDownload(blob, cleanName);
      trackSvgDownloaded(cleanName);
      setFeedbackMessage({
        text: `Exported cleaned & optimized vector: ${cleanName}`,
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to optimize SVG.");
    }
  };

  // Phase 2: Download Palette TXT
  const handleDownloadPaletteTxt = async () => {
    if (!logo) return;
    try {
      const colors = await extractDominantColors(logo);
      const txt = generatePaletteTxt(logo.name, colors);
      const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
      triggerBlobDownload(blob, "brand-palette.txt");
      setFeedbackMessage({
        text: "Downloaded brand color palette TXT with CSS variables!",
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to extract palette.");
    }
  };

  // Phase 2: Download Brand Sheet PNG
  const handleDownloadBrandSheet = async () => {
    if (!logo) return;
    setIsExportingBrandSheet(true);
    try {
      const colors = await extractDominantColors(logo);
      const blob = await generateBrandSheetPng(logo, colors);
      triggerBlobDownload(blob, `${logo.name.replace(/\.[^/.]+$/, "")}-brand-sheet.png`);
      setFeedbackMessage({
        text: "Downloaded 1920×1080 One-Page Brand Guide Sheet PNG!",
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate brand sheet.");
    } finally {
      setIsExportingBrandSheet(false);
    }
  };

  // Phase 2: Batch Download (One ZIP per logo)
  const handleDownloadBatch = async () => {
    if (logos.length === 0) return;
    setIsDownloadingBatch(true);
    try {
      const selectedConfigs = EXPORT_SIZES.filter((s) =>
        selectedSizeIds.includes(s.id)
      );

      const kits: { logoName: string; zipBlob: Blob }[] = [];

      for (const currentLogo of logos) {
        const renderPromises = selectedConfigs.map((cfg) =>
          renderLogoToSize(
            currentLogo,
            cfg,
            exportFormat,
            background,
            customColor,
            zoomPercent,
            effectiveThreshold
          )
        );
        const results = await Promise.all(renderPromises);

        // Build individual ZIP for this logo
        const logoZip = new (await import("jszip")).default();
        results.forEach((r) => logoZip.file(r.fileName, r.blob));

        // Add favicon.ico if possible
        try {
          const icoBlob = await generateFaviconIco(
            currentLogo,
            zoomPercent,
            background,
            customColor,
            effectiveThreshold
          );
          logoZip.file("favicon.ico", icoBlob);
        } catch (_) {}

        const zipBlob = await logoZip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });

        kits.push({
          logoName: currentLogo.name.replace(/\.[^/.]+$/, ""),
          zipBlob,
        });
      }

      await downloadBatchLogosZip(kits, "all-logos-brand-kits.zip");

      setFeedbackMessage({
        text: `Exported batch archive with individual ZIP kits for all ${logos.length} logos!`,
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to export batch kits.");
    } finally {
      setIsDownloadingBatch(false);
    }
  };

  const handleTabChange = (tab: "canvas" | "browser" | "avatar") => {
    setPreviewTab(tab);
    trackPreviewViewed(tab);
  };

  const getExtension = () => {
    if (exportFormat === "jpg") return "jpg";
    if (exportFormat === "webp") return "webp";
    return "png";
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
        className="hidden"
        id="logo-file-input"
      />
      <input
        type="file"
        ref={batchFileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
        className="hidden"
        id="batch-logo-file-input"
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 flex items-start justify-between gap-3 text-red-800 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold">Error Processing Logo</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 p-1"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {feedbackMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5 flex items-start justify-between gap-3 text-emerald-900 text-xs sm:text-sm shadow-xs transition-all">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-500 hover:text-emerald-800 p-1"
            aria-label="Dismiss feedback"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* EMPTY STATE: Upload Zone */}
      {logos.length === 0 && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center transition-all duration-200 flex flex-col items-center justify-center space-y-5 bg-white ${
              isDragging
                ? "border-[#5846F6] bg-[#5846F6]/5 scale-[1.01]"
                : "border-[#C9C7C1] hover:border-[#5846F6] hover:bg-[#F4F2EC]/40"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5846F6]/10 text-[#5846F6] shadow-xs">
              <Upload className="h-8 w-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-lg sm:text-xl font-extrabold text-[#0B0B0D]">
                Drop your logos here, or{" "}
                <span className="text-[#5846F6] underline underline-offset-4">
                  Browse files
                </span>
              </p>
              <p className="text-xs sm:text-sm text-[#4F4E55]">
                Upload single or multiple files (batch mode supported). Accepts <strong className="text-[#0B0B0D]">SVG, PNG, and JPG</strong> up to 10 MB each.
              </p>
            </div>

            <div className="rounded-xl border border-[#C9C7C1] bg-[#F4F2EC] px-4 py-2.5 max-w-lg text-xs text-[#4F4E55] leading-relaxed">
              <span className="font-semibold text-[#0B0B0D]">Includes:</span>{" "}
              Exports multi-size <strong className="text-[#0B0B0D]">favicon.ico</strong>, Apple Touch, Android PWA, OG share cards, brand sheets, and batch ZIPs client-side!
            </div>

            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleTrySampleLogo}
                className="inline-flex items-center gap-2 rounded-full border border-[#5846F6]/20 bg-[#5846F6]/10 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#5846F6] hover:bg-[#5846F6] hover:text-white transition-all shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>Try a sample logo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE STATE: Tool Workspace with Live Preview & Controls */}
      {logo && (
        <div className="space-y-8">
          {/* Top Bar with Active Logo & Batch Strip */}
          <div className="rounded-2xl border border-[#C9C7C1] bg-[#F4F2EC] p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#C9C7C1] text-[#5846F6] font-bold text-xs uppercase shadow-xs">
                  {logo.isSvg ? "SVG" : logo.type.replace("image/", "")}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#0B0B0D] text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                    {logo.name}
                  </p>
                  <p className="text-xs text-[#4F4E55]">
                    Original: {logo.width} × {logo.height} px • {formatBytes(logo.size)} • {logo.isSvg ? "Vector SVG" : "Raster Image"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                <button
                  type="button"
                  onClick={() => batchFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#C9C7C1] bg-white px-4 py-2 text-xs font-semibold text-[#0B0B0D] hover:bg-[#E5E1D6] transition-colors shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5 text-[#5846F6]" />
                  <span>Add more logos</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLogos([]);
                    setActiveLogoIndex(0);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Batch Thumbnail Strip if > 1 logo */}
            {logos.length > 1 && (
              <div className="pt-3 border-t border-[#C9C7C1]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0B0B0D] flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#5846F6]" />
                    <span>Batch Queue ({logos.length} logos loaded)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadBatch}
                    disabled={isDownloadingBatch}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5846F6] hover:underline"
                  >
                    {isDownloadingBatch ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileArchive className="h-3.5 w-3.5" />
                    )}
                    <span>Download All (One ZIP per logo)</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {logos.map((item, idx) => (
                    <button
                      key={`${item.name}-${idx}`}
                      type="button"
                      onClick={() => setActiveLogoIndex(idx)}
                      className={`relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold shrink-0 transition-all border ${
                        idx === activeLogoIndex
                          ? "border-[#5846F6] bg-white text-[#5846F6] ring-2 ring-[#5846F6]/20 shadow-xs"
                          : "border-[#C9C7C1] bg-white/70 text-[#4F4E55] hover:bg-white"
                      }`}
                    >
                      <img
                        src={item.objectUrl}
                        alt={item.name}
                        className="h-5 w-5 object-contain rounded"
                      />
                      <span className="max-w-[120px] truncate">{item.name}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogos((prev) => prev.filter((_, i) => i !== idx));
                          if (activeLogoIndex >= logos.length - 1) {
                            setActiveLogoIndex(Math.max(0, logos.length - 2));
                          }
                        }}
                        className="text-neutral-400 hover:text-red-500 ml-1"
                        title="Remove"
                      >
                        ×
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Phase 2 Actions Bar */}
          <div className="rounded-2xl border border-[#C9C7C1] bg-white p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F4E55] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#5846F6]" />
                <span>Quick Exports:</span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Favicon.ico button */}
              <button
                type="button"
                onClick={handleDownloadFaviconIco}
                disabled={isExportingFavicon}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#5846F6]/30 bg-[#5846F6]/10 hover:bg-[#5846F6] hover:text-white text-[#5846F6] px-3.5 py-2 text-xs font-bold transition-all shadow-2xs"
                title="Exports real binary 16, 32, 48 px favicon.ico"
              >
                {isExportingFavicon ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
                <span>Download favicon.ico</span>
              </button>

              {/* Optimized SVG button */}
              {logo.isSvg && (
                <button
                  type="button"
                  onClick={handleDownloadOptimizedSvg}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9C7C1] bg-white hover:border-[#5846F6] hover:text-[#5846F6] text-[#0B0B0D] px-3.5 py-2 text-xs font-bold transition-all shadow-2xs"
                  title="Strip XML comments and editor metadata"
                >
                  <FileCode className="h-3.5 w-3.5 text-[#5846F6]" />
                  <span>Download optimized SVG</span>
                </button>
              )}

              {/* Palette TXT */}
              <button
                type="button"
                onClick={handleDownloadPaletteTxt}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9C7C1] bg-white hover:border-[#5846F6] hover:text-[#5846F6] text-[#0B0B0D] px-3.5 py-2 text-xs font-bold transition-all shadow-2xs"
                title="Download brand colors as TXT & CSS variables"
              >
                <Palette className="h-3.5 w-3.5 text-[#5846F6]" />
                <span>Palette TXT</span>
              </button>

              {/* Brand Sheet PNG */}
              <button
                type="button"
                onClick={handleDownloadBrandSheet}
                disabled={isExportingBrandSheet}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9C7C1] bg-white hover:border-[#5846F6] hover:text-[#5846F6] text-[#0B0B0D] px-3.5 py-2 text-xs font-bold transition-all shadow-2xs"
                title="Download 1920x1080 Brand Identity Sheet PNG"
              >
                {isExportingBrandSheet ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-[#5846F6]" />
                )}
                <span>Brand Sheet (PNG)</span>
              </button>
            </div>
          </div>

          {/* Main Controls & Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Live Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-[#C9C7C1] bg-white p-5 space-y-4 shadow-xs">
                {/* Header with preview tabs and dark/light toggle */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-xl border border-[#C9C7C1]/50">
                    <button
                      type="button"
                      onClick={() => handleTabChange("canvas")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        previewTab === "canvas"
                          ? "bg-white text-[#5846F6] shadow-2xs"
                          : "text-[#4F4E55] hover:text-[#0B0B0D]"
                      }`}
                    >
                      Canvas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("browser")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        previewTab === "browser"
                          ? "bg-white text-[#5846F6] shadow-2xs"
                          : "text-[#4F4E55] hover:text-[#0B0B0D]"
                      }`}
                    >
                      Browser Tab
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("avatar")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        previewTab === "avatar"
                          ? "bg-white text-[#5846F6] shadow-2xs"
                          : "text-[#4F4E55] hover:text-[#0B0B0D]"
                      }`}
                    >
                      Avatar
                    </button>
                  </div>

                  {/* Dark/Light Background Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = previewTheme === "light" ? "dark" : "light";
                      setPreviewTheme(next);
                      trackPreviewViewed(`theme_${next}`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9C7C1] px-2.5 py-1 text-xs font-semibold text-[#4F4E55] hover:text-[#0B0B0D]"
                    title="Toggle preview surface theme"
                  >
                    {previewTheme === "light" ? (
                      <>
                        <Moon className="h-3.5 w-3.5 text-[#5846F6]" />
                        <span>Dark Mock</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                        <span>Light Mock</span>
                      </>
                    )}
                  </button>
                </div>

                {/* TAB 1: Default Canvas Preview */}
                {previewTab === "canvas" && (
                  <div
                    className={`relative aspect-square w-full rounded-2xl overflow-hidden border border-[#C9C7C1] flex items-center justify-center p-4 transition-colors ${
                      previewTheme === "dark" ? "bg-[#0B0B0D]" : "bg-transparency-grid"
                    }`}
                  >
                    {previewDataUrl ? (
                      <img
                        src={previewDataUrl}
                        alt="Logo Live Preview"
                        className="h-full w-full object-contain drop-shadow-xs transition-all"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-xs text-[#4F4E55] gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-[#5846F6]" />
                        <span>Rendering preview...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Realistic Browser Tab Mock */}
                {previewTab === "browser" && (
                  <div
                    className={`rounded-2xl border border-[#C9C7C1] overflow-hidden ${
                      previewTheme === "dark" ? "bg-[#1A1A1E] text-white" : "bg-[#F4F2EC] text-[#0B0B0D]"
                    }`}
                  >
                    {/* Browser Chrome Header */}
                    <div className="px-3 py-2.5 border-b border-[#C9C7C1]/40 flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>

                      {/* Mock Tab */}
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-t-lg text-xs font-bold max-w-[200px] truncate shadow-2xs ${
                          previewTheme === "dark" ? "bg-[#0B0B0D]" : "bg-white"
                        }`}
                      >
                        {previewDataUrl && (
                          <img
                            src={previewDataUrl}
                            alt="Favicon"
                            className="h-3.5 w-3.5 object-contain shrink-0"
                          />
                        )}
                        <span className="truncate">{logo.name.replace(/\.[^/.]+$/, "")} — Official</span>
                      </div>
                    </div>

                    {/* URL Bar */}
                    <div className="p-3 border-b border-[#C9C7C1]/30">
                      <div
                        className={`rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-2 ${
                          previewTheme === "dark" ? "bg-[#0B0B0D] text-neutral-400" : "bg-white text-neutral-600 border border-[#C9C7C1]/60"
                        }`}
                      >
                        <Globe className="h-3 w-3 text-emerald-500" />
                        <span className="truncate">https://{logo.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com</span>
                      </div>
                    </div>

                    {/* Web Content Body */}
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                      {previewDataUrl && (
                        <img
                          src={previewDataUrl}
                          alt="Hero Logo"
                          className="h-24 w-48 object-contain drop-shadow-sm"
                        />
                      )}
                      <p className="text-xs text-[#4F4E55]">
                        Simulated live browser tab display showing your generated 16/32/48px favicon.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: Circle Avatar Preview */}
                {previewTab === "avatar" && (
                  <div
                    className={`rounded-2xl border border-[#C9C7C1] p-6 flex flex-col items-center justify-center space-y-4 ${
                      previewTheme === "dark" ? "bg-[#0B0B0D]" : "bg-[#F4F2EC]"
                    }`}
                  >
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-[#5846F6] shadow-md bg-white flex items-center justify-center p-3">
                      {previewDataUrl ? (
                        <img
                          src={previewDataUrl}
                          alt="Round Avatar Crop"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <User className="h-10 w-10 text-neutral-300" />
                      )}
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-[#0B0B0D]">Round Crop Avatar</p>
                      <p className="text-[11px] text-[#4F4E55]">
                        Displays circular masking used by Instagram, X, LinkedIn, and Slack.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#4F4E55]">
                  <span>Zoom: <strong>{zoomPercent}%</strong></span>
                  <span>Surface: <strong className="capitalize">{previewTheme}</strong></span>
                </div>
              </div>
            </div>

            {/* Right Column: Customization Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-[#C9C7C1] bg-white p-6 sm:p-7 space-y-6 shadow-xs">
                {/* 1. Background Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#0B0B0D] flex items-center gap-2">
                      <Palette className="h-4 w-4 text-[#5846F6]" />
                      <span>Background Color</span>
                    </label>
                    <span className="text-xs text-[#4F4E55] capitalize font-medium">
                      {background === "custom" ? customColor : background}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Transparent */}
                    <button
                      type="button"
                      onClick={() => setBackground("transparent")}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        background === "transparent"
                          ? "border-[#5846F6] bg-[#5846F6]/10 text-[#5846F6] ring-2 ring-[#5846F6]/20"
                          : "border-[#C9C7C1] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC]"
                      }`}
                    >
                      <div className="h-5 w-5 shrink-0 rounded-md border border-[#C9C7C1] bg-transparency-grid" />
                      <span>Transparent</span>
                    </button>

                    {/* White */}
                    <button
                      type="button"
                      onClick={() => setBackground("white")}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        background === "white"
                          ? "border-[#5846F6] bg-[#5846F6]/10 text-[#5846F6] ring-2 ring-[#5846F6]/20"
                          : "border-[#C9C7C1] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC]"
                      }`}
                    >
                      <div className="h-5 w-5 shrink-0 rounded-md border border-[#C9C7C1] bg-white shadow-2xs" />
                      <span>White</span>
                    </button>

                    {/* Black */}
                    <button
                      type="button"
                      onClick={() => setBackground("black")}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        background === "black"
                          ? "border-[#5846F6] bg-[#5846F6]/10 text-[#5846F6] ring-2 ring-[#5846F6]/20"
                          : "border-[#C9C7C1] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC]"
                      }`}
                    >
                      <div className="h-5 w-5 shrink-0 rounded-md border border-neutral-700 bg-black shadow-2xs" />
                      <span>Black</span>
                    </button>

                    {/* Custom Color Picker */}
                    <div
                      className={`relative flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                        background === "custom"
                          ? "border-[#5846F6] bg-[#5846F6]/10 text-[#5846F6] ring-2 ring-[#5846F6]/20"
                          : "border-[#C9C7C1] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC]"
                      }`}
                      onClick={() => setBackground("custom")}
                    >
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setBackground("custom");
                        }}
                        className="h-5 w-5 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
                        title="Pick custom color"
                        aria-label="Custom color picker"
                      />
                      <span className="truncate">
                        {background === "custom" ? customColor.toUpperCase() : "Custom"}
                      </span>
                    </div>
                  </div>

                  {background === "transparent" && exportFormat === "jpg" && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                      <strong>Note:</strong> JPG format does not support transparency. A solid white background will be automatically applied when exporting as JPG. For transparent logos, choose <strong>PNG</strong> or <strong>WebP</strong>.
                    </p>
                  )}
                </div>

                {/* 2. Experimental White-Background Removal (Phase 2) */}
                <div className="space-y-3 pt-4 border-t border-[#C9C7C1]">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#0B0B0D] flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-[#5846F6]" />
                      <span>White Background Removal</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                        Experimental
                      </span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeWhiteBg}
                        onChange={(e) => setRemoveWhiteBg(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5846F6]"></div>
                    </label>
                  </div>

                  {removeWhiteBg && (
                    <div className="p-3 bg-[#F4F2EC] rounded-xl border border-[#C9C7C1] space-y-2">
                      <div className="flex justify-between text-xs text-[#4F4E55]">
                        <span>Tolerance threshold</span>
                        <span className="font-mono font-bold text-[#0B0B0D]">{whiteThreshold}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        step="1"
                        value={whiteThreshold}
                        onChange={(e) => setWhiteThreshold(Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg bg-neutral-300 cursor-pointer accent-[#5846F6]"
                      />
                      <p className="text-[11px] text-[#4F4E55]">
                        Automatically detects and renders near-white background pixels transparent.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Logo Size / Zoom Slider */}
                <div className="space-y-3 pt-4 border-t border-[#C9C7C1]">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="zoom-slider"
                      className="text-sm font-bold text-[#0B0B0D] flex items-center gap-2"
                    >
                      <ZoomIn className="h-4 w-4 text-[#5846F6]" />
                      <span>Logo Size / Zoom</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {zoomPercent !== 100 && (
                        <button
                          type="button"
                          onClick={() => setZoomPercent(100)}
                          className="text-[11px] font-semibold text-[#5846F6] hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                      <span className="text-sm font-extrabold text-[#5846F6] font-mono bg-[#5846F6]/10 px-2.5 py-0.5 rounded-md border border-[#5846F6]/20">
                        {zoomPercent}%
                      </span>
                    </div>
                  </div>

                  <input
                    id="zoom-slider"
                    type="range"
                    min="40"
                    max="160"
                    step="1"
                    value={zoomPercent}
                    onChange={(e) => setZoomPercent(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-[#C9C7C1]/50 cursor-pointer accent-[#5846F6]"
                    aria-label="Logo size and zoom slider"
                  />

                  <div className="flex justify-between items-center text-[11px] text-[#4F4E55]">
                    <span className="flex items-center gap-1 font-medium">
                      <ZoomOut className="h-3.5 w-3.5 text-[#4F4E55]" />
                      <span>Zoom out (pad)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomPercent(100)}
                      className="text-[#5846F6] font-bold hover:underline cursor-pointer"
                    >
                      100% (Default)
                    </button>
                    <span className="flex items-center gap-1 font-medium">
                      <span>Zoom in (enlarge)</span>
                      <ZoomIn className="h-3.5 w-3.5 text-[#4F4E55]" />
                    </span>
                  </div>
                </div>

                {/* 4. Export Format Options */}
                <div className="space-y-3 pt-4 border-t border-[#C9C7C1]">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#0B0B0D] flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-[#5846F6]" />
                      <span>Export Format</span>
                    </label>
                    <span className="text-xs font-semibold text-[#4F4E55]">
                      All files will export as <strong>.{getExtension()}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* PNG */}
                    <button
                      type="button"
                      onClick={() => setExportFormat("png")}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs transition-all ${
                        exportFormat === "png"
                          ? "border-[#5846F6] bg-[#5846F6]/10 text-[#5846F6] ring-2 ring-[#5846F6]/20 font-bold"
                          : "border-[#C9C7C1] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC] font-semibold"
                      }`}
                    >
                      <span className="text-sm">PNG</span>
                      <span className="text-[10px] text-[#4F4E55] mt-0.5">
                        Transparent (Default)
                      </span>
                    </button>

                    {/* JPG */}
                    <button
                      type="button"
                      onClick={() => setExportFormat("jpg")}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs transition-all ${
                        exportFormat === "jpg"
                          ? "border-[#5846F6] bg-[#5846F6]/10 text-[#5846F6] ring-2 ring-[#5846F6]/20 font-bold"
                          : "border-[#C9C7C1] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC] font-semibold"
                      }`}
                    >
                      <span className="text-sm">JPG</span>
                      <span className="text-[10px] text-[#4F4E55] mt-0.5">
                        Solid Background
                      </span>
                    </button>

                    {/* WebP */}
                    <button
                      type="button"
                      onClick={() => setExportFormat("webp")}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs transition-all ${
                        exportFormat === "webp"
                          ? "border-[#5846F6] bg-[#5846F6]/10 text-[#5846F6] ring-2 ring-[#5846F6]/20 font-bold"
                          : "border-[#C9C7C1] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC] font-semibold"
                      }`}
                    >
                      <span className="text-sm">WebP</span>
                      <span className="text-[10px] text-[#4F4E55] mt-0.5">
                        Ultra Lightweight
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Sizes Selection & Action Card */}
          <div className="rounded-3xl border border-[#C9C7C1] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C9C7C1]">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0B0B0D]">
                  Production Export Sizes
                </h3>
                <p className="text-xs sm:text-sm text-[#4F4E55]">
                  Includes web headers, favicons, Apple touch icon 180×180, Android PWA (192, 512), OG image (1200×630), and 2000px print master.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-[#5846F6] hover:underline underline-offset-2"
                >
                  {selectedSizeIds.length === EXPORT_SIZES.length
                    ? "Deselect All"
                    : `Select All (${EXPORT_SIZES.length} sizes)`}
                </button>

                {/* Big Download All as ZIP Button */}
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isDownloadingZip || selectedSizeIds.length === 0}
                  className="inline-flex items-center gap-2 rounded-full bg-[#5846F6] hover:bg-[#4735E2] disabled:opacity-50 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {isDownloadingZip ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating ZIP...</span>
                    </>
                  ) : (
                    <>
                      <FileArchive className="h-4 w-4" />
                      <span>Download All as ZIP ({selectedSizeIds.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of Export Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {EXPORT_SIZES.map((cfg) => {
                const isSelected = selectedSizeIds.includes(cfg.id);
                const isItemDownloading = downloadingId === cfg.id;
                const dynamicFileName = `${cfg.fileBaseName}.${getExtension()}`;

                return (
                  <div
                    key={cfg.id}
                    onClick={() => handleToggleSize(cfg.id)}
                    className={`cursor-pointer rounded-2xl border p-4 sm:p-4.5 flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? "border-[#5846F6] bg-[#5846F6]/5"
                        : "border-[#C9C7C1] bg-white opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 rounded border-[#C9C7C1] text-[#5846F6] focus:ring-[#5846F6] cursor-pointer"
                        aria-label={`Select ${cfg.fileBaseName}`}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#0B0B0D]">
                            {cfg.width} × {cfg.height}
                          </span>
                          <span className="text-[10px] font-bold text-[#5846F6] bg-[#5846F6]/10 px-2 py-0.5 rounded-full border border-[#5846F6]/20">
                            {cfg.category}
                          </span>
                        </div>
                        <p className="font-mono text-xs font-semibold text-[#0B0B0D] mt-1 truncate">
                          {dynamicFileName}
                        </p>
                        <p className="text-[11px] text-[#4F4E55] mt-0.5 truncate">
                          {cfg.recommendedUse}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(cfg)}
                        disabled={isItemDownloading}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9C7C1] bg-white hover:border-[#5846F6] hover:bg-[#5846F6]/10 hover:text-[#5846F6] text-[#0B0B0D] px-3 py-1.5 text-xs font-bold transition-all shadow-2xs"
                        aria-label={`Download ${dynamicFileName}`}
                      >
                        {isItemDownloading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Bar Action on Mobile */}
            <div className="pt-4 border-t border-[#C9C7C1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#4F4E55]">
                {selectedSizeIds.length} of {EXPORT_SIZES.length} sizes selected. Formatted as{" "}
                <strong className="text-[#0B0B0D]">.{getExtension()}</strong> with{" "}
                <strong className="text-[#0B0B0D]">{zoomPercent}% zoom</strong>.
              </p>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isDownloadingZip || selectedSizeIds.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#5846F6] hover:bg-[#4735E2] disabled:opacity-50 text-white px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                {isDownloadingZip ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Packing ZIP Archive...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="h-4 w-4" />
                    <span>Download All as ZIP ({selectedSizeIds.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY BADGE */}
      <div className="rounded-2xl border border-[#C9C7C1] bg-white p-4 text-center max-w-xl mx-auto flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#0B0B0D]">
        <Shield className="h-4 w-4 shrink-0 text-[#5846F6]" />
        <span>100% private. Your logo is processed entirely in your browser and never uploaded.</span>
      </div>
    </section>
  );
}
