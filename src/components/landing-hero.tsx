"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Upload, HelpCircle, Activity } from "lucide-react";

interface LandingHeroProps {
  onStartAnalysis: () => void;
  onViewSample: () => void;
  onUploadDataset: () => void;
}

export default function LandingHero({ 
  onStartAnalysis, 
  onViewSample, 
  onUploadDataset 
}: LandingHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background particles animation representing a neural-network grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }[] = [];

    const numParticles = 45;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Check current theme colors
      const isDarkMode = document.documentElement.classList.contains("dark") || 
                         document.querySelector(".dark") !== null;
      const lineColor = isDarkMode ? "rgba(16, 185, 129, 0.08)" : "rgba(20, 83, 45, 0.04)";
      const dotColor = isDarkMode ? "rgba(34, 211, 238, 0.3)" : "rgba(20, 83, 45, 0.15)";

      // Draw lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Update physics
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = (1 - dist / 150) * 1.2;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-background p-8 md:p-12 mb-8 select-none shadow-sm">
      {/* Absolute Canvas Overlay */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none" 
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Info Column */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary/5 dark:bg-emerald-500/10 border border-primary/20 dark:border-emerald-500/20 px-3 py-1 rounded-full w-fit">
            <Activity className="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-primary dark:text-emerald-400 uppercase">
              Precision Crop Telemetry Enabled
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-mono font-extrabold tracking-tight text-text-main leading-tight">
            AI-Powered Crop <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary dark:from-emerald-400 dark:to-accent">
              Health Intelligence
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-text-muted leading-relaxed max-w-xl">
            Analyze crop health in real time using advanced Computer Vision, Deep Learning, and multi-spectral Satellite Intelligence. Diagnose leaf pathologies, monitor vegetation indices, and deploy target treatment strategies.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onStartAnalysis}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-mono font-semibold rounded-lg shadow-md shadow-primary/10 hover:shadow-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>START ANALYSIS</span>
            </button>
            <button
              onClick={onViewSample}
              className="flex items-center space-x-2 px-5 py-2.5 bg-card hover:bg-background border border-border text-text-main text-xs font-mono font-semibold rounded-lg transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>VIEW SAMPLE CASES</span>
            </button>
            <button
              onClick={onUploadDataset}
              className="flex items-center space-x-2 px-5 py-2.5 bg-background hover:bg-card border border-border text-text-muted hover:text-text-main text-xs font-mono rounded-lg transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>UPLOAD DATASET</span>
            </button>
          </div>
        </div>

        {/* Right Illustration Column (Vector SVG) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm"
          >
            <svg 
              viewBox="0 0 400 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-md text-primary dark:text-emerald-500"
            >
              {/* Grid Background */}
              <defs>
                <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
                </pattern>
                <linearGradient id="beamGradient" x1="200" y1="80" x2="200" y2="300" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <rect width="400" height="400" fill="url(#heroGrid)" rx="16" />

              {/* Orbit Path */}
              <ellipse cx="200" cy="80" rx="140" ry="20" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.4" />

              {/* Satellite Beam (Scanning Overlay) */}
              <polygon points="200,80 100,280 300,280" fill="url(#beamGradient)" className="pulse-node" />

              {/* Leaf Scan Target */}
              <g transform="translate(100, 200)">
                {/* Simulated Grid Node */}
                <rect x="0" y="0" width="200" height="120" rx="8" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.3" />
                
                {/* SVG Leaf */}
                <path 
                  d="M100 20 C140 50, 160 80, 100 110 C40 80, 60 50, 100 20 Z" 
                  fill="currentColor" 
                  fillOpacity="0.08" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                />
                {/* Leaf Veins */}
                <path d="M100 20 L100 110" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
                <path d="M100 45 C115 50, 130 55, 135 60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                <path d="M100 65 C115 70, 125 75, 130 80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                <path d="M100 45 C85 50, 70 55, 65 60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                <path d="M100 65 C85 70, 75 75, 70 80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />

                {/* Computer Vision Bounding Box */}
                <rect x="55" y="40" width="90" height="60" rx="4" stroke="#DC2626" strokeWidth="1.5" className="pulse-node" />
                <text x="60" y="36" fill="#DC2626" fontSize="8" fontFamily="monospace" fontWeight="bold">INFECTION DETECTED: 98%</text>

                {/* Cybernetic Points */}
                <circle cx="100" cy="20" r="3" fill="#06B6D4" />
                <circle cx="100" cy="110" r="3" fill="#06B6D4" />
                <circle cx="130" cy="80" r="2.5" fill="#16A34A" />
                <circle cx="70" cy="80" r="2.5" fill="#16A34A" />
              </g>

              {/* Satellite Vector */}
              <g transform="translate(180, 50)" className="pulse-node">
                <rect x="0" y="10" width="40" height="20" rx="4" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
                <rect x="-15" y="15" width="15" height="10" rx="2" fill="#06B6D4" />
                <rect x="40" y="15" width="15" height="10" rx="2" fill="#06B6D4" />
                <path d="M20 20 L20 35 M20 35 L12 40 M20 35 L28 40" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="20" cy="42" r="2" fill="#DC2626" />
              </g>

              {/* Scientific Dashboard Overlay Text */}
              <text x="20" y="375" fill="currentColor" fillOpacity="0.5" fontSize="10" fontFamily="monospace">GRID SPEC: WGS-84 / UTM ZONE 17N</text>
              <text x="260" y="375" fill="currentColor" fillOpacity="0.5" fontSize="10" fontFamily="monospace">FOV: 120km SENSOR</text>
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
