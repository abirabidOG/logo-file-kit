"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Shield,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  Sliders,
  Palette,
  FileCheck,
  FileArchive,
  Image as ImageIcon,
  CheckCircle2,
  X,
  ExternalLink,
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
  downloadAllSizesZip,
  formatBytes,
} from "@/lib/logoProcessor";
import { EXPORT_SIZES, ExportSizeConfig } from "@/data/exportSizes";
import { createSampleLogoFile } from "@/lib/sampleLogo";
import { trackLogoExported, trackDownloadAllKit } from "@/lib/analytics";

export default function LogoResizerTool() {
  // State
  const [logo, setLogo] = useState<LoadedLogo | null>(null);
  const [background, setBackground] = useState<BackgroundMode>("transparent");
  const [customColor, setCustomColor] = useState<string>("#1F8C7F");
  const [paddingPercent, setPaddingPercent] = useState<number>(10);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>(
    EXPORT_SIZES.map((s) => s.id)
  );

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "info";
  } | null>(null);

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => setFeedbackMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  // Update live preview when logo, padding, background, or format changes
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
      paddingPercent
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
  }, [logo, background, customColor, paddingPercent, exportFormat]);

  // Process incoming file
  const handleProcessFile = useCallback(async (file: File) => {
    setErrorMessage(null);
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid file.");
      return;
    }

    setIsLoading(true);
    try {
      const loaded = await loadLogoFile(file);
      setLogo(loaded);
      setFeedbackMessage({
        text: `Loaded "${file.name}" (${loaded.width} × ${loaded.height} px). Select your export options below.`,
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load logo file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  // Try sample logo
  const handleTrySampleLogo = () => {
    const sample = createSampleLogoFile();
    handleProcessFile(sample);
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
        paddingPercent
      );
      triggerFileDownload(result);
      trackLogoExported({
        sizeId: sizeConfig.id,
        width: sizeConfig.width,
        height: sizeConfig.height,
        format: exportFormat,
        background,
        paddingPercent,
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

  // Download All as ZIP
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
          paddingPercent
        )
      );
      const results = await Promise.all(renderPromises);
      const zipRes = await downloadAllSizesZip(results, "logo-file-kit.zip");

      trackDownloadAllKit({
        fileCount: results.length,
        format: exportFormat,
        background,
        paddingPercent,
        selectedSizes: selectedConfigs.map((c) => c.id),
      });

      setFeedbackMessage({
        text: `All ${zipRes.count} logo files downloaded in logo-file-kit.zip (${formatBytes(zipRes.totalBytes)})!`,
        type: "success",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create ZIP package.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Helper for current extension
  const getExtension = () => {
    if (exportFormat === "jpg") return "jpg";
    if (exportFormat === "webp") return "webp";
    return "png";
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
        className="hidden"
        id="logo-file-input"
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

      {/* Success Toast / Notification */}
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
      {!logo && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center transition-all duration-200 flex flex-col items-center justify-center space-y-5 bg-white ${
              isDragging
                ? "border-[#1F8C7F] bg-[#EBF7F5] scale-[1.01]"
                : "border-[#E5E1D6] hover:border-[#1F8C7F] hover:bg-[#F4F2EC]/40"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EBF7F5] text-[#1F8C7F] shadow-xs">
              <Upload className="h-8 w-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-lg sm:text-xl font-extrabold text-[#0B0B0D]">
                Drop your logo here, or{" "}
                <span className="text-[#1F8C7F] underline underline-offset-4">
                  Browse files
                </span>
              </p>
              <p className="text-xs sm:text-sm text-[#4F4E55]">
                Accepts <strong className="text-[#0B0B0D]">SVG, PNG, and JPG</strong> input up to 10 MB.
              </p>
            </div>

            {/* Illustrative AI / EPS Note Required by Prompt */}
            <div className="rounded-xl border border-[#E5E1D6] bg-[#F4F2EC] px-4 py-2.5 max-w-lg text-xs text-[#4F4E55] leading-relaxed">
              <span className="font-semibold text-[#0B0B0D]">Note for Vector Designers:</span>{" "}
              Have an AI or EPS file? Export it as SVG or PNG from Illustrator first, then upload it here.
            </div>

            {/* Try a Sample Logo Button */}
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleTrySampleLogo}
                className="inline-flex items-center gap-2 rounded-full border border-[#B6E2DC] bg-[#EBF7F5] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#1F8C7F] hover:bg-[#1F8C7F] hover:text-white transition-all shadow-xs"
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
          {/* Top Bar with Logo File Info & Re-upload button */}
          <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5E1D6] text-[#1F8C7F] font-bold text-xs uppercase shadow-xs">
                {logo.isSvg ? "SVG" : logo.type.replace("image/", "")}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#0B0B0D] text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                  {logo.name}
                </p>
                <p className="text-xs text-[#4F4E55]">
                  Original: {logo.width} × {logo.height} px • {formatBytes(logo.size)} • {logo.isSvg ? "Scalable Vector" : "Raster Image"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E1D6] bg-white px-4 py-2 text-xs font-semibold text-[#0B0B0D] hover:bg-[#E5E1D6] transition-colors shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Change logo</span>
              </button>
            </div>
          </div>

          {/* Main Controls & Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Live Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-[#E5E1D6] bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4F4E55]">
                    Interactive Live Preview
                  </span>
                  <span className="text-[11px] font-semibold text-[#1F8C7F] bg-[#EBF7F5] px-2 py-0.5 rounded-md border border-[#B6E2DC]">
                    {paddingPercent}% Padding
                  </span>
                </div>

                {/* Checkerboard Preview Area */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#E5E1D6] bg-transparency-grid flex items-center justify-center p-4">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Logo Live Preview"
                      className="h-full w-full object-contain drop-shadow-xs transition-all"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-xs text-[#4F4E55] gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-[#1F8C7F]" />
                      <span>Rendering preview...</span>
                    </div>
                  )}
                </div>

                <p className="text-center text-[11px] text-[#4F4E55]">
                  Checkerboard pattern represents <strong>alpha transparency</strong>.
                </p>
              </div>
            </div>

            {/* Right Column: Customization Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-[#E5E1D6] bg-white p-6 sm:p-7 space-y-6 shadow-xs">
                {/* 1. Background Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#0B0B0D] flex items-center gap-2">
                      <Palette className="h-4 w-4 text-[#1F8C7F]" />
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
                          ? "border-[#1F8C7F] bg-[#EBF7F5] text-[#1F8C7F] ring-2 ring-[#1F8C7F]/20"
                          : "border-[#E5E1D6] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC]"
                      }`}
                    >
                      <div className="h-5 w-5 shrink-0 rounded-md border border-[#E5E1D6] bg-transparency-grid" />
                      <span>Transparent</span>
                    </button>

                    {/* White */}
                    <button
                      type="button"
                      onClick={() => setBackground("white")}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        background === "white"
                          ? "border-[#1F8C7F] bg-[#EBF7F5] text-[#1F8C7F] ring-2 ring-[#1F8C7F]/20"
                          : "border-[#E5E1D6] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC]"
                      }`}
                    >
                      <div className="h-5 w-5 shrink-0 rounded-md border border-[#E5E1D6] bg-white shadow-2xs" />
                      <span>White</span>
                    </button>

                    {/* Black */}
                    <button
                      type="button"
                      onClick={() => setBackground("black")}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        background === "black"
                          ? "border-[#1F8C7F] bg-[#EBF7F5] text-[#1F8C7F] ring-2 ring-[#1F8C7F]/20"
                          : "border-[#E5E1D6] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC]"
                      }`}
                    >
                      <div className="h-5 w-5 shrink-0 rounded-md border border-neutral-700 bg-black shadow-2xs" />
                      <span>Black</span>
                    </button>

                    {/* Custom Color Picker */}
                    <div
                      className={`relative flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        background === "custom"
                          ? "border-[#1F8C7F] bg-[#EBF7F5] text-[#1F8C7F] ring-2 ring-[#1F8C7F]/20"
                          : "border-[#E5E1D6] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC]"
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

                {/* 2. Padding Slider */}
                <div className="space-y-3 pt-4 border-t border-[#E5E1D6]">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="padding-slider"
                      className="text-sm font-bold text-[#0B0B0D] flex items-center gap-2"
                    >
                      <Sliders className="h-4 w-4 text-[#1F8C7F]" />
                      <span>Padding / Safe Zone</span>
                    </label>
                    <span className="text-sm font-extrabold text-[#1F8C7F] font-mono">
                      {paddingPercent}%
                    </span>
                  </div>

                  <input
                    id="padding-slider"
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={paddingPercent}
                    onChange={(e) => setPaddingPercent(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-[#E5E1D6] cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] text-[#4F4E55]">
                    <span>0% (Tight edge)</span>
                    <span className="text-[#1F8C7F] font-semibold">10% (Recommended default)</span>
                    <span>30% (Spacious avatar)</span>
                  </div>
                  <p className="text-xs text-[#4F4E55]">
                    Safe-zone padding prevents circular social media avatars from cutting off the corners of your logo mark.
                  </p>
                </div>

                {/* 3. Export Format Options */}
                <div className="space-y-3 pt-4 border-t border-[#E5E1D6]">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#0B0B0D] flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-[#1F8C7F]" />
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
                          ? "border-[#1F8C7F] bg-[#EBF7F5] text-[#1F8C7F] ring-2 ring-[#1F8C7F]/20 font-bold"
                          : "border-[#E5E1D6] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC] font-semibold"
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
                          ? "border-[#1F8C7F] bg-[#EBF7F5] text-[#1F8C7F] ring-2 ring-[#1F8C7F]/20 font-bold"
                          : "border-[#E5E1D6] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC] font-semibold"
                      }`}
                    >
                      <span className="text-sm">JPG</span>
                      <span className="text-[10px] text-[#4F4E55] mt-0.5">
                        White Background
                      </span>
                    </button>

                    {/* WebP */}
                    <button
                      type="button"
                      onClick={() => setExportFormat("webp")}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs transition-all ${
                        exportFormat === "webp"
                          ? "border-[#1F8C7F] bg-[#EBF7F5] text-[#1F8C7F] ring-2 ring-[#1F8C7F]/20 font-bold"
                          : "border-[#E5E1D6] bg-white text-[#0B0B0D] hover:bg-[#F4F2EC] font-semibold"
                      }`}
                    >
                      <span className="text-sm">WebP</span>
                      <span className="text-[10px] text-[#4F4E55] mt-0.5">
                        Modern & Lightweight
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Sizes Selection & Action Card */}
          <div className="rounded-3xl border border-[#E5E1D6] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D6]">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0B0B0D]">
                  Production Export Sizes
                </h3>
                <p className="text-xs sm:text-sm text-[#4F4E55]">
                  Generated simultaneously from your single upload with precision pixel resampling.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-[#1F8C7F] hover:underline underline-offset-2"
                >
                  {selectedSizeIds.length === EXPORT_SIZES.length
                    ? "Deselect All"
                    : "Select All (9 sizes)"}
                </button>

                {/* Big Download All as ZIP Button */}
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isDownloadingZip || selectedSizeIds.length === 0}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1F8C7F] hover:bg-[#176E64] disabled:opacity-50 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
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
                        ? "border-[#1F8C7F] bg-[#EBF7F5]/40"
                        : "border-[#E5E1D6] bg-white opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent div
                        className="mt-1 h-4 w-4 rounded border-[#E5E1D6] text-[#1F8C7F] focus:ring-[#1F8C7F] cursor-pointer"
                        aria-label={`Select ${cfg.fileBaseName}`}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#0B0B0D]">
                            {cfg.width} × {cfg.height}
                          </span>
                          <span className="text-[10px] font-bold text-[#1F8C7F] bg-[#EBF7F5] px-2 py-0.5 rounded-full border border-[#B6E2DC]">
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
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D6] bg-white hover:border-[#1F8C7F] hover:bg-[#EBF7F5] hover:text-[#1F8C7F] text-[#0B0B0D] px-3 py-1.5 text-xs font-bold transition-all shadow-2xs"
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
            <div className="pt-4 border-t border-[#E5E1D6] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#4F4E55]">
                {selectedSizeIds.length} of {EXPORT_SIZES.length} sizes selected. Formatted as{" "}
                <strong className="text-[#0B0B0D]">.{getExtension()}</strong> with{" "}
                <strong className="text-[#0B0B0D]">{paddingPercent}% padding</strong>.
              </p>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isDownloadingZip || selectedSizeIds.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1F8C7F] hover:bg-[#176E64] disabled:opacity-50 text-white px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all"
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

      {/* PRIVACY BADGE: Explicitly Requested Under the Tool */}
      <div className="rounded-2xl border border-[#B6E2DC] bg-[#EBF7F5] p-4 text-center max-w-xl mx-auto flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1F8C7F]">
        <Shield className="h-4 w-4 shrink-0 text-[#1F8C7F]" />
        <span>100% private. Your logo is processed in your browser and never uploaded.</span>
      </div>
    </section>
  );
}
