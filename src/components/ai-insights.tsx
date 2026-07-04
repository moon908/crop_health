"use client";

import React, { useState } from "react";
import { AI_INSIGHTS, AIInsight } from "@/lib/mock-data";
import { 
  BrainCircuit, 
  AlertTriangle, 
  HelpCircle,
  Clock, 
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  BookmarkCheck,
  TrendingDown,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIInsightsProps {
  onShowToast: (message: string, type: "success" | "warning" | "error") => void;
}

export default function AIInsightsPanel({ onShowToast }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>(AI_INSIGHTS);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleResolve = (idx: number, title: string) => {
    onShowToast(`System action logged: '${title}' marked as reviewed/resolved.`, "success");
    setInsights(prev => prev.filter((_, i) => i !== idx));
    setExpandedIndex(null);
  };

  const getSeverityStyle = (type: string) => {
    if (type === "alert") return "border-danger bg-danger/5 text-danger";
    if (type === "recommendation") return "border-warning bg-warning/5 text-warning";
    return "border-accent bg-accent/5 text-accent";
  };

  return (
    <div className="space-y-8 font-mono text-xs select-none">
      
      {/* Upper header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-secondary animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-text-main uppercase">AI COGNITIVE MONITORING INSIGHTS</h3>
            <p className="text-[9px] text-text-muted mt-0.5">ACTIVE PATHOLOGY AND SOIL PROFILE ANALYSES</p>
          </div>
        </div>
        <span className="bg-background text-text-muted px-2 py-0.5 rounded text-[10px]">
          {insights.length} DISCOVERIES
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Insight Stack (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence mode="popLayout">
            {insights.length > 0 ? (
              insights.map((insight, idx) => {
                const isExpanded = expandedIndex === idx;
                const badgeStyle = getSeverityStyle(insight.type);

                return (
                  <motion.div
                    key={insight.title}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-card border rounded-xl overflow-hidden shadow-sm transition-colors ${
                      isExpanded ? "border-secondary" : "border-border hover:border-text-muted"
                    }`}
                  >
                    {/* Header */}
                    <div 
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="p-4 flex items-start justify-between cursor-pointer space-x-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-bold border ${badgeStyle}`}>
                            {insight.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-text-muted">{insight.field} • {insight.timestamp}</span>
                        </div>
                        <h4 className="text-xs font-bold text-text-main truncate uppercase">
                          {insight.title}
                        </h4>
                      </div>
                      
                      <div className="text-text-muted flex items-center space-x-2 shrink-0">
                        <span className="text-[9px]">{isExpanded ? "COLLAPSE" : "EXPAND"}</span>
                        <ArrowRight className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`} />
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/50 bg-background/30 p-4 space-y-4"
                      >
                        <p className="text-[11px] text-text-main leading-relaxed">
                          {insight.description}
                        </p>

                        {/* Telemetry specs grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-card p-3 rounded-lg border border-border/80">
                          {insight.parameters.pesticide && (
                            <div className="text-[10px]">
                              <span className="text-text-muted block">PESTICIDE TARGET:</span>
                              <span className="text-text-main font-bold">{insight.parameters.pesticide}</span>
                            </div>
                          )}
                          {insight.parameters.fertilizer && (
                            <div className="text-[10px]">
                              <span className="text-text-muted block">FERTILIZER ACTION:</span>
                              <span className="text-text-main font-bold">{insight.parameters.fertilizer}</span>
                            </div>
                          )}
                          {insight.parameters.irrigation && (
                            <div className="text-[10px]">
                              <span className="text-text-muted block">IRRIGATION:</span>
                              <span className="text-text-main font-bold">{insight.parameters.irrigation}</span>
                            </div>
                          )}
                          {insight.parameters.deficiency && (
                            <div className="text-[10px]">
                              <span className="text-text-muted block">DEFICIENCY DETECTED:</span>
                              <span className="text-danger font-bold">{insight.parameters.deficiency}</span>
                            </div>
                          )}
                          {insight.parameters.recoveryTime && (
                            <div className="text-[10px]">
                              <span className="text-text-muted block">RECOVERY TIMELINE:</span>
                              <span className="text-text-main font-bold flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-secondary inline-block" />
                                <span>{insight.parameters.recoveryTime}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* References */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-text-muted font-bold block uppercase">SCIENTIFIC CITATIONS</span>
                          {insight.references.map((ref, rIdx) => (
                            <div key={rIdx} className="text-[9px] text-accent flex items-center space-x-1 hover:underline cursor-pointer">
                              <Bookmark className="w-3 h-3 text-secondary shrink-0" />
                              <span>{ref}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end space-x-2 pt-2 border-t border-border/50">
                          <button
                            onClick={() => handleResolve(idx, insight.title)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-secondary hover:bg-primary text-white font-bold rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>RESOLVE</span>
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-card border border-border rounded-xl text-text-muted space-y-2">
                <BookmarkCheck className="w-10 h-10 mx-auto text-secondary animate-bounce" />
                <p className="font-bold text-text-main">ALL ANOMALIES RESOLVED</p>
                <p className="text-[10px]">Foliar disease sensor indices are current and within optimal limits.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Nutrient Deficiency Matrix & Help Reference (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Nutrient card */}
          <div className="bg-card border border-border p-5 rounded-xl space-y-4">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider border-b border-border/50 pb-2">
              SOIL CANOPY NUTRIENT PROFILE
            </span>
            <p className="text-[10px] text-text-muted leading-relaxed">
              Derived from high-resolution spectral chlorophyll indices (NDRE) and lab soil samples.
            </p>

            <div className="space-y-3.5">
              {/* Nitrogen */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-text-main">Nitrogen (N)</span>
                  <span className="text-danger">Critical Deficiency (2.4%)</span>
                </div>
                <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden">
                  <div className="h-full bg-danger" style={{ width: "35%" }} />
                </div>
              </div>

              {/* Phosphorus */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-text-main">Phosphorus (P)</span>
                  <span className="text-secondary">Optimal (4.2%)</span>
                </div>
                <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: "82%" }} />
                </div>
              </div>

              {/* Potassium */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-text-main">Potassium (K)</span>
                  <span className="text-warning">Moderate Depletion (3.1%)</span>
                </div>
                <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden">
                  <div className="h-full bg-warning" style={{ width: "52%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 text-[10px] text-text-muted flex items-start space-x-1.5">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>Drip Urea (UAN-32) injection is scheduled for Field B-12 to correct canopy nitrogen deficit.</span>
            </div>
          </div>

          {/* Reference Card */}
          <div className="bg-card border border-border p-5 rounded-xl space-y-4">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider border-b border-border/50 pb-2">
              DIAGNOSTIC CRITERIA MATRIX
            </span>
            <div className="space-y-2 text-[10px] text-text-main leading-relaxed">
              <p>
                <b>Severity Index</b> is calculated as the ratio of infected leaf surface pixel area to total leaf surface pixel area.
              </p>
              <p>
                <b>Yield Impact</b> is simulated using historic crop development timelines and temperature curves under pathology stress.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
