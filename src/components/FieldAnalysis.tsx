import React, { useState } from "react";
import { 
  FileText, 
  Printer, 
  Share2, 
  Calendar, 
  Map as MapIcon,
  Droplet,
  Leaf,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Maximize2
} from "lucide-react";
import Image from "next/image";

interface AnalysisResult {
  id: string;
  reportId: string;
  crop: string;
  cropConfidence: number;
  healthStatus: string;
  healthScore: number;
  disease: string;
  scientificName: string;
  confidence: number;
  severity: string;
  affectedArea: number;
  symptoms: string[];
  nutrientDeficiency: string;
  pestRisk: string;
  latitude?: number;
  longitude?: number;
  sectorName?: string;
  summary: string;
  analysisTime: string;
  probabilities: Array<{ class: string; probability: number }>;
  recommendations: {
    watering: string;
    fertilizer: string;
    treatment: string;
    prevention: string;
    monitoring: string;
  };
  visualOutputs: {
    heatmap: string;
    annotatedImage: string;
    segmentationMap: string;
    chlorophyllMap: string;
    thermalStressIndex: string;
  };
  images: {
    original: string;
    heatmap: string;
  };
}

interface FieldAnalysisProps {
  result: AnalysisResult;
  onReset?: () => void;
}

type ViewMode = "original" | "annotated" | "heatmap" | "segmentation" | "chlorophyll" | "thermalStress";

export default function FieldAnalysis({ result, onReset }: FieldAnalysisProps) {
  const [activeView, setActiveView] = useState<ViewMode>("annotated");
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Crop_Health_Report_${result.reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to compile PDF Report");
      }
    } catch (e) {
      console.error(e);
      alert("Error compiling PDF Report");
    }
  };

  const getOverlayImageSrc = () => {
    switch (activeView) {
      case "annotated": return result.visualOutputs.annotatedImage; // Lesion Map
      case "heatmap": return result.visualOutputs.heatmap; // Heatmap (Grad-CAM)
      case "segmentation": return result.visualOutputs.segmentationMap; // Segmentation Map
      case "chlorophyll": return result.visualOutputs.chlorophyllMap; // Chlorophyll Map
      case "thermalStress": return result.visualOutputs.thermalStressIndex; // Thermal Stress Index
      default: return result.images?.original || "/samples/1land.jpeg"; // Raw Image
    }
  };

  const severityColor = () => {
    switch (result.severity) {
      case "Healthy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "Mild": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "Moderate": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "Severe": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      default: return "text-red-500 bg-red-500/10 border-red-500/20";
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-600">
      
      {/* Floating Glassmorphic Header */}
      <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-secondary/5 rounded-full blur-3xl -mr-14 -mt-14 pointer-events-none"></div>
        
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold tracking-widest text-secondary uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AGRI-DIAGNOSTICS CONSOLE V4.2</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight mt-1 text-primary">
            Diagnostic Dossier: {result.crop}
          </h1>
          <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono text-text-muted mt-2.5">
            <span className="flex items-center bg-white/60 px-2.5 py-1 rounded-full border border-white"><Clock className="w-3.5 h-3.5 mr-1" /> Telemetry Time: {result.analysisTime}</span>
            <span className="flex items-center bg-white/60 px-2.5 py-1 rounded-full border border-white"><MapIcon className="w-3.5 h-3.5 mr-1" /> Vector ID: #{result.reportId.slice(0, 8)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          {onReset && (
            <button 
              onClick={onReset}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white/80 hover:bg-white text-primary border border-white/60 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer hover:shadow"
            >
              <span>Analyze New Image</span>
            </button>
          )}
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Compile PDF Report</span>
          </button>
          <button className="p-2.5 border border-white bg-white/60 backdrop-blur rounded-full hover:bg-white text-text-main transition-all cursor-pointer shadow-sm">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-2.5 border border-white bg-white/60 backdrop-blur rounded-full hover:bg-white text-text-main transition-all cursor-pointer shadow-sm">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Interactive Image Workspace */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-4 shadow-xl flex-1 flex flex-col">
            
            {/* Overlay View Selector Tabs */}
            <div className="flex flex-wrap gap-1 bg-neutral/10 p-1 rounded-2xl mb-4 font-mono text-[9px] font-bold">
              {(["original", "annotated", "heatmap", "segmentation", "chlorophyll", "thermalStress"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveView(mode)}
                  className={`flex-1 px-2 py-2 rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                    activeView === mode 
                      ? "bg-white text-primary shadow-sm font-extrabold" 
                      : "text-text-muted hover:text-primary"
                  }`}
                >
                  {mode === "original" && "Raw Image"}
                  {mode === "annotated" && "Lesion Map"}
                  {mode === "heatmap" && "Heatmap"}
                  {mode === "segmentation" && "Seg Map"}
                  {mode === "chlorophyll" && "Chlorophyll"}
                  {mode === "thermalStress" && "Thermal Stress"}
                </button>
              ))}
            </div>

            {/* Interactive Image Container */}
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-border shadow-inner group aspect-video">
              <Image 
                src={getOverlayImageSrc()} 
                alt="Diagnostics imagery Workspace" 
                fill 
                className="object-cover group-hover:scale-[1.01] transition-transform duration-600 ease-out"
              />
              
              {/* Telemetry Corner Indicators */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white/90 px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-wider border border-white/10 uppercase">
                ACTIVE VIEW: {activeView}_MULTIPLEX
              </div>
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-primary px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-wider border border-white shadow-sm flex items-center">
                <Maximize2 className="w-3 h-3 mr-1" /> RESOLUTION: 1024x1024
              </div>
            </div>
            
          </div>
        </div>

        {/* Right Column: Key Diagnostics Dashboard */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* Card 1: Land Registry & Vector Info */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-5 rounded-3xl shadow-xl flex flex-col">
            <h3 className="font-display font-extrabold text-sm text-primary mb-3 flex items-center uppercase tracking-widest">
              <MapIcon className="w-4 h-4 mr-2 text-secondary" /> Land & Sector Identity
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-white/60 p-3 rounded-2xl border border-white flex justify-between">
                <span className="text-text-muted font-bold">NAME OF LAND:</span>
                <span className="font-bold text-primary">{result.sectorName || "Sector 7G (Greenwood Farm)"}</span>
              </div>
              <div className="bg-white/60 p-3 rounded-2xl border border-white flex justify-between">
                <span className="text-text-muted font-bold">COORDINATES:</span>
                <span className="font-bold text-primary">
                  {result.latitude ? `${Math.abs(result.latitude).toFixed(4)}° ${result.latitude >= 0 ? "N" : "S"}` : "42.3601° N"}, 
                  {result.longitude ? `${Math.abs(result.longitude).toFixed(4)}° ${result.longitude >= 0 ? "E" : "W"}` : "71.0589° W"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Biometric Health Telemetry */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-5 rounded-3xl shadow-xl flex flex-col justify-between flex-1">
            <div className="flex justify-between items-center border-b border-white/50 pb-3 mb-3">
              <h2 className="font-display font-extrabold text-sm text-primary">Biometric Health Telemetry</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${severityColor()}`}>
                {result.severity} INFECTION
              </span>
            </div>

            <div className="grid grid-cols-2 gap-5 items-center py-1">
              {/* Circular Health Gauge */}
              <div className="flex flex-col items-center justify-center relative">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="46" fill="transparent" stroke="#E6DFD9" strokeWidth="7" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="46" 
                    fill="transparent" 
                    stroke="url(#greenGradient)" 
                    strokeWidth="7" 
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - result.healthScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2D6A4F" />
                      <stop offset="100%" stopColor="#1B4332" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-extrabold text-primary font-display block leading-none">{result.healthScore}%</span>
                  <span className="text-[8px] uppercase font-mono font-bold tracking-widest text-text-muted mt-0.5 block">Foliage score</span>
                </div>
              </div>

              {/* Dynamic Key Indicators */}
              <div className="space-y-2.5 font-mono text-[10px]">
                <div 
                  className="bg-white/60 p-2.5 rounded-2xl border border-white hover:shadow-sm transition-all"
                  onMouseEnter={() => setHoveredMetric("conf")}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <span className="text-text-muted block font-bold text-[8px] leading-tight">DIAGNOSTIC CONFIDENCE</span>
                  <span className="text-sm font-extrabold text-primary">{result.confidence}%</span>
                </div>
                <div 
                  className="bg-white/60 p-2.5 rounded-2xl border border-white hover:shadow-sm transition-all"
                  onMouseEnter={() => setHoveredMetric("area")}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <span className="text-text-muted block font-bold text-[8px] leading-tight">AFFECTED LEAF AREA</span>
                  <span className="text-sm font-extrabold text-primary">{result.affectedArea}%</span>
                </div>
              </div>
            </div>

            {/* Dynamic Info Footnotes based on hovering */}
            <div className="mt-3 bg-white/30 border border-white/40 p-2.5 rounded-2xl text-[9px] text-text-muted flex items-start space-x-2">
              <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p className="leading-tight text-[9px]">
                {hoveredMetric === "conf" && "Model confidence calculates probability match matching standard Alternaria and Septoria leaf strains."}
                {hoveredMetric === "area" && "Estimated percentage calculated using pixel-density leaf contours vs diseased lesion counts."}
                {!hoveredMetric && "Interactive analytics calibrated to plant foliage index. Overlays represent verified computer vision outputs."}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Row 2: Pathogen Fingerprints, Symptom tags, & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: AI Disease Detection */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-5 rounded-3xl shadow-xl flex flex-col">
          <h3 className="font-display font-extrabold text-sm text-primary mb-3.5 flex items-center">
            <Sparkles className="w-4.5 h-4.5 mr-1.5 text-secondary" /> AI Disease Detection
          </h3>
          
          <div className="space-y-3 flex-1">
            {result.probabilities.map((item, idx) => (
              <div key={idx} className="bg-white/50 p-2.5 rounded-2xl border border-white shadow-sm hover:shadow transition-shadow">
                <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                  <span className="text-primary">{item.class}</span>
                  <span className="text-secondary">{item.probability}%</span>
                </div>
                <div className="w-full bg-neutral/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-700"
                    style={{ width: `${item.probability}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 & 3: Nutrient Deficiency Analysis & AI Explanation */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-5 rounded-3xl shadow-xl flex flex-col md:col-span-2">
          <h3 className="font-display font-extrabold text-sm text-primary mb-3.5 flex items-center">
            <Bot className="w-4.5 h-4.5 mr-1.5 text-secondary" /> Nutrient Deficiency Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch flex-1">
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block mb-2">Foliage Deficiencies:</span>
                <div className="flex flex-wrap gap-2">
                  {result.nutrientDeficiency !== "None" ? (
                    <span className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 animate-pulse">
                      ⚠️ {result.nutrientDeficiency}
                    </span>
                  ) : (
                    <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700">
                      ✓ Balanced
                    </span>
                  )}
                  {result.symptoms.map((symptom, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white/60 border border-white px-2.5 py-1.5 rounded-xl text-xs font-semibold text-primary"
                    >
                      🌱 {symptom}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/60 border border-white p-3 rounded-2xl text-[10px] font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-muted">Pest Risk Assessment:</span>
                  <span className="font-bold text-primary uppercase">{result.pestRisk} RISK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Pathogen Scientific Name:</span>
                  <span className="font-bold text-primary italic text-right">{result.scientificName}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none"></div>
              <div>
                <div className="flex items-center space-x-1.5 text-[9px] font-mono font-bold text-secondary tracking-wider mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>STEWARDSHIP AI INSIGHT</span>
                </div>
                <p className="text-xs text-primary leading-snug italic font-medium">
                  "{result.summary}"
                </p>
              </div>
              <button className="w-full bg-primary hover:bg-secondary text-white py-2 rounded-xl font-bold text-xs mt-3 cursor-pointer">
                Agronomy Assistant Advice
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Agronomic Recommendations Timeline */}
      <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-6 rounded-3xl shadow-xl">
        <h3 className="font-display font-extrabold text-sm text-primary mb-5 flex items-center">
          <Leaf className="w-4.5 h-4.5 mr-1.5 text-secondary animate-pulse" /> Precision Agronomic Action Plan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
          
          <div className="bg-white/50 border border-white p-4 rounded-2xl shadow-sm hover:shadow transition-shadow relative">
            <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center font-mono font-bold text-xs mb-3">
              1
            </div>
            <h4 className="font-bold text-primary text-xs mb-1.5 flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-500" /> Immediate Treatment
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              {result.recommendations.treatment}
            </p>
          </div>

          <div className="bg-white/50 border border-white p-4 rounded-2xl shadow-sm hover:shadow transition-shadow">
            <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-mono font-bold text-xs mb-3">
              2
            </div>
            <h4 className="font-bold text-primary text-xs mb-1.5 flex items-center">
              <Droplet className="w-3.5 h-3.5 mr-1 text-blue-500" /> Irrigation Modifications
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              {result.recommendations.watering}
            </p>
          </div>

          <div className="bg-white/50 border border-white p-4 rounded-2xl shadow-sm hover:shadow transition-shadow">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-mono font-bold text-xs mb-3">
              3
            </div>
            <h4 className="font-bold text-primary text-xs mb-1.5 flex items-center">
              <Leaf className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Nutritional Balancing
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              {result.recommendations.fertilizer}
            </p>
          </div>

          <div className="bg-white/50 border border-white p-4 rounded-2xl shadow-sm hover:shadow transition-shadow">
            <div className="w-7 h-7 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-mono font-bold text-xs mb-3">
              4
            </div>
            <h4 className="font-bold text-primary text-xs mb-1.5 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-secondary" /> Preventive Controls
            </h4>
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              <span className="font-semibold block mb-0.5">Spread Prevention:</span> {result.recommendations.prevention}
              <span className="font-semibold block mt-1.5 mb-0.5">Monitoring Timeline:</span> {result.recommendations.monitoring}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
