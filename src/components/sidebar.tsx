"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FlaskConical, 
  Satellite, 
  Dna, 
  History, 
  CloudSun, 
  FileText, 
  BrainCircuit, 
  FolderGit2, 
  Settings,
  Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewType = 
  | "dashboard" 
  | "analysis" 
  | "satellite" 
  | "diseases" 
  | "history" 
  | "weather" 
  | "reports" 
  | "insights" 
  | "datasets" 
  | "settings";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface SidebarItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analysis", label: "Crop Analysis", icon: FlaskConical },
  { id: "satellite", label: "Satellite Monitoring", icon: Satellite },
  { id: "diseases", label: "Disease Detection", icon: Dna },
  { id: "history", label: "Field History", icon: History },
  { id: "weather", label: "Weather Telemetry", icon: CloudSun },
  { id: "reports", label: "Analysis Reports", icon: FileText },
  { id: "insights", label: "AI Insights", icon: BrainCircuit },
  { id: "datasets", label: "Dataset Manager", icon: FolderGit2 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-72 bg-card border-r border-border h-screen sticky top-0 flex flex-col justify-between select-none z-30 shrink-0">
      <div className="flex flex-col h-full">
        {/* Top Header Logo */}
        <div className="p-6 border-b border-border flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-mono font-bold tracking-tight text-text-main text-lg leading-tight">
              AETHERIA
            </h1>
            <p className="text-[10px] text-text-muted font-mono tracking-widest uppercase">
              Agri-Vision Lab
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "relative w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 outline-none text-left group",
                  isActive 
                    ? "text-primary dark:text-emerald-400 font-semibold" 
                    : "text-text-muted hover:text-text-main hover:bg-background/80"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1.5 h-7 bg-primary dark:bg-primary-hover rounded-r-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Active Background Glow */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-bg"
                    className="absolute inset-0 bg-primary/5 dark:bg-emerald-500/10 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-primary dark:text-emerald-400" : "text-text-muted group-hover:text-text-main"
                )} />
                <span className="font-mono tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-6 border-t border-border bg-background/50 font-mono text-[10px] text-text-muted space-y-1">
        <div className="flex justify-between items-center">
          <span>AI AGENT STATUS:</span>
          <span className="flex items-center space-x-1.5 font-bold text-secondary">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" />
            <span>ONLINE</span>
          </span>
        </div>
        <div>STATION: AP-MIDWEST-09</div>
        <div>VER: 4.10.82-LITE</div>
      </div>
    </aside>
  );
}
