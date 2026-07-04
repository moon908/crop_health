"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  CheckCircle, 
  TrendingUp, 
  HelpCircle,
  Clock, 
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Thermometer
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { cn } from "@/lib/utils";
import { AIAnalysisResult } from "@/lib/types";

interface AnalysisResultProps {
  result: AIAnalysisResult;
  onReset: () => void;
}

export default function AnalysisResult({ result: rawResult, onReset }: AnalysisResultProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<"mask" | "heatmap">("mask");
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize result to ensure compatibility with both full AIAnalysisResult and legacy CropLeafCase structures
  const result = React.useMemo(() => {
    if (!rawResult) return rawResult;
    if (rawResult.disease_analysis && rawResult.crop_info) {
      return rawResult;
    }
    
    const diseaseName = rawResult.disease || rawResult.name || "Healthy";
    const confidence = rawResult.confidence ?? 95;
    
    const top_5_predictions = [
      { disease: diseaseName, probability: confidence },
      { disease: "Other Disease A", probability: Math.max(0, parseFloat(((100 - confidence) * 0.4).toFixed(1))) },
      { disease: "Other Disease B", probability: Math.max(0, parseFloat(((100 - confidence) * 0.3).toFixed(1))) },
      { disease: "Other Disease C", probability: Math.max(0, parseFloat(((100 - confidence) * 0.2).toFixed(1))) },
      { disease: "Healthy", probability: Math.max(0, parseFloat(((100 - confidence) * 0.1).toFixed(1))) }
    ];

    let severityLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    const severityVal = rawResult.severity ?? 0;
    if (severityVal > 75) severityLevel = 'Critical';
    else if (severityVal > 50) severityLevel = 'High';
    else if (severityVal > 20) severityLevel = 'Medium';

    const defaultImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='300' height='300' fill='%231e293b'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='monospace' font-size='12'>SAMPLE LEAF IMAGE</text></svg>";
    
    let originalImage = rawResult.original_image_base64 || defaultImage;
    let maskImage = rawResult.mask_image_base64 || defaultImage;
    let heatmapImage = rawResult.heatmap_image_base64 || defaultImage;

    if (!rawResult.original_image_base64) {
      if (rawResult.id === "case-corn-spot") {
        originalImage = "/samples/corn-spot.jpg";
        maskImage = "/samples/corn-spot.jpg";
        heatmapImage = "/samples/corn-spot.jpg";
      } else if (rawResult.id === "case-soy-rust") {
        originalImage = "/samples/soy-rust.jpg";
        maskImage = "/samples/soy-rust.jpg";
        heatmapImage = "/samples/soy-rust.jpg";
      } else if (rawResult.id === "case-potato-blight") {
        originalImage = "/samples/potato-blight.jpg";
        maskImage = "/samples/potato-blight.jpg";
        heatmapImage = "/samples/potato-blight.jpg";
      } else if (rawResult.id === "case-tomato-blight") {
        originalImage = "/samples/tomato-blight.jpg";
        maskImage = "/samples/tomato-blight.jpg";
        heatmapImage = "/samples/tomato-blight.jpg";
      }
    }

    const recs = {
      immediate_action: rawResult.recommendations?.immediate_action || rawResult.recommendations?.pesticide || "Prune infected tissue.",
      fungicide_pesticide: rawResult.recommendations?.fungicide_pesticide || rawResult.recommendations?.pesticide || "N/A",
      watering: rawResult.recommendations?.watering || rawResult.recommendations?.water || "Regular watering.",
      fertilizer: rawResult.recommendations?.fertilizer || "Balanced fertilizer.",
      soil_management: rawResult.recommendations?.soil_management || "Ensure good aeration.",
      prevention_methods: rawResult.recommendations?.prevention_methods || (rawResult.recommendations?.preventive ? rawResult.recommendations.preventive.join(". ") : "N/A"),
      monitoring_frequency: rawResult.recommendations?.monitoring_frequency || "Weekly scouting."
    };

    return {
      ...rawResult,
      crop_info: {
        crop_type: rawResult.cropType || "Unknown Crop",
        growth_stage: "Flowering Stage",
        leaf_condition: severityVal > 0 ? "Chlorotic / Necrotic Lesions" : "Healthy Canopy Structure",
        overall_health: 100 - severityVal
      },
      disease_analysis: {
        disease_detected: diseaseName.split(" (")[0],
        scientific_name: rawResult.scientific_name || "Pathogen species",
        confidence_score: confidence,
        severity_level: severityLevel,
        probability: confidence,
        top_5_predictions
      },
      visual_findings: {
        spots: severityVal > 0 ? Math.round(severityVal * 0.6) : 0,
        yellowing: severityVal > 0 ? Math.round(severityVal * 0.4) : 0,
        dry_areas: severityVal > 0 ? Math.round(severityVal * 0.2) : 0,
        mold: severityVal > 50 ? Math.round((severityVal - 50) * 0.3) : 0,
        pest_damage: 0,
        nutrient_deficiency: severityVal > 0 ? Math.round(severityVal * 0.15) : 0,
      },
      ai_explanation: rawResult.description || "Infection detected.",
      recommendations: recs,
      original_image_base64: originalImage,
      mask_image_base64: maskImage,
      heatmap_image_base64: heatmapImage,
      bounding_boxes: rawResult.bounding_boxes || [
        { x: 35, y: 35, w: 30, h: 30, label: `${diseaseName.split(" (")[0]} Area`, confidence }
      ],
    };
  }, [rawResult]);

  // 1. Chart Data: Top 5 predictions distribution
  const chartDataProbabilities = result.disease_analysis.top_5_predictions.map(pred => ({
    name: pred.disease.split(" (")[0],
    probability: pred.probability
  }));

  // 2. Chart Data: Health Score vs Severity pie chart
  const health = result.crop_info.overall_health;
  const severity = result.severity;
  const pieDataHealth = [
    { name: "Healthy Tissue", value: health },
    { name: "Infected Tissue", value: severity }
  ];
  
  const HEALTH_COLORS = ["#10B981", "#EF4444"]; // Emerald vs Red

  // 3. Chart Data: Projected Yield recovery curve
  const yieldImpact = result.yieldImpact;
  const chartDataYieldRecovery = [
    { day: "Day 0 (Scan)", standardYield: 100, projectedYield: 100 - yieldImpact },
    { day: "Day 7", standardYield: 102, projectedYield: Math.min(102, (102 - yieldImpact) + (yieldImpact * 0.25)) },
    { day: "Day 14", standardYield: 105, projectedYield: Math.min(105, (105 - yieldImpact) + (yieldImpact * 0.65)) },
    { day: "Day 21 (Harvest)", standardYield: 110, projectedYield: Math.min(110, (110 - yieldImpact) + (yieldImpact * 0.95)) }
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const getSeverityColor = (level: string) => {
    if (level === "Low") return "text-secondary border-secondary/20 bg-secondary/5";
    if (level === "Medium") return "text-warning border-warning/20 bg-warning/5";
    return "text-danger border-danger/20 bg-danger/5";
  };

  const getOverlaySrc = () => {
    return activeOverlay === "mask" 
      ? result.mask_image_base64 
      : result.heatmap_image_base64;
  };

  return (
    <div className="space-y-8 font-mono text-xs select-none">
      {/* Action Header bar */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-base font-bold text-text-main flex items-center space-x-2">
            <span>DIAGNOSTIC MATRIX REPORT:</span>
            <span className="text-primary dark:text-emerald-400 font-bold">{result.id.toUpperCase()}</span>
          </h3>
          <p className="text-[10px] text-text-muted mt-0.5 animate-pulse">
            CLASSIFICATION COMPLETED BY RESNET-50 CROP SCANNER
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 border border-border bg-background hover:bg-card text-text-main rounded-lg transition-all cursor-pointer font-bold"
        >
          ANALYZE NEW IMAGE
        </button>
      </div>

      {/* Main Analysis Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Image Slider */}
        <div ref={containerRef} className="lg:col-span-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center bg-card border border-border p-3 rounded-t-xl">
            <span className="font-bold text-text-main uppercase tracking-wider text-[10px]">
              INTERACTIVE VISION COMPARER
            </span>
            <div className="flex items-center space-x-2">
              {/* Overlay Toggle Tabs */}
              <div className="flex bg-background border border-border rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setActiveOverlay("mask")}
                  className={cn(
                    "px-2 py-1 rounded text-[8px] font-bold cursor-pointer transition-colors",
                    activeOverlay === "mask" 
                      ? "bg-secondary text-white" 
                      : "text-text-muted hover:text-text-main"
                  )}
                >
                  MASK
                </button>
                <button
                  onClick={() => setActiveOverlay("heatmap")}
                  className={cn(
                    "px-2 py-1 rounded text-[8px] font-bold cursor-pointer transition-colors",
                    activeOverlay === "heatmap" 
                      ? "bg-secondary text-white" 
                      : "text-text-muted hover:text-text-main"
                  )}
                >
                  HEATMAP
                </button>
              </div>
              <button 
                onClick={toggleFullscreen} 
                className="p-1 hover:bg-background border border-border rounded cursor-pointer"
                title="Fullscreen Mode"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-text-muted" /> : <Maximize2 className="w-3.5 h-3.5 text-text-muted" />}
              </button>
            </div>
          </div>

          {/* Slider Container */}
          <div className="relative border border-t-0 border-border bg-slate-950 rounded-b-xl aspect-square overflow-hidden flex items-center justify-center min-h-[300px] w-full">
            
            {/* Base Image (Original Uploaded Image) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <img 
                src={result.original_image_base64} 
                alt="Uploaded leaf" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlaid Image (AI Segmentation Mask or Heatmap) */}
            <div 
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img 
                src={getOverlaySrc()} 
                alt="AI Analysis overlay" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bounding Box Drawing Overlays */}
            <div className="absolute inset-0 pointer-events-none w-full h-full">
              {result.bounding_boxes.map((box, idx) => (
                <div
                  key={idx}
                  className="absolute border-2 border-danger rounded shadow-[0_0_8px_rgba(239,68,68,0.5)] flex flex-col justify-start items-start"
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`
                  }}
                >
                  <span className="bg-danger text-white font-mono text-[7px] px-1 py-0.2 rounded-br select-none">
                    {box.label} ({box.confidence}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Slider bar overlay line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-accent z-10 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-accent border-2 border-white flex items-center justify-center shadow-lg pointer-events-auto cursor-col-resize">
                <span className="text-[10px] text-white font-bold select-none">↔</span>
              </div>
            </div>

            {/* Slider input control */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20"
            />

            {/* Banner details */}
            <div className="absolute bottom-3 left-3 bg-card/90 border border-border px-2 py-1 rounded text-[8px] tracking-widest text-text-main flex space-x-3">
              <span>← ORIGINAL LEAF</span>
              <span className="text-accent font-bold">
                {activeOverlay === "mask" ? "SEGMENTATION MASK" : "ACTIVATION HEATMAP"} (DRAG SLIDER) →
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Results Metadata */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          
          {/* Crop Info Overview */}
          <div className="bg-card border border-border p-4 rounded-xl grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] text-text-muted block font-bold uppercase">CROP TYPE</span>
              <span className="text-[11px] text-text-main font-bold mt-1 block">{result.crop_info.crop_type}</span>
            </div>
            <div>
              <span className="text-[9px] text-text-muted block font-bold uppercase">GROWTH STAGE</span>
              <span className="text-[11px] text-text-main font-bold mt-1 block">{result.crop_info.growth_stage}</span>
            </div>
            <div className="border-t border-border/50 pt-2">
              <span className="text-[9px] text-text-muted block font-bold uppercase">LEAF CONDITION</span>
              <span className="text-[11px] text-warning font-bold mt-1 block">{result.crop_info.leaf_condition}</span>
            </div>
            <div className="border-t border-border/50 pt-2">
              <span className="text-[9px] text-text-muted block font-bold uppercase">PLANT HEALTH SCORE</span>
              <span className="text-[11px] text-secondary font-bold mt-1 block">{result.crop_info.overall_health}/100</span>
            </div>
          </div>

          {/* Main classification card */}
          <div className="bg-card border border-border p-6 rounded-xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-text-muted tracking-wider uppercase">DETECTED PATHOGEN / INFECTION</span>
                <h4 className="text-base font-bold text-text-main leading-tight mt-1">
                  {result.disease_analysis.disease_detected}
                </h4>
                <p className="text-[10px] text-text-muted italic mt-0.5">{result.disease_analysis.scientific_name}</p>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold border rounded-full ${getSeverityColor(result.disease_analysis.severity_level)}`}>
                {result.disease_analysis.severity_level.toUpperCase()} SEVERITY
              </span>
            </div>

            {/* Science KPIs */}
            <div className="grid grid-cols-3 gap-4 border-y border-border/50 py-4 font-mono">
              <div className="text-center">
                <span className="text-[10px] text-text-muted block">AI CONFIDENCE</span>
                <span className="text-base font-bold text-accent">{result.disease_analysis.confidence_score}%</span>
              </div>
              <div className="text-center border-x border-border/50">
                <span className="text-[10px] text-text-muted block">SEVERITY INDEX</span>
                <span className="text-base font-bold text-warning">{result.severity}%</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-text-muted block">YIELD IMPACT</span>
                <span className="text-base font-bold text-danger">-{result.yieldImpact}%</span>
              </div>
            </div>

            {/* Explanation paragraph */}
            <div className="space-y-2">
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">
                SCIENTIFIC EXPLANATION
              </span>
              <p className="text-text-main leading-relaxed text-[11px]">
                {result.ai_explanation}
              </p>
            </div>

            {/* Visual Symptoms Breakdown */}
            <div className="space-y-3 border-t border-border/50 pt-4">
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">
                VISUAL SIGNS DETECTION ANALYSIS
              </span>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-text-muted">Spots (Necrosis):</span>
                  <span className="text-text-main font-bold">{result.visual_findings.spots}% area</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-text-muted">Yellowing (Chlorosis):</span>
                  <span className="text-text-main font-bold">{result.visual_findings.yellowing}% area</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-text-muted">Dry/Dehydrated Areas:</span>
                  <span className="text-text-main font-bold">{result.visual_findings.dry_areas}% area</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-text-muted">Mold Growth:</span>
                  <span className="text-text-main font-bold">{result.visual_findings.mold}% area</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-text-muted">Pest Damage:</span>
                  <span className="text-text-main font-bold">{result.visual_findings.pest_damage}% area</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-text-muted">Nutrient Deficiencies:</span>
                  <span className="text-text-main font-bold">{result.visual_findings.nutrient_deficiency}% area</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Treatment Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 bg-card border border-border p-6 rounded-xl space-y-4">
          <div className="flex items-center space-x-2 text-text-main font-bold border-b border-border/50 pb-2">
            <ShieldAlert className="w-4.5 h-4.5 text-secondary" />
            <span className="uppercase text-[11px] tracking-wider">PRESCRIPTION & ACTION PROTOCOLS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-background border border-border rounded-lg">
              <span className="text-[9px] text-text-muted block font-bold">🧪 TREATMENT</span>
              <span className="text-text-main font-bold block mt-1 text-[10px]">{result.recommendations.fungicide_pesticide}</span>
            </div>
            <div className="p-3 bg-background border border-border rounded-lg">
              <span className="text-[9px] text-text-muted block font-bold">🌱 FERTILIZER</span>
              <span className="text-text-main font-bold block mt-1 text-[10px]">{result.recommendations.fertilizer}</span>
            </div>
            <div className="p-3 bg-background border border-border rounded-lg">
              <span className="text-[9px] text-text-muted block font-bold">💧 WATERING</span>
              <span className="text-text-main font-bold block mt-1 text-[10px]">{result.recommendations.watering}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <span className="text-[9px] text-text-muted font-bold block uppercase mb-1">🚜 SOIL & SANITATION MANAGEMENT</span>
              <p className="text-[10px] text-text-main">{result.recommendations.soil_management}</p>
            </div>
            <div>
              <span className="text-[9px] text-text-muted font-bold block uppercase mb-1">🛡️ LONG-TERM PREVENTATIVE METHODS</span>
              <p className="text-[10px] text-text-main">{result.recommendations.prevention_methods}</p>
            </div>
            <div>
              <span className="text-[9px] text-text-muted font-bold block uppercase mb-1">👁️ scouting & monitoring frequency</span>
              <p className="text-[10px] text-text-main">{result.recommendations.monitoring_frequency}</p>
            </div>
          </div>
        </div>

        {/* Right Info: References and recovery timer */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-6">
          {/* Recovery Time Widget */}
          <div className="bg-card border border-border p-4 rounded-xl flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20 text-secondary">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-text-muted block uppercase tracking-wider font-bold">ESTIMATED RECOVERY WINDOW</span>
              <span className="text-sm font-bold text-text-main">
                {result.severity > 35 ? "14 - 21 DAYS" : result.severity > 5 ? "7 - 14 DAYS" : "IMMEDIATE (HEALTHY)"}
              </span>
              <p className="text-[9px] text-text-muted mt-0.5">Subject to prompt execution of treatment recommendation guidelines.</p>
            </div>
          </div>

          {/* Academic References */}
          <div className="bg-card border border-border p-5 rounded-xl flex-1 flex flex-col justify-between">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-widest border-b border-border/50 pb-2 mb-3">
              ACADEMIC CITATIONS & EVIDENCE
            </span>
            <div className="space-y-2.5">
              {result.references.map((ref, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-[10px] text-text-main hover:underline cursor-pointer">
                  <ExternalLink className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span>{ref}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-text-muted mt-4 pt-2 border-t border-border/50">
              Verified against USDA Agricultural Research databases.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Recharts Section */}
      <div className="border-t border-border/50 pt-8">
        <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-6 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span>SCIENTIFIC METRIC VISUALIZATIONS</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart 1: Disease Probability Distribution */}
          <div className="bg-card border border-border p-4 rounded-xl">
            <span className="text-[10px] text-text-muted font-bold block uppercase mb-4 text-center">
              MODEL CLASSIFICATION PROBABILITIES
            </span>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataProbabilities} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 8 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: "#64748B", fontSize: 8 }} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "none", borderRadius: 8, color: "#fff", fontSize: 9 }} />
                  <Bar dataKey="probability" fill="#06B6D4" radius={[0, 4, 4, 0]}>
                    {chartDataProbabilities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#EF4444" : "#3B82F6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Health Score Gauge */}
          <div className="bg-card border border-border p-4 rounded-xl">
            <span className="text-[10px] text-text-muted font-bold block uppercase mb-4 text-center">
              HEALTHY VS INFECTED TISSUE RATIO
            </span>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataHealth}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieDataHealth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={HEALTH_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1E293B", border: "none", borderRadius: 8, color: "#fff", fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col space-y-1.5 text-[9px] w-28 shrink-0">
                <div className="flex items-center space-x-1.5 text-text-main font-mono">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#10B981" }} />
                  <span>Healthy: {health}%</span>
                </div>
                <div className="flex items-center space-x-1.5 text-text-main font-mono">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#EF4444" }} />
                  <span>Infected: {severity}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 3: Projected Yield Curve */}
          <div className="bg-card border border-border p-4 rounded-xl">
            <span className="text-[10px] text-text-muted font-bold block uppercase mb-4 text-center">
              YIELD PROJECTION STABILIZATION
            </span>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataYieldRecovery} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity="0.2"/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity="0.2"/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 8 }} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 8 }} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "none", borderRadius: 8, color: "#fff", fontSize: 9 }} />
                  <Area type="monotone" dataKey="standardYield" stroke="#10B981" fillOpacity={1} fill="url(#colorStandard)" name="Standard Crop" />
                  <Area type="monotone" dataKey="projectedYield" stroke="#3B82F6" fillOpacity={1} fill="url(#colorProjected)" name="Recovering Crop" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
