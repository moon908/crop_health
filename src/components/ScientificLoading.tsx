import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  UploadCloud, 
  Cpu, 
  Binary, 
  Search, 
  Map, 
  FileText, 
  CheckCircle 
} from "lucide-react";

interface ScientificLoadingProps {
  step: number;
}

const STEPS = [
  { id: 1, label: "Uploading Image", status: "Uploading image data...", icon: UploadCloud },
  { id: 2, label: "Preprocessing Image", status: "Preparing Image...", icon: Binary },
  { id: 3, label: "Running AI Model", status: "Extracting Features...", icon: Cpu },
  { id: 4, label: "Disease Detection", status: "Detecting Crop Disease...", icon: Search },
  { id: 5, label: "Generating Heatmap", status: "Generating Explainability Map...", icon: Map },
  { id: 6, label: "Generating AI Report", status: "Preparing Scientific Report...", icon: FileText },
];

export default function ScientificLoading({ step }: ScientificLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar calculation based on current step
    const targetProgress = Math.min((step / STEPS.length) * 100, 100);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress);
        }
        clearInterval(interval);
        return prev;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-2xl shadow-xl max-w-2xl mx-auto my-12 font-mono text-xs select-none">
      <div className="w-full border-b border-border/50 pb-3 mb-6 flex justify-between items-center text-text-muted">
        <span className="font-bold uppercase tracking-widest text-[10px]">AI TELEMETRY PIPELINE</span>
        <span className="text-secondary font-bold">ACTIVE SCAN</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-center">
        {/* Left Column: Visual Animations based on active step */}
        <div className="md:col-span-5 relative bg-background border border-border rounded-2xl aspect-square flex items-center justify-center overflow-hidden min-h-[220px]">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8e0d9_1px,transparent_1px),linear-gradient(to_bottom,#e8e0d9_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
          
          {/* Dynamic step-specific animations */}
          {step === 1 && (
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center"
            >
              <UploadCloud className="w-16 h-16 text-primary animate-pulse" />
              <span className="text-[10px] mt-2 text-text-muted">Ingesting packets...</span>
            </motion.div>
          )}

          {step === 2 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Binary className="w-16 h-16 text-secondary animate-pulse" />
              <div className="absolute inset-0 border-t-2 border-secondary/40 scan-line" />
            </div>
          )}

          {step === 3 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Cpu className="w-16 h-16 text-tertiary animate-spin duration-3000" />
              {/* Animated neural nodes */}
              <svg className="absolute inset-0 w-full h-full text-tertiary/20" viewBox="0 0 100 100">
                <circle cx="20" cy="30" r="2.5" className="fill-tertiary pulse-node" />
                <circle cx="80" cy="30" r="2.5" className="fill-tertiary pulse-node" />
                <circle cx="50" cy="70" r="2.5" className="fill-tertiary pulse-node" />
                <line x1="20" y1="30" x2="50" y2="70" stroke="currentColor" strokeWidth="1" />
                <line x1="80" y1="30" x2="50" y2="70" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          )}

          {step === 4 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Search className="w-16 h-16 text-primary" />
              <motion.div 
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute w-24 h-24 border-2 border-primary rounded-lg"
              />
            </div>
          )}

          {step === 5 && (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <Map className="w-16 h-16 text-red-500" />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-orange-500/20 to-transparent"
              />
            </div>
          )}

          {step === 6 && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="flex items-center justify-center"
            >
              <FileText className="w-16 h-16 text-secondary" />
            </motion.div>
          )}

          <div className="absolute bottom-3 left-3 bg-card/90 border border-border px-2 py-1 rounded text-[8px] tracking-wider text-primary font-bold">
            STAGE_{step}_ACTIVE
          </div>
        </div>

        {/* Right Column: Steps Progress List */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-3 bg-background/50 border border-border p-4 rounded-xl">
            {STEPS.map((s) => {
              const isDone = s.id < step;
              const isActive = s.id === step;
              const Icon = s.icon;

              return (
                <div 
                  key={s.id}
                  className={`flex items-center space-x-3 text-[11px] transition-colors duration-300 ${
                    isDone ? "text-secondary font-semibold" : isActive ? "text-primary font-bold" : "text-text-muted/60"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-secondary shrink-0" />
                  ) : isActive ? (
                    <Cpu className="w-4 h-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 border border-border rounded-full shrink-0" />
                  )}
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-text-muted"}`} />
                  <span className="truncate">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Progress telemetry */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-text-muted">SYSTEM STATUS:</span>
              <span className="text-primary uppercase">{STEPS[step - 1]?.status || "Complete"}</span>
            </div>
            
            <div className="w-full h-3 bg-background border border-border rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-text-muted">
              <span>COMPUTING MATRIX DATA</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
