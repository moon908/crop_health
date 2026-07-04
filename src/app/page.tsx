"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dna, 
  Settings as SettingsIcon, 
  FolderGit2, 
  AlertTriangle,
  Brain,
  Cpu,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle,
  Database,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import Sidebar, { ViewType } from "@/components/sidebar";
import Topbar from "@/components/topbar";
import LandingHero from "@/components/landing-hero";
import StatsGrid from "@/components/stats-grid";
import UploadZone from "@/components/upload-zone";
import AnalysisResult from "@/components/analysis-result";
import WeatherPanel from "@/components/weather-panel";
import ReportPreview from "@/components/report-preview";
import DataTable from "@/components/data-table";
import AIInsightsPanel from "@/components/ai-insights";
import { LEAF_CASES, DATASETS, CropLeafCase, CROP_SCANS } from "@/lib/mock-data";

// Dynamically import Leaflet Map to bypass SSR window undefined check during Next build compiles
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[680px] bg-card border border-border rounded-xl flex items-center justify-center space-x-2 font-mono text-xs text-text-muted">
      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" />
      <span>LOADING SATELLITE CORE GEOMETRIC PANELS...</span>
    </div>
  )
});

interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "error";
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isDark, setIsDark] = useState(true); // default dark scientific style
  const [farmSelection, setFarmSelection] = useState("Green Prairie Farm");
  const [selectedScanCase, setSelectedScanCase] = useState<any | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Settings states
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [activeModel, setActiveModel] = useState("resnet");
  const [autoSentryScan, setAutoSentryScan] = useState(true);

  // Toast handler
  const showToast = (message: string, type: "success" | "warning" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Synchronize themes on html class root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Handler: When user clicks "DIAGNOSE" inside historical table rows
  const handleSelectHistoricalScan = (scan: any) => {
    // Map database scan structure back to LeafCase simulation data
    const matchedCase = LEAF_CASES.find(c => c.disease.includes(scan.disease.split(" ")[0])) || LEAF_CASES[0];
    setSelectedScanCase({
      ...matchedCase,
      id: scan.id,
      confidence: scan.confidence,
      severity: scan.severity,
      yieldImpact: scan.yieldImpact,
      status: scan.status
    });
    setCurrentView("analysis");
    showToast(`Loaded historical scan ${scan.id} for diagnostic review.`, "success");
  };

  const handleRetrain = (datasetName: string) => {
    showToast(`Retraining queue initialized for: ${datasetName}`, "success");
    setTimeout(() => {
      showToast(`Feature extraction and epoch convergence successful on GPU array.`, "success");
    }, 2000);
  };

  return (
    <div className={`flex min-h-screen ${isDark ? "dark" : ""} bg-background text-text-main font-sans`}>
      {/* Sidebar Left Component */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar Component */}
        <Topbar 
          isDark={isDark} 
          onThemeToggle={() => setIsDark(!isDark)} 
          farmSelection={farmSelection}
          onFarmChange={(f) => {
            setFarmSelection(f);
            showToast(`Switched active farm station telemetry to: ${f}`, "success");
          }}
        />

        {/* Content canvas scrolling workspace */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Conditional view switching */}
              {currentView === "dashboard" && (
                <div className="space-y-8">
                  {/* Hero Welcomer Banner */}
                  <LandingHero 
                    onStartAnalysis={() => setCurrentView("analysis")}
                    onViewSample={() => {
                      setSelectedScanCase(LEAF_CASES[0]);
                      setCurrentView("analysis");
                      showToast("Loaded sample Corn leaf Gray Spot analysis.", "success");
                    }}
                    onUploadDataset={() => setCurrentView("datasets")}
                  />
                  
                  {/* Key Stats Widget row */}
                  <StatsGrid />

                  {/* Scientific Map & Scan table row */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-7">
                      <LeafletMap />
                    </div>
                    <div className="xl:col-span-5 flex flex-col justify-between">
                      <div className="bg-card border border-border p-5 rounded-xl flex-1 flex flex-col justify-between mb-8">
                        <div>
                          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider border-b border-border/50 pb-2 mb-4">
                            AI DEEP CORES SCENARIOS
                          </span>
                          <p className="text-[10px] text-text-muted leading-relaxed mb-4">
                            Use custom convolutional nodes to process images. Adjust model sensitivity, weights, and filter options in the Settings tab to modify prediction layers.
                          </p>
                          <div className="space-y-3 font-mono text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-text-muted">ACTIVE ML MODEL:</span>
                              <span className="text-secondary font-bold">ResNet-50 v4 (Foliar)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">CONFIDENCE LIMIT:</span>
                              <span className="text-text-main font-bold">&ge; {confidenceThreshold}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">VALIDATION SET ACC:</span>
                              <span className="text-accent font-bold">98.2% (ResNet)</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setCurrentView("settings")}
                          className="w-full mt-6 py-2 border border-border bg-background hover:bg-card text-text-main rounded-lg text-center font-bold font-mono transition-colors"
                        >
                          CONFIGURE ENGINE
                        </button>
                      </div>

                      {/* Soil profile telemetry */}
                      <div className="bg-card border border-border p-5 rounded-xl">
                        <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider border-b border-border/50 pb-2 mb-3">
                          SOIL PH TELEMETRY PROFILE
                        </span>
                        <div className="flex justify-between items-center font-mono">
                          <div>
                            <span className="text-lg font-bold text-text-main">6.4 pH</span>
                            <span className="text-[9px] text-text-muted block mt-0.5">SLIGHTLY ACIDIC (OPTIMAL)</span>
                          </div>
                          <div className="w-20 h-10 flex items-center justify-center bg-secondary/5 border border-secondary/20 rounded">
                            <span className="text-[10px] text-secondary font-bold">BALANCED</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {currentView === "analysis" && (
                <div className="space-y-8">
                  {selectedScanCase ? (
                    <AnalysisResult 
                      result={selectedScanCase} 
                      onReset={() => {
                        setSelectedScanCase(null);
                        showToast("Cleared diagnostic workbench.", "warning");
                      }} 
                    />
                  ) : (
                    <UploadZone 
                      onAnalysisStart={() => showToast("Scanning image matrix... Deploying neural weights.", "success")}
                      onAnalysisComplete={(res) => {
                        setSelectedScanCase(res);
                        showToast(`Analysis complete: ${res.disease} classified.`, "success");
                      }} 
                    />
                  )}
                </div>
              )}

              {currentView === "satellite" && (
                <div className="space-y-8">
                  <LeafletMap />
                </div>
              )}

              {currentView === "diseases" && (
                <div className="space-y-8 select-none font-mono">
                  <div className="flex items-center space-x-2 border-b border-border pb-4">
                    <Dna className="w-5 h-5 text-secondary animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-text-main uppercase">PATHOLOGY TAXONOMY REFERENCE</h3>
                      <p className="text-[9px] text-text-muted mt-0.5">USDA SCIENTIFIC VERIFICATION RECORDS</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {LEAF_CASES.map((item) => (
                      <div key={item.id} className="bg-card border border-border p-5 rounded-xl space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-text-main uppercase text-[11px] leading-tight max-w-[150px]">
                              {item.disease.split(" (")[0]}
                            </h4>
                            <span className="text-[8px] border border-danger/20 bg-danger/5 text-danger font-bold px-1.5 py-0.5 rounded">
                              {item.status.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[9px] text-text-muted block italic mt-1">{item.cropType}</span>
                          <p className="text-[10px] text-text-main mt-3 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="border-t border-border/50 pt-3 space-y-1">
                          <span className="text-[9px] text-text-muted font-bold block uppercase">REMEDIAL TREATMENT</span>
                          <div className="text-[10px] text-text-main truncate font-bold">
                            {item.recommendations.pesticide}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentView === "history" && (
                <div className="space-y-8">
                  <DataTable 
                    onShowToast={showToast} 
                    onSelectScan={handleSelectHistoricalScan} 
                  />
                </div>
              )}

              {currentView === "weather" && (
                <div className="space-y-8">
                  <WeatherPanel />
                </div>
              )}

              {currentView === "reports" && (
                <div className="space-y-8">
                  <ReportPreview 
                    onShowToast={showToast} 
                    selectedScanCase={selectedScanCase || undefined} 
                  />
                </div>
              )}

              {currentView === "insights" && (
                <div className="space-y-8">
                  <AIInsightsPanel onShowToast={showToast} />
                </div>
              )}

              {currentView === "datasets" && (
                <div className="space-y-8 select-none font-mono">
                  <div className="flex items-center space-x-2 border-b border-border pb-4">
                    <FolderGit2 className="w-5 h-5 text-secondary animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-text-main uppercase">TRAINING DATASET MATRIX</h3>
                      <p className="text-[9px] text-text-muted mt-0.5">MANAGE ANNOTATED CROP DATASETS</p>
                    </div>
                  </div>

                  {/* Dataset Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {DATASETS.map((ds) => (
                      <div key={ds.id} className="bg-card border border-border p-5 rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-text-main text-[11px] uppercase">{ds.name}</h4>
                            <span className="text-[9px] text-text-muted font-mono">{ds.id} • SIZE: {ds.size}</span>
                          </div>
                          <span className="bg-secondary/10 border border-secondary/20 text-secondary text-[9px] font-bold px-2 py-0.5 rounded">
                            {ds.accuracy}% VAL ACC
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50 text-[10px]">
                          <div>
                            <span className="text-text-muted block">IMAGES:</span>
                            <span className="font-bold text-text-main">{ds.imagesCount}</span>
                          </div>
                          <div>
                            <span className="text-text-muted block">CLASSES:</span>
                            <span className="font-bold text-text-main">{ds.classCount}</span>
                          </div>
                          <div>
                            <span className="text-text-muted block">LAST SYNC:</span>
                            <span className="font-bold text-text-main">{ds.lastUpdated}</span>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleRetrain(ds.name)}
                            className="px-3 py-1.5 bg-secondary hover:bg-primary text-white font-bold rounded-lg transition-colors"
                          >
                            RETRAIN CONVOLUTION
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentView === "settings" && (
                <div className="space-y-8 select-none font-mono">
                  <div className="flex items-center space-x-2 border-b border-border pb-4">
                    <SettingsIcon className="w-5 h-5 text-secondary animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-text-main uppercase">AI SYSTEM CONFIGURATIONS</h3>
                      <p className="text-[9px] text-text-muted mt-0.5">ADJUST CORE ALGORITHM PARMETERS</p>
                    </div>
                  </div>

                  <div className="max-w-xl bg-card border border-border p-6 rounded-xl space-y-6">
                    {/* Confidence Threshold */}
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-[10px]">
                        <span className="text-text-main">AI CLASSIFICATION THRESHOLD</span>
                        <span className="text-accent">{confidenceThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="98"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                        className="w-full accent-secondary cursor-pointer h-1.5 bg-background border border-border rounded-lg"
                      />
                      <span className="text-[9px] text-text-muted block">
                        Predictions below this value will trigger human-in-the-loop manual lab confirmation tasks.
                      </span>
                    </div>

                    {/* Active CNN Layer */}
                    <div className="space-y-2">
                      <span className="font-bold text-[10px] text-text-main block">ACTIVE DEEP LEARNING MODEL</span>
                      <select
                        value={activeModel}
                        onChange={(e) => {
                          setActiveModel(e.target.value);
                          showToast(`Switched active CNN weights to: ${e.target.value.toUpperCase()}`, "success");
                        }}
                        className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-[10px] text-text-main focus:outline-none cursor-pointer"
                      >
                        <option value="resnet">ResNet-50 v4 (98.2% Acc, 25ms inference)</option>
                        <option value="efficientnet">EfficientNet-B4 (97.4% Acc, 15ms inference)</option>
                        <option value="vit">Vision Transformer ViT-L/16 (99.1% Acc, 110ms inference)</option>
                      </select>
                    </div>

                    {/* Auto Satellite scanning toggler */}
                    <div className="flex justify-between items-center border-t border-border/50 pt-4">
                      <div>
                        <span className="font-bold text-[10px] text-text-main block">AUTOMATED SATELLITE SENTRY</span>
                        <span className="text-[9px] text-text-muted">Sync maps automatically during Sentinel passes</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoSentryScan}
                        onChange={(e) => setAutoSentryScan(e.target.checked)}
                        className="w-4 h-4 accent-secondary border-border cursor-pointer"
                      />
                    </div>

                    {/* Save button */}
                    <div className="pt-4 border-t border-border/50 flex justify-end">
                      <button
                        onClick={() => showToast("Configurations saved in station cache memory.", "success")}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors"
                      >
                        SAVE CONFIGURATIONS
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating System Toast Alerts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm pointer-events-none select-none font-mono">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-3.5 border rounded-xl shadow-lg pointer-events-auto bg-card flex items-start space-x-2.5 ${
                toast.type === "success" 
                  ? "border-secondary/30 text-text-main" 
                  : toast.type === "warning"
                  ? "border-warning/30 text-warning"
                  : "border-danger/30 text-danger"
              }`}
            >
              {toast.type === "success" ? (
                <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <div className="flex flex-col space-y-0.5 text-[10px]">
                <span className="font-bold uppercase text-[9px] text-text-muted">
                  {toast.type === "success" ? "System Logged" : "System Alert"}
                </span>
                <span className="leading-tight text-text-main">{toast.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
