"use client";

import React from "react";
import { WEATHER_DATA } from "@/lib/mock-data";
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain, 
  AlertTriangle,
  Info,
  LineChart
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

export default function WeatherPanel() {
  const data = WEATHER_DATA;

  // Forecast data mapping for Recharts
  const chartData = data.forecast.map(item => ({
    day: item.day,
    temp: item.temp,
    humidity: item.humidity,
    rainfall: item.rainfall
  }));

  const getRiskBadgeColor = (risk: "Low" | "Moderate" | "High") => {
    if (risk === "Low") return "bg-secondary/15 border-secondary/20 text-secondary";
    if (risk === "Moderate") return "bg-warning/15 border-warning/20 text-warning";
    return "bg-danger/15 border-danger/20 text-danger";
  };

  return (
    <div className="space-y-8 font-mono text-xs select-none">
      
      {/* Top Section: Grid of current conditions */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Temp */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">AIR TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">{data.temp}°C</span>
            <span className="text-[9px] text-text-muted block mt-1">OPTIMAL: 18-28°C</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">REL HUMIDITY</span>
            <Droplets className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">{data.humidity}%</span>
            <span className="text-[9px] text-text-muted block mt-1">SPORE RISK: &gt;75%</span>
          </div>
        </div>

        {/* Rainfall */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">24H RAIN</span>
            <CloudRain className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">{data.rainfall} mm</span>
            <span className="text-[9px] text-text-muted block mt-1">SOIL SATURATION</span>
          </div>
        </div>

        {/* Wind */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">WIND SPEED</span>
            <Wind className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">{data.windSpeed} km/h</span>
            <span className="text-[9px] text-text-muted block mt-1">SPORE DISPERSAL</span>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">SOIL MOISTURE</span>
            <Droplets className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">{data.soilMoisture}%</span>
            <span className="text-[9px] text-text-muted block mt-1">VOLUMETRIC H2O</span>
          </div>
        </div>

        {/* Soil Temp */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-muted">
            <span className="text-[9px] font-bold uppercase">SOIL TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-warning" />
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-text-main">{data.soilTemp}°C</span>
            <span className="text-[9px] text-text-muted block mt-1">ROOT SUSCEPTIBILITY</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Forecast and Disease Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Forecast Graph (Left) */}
        <div className="lg:col-span-8 bg-card border border-border p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-text-main uppercase tracking-wider text-[10px]">
              7-DAY METEOROLOGICAL HYPOTHETICAL TREND
            </span>
            <div className="flex items-center space-x-2 text-[9px] text-text-muted">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-secondary inline-block" /> <span>Temp (°C)</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> <span>Humidity (%)</span></span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity="0.2"/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="colorHumid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity="0.2"/>
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

        {/* Disease Risk Dashboard (Right) */}
        <div className="lg:col-span-4 bg-card border border-border p-6 rounded-xl flex flex-col justify-between">
          <div>
            <span className="font-bold text-text-main uppercase tracking-wider text-[10px] block border-b border-border/50 pb-2 mb-4">
              WEATHER-DRIVEN DISEASE RISK INDEX
            </span>
            <p className="text-[10px] text-text-muted leading-relaxed mb-4">
              Computed from combined foliar moisture sensors, humidity averages, and 72-hour air temperature curves.
            </p>

            <div className="space-y-4">
              {data.diseaseRisks.map((riskItem, idx) => (
                <div key={idx} className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-text-main">{riskItem.disease.split(" ")[0]} Risk</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] border font-bold ${getRiskBadgeColor(riskItem.risk)}`}>
                      {riskItem.risk.toUpperCase()} ({riskItem.percentage}%)
                    </span>
                  </div>
                  
                  {/* Progress Risk Bar */}
                  <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
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

      {/* Dynamic Forecast Grid */}
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

                <span className="text-text-main font-bold text-xs">{dayItem.temp}°C</span>
                <span className="text-[9px] text-text-muted mt-1">{dayItem.condition}</span>
                <span className="text-[9px] text-accent mt-0.5 font-bold">{dayItem.rainfall} mm</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
