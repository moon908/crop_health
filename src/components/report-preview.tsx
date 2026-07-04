"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  MapPin, 
  Compass,
  Cpu,
  Leaf,
  FileSpreadsheet,
  FileCode,
  FileImage,
  AlertTriangle
} from "lucide-react";
import { LEAF_CASES } from "@/lib/mock-data";
import { AIAnalysisResult } from "@/lib/types";

interface ReportPreviewProps {
  onShowToast: (message: string, type: "success" | "warning" | "error") => void;
  selectedScanCase?: AIAnalysisResult | null;
}

export default function ReportPreview({ onShowToast, selectedScanCase }: ReportPreviewProps) {
  // Combine catalog cases and the active scanned case
  const availableCases = useMemo(() => {
    const list = [...LEAF_CASES] as any[];
    if (selectedScanCase && !list.some(c => c.id === selectedScanCase.id)) {
      list.unshift(selectedScanCase);
    }
    return list;
  }, [selectedScanCase]);

  const [selectedCase, setSelectedCase] = useState<any>(
    selectedScanCase || availableCases[0]
  );

  const timestamp = selectedCase.timestamp || "2026-07-04 14:10:00 UTC";

  // Trigger export from backend
  const triggerDownload = async (format: "pdf" | "csv" | "json" | "png") => {
    // If selecting a mock case that wasn't uploaded (i.e. has a string id starting with "case-"),
    // prompt user to perform a real scan first.
    if (selectedCase.id && selectedCase.id.startsWith("case-")) {
      onShowToast("Simulation cases do not exist in the active backend session. Please upload a real crop image first.", "warning");
      return;
    }

    onShowToast(`Requesting ${format.toUpperCase()} assembly from AI backend...`, "success");

    try {
      const response = await fetch(`http://localhost:8000/api/download/${format}?id=${selectedCase.id}`);
      if (!response.ok) {
        throw new Error(`Failed to compile ${format.toUpperCase()} report.`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      link.download = `Crop_Report_${dateStr}_${selectedCase.id}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onShowToast(`Downloaded Crop_Report_${dateStr}_${selectedCase.id}.${format} successfully!`, "success");
    } catch (error) {
      onShowToast(`Download failed: Ensure the python backend is running.`, "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      
      {/* Top Selector Panel */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-secondary animate-pulse" />
          <span className="font-bold text-text-main">REPORT BUNDLER CORE</span>
        </div>

        {/* Scan Selection Dropdown */}
        <div className="flex items-center space-x-3">
          <span className="text-text-muted text-[10px] uppercase font-bold">SELECT SCAN REPORT:</span>
          <select
            value={selectedCase.id}
            onChange={(e) => {
              const found = availableCases.find(c => c.id === e.target.value);
              if (found) setSelectedCase(found);
            }}
            className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-[10px] text-text-main focus:outline-none focus:border-secondary cursor-pointer font-bold"
          >
            {availableCases.map(c => (
              <option key={c.id} value={c.id}>{c.name || `${c.crop_info?.crop_type?.split(" (")[0] || "Unknown Crop"} - ${c.disease_analysis?.disease_detected || "Unknown Disease"}`}</option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            onClick={() => triggerDownload("pdf")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT PDF</span>
          </button>
          <button
            onClick={() => triggerDownload("csv")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border hover:bg-card text-text-muted hover:text-text-main rounded-lg transition-colors cursor-pointer"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => triggerDownload("json")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border hover:bg-card text-text-muted hover:text-text-main rounded-lg transition-colors cursor-pointer"
            title="Download JSON"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => triggerDownload("png")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border hover:bg-card text-text-muted hover:text-text-main rounded-lg transition-colors cursor-pointer"
            title="Download PNG Analysis"
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-background hover:bg-border/40 border border-border rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT</span>
          </button>
        </div>
      </div>

      {/* Warning if using simulator case */}
      {selectedCase.id && selectedCase.id.startsWith("case-") && (
        <div className="p-3 border border-warning/30 bg-warning/5 rounded-xl text-warning flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Viewing Simulator Sample Report</span>
            <span className="block text-[10px] mt-0.5">
              Downloads are disabled for preset catalog presets. To download PDF, CSV, JSON, and PNG reports, please go to the <b>Workbench</b> tab, upload an image, and run the real-time AI scan.
            </span>
          </div>
        </div>
      )}

      {/* Printable Sheet (Simulated A4 Paper Layout) */}
      <div className="bg-card border border-border rounded-xl p-8 max-w-4xl mx-auto shadow-md relative overflow-hidden print:border-none print:shadow-none print:p-0">
        
        {/* Decorative Grid Overlay inside report */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

        {/* A4 Sheet Header */}
        <div className="flex justify-between items-start border-b-2 border-primary pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-main tracking-wider">
                AETHERIA AGRI-VISION LABS
              </h2>
              <span className="text-[9px] text-text-muted font-mono block">
                USDA VERIFIED PATHOLOGY DIAGNOSTIC CORES
              </span>
            </div>
          </div>
          <div className="text-right text-[9px] text-text-muted space-y-0.5">
            <div>REPORT ID: <span className="text-text-main font-bold">ATH-{selectedCase.id.toUpperCase()}</span></div>
            <div>STATUS: <span className="text-secondary font-bold">VERIFIED CERTIFICATION</span></div>
            <div>GENERATED: <span className="text-text-main">{timestamp}</span></div>
          </div>
        </div>

        {/* Sheet Section: Coordinates & Farm Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6 border-b border-border/80">
          <div>
            <span className="text-[8px] text-text-muted font-bold block uppercase">STATION SITE</span>
            <span className="text-[10px] text-text-main font-bold flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>Green Prairie Farms</span>
            </span>
          </div>
          <div>
            <span className="text-[8px] text-text-muted font-bold block uppercase">PLOT LOCATION</span>
            <span className="text-[10px] text-text-main font-bold flex items-center space-x-1 mt-0.5">
              <Compass className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>42.368° N, -83.352° W</span>
            </span>
          </div>
          <div>
            <span className="text-[8px] text-text-muted font-bold block uppercase">CROP TYPE</span>
            <span className="text-[10px] text-text-main font-bold mt-0.5 block">{selectedCase.cropType || selectedCase.crop_info?.crop_type}</span>
          </div>
          <div>
            <span className="text-[8px] text-text-muted font-bold block uppercase">ANALYST ENGINE</span>
            <span className="text-[10px] text-text-main font-bold mt-0.5 flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>ResNet-50 v4.1 (Foliar)</span>
            </span>
          </div>
        </div>

        {/* Sheet Section: Diagnostic Result Summary */}
        <div className="py-6 border-b border-border/80 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="text-[8px] text-text-muted font-bold block uppercase">DIAGNOSIS (PATHOGEN CLASSIFICATION)</span>
              <h3 className="text-sm font-bold text-text-main mt-0.5">
                {selectedCase.disease || selectedCase.disease_analysis?.disease_detected}
              </h3>
            </div>
            <div>
              <span className="text-[8px] text-text-muted font-bold block uppercase">PATHOLOGICAL EVALUATION SUMMARY</span>
              <p className="text-[10px] text-text-main leading-relaxed mt-1">
                {selectedCase.description || selectedCase.ai_explanation}
              </p>
            </div>
          </div>
          <div className="md:col-span-4 bg-background/50 border border-border p-4 rounded-lg flex flex-col justify-between">
            <div className="space-y-3 font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted">AI CONFIDENCE:</span>
                <span className="text-accent font-bold">
                  {selectedCase.confidence || selectedCase.disease_analysis?.confidence_score}%
                </span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2">
                <span className="text-text-muted">SEVERITY LEVEL:</span>
                <span className="text-warning font-bold">
                  {selectedCase.severity || selectedCase.disease_analysis?.severity_level}%
                </span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2">
                <span className="text-text-muted">YIELD REDUCTION:</span>
                <span className="text-danger font-bold">-{selectedCase.yieldImpact}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sheet Section: Bounding Box and Segments Thumbnail Simulation */}
        <div className="py-6 border-b border-border/80 space-y-4">
          <span className="text-[8px] text-text-muted font-bold block uppercase">VISION SEGMENTATION PROOFS</span>
          <div className="grid grid-cols-2 gap-4">
            {/* Thumbnail 1: Raw */}
            <div className="border border-border rounded-lg p-2 bg-background flex flex-col items-center min-h-[140px] justify-center">
              <span className="text-[8px] text-text-muted uppercase mb-2">TELEMETRY CAMERA INPUT</span>
              {selectedCase.original_image_base64 ? (
                <img 
                  src={selectedCase.original_image_base64} 
                  alt="Original telemetry input" 
                  className="w-24 h-24 object-contain rounded"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-secondary">
                  <path d="M50 10 C70 30, 80 50, 50 90 C20 50, 30 30, 50 10 Z" fill="#16A34A" />
                  <circle cx="55" cy="45" r="4" fill="#854D0E" fillOpacity="0.8" />
                  <circle cx="45" cy="60" r="5" fill="#854D0E" fillOpacity="0.8" />
                </svg>
              )}
            </div>
            {/* Thumbnail 2: Mask */}
            <div className="border border-border rounded-lg p-2 bg-background flex flex-col items-center min-h-[140px] justify-center">
              <span className="text-[8px] text-text-muted uppercase mb-2">NEURAL NETWORK MASK GENERATED</span>
              {selectedCase.mask_image_base64 ? (
                <img 
                  src={selectedCase.mask_image_base64} 
                  alt="AI segmentation overlay" 
                  className="w-24 h-24 object-contain rounded bg-slate-950"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-secondary">
                  <path d="M50 10 C70 30, 80 50, 50 90 C20 50, 30 30, 50 10 Z" fill="#06B6D4" fillOpacity="0.2" stroke="#06B6D4" />
                  <circle cx="55" cy="45" r="5.5" fill="#DC2626" fillOpacity="0.5" stroke="#DC2626" strokeWidth="0.5" />
                  <circle cx="45" cy="60" r="6.5" fill="#DC2626" fillOpacity="0.5" stroke="#DC2626" strokeWidth="0.5" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Sheet Section: Treatment Recommendations */}
        <div className="py-6 border-b border-border/80">
          <span className="text-[8px] text-text-muted font-bold block uppercase mb-3">REMEDIAL TREATMENT PROTOCOL</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border p-3 rounded bg-background/30">
              <span className="text-[8px] text-text-muted font-bold block">PESTICIDE TARGET</span>
              <span className="text-text-main font-bold mt-1 block">
                {selectedCase.recommendations.fungicide_pesticide || selectedCase.recommendations.pesticide}
              </span>
            </div>
            <div className="border border-border p-3 rounded bg-background/30">
              <span className="text-[8px] text-text-muted font-bold block">NUTRITIONAL REGIMEN</span>
              <span className="text-text-main font-bold mt-1 block">{selectedCase.recommendations.fertilizer}</span>
            </div>
            <div className="border border-border p-3 rounded bg-background/30">
              <span className="text-[8px] text-text-muted font-bold block">IRRIGATION MATRIX</span>
              <span className="text-text-main font-bold mt-1 block">
                {selectedCase.recommendations.watering || selectedCase.recommendations.water}
              </span>
            </div>
          </div>
        </div>

        {/* Report Footer with QR Verification */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-[8px] text-text-muted max-w-sm font-mono leading-relaxed text-center sm:text-left">
            This telemetry report was generated automatically by the Aetheria agricultural analysis cloud. Diagnosis code certifications comply with ISO-9001 and USDA precision farming databases.
          </div>
          
          {/* QR Code Graphic using SVG Grid Nodes */}
          <div className="flex items-center space-x-3 shrink-0 border border-border p-2 rounded bg-background">
            <svg width="40" height="40" viewBox="0 0 40 40" className="text-text-main">
              <rect x="0" y="0" width="10" height="10" fill="currentColor" />
              <rect x="2" y="2" width="6" height="6" fill="white" />
              <rect x="4" y="4" width="2" height="2" fill="currentColor" />

              <rect x="30" y="0" width="10" height="10" fill="currentColor" />
              <rect x="32" y="2" width="6" height="6" fill="white" />
              <rect x="34" y="4" width="2" height="2" fill="currentColor" />

              <rect x="0" y="30" width="10" height="10" fill="currentColor" />
              <rect x="2" y="32" width="6" height="6" fill="white" />
              <rect x="4" y="34" width="2" height="2" fill="currentColor" />

              <rect x="15" y="5" width="3" height="3" fill="currentColor" />
              <rect x="22" y="12" width="4" height="2" fill="currentColor" />
              <rect x="12" y="25" width="2" height="4" fill="currentColor" />
              <rect x="28" y="28" width="5" height="5" fill="currentColor" />
              <rect x="20" y="20" width="6" height="6" fill="currentColor" />
            </svg>
            <div className="text-[8px] text-text-muted flex flex-col">
              <span className="font-bold text-text-main">SECURE SIGNATURE</span>
              <span>VERIFY HASH: 8f921a</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
