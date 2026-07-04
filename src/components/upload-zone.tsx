"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  Leaf, 
  Cpu, 
  CheckCircle,
  FileImage,
  Eye,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LEAF_CASES } from "@/lib/mock-data";
import { AIAnalysisResult } from "@/lib/types";

interface UploadZoneProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: AIAnalysisResult) => void;
}

type ScanType = "leaf" | "drone" | "satellite" | "field";

const SCAN_STEPS = [
  "Initializing telemetry data stream...",
  "Running spatial noise removal filters...",
  "Extracting multi-spectral and shape features...",
  "Deploying convolutional neural network (ResNet-50 v4)...",
  "Generating visual pixel segmentation masks...",
  "Computing disease confidence and yield impact scores...",
  "Packaging final scientific diagnostic report..."
];

export default function UploadZone({ onAnalysisStart, onAnalysisComplete }: UploadZoneProps) {
  const [selectedScanType, setSelectedScanType] = useState<ScanType>("leaf");
  const [selectedCrop, setSelectedCrop] = useState<string>("auto");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Refs to share state between async requests and timers
  const apiResultRef = useRef<AIAnalysisResult | null>(null);
  const apiErrorRef = useRef<string | null>(null);
  const animationFinishedRef = useRef(false);

  // XMLHttp Request handler to send image and track real progress
  const uploadFile = (file: File, cropHint: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg(null);
    apiResultRef.current = null;
    apiErrorRef.current = null;
    animationFinishedRef.current = false;
    setCurrentStepIndex(0);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("crop_hint", cropHint);

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    // Handle upload completion
    xhr.addEventListener("load", () => {
      setIsUploading(false);
      
      if (xhr.status === 200) {
        try {
          const responseData = JSON.parse(xhr.responseText) as AIAnalysisResult;
          apiResultRef.current = responseData;
          
          // Trigger the step scanning animation
          setIsProcessing(true);
          onAnalysisStart();
        } catch (e) {
          setErrorMsg("Failed to parse analysis results from the server.");
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          apiErrorRef.current = errData.detail || "Server failed to process image.";
        } catch {
          apiErrorRef.current = `Server returned status code: ${xhr.status}`;
        }
        setErrorMsg(apiErrorRef.current);
      }
    });

    // Handle network errors
    xhr.addEventListener("error", () => {
      setIsUploading(false);
      const networkErr = "Network connection failed. Please ensure the Python/FastAPI server is running on port 8000.";
      apiErrorRef.current = networkErr;
      setErrorMsg(networkErr);
    });

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    xhr.open("POST", `${apiBaseUrl}/api/analyze`);
    xhr.send(formData);
  };

  // Pre-processing step scanning simulation to visually guide the user
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= SCAN_STEPS.length - 1) {
          clearInterval(interval);
          animationFinishedRef.current = true;
          
          // Check if API has returned the result
          setTimeout(() => {
            if (apiResultRef.current) {
              setIsProcessing(false);
              onAnalysisComplete(apiResultRef.current);
            } else if (apiErrorRef.current) {
              setIsProcessing(false);
              setErrorMsg(apiErrorRef.current);
            } else {
              // Wait for API to resolve (polled by another hook or resolved when API finishes)
              const waitInterval = setInterval(() => {
                if (apiResultRef.current) {
                  clearInterval(waitInterval);
                  setIsProcessing(false);
                  onAnalysisComplete(apiResultRef.current);
                } else if (apiErrorRef.current) {
                  clearInterval(waitInterval);
                  setIsProcessing(false);
                  setErrorMsg(apiErrorRef.current);
                }
              }, 200);
            }
          }, 800);
          
          return SCAN_STEPS.length - 1;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isProcessing, onAnalysisComplete]);

  // Dropzone file drop trigger
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setUploadedFile({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });
    uploadFile(file, selectedCrop);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: isUploading || isProcessing
  });

  // Action: triggers analysis using pre-generated public sample files
  const triggerSampleScan = async (sampleId: string) => {
    setErrorMsg(null);
    let samplePath = "";
    let cropHint = "tomato";

    if (sampleId === "case-corn-spot") {
      samplePath = "/samples/corn-spot.jpg";
      cropHint = "corn";
    } else if (sampleId === "case-soy-rust") {
      samplePath = "/samples/soy-rust.jpg";
      cropHint = "soybean";
    } else if (sampleId === "case-potato-blight") {
      samplePath = "/samples/potato-blight.jpg";
      cropHint = "potato";
    } else {
      samplePath = "/samples/tomato-blight.jpg";
      cropHint = "tomato";
    }

    setUploadedFile({
      name: `SAMPLE-${sampleId.toUpperCase().replace("CASE-", "")}.jpg`,
      size: "Computing..."
    });
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const response = await fetch(samplePath);
      if (!response.ok) {
        throw new Error("FastAPI server must be active to fetch and analyze sample images.");
      }
      const blob = await response.blob();
      const file = new File([blob], `${sampleId}.jpg`, { type: "image/jpeg" });
      
      setUploadedFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      uploadFile(file, cropHint);
    } catch (err) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Failed to run sample scan. ${msg}`);
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8 select-none font-mono text-xs">
      <h3 className="text-sm font-bold text-text-main mb-4 border-b border-border/50 pb-2 flex justify-between items-center">
        <span>IMAGE DIGITIZER WORKSPACE</span>
        <span className="text-[9px] text-secondary font-bold">REAL MODEL WORKBENCH</span>
      </h3>

      <AnimatePresence mode="wait">
        {!isUploading && !isProcessing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Crop Selector Panel */}
            <div className="flex flex-col space-y-2 bg-background/50 border border-border p-4 rounded-xl">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Target Crop Variety (Hint for model preprocessing):
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-text-main text-[11px] focus:outline-none focus:border-secondary cursor-pointer font-bold"
              >
                <option value="auto">🤖 Auto-Detect Crop Variety (Visual Shape and Color)</option>
                <option value="tomato">🍅 Tomato (Solanum lycopersicum)</option>
                <option value="corn">🌽 Corn (Zea mays)</option>
                <option value="potato">🥔 Potato (Solanum tuberosum)</option>
                <option value="soybean">🌿 Soybean (Glycine max)</option>
              </select>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 border border-danger/30 bg-danger/5 rounded-xl text-danger flex items-start space-x-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-[10px] uppercase">Analysis Engine Error</span>
                  <span className="text-[10px] mt-0.5 leading-tight block">{errorMsg}</span>
                  <p className="text-[9px] text-text-muted mt-2">
                    Make sure your file is a valid image (JPEG/PNG) and the Python/FastAPI server is running locally on port 8000 (`python -m uvicorn main:app --reload`).
                  </p>
                </div>
              </motion.div>
            )}

            {/* Input Mode Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["leaf", "drone", "satellite", "field"] as ScanType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedScanType(type)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border text-center transition-all cursor-pointer",
                    selectedScanType === type 
                      ? "border-secondary bg-secondary/5 text-secondary font-bold" 
                      : "border-border hover:border-text-muted text-text-muted"
                  )}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider mb-1">{type} SCAN</span>
                  <span className="text-[9px] text-text-muted">
                    {type === "leaf" && "Macro leaf photos"}
                    {type === "drone" && "Low-altitude orthos"}
                    {type === "satellite" && "Sentinel multi-spectral"}
                    {type === "field" && "Handheld camera shots"}
                  </span>
                </button>
              ))}
            </div>

            {/* Drag Zone */}
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative min-h-[220px]",
                isDragActive 
                  ? "border-secondary bg-secondary/5 text-secondary" 
                  : "border-border hover:border-text-muted hover:bg-background/40"
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className={cn("w-12 h-12 mb-3 text-text-muted animate-bounce", isDragActive && "text-secondary")} />
              <p className="text-text-main font-semibold mb-1">
                Drag & Drop leaf photo here, or click to browse
              </p>
              <p className="text-text-muted text-[10px]">
                Supported Formats: JPG, JPEG, PNG • Maximum file size: 50MB
              </p>

              {/* Decorative Tech Corners */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-border" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-border" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-border" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-border" />
            </div>

            {/* View Samples Shortcuts */}
            <div className="border-t border-border/50 pt-4">
              <span className="text-[10px] text-text-muted block mb-2 uppercase tracking-widest font-bold">
                Run Diagnostic Model with Real Leaf Samples:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => triggerSampleScan("case-tomato-blight")}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-background hover:bg-border/40 border border-border text-[10px] rounded-lg text-text-main font-mono transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-secondary" />
                  <span>Tomato Early Blight</span>
                </button>
                <button
                  onClick={() => triggerSampleScan("case-corn-spot")}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-background hover:bg-border/40 border border-border text-[10px] rounded-lg text-text-main font-mono transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-secondary" />
                  <span>Corn Gray Leaf Spot</span>
                </button>
                <button
                  onClick={() => triggerSampleScan("case-soy-rust")}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-background hover:bg-border/40 border border-border text-[10px] rounded-lg text-text-main font-mono transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-secondary" />
                  <span>Soybean Leaf Rust</span>
                </button>
                <button
                  onClick={() => triggerSampleScan("case-potato-blight")}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-background hover:bg-border/40 border border-border text-[10px] rounded-lg text-text-main font-mono transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-secondary" />
                  <span>Potato Late Blight</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 space-y-4"
          >
            <RefreshCw className="w-12 h-12 text-accent animate-spin" />
            <div className="text-center">
              <p className="font-bold text-text-main">STREAMING IMAGE TO COMPUTE CORRIDOR</p>
              <p className="text-text-muted text-[10px] mt-0.5">{uploadedFile?.name} ({uploadedFile?.size})</p>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full max-w-md h-2.5 bg-background border border-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <span className="font-mono font-bold text-accent text-xs">{uploadProgress}% COMPLETE</span>
          </motion.div>
        ) : (
          /* CNN Running Telemetry Scanning Animation */
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6"
          >
            {/* Left Column: Neural Scan Effect */}
            <div className="md:col-span-5 relative bg-background border border-border rounded-xl aspect-square flex items-center justify-center overflow-hidden min-h-[220px]">
              <Leaf className="w-20 h-20 text-secondary/30 animate-pulse" />
              
              {/* Scanning Laser Line */}
              <div className="scan-line" />
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

              <svg className="absolute inset-0 w-full h-full text-accent/20" viewBox="0 0 100 100">
                <circle cx="20" cy="30" r="1.5" fill="currentColor" className="pulse-node" />
                <circle cx="50" cy="15" r="1.5" fill="currentColor" className="pulse-node" />
                <circle cx="80" cy="35" r="1.5" fill="currentColor" className="pulse-node" />
                <circle cx="30" cy="70" r="1.5" fill="currentColor" className="pulse-node" />
                <circle cx="70" cy="65" r="1.5" fill="currentColor" className="pulse-node" />
                
                <line x1="20" y1="30" x2="50" y2="15" stroke="currentColor" strokeWidth="0.5" />
                <line x1="50" y1="15" x2="80" y2="35" stroke="currentColor" strokeWidth="0.5" />
                <line x1="20" y1="30" x2="30" y2="70" stroke="currentColor" strokeWidth="0.5" />
                <line x1="80" y1="35" x2="70" y2="65" stroke="currentColor" strokeWidth="0.5" />
                <line x1="30" y1="70" x2="70" y2="65" stroke="currentColor" strokeWidth="0.5" />
                <line x1="50" y1="15" x2="70" y2="65" stroke="currentColor" strokeWidth="0.5" />
              </svg>

              <div className="absolute bottom-3 left-3 bg-card/90 border border-border px-2 py-1 rounded text-[8px] font-mono tracking-widest text-accent">
                SCAN ACTIVE: CNN_LAYER_CONV_3B
              </div>
            </div>

            {/* Right Column: Console Steps Log */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-text-main font-bold">
                  <Cpu className="w-4 h-4 text-accent animate-spin" />
                  <span>AI DIAGNOSTIC MATRIX PROCESSING...</span>
                </div>
                <p className="text-[10px] text-text-muted">
                  Executing machine learning models on high-performance GPU tensor clusters.
                </p>
              </div>

              {/* Progress Steps Checklist */}
              <div className="space-y-2.5 bg-background/50 border border-border/80 p-4 rounded-xl">
                {SCAN_STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "flex items-center space-x-2 text-[10px]",
                        isDone && "text-secondary font-semibold",
                        isCurrent && "text-accent font-bold animate-pulse",
                        idx > currentStepIndex && "text-text-muted"
                      )}
                    >
                      {isDone ? (
                        <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />
                      ) : isCurrent ? (
                        <Cpu className="w-3.5 h-3.5 text-accent animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 border border-border rounded-full shrink-0" />
                      )}
                      <span className="font-mono truncate">{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Percentage */}
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-text-muted">OVERALL PROGRESS:</span>
                <span className="text-accent">
                  {Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
