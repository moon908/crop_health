"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Map, 
  BrainCircuit, 
  TrendingUp, 
  Droplets,
  Thermometer,
  Percent
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-component for premium animated numbers
function AnimatedCounter({ value, decimals = 1, duration = 800 }: { value: number; decimals?: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = React.useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    const startTime = performance.now();

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const current = start + (end - start) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
        prevValueRef.current = end;
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value, duration]);

  return <span>{displayValue.toFixed(decimals)}</span>;
}

interface StatsCardProps {
  title: string;
  value: number;
  decimals?: number;
  suffix?: string;
  trend: number[]; // Sparkline data points
  trendLabel: string;
  trendDirection: "up" | "down" | "neutral";
  status: "success" | "warning" | "danger" | "info";
  icon: React.ComponentType<{ className?: string }>;
}

function StatsCard({
  title,
  value,
  decimals = 1,
  suffix = "",
  trend,
  trendLabel,
  trendDirection,
  status,
  icon: Icon
}: StatsCardProps) {
  // Sparkline coordinates helper
  const width = 80;
  const height = 24;
  const minVal = Math.min(...trend);
  const maxVal = Math.max(...trend);
  const range = maxVal - minVal || 1;
  const points = trend.map((val, idx) => {
    const x = (idx / (trend.length - 1)) * width;
    const y = height - ((val - minVal) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const colorMap = {
    success: {
      border: "border-secondary/20 hover:border-secondary/40",
      bgGlow: "bg-secondary/5",
      text: "text-secondary",
      sparkline: "stroke-secondary"
    },
    warning: {
      border: "border-warning/20 hover:border-warning/40",
      bgGlow: "bg-warning/5",
      text: "text-warning",
      sparkline: "stroke-warning"
    },
    danger: {
      border: "border-danger/20 hover:border-danger/40",
      bgGlow: "bg-danger/5",
      text: "text-danger",
      sparkline: "stroke-danger"
    },
    info: {
      border: "border-accent/20 hover:border-accent/40",
      bgGlow: "bg-accent/5",
      text: "text-accent",
      sparkline: "stroke-accent"
    }
  };

  const scheme = colorMap[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "bg-card border border-border p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition-all duration-300",
        scheme.border
      )}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
          {title}
        </span>
        <div className={cn("p-2 rounded-lg bg-background border border-border", scheme.text)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="my-4 flex items-baseline space-x-1">
        <span className="text-2xl font-mono font-bold text-text-main">
          <AnimatedCounter value={value} decimals={decimals} />
        </span>
        <span className="text-sm font-mono text-text-muted">{suffix}</span>
      </div>

      <div className="flex justify-between items-center border-t border-border/50 pt-3">
        {/* Sparkline Graph */}
        <div className="flex items-center space-x-2">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              strokeWidth="2"
              points={points}
              className={scheme.sparkline}
            />
          </svg>
        </div>

        {/* Trend Indicator */}
        <div className="flex flex-col items-end font-mono text-[9px] leading-tight">
          <span className={cn("font-bold flex items-center space-x-0.5", 
            trendDirection === "up" && "text-secondary",
            trendDirection === "down" && "text-danger",
            trendDirection === "neutral" && "text-text-muted"
          )}>
            {trendDirection === "up" && "+"}
            {trendDirection === "down" && "-"}
            {trendLabel}
          </span>
          <span className="text-text-muted">TREND</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsGrid() {
  const [ndvi, setNdvi] = useState(0.68);
  const [diseasedHectares, setDiseasedHectares] = useState(12.4);
  const [aiPredictions, setAiPredictions] = useState(142);
  const [soilMoisture, setSoilMoisture] = useState(42.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setNdvi(prev => {
        const diff = (Math.random() - 0.5) * 0.015; // small fluctuation
        return Math.max(0.3, Math.min(0.99, Number((prev + diff).toFixed(2))));
      });
      setDiseasedHectares(prev => {
        const diff = (Math.random() - 0.5) * 0.15;
        return Math.max(0, Math.min(100, Number((prev + diff).toFixed(1))));
      });
      setSoilMoisture(prev => {
        const diff = (Math.random() - 0.5) * 0.25;
        return Math.max(10, Math.min(90, Number((prev + diff).toFixed(1))));
      });
      setAiPredictions(prev => {
        // AI predictions increase by 1 roughly 15% of the time
        if (Math.random() > 0.85) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none">
      <StatsCard
        title="NDVI Canopy Index"
        value={ndvi}
        decimals={2}
        trend={[0.61, 0.62, 0.65, 0.63, 0.66, ndvi]}
        trendLabel="11.4%"
        trendDirection="up"
        status="success"
        icon={TrendingUp}
      />
      <StatsCard
        title="Diseased Canopy Hectares"
        value={diseasedHectares}
        decimals={1}
        suffix=" ha"
        trend={[18.5, 16.2, 14.8, 13.1, 12.8, diseasedHectares]}
        trendLabel="32.9%"
        trendDirection="down"
        status="danger"
        icon={AlertTriangle}
      />
      <StatsCard
        title="Today's AI Predictions"
        value={aiPredictions}
        decimals={0}
        trend={[92, 105, 110, 118, 125, aiPredictions]}
        trendLabel="13.6%"
        trendDirection="up"
        status="info"
        icon={BrainCircuit}
      />
      <StatsCard
        title="Soil Moisture (VWC)"
        value={soilMoisture}
        decimals={1}
        suffix="%"
        trend={[45.2, 44.8, 43.1, 41.5, 42.0, soilMoisture]}
        trendLabel="1.9%"
        trendDirection="neutral"
        status="info"
        icon={Droplets}
      />
    </div>
  );
}
