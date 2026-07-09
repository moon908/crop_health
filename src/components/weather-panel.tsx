"use client";

import React, { useState, useEffect, useRef } from "react";
import { WEATHER_DATA } from "@/lib/mock-data";
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  AlertTriangle,
  Info,
  Radio,
  Signal,
  Activity
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

// Optimized animated digits component (slides numbers smoothly from previous values without resetting to zero)
function AnimatedCounter({ value, decimals = 1, duration = 600 }: { value: number; decimals?: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    const startTime = performance.now();

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
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

interface LivePoint {
  time: string;
  temp: number;
  moisture: number;
}

export default function WeatherPanel() {
  const [weather, setWeather] = useState(WEATHER_DATA);
  const [latency, setLatency] = useState(42);
  const [signalStrength, setSignalStrength] = useState(98);

  // Initialize live scrolling sensor history buffer (10 points, updated every 2.5s)
  const [liveHistory, setLiveHistory] = useState<LivePoint[]>(() => {
    const pts: LivePoint[] = [];
    const baseTime = Date.now();
    for (let i = 9; i >= 0; i--) {
      pts.push({
        time: new Date(baseTime - i * 2500).toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temp: WEATHER_DATA.temp + (Math.random() - 0.5) * 0.4,
        moisture: WEATHER_DATA.soilMoisture + (Math.random() - 0.5) * 0.4
      });
    }
    return pts;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Calculate random sensor latency and signal drift
      setLatency(Math.round(40 + Math.random() * 8));
      setSignalStrength(Math.round(96 + Math.random() * 3));

      // 2. Fluctuate standard weather values
      setWeather(prev => {
        const tempDiff = (Math.random() - 0.5) * 0.2; // -0.1 to +0.1
        const humidDiff = (Math.random() - 0.5) * 0.3; // -0.15 to +0.15
        const windDiff = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
        const soilMoistDiff = (Math.random() - 0.5) * 0.15; // -0.075 to +0.075
        const soilTempDiff = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
        
        const newTemp = Math.max(10, Math.min(45, Number((prev.temp + tempDiff).toFixed(1))));
        const newHumid = Math.max(20, Math.min(100, Number((prev.humidity + humidDiff).toFixed(1))));
        const newWind = Math.max(0, Math.min(60, Number((prev.windSpeed + windDiff).toFixed(1))));
        const newSoilMoist = Math.max(0, Math.min(100, Number((prev.soilMoisture + soilMoistDiff).toFixed(1))));
        const newSoilTemp = Math.max(5, Math.min(35, Number((prev.soilTemp + soilTempDiff).toFixed(1))));
        
        // Fluctuate risk percentages slightly
        const newRisks = prev.diseaseRisks.map(r => {
          const rDiff = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const newPct = Math.max(5, Math.min(99, r.percentage + rDiff));
          let riskLevel: "Low" | "Moderate" | "High" = "Low";
          if (newPct > 70) riskLevel = "High";
          else if (newPct > 40) riskLevel = "Moderate";
          return {
            ...r,
            percentage: newPct,
            risk: riskLevel
          };
        });

        // 3. Append to live scrolling chart buffer
        setLiveHistory(prevHistory => {
          const nextPt: LivePoint = {
            time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            temp: newTemp,
            moisture: newSoilMoist
          };
          return [...prevHistory.slice(1), nextPt];
        });

        return {
          ...prev,
          temp: newTemp,
          humidity: newHumid,
          windSpeed: newWind,
          soilMoisture: newSoilMoist,
          soilTemp: newSoilTemp,
          diseaseRisks: newRisks
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const data = weather;

  const getRiskBadgeColor = (risk: "Low" | "Moderate" | "High") => {
    if (risk === "Low") return "bg-secondary/15 border-secondary/20 text-secondary";
    if (risk === "Moderate") return "bg-warning/15 border-warning/20 text-warning";
    return "bg-danger/15 border-danger/20 text-danger";
  };

  return (
    <div className="space-y-8 font-mono text-xs select-none">
      
      {/* Real-time Status Header */}
      <div className="flex flex-wrap items-center justify-between bg-card border border-border p-3.5 rounded-xl gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </div>
          <span className="font-bold text-text-main uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span>LIVE IoT RADAR FIELD FEED (ONLINE)</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[10px] text-text-muted">
          <span className="flex items-center space-x-1">
            <Signal className="w-3.5 h-3.5 text-secondary" />
            <span>SIGNAL: <b>{signalStrength}%</b></span>
          </span>
          <span className="h-3 w-[1px] bg-border" />
          <span className="flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <span>LATENCY: <b>{latency}ms</b></span>
          </span>
          <span className="h-3 w-[1px] bg-border" />
          <span>POLLING: <b>1.0Hz</b></span>
        </div>
      </div>
      
      {/* Top Section: Grid of fluctuating conditions */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Temp */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between hover:border-secondary/30 transition-colors">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">AIR TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">
              <AnimatedCounter value={data.temp} decimals={1} />°C
            </span>
            <span className="text-[9px] text-text-muted block mt-1">OPTIMAL: 18-28°C</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between hover:border-accent/30 transition-colors">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">REL HUMIDITY</span>
            <Droplets className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">
              <AnimatedCounter value={data.humidity} decimals={1} />%
            </span>
            <span className="text-[9px] text-text-muted block mt-1">SPORE RISK: &gt;75%</span>
          </div>
        </div>

        {/* Rainfall */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between hover:border-accent/30 transition-colors">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">24H RAIN</span>
            <CloudRain className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">
              <AnimatedCounter value={data.rainfall} decimals={1} /> mm
            </span>
            <span className="text-[9px] text-text-muted block mt-1">SOIL SATURATION</span>
          </div>
        </div>

        {/* Wind */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between hover:border-border/60 transition-colors">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">WIND SPEED</span>
            <Wind className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">
              <AnimatedCounter value={data.windSpeed} decimals={1} /> km/h
            </span>
            <span className="text-[9px] text-text-muted block mt-1">SPORE DISPERSAL</span>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between hover:border-secondary/30 transition-colors">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">SOIL MOISTURE</span>
            <Droplets className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">
              <AnimatedCounter value={data.soilMoisture} decimals={1} />%
            </span>
            <span className="text-[9px] text-text-muted block mt-1">VOLUMETRIC H2O</span>
          </div>
        </div>

        {/* Soil Temp */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between hover:border-warning/30 transition-colors">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">SOIL TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-warning" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">
              <AnimatedCounter value={data.soilTemp} decimals={1} />°C
            </span>
            <span className="text-[9px] text-text-muted block mt-1">ROOT SUSCEPTIBILITY</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Live Oscilloscope stream & Disease Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Live Oscilloscope Graph (Left - 8 columns) */}
        <div className="lg:col-span-8 bg-card border border-border p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-text-main uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-accent animate-pulse" />
              <span>REAL-TIME SENSOR STREAM OSCILLOSCOPE (2.5s INTERVAL)</span>
            </span>
            <div className="flex items-center space-x-2 text-[9px] text-text-muted">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block" /> 
                <span>Air Temp (°C)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" /> 
                <span>Soil Moisture (%)</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="time" tick={{ fill: "#64748B", fontSize: 8 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 9 }} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "none", borderRadius: 8, color: "#fff", fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#16A34A" 
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#16A34A" }} 
                  name="Air Temp"
                  isAnimationActive={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="moisture" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#06B6D4" }} 
                  name="Soil Moisture"
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disease Risk Dashboard (Right - 4 columns) */}
        <div className="lg:col-span-4 bg-card border border-border p-6 rounded-xl flex flex-col justify-between">
          <div>
            <span className="font-bold text-text-main uppercase tracking-wider text-[10px] block border-b border-border/50 pb-2 mb-4">
              WEATHER-DRIVEN DISEASE RISK INDEX
            </span>
            <p className="text-[10px] text-text-muted leading-relaxed mb-4">
              Computed dynamically from leaf wetness sensors, humidity averages, and 72-hour air temperature curves.
            </p>

            <div className="space-y-4">
              {data.diseaseRisks.map((riskItem, idx) => (
                <div key={idx} className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-text-main">{riskItem.disease.split(" ")[0]} Risk</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] border font-bold ${getRiskBadgeColor(riskItem.risk)}`}>
                      {riskItem.risk.toUpperCase()} (<AnimatedCounter value={riskItem.percentage} decimals={0} />%)
                    </span>
                  </div>
                  
                  {/* Progress Risk Bar */}
                  <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        riskItem.risk === "High" ? "bg-danger" : riskItem.risk === "Moderate" ? "bg-warning" : "bg-secondary"
                      }`}
                      style={{ width: `${riskItem.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-start space-x-2 bg-background/50 border border-border/80 p-3 rounded-lg text-[9px] text-text-muted leading-tight">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>High humidity curves for Wednesday indicate accelerated Late Blight sporulation risks. Preventive fungicidal coverage is strongly advised.</span>
          </div>
        </div>
      </div>

      {/* Forecast Trend Graph (Bottom) */}
      <div className="bg-card border border-border p-6 rounded-xl">
        <span className="font-bold text-text-main uppercase tracking-wider text-[10px] block border-b border-border/50 pb-2 mb-6">
          7-DAY METEOROLOGICAL HYPOTHETICAL TREND
        </span>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.forecast} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity="0.15"/>
                  <stop offset="95%" stopColor="#16A34A" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="colorHumid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity="0.15"/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 9 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#1E293B", border: "none", borderRadius: 8, color: "#fff", fontSize: 10 }} />
              <Area type="monotone" dataKey="temp" stroke="#16A34A" fillOpacity={1} fill="url(#colorTemp)" name="Temperature" />
              <Area type="monotone" dataKey="humidity" stroke="#06B6D4" fillOpacity={1} fill="url(#colorHumid)" name="Humidity" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Micro-climate Forecast Grid */}
      <div>
        <h4 className="text-[10px] font-bold text-text-main uppercase tracking-widest mb-4">
          MICRO-CLIMATE WEATHER TARGETS
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
          {data.forecast.map((dayItem, idx) => {
            const isToday = idx === 0;
            return (
              <div 
                key={idx}
                className={`bg-card border p-3 rounded-xl flex flex-col items-center justify-between text-center transition-all ${
                  isToday ? "border-secondary bg-secondary/5 font-bold shadow-md shadow-secondary/5" : "border-border"
                }`}
              >
                <span className={`text-[10px] font-bold ${isToday ? "text-secondary" : "text-text-muted"}`}>
                  {dayItem.day.toUpperCase()} {isToday && "(TODAY)"}
                </span>

                <CloudSun className="w-6 h-6 my-2 text-warning animate-pulse" />

                <span className="text-text-main font-bold text-xs">
                  {isToday ? (
                    <AnimatedCounter value={data.temp} decimals={1} />
                  ) : (
                    dayItem.temp
                  )}°C
                </span>
                <span className="text-[9px] text-text-muted mt-1">{dayItem.condition}</span>
                <span className="text-[9px] text-accent mt-0.5 font-bold">
                  {isToday ? (
                    <AnimatedCounter value={data.rainfall} decimals={1} />
                  ) : (
                    dayItem.rainfall
                  )} mm
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
