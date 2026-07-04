"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  MapPin, 
  Cpu, 
  ChevronDown, 
  UserCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  isDark: boolean;
  onThemeToggle: () => void;
  farmSelection: string;
  onFarmChange: (farm: string) => void;
}

export default function Topbar({ 
  isDark, 
  onThemeToggle, 
  farmSelection, 
  onFarmChange 
}: TopbarProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, text: "High Rust risk detected in Field A-04", unread: true },
    { id: 2, text: "Satellite pass scheduled for 14:05 UTC", unread: true },
    { id: 3, text: "Field scan SCAN-2026-904 finished processing", unread: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("en-US", { 
        weekday: "short", 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit",
        hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-card/85 backdrop-blur-md border-b border-border px-6 flex items-center justify-between">
      {/* Left Area: Search and Location Info */}
      <div className="flex items-center space-x-6 flex-1">
        {/* Search */}
        <div className="relative w-64 max-w-xs hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </span>
          <input
            type="text"
            placeholder="Search fields, diseases, scans..."
            className="w-full pl-9 pr-4 py-1.5 bg-background/50 border border-border rounded-lg text-xs font-mono text-text-main focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        {/* Farm Coordinator Selector */}
        <div className="flex items-center space-x-2 text-xs font-mono bg-background/80 px-3 py-1.5 rounded-lg border border-border">
          <MapPin className="w-3.5 h-3.5 text-secondary" />
          <span className="text-text-muted">COORDS:</span>
          <span className="text-text-main font-bold">42.368° N, 83.352° W</span>
          <span className="h-3 w-[1px] bg-border mx-1" />
          <select 
            value={farmSelection} 
            onChange={(e) => onFarmChange(e.target.value)}
            className="bg-transparent text-text-main focus:outline-none font-bold cursor-pointer"
          >
            <option value="Green Prairie Farm">Green Prairie Farm (Central)</option>
            <option value="North Field Labs">North Field Labs (Sub-station)</option>
            <option value="Valley Drip Plots">Valley Drip Plots (South)</option>
          </select>
        </div>
      </div>

      {/* Right Area: System Telemetry & Utilities */}
      <div className="flex items-center space-x-4">
        {/* Clock */}
        <div className="hidden lg:block font-mono text-xs text-text-muted border-r border-border pr-4">
          SYS TIME: <span className="text-text-main font-bold">{currentTime}</span>
        </div>

        {/* AI Model Core Indicator */}
        <div className="flex items-center space-x-2 bg-secondary/5 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-secondary/20 font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-secondary animate-pulse" />
          <span className="text-text-muted hidden sm:inline">AI CORE:</span>
          <span className="text-secondary font-bold">V4.1-ACTIVE</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 hover:bg-background border border-border rounded-lg transition-colors text-text-muted hover:text-text-main relative"
          title="Toggle System Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-background border border-border rounded-lg transition-colors text-text-muted hover:text-text-main relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-danger text-[9px] font-mono font-bold text-white items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-40 p-4 font-mono text-xs"
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
                    <span className="font-bold text-text-main">TELEMETRY NOTIFICATIONS</span>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({...n, unread: false})))}
                      className="text-[10px] text-secondary hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2 rounded-lg border text-[11px] ${
                          n.unread 
                            ? "bg-secondary/5 border-secondary/20 text-text-main font-semibold" 
                            : "bg-background/40 border-border text-text-muted"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                          <span className="text-[10px] text-text-muted">SYSTEM</span>
                        </div>
                        {n.text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2 border-l border-border pl-4">
          <div className="flex flex-col items-end text-[10px] font-mono leading-tight">
            <span className="text-text-main font-bold">DR. S. VARMA</span>
            <span className="text-text-muted">CHIEF AGRONOMIST</span>
          </div>
          <UserCircle className="w-8 h-8 text-text-muted hover:text-text-main transition-colors cursor-pointer" />
        </div>
      </div>
    </header>
  );
}
