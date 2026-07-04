"use client";

import React, { useEffect, useRef, useState } from "react";
import { SATELLITE_MARKERS, SatelliteMarker } from "@/lib/mock-data";
import { Activity, RefreshCw, Compass } from "lucide-react";

export default function LeafletMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeLayer, setActiveLayer] = useState<"satellite" | "ndvi" | "terrain">("satellite");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<SatelliteMarker | null>(null);

  // We load Leaflet dynamically on the client to prevent SSR errors
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (mapInstanceRef.current || (mapContainerRef.current as any)._leaflet_id) return;

    let isMounted = true;
    let L: any;

    const initMap = async () => {
      // Import Leaflet dynamically
      L = await import("leaflet");

      if (!isMounted) return;

      // Fix default marker icon issues in Leaflet inside Webpack/Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Initialize Map (double check again right before creation to prevent race condition)
      if (mapInstanceRef.current || (mapContainerRef.current as any)._leaflet_id) return;

      const map = L.map(mapContainerRef.current, {
        center: [42.370, -83.350],
        zoom: 14,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Draw Field Boundary Polygons
      const fieldABoundary = [
        [42.378, -83.345],
        [42.372, -83.335],
        [42.371, -83.344],
        [42.375, -83.348],
      ];
      L.polygon(fieldABoundary, {
        color: "#DC2626", // Danger Red for Soybean Rust
        fillColor: "#DC2626",
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map).bindPopup("<b>Field A-04 (Soybean)</b><br/>Disease Threat: Asian Soybean Rust<br/>Severity: 65%<br/>NDVI Avg: 0.38");

      const fieldBBoundary = [
        [42.371, -83.358],
        [42.365, -83.350],
        [42.366, -83.357],
        [42.369, -83.361],
      ];
      L.polygon(fieldBBoundary, {
        color: "#F59E0B", // Warning Amber for Corn Spot
        fillColor: "#F59E0B",
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map).bindPopup("<b>Field B-12 (Corn)</b><br/>Disease Threat: Cercospora Leaf Spot<br/>Severity: 38.5%<br/>NDVI Avg: 0.52");

      const fieldCBoundary = [
        [42.364, -83.368],
        [42.359, -83.361],
        [42.362, -83.370],
      ];
      L.polygon(fieldCBoundary, {
        color: "#16A34A", // Healthy Green
        fillColor: "#16A34A",
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map).bindPopup("<b>Field C-04 (Wheat)</b><br/>Status: Optimal (Healthy)<br/>NDVI Avg: 0.78");

      // Set Tile Layers
      setTileLayer(map, "satellite", L);

      // Plot Satellite Markers (Hotspots / Telemetry points)
      SATELLITE_MARKERS.forEach((marker) => {
        let markerColor = "#16A34A";
        if (marker.type === "Hotspot") markerColor = "#DC2626";
        else if (marker.type === "Water Stress") markerColor = "#06B6D4";
        else if (marker.type === "Nutrient Deficient") markerColor = "#F59E0B";

        // Create Custom Icon using DivIcon to match light/dark scientific styling
        const customIcon = L.divIcon({
          className: "custom-leaflet-icon",
          html: `<div style="
            width: 14px; 
            height: 14px; 
            border-radius: 50%; 
            background-color: ${markerColor}; 
            border: 2px solid white; 
            box-shadow: 0 0 8px ${markerColor};
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const mapMarker = L.marker(marker.gps, { icon: customIcon }).addTo(map);
        
        mapMarker.on("click", () => {
          setSelectedMarker(marker);
        });

        // Tooltip
        mapMarker.bindTooltip(
          `<b>${marker.crop}</b>: NDVI ${marker.ndvi} (${marker.type})`, 
          { direction: "top", offset: [0, -7] }
        );
      });

      setMapLoaded(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base tile layers dynamically
  const setTileLayer = (map: any, type: "satellite" | "ndvi" | "terrain", LInstance?: any) => {
    const L = LInstance || (window as any).L;
    if (!L || !map) return;

    // Remove existing layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let url = "";
    let options = {};

    if (type === "satellite") {
      // ESRI World Imagery
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      options = {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      };
    } else if (type === "ndvi") {
      // NDVI Simulator (using CARTO Dark Matter or Positron tiles filtered with CSS)
      const isDarkMode = document.documentElement.classList.contains("dark") ||
                         document.querySelector(".dark") !== null;
      url = isDarkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{y}/{x}{r}.png";
      options = {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
      };
    } else {
      // Standard USGS OpenTopoMap
      url = "https://{s}.tile.opentopomap.org/{z}/{y}/{x}.png";
      options = {
        attribution: "Map data: &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, <a href='http://viewfinderpanoramas.org'>SRTM</a> | Map style: &copy; <a href='https://opentopomap.org'>OpenTopoMap</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>)",
      };
    }

    L.tileLayer(url, options).addTo(map);
  };

  const handleLayerChange = (layer: "satellite" | "ndvi" | "terrain") => {
    setActiveLayer(layer);
    if (mapInstanceRef.current) {
      setTileLayer(mapInstanceRef.current, layer);
    }
  };

  const getHotspotColor = (type: string) => {
    if (type === "Healthy") return "bg-secondary";
    if (type === "Water Stress") return "bg-accent";
    if (type === "Nutrient Deficient") return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden select-none font-mono text-xs flex flex-col h-[680px]">
      {/* Map Control Headers */}
      <div className="p-4 border-b border-border bg-card flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-secondary animate-spin-slow" />
          <span className="font-bold text-text-main">SATELLITE SCANNER & FIELD MAPPING MATRIX</span>
        </div>

        {/* Tile Layers toggler */}
        <div className="flex space-x-1.5 bg-background border border-border p-1 rounded-lg">
          <button
            onClick={() => handleLayerChange("satellite")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
              activeLayer === "satellite" ? "bg-primary text-white" : "text-text-muted hover:text-text-main"
            }`}
          >
            RGB SATELLITE
          </button>
          <button
            onClick={() => handleLayerChange("ndvi")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
              activeLayer === "ndvi" ? "bg-primary text-white" : "text-text-muted hover:text-text-main"
            }`}
          >
            NDVI ANALYTIC
          </button>
          <button
            onClick={() => handleLayerChange("terrain")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
              activeLayer === "terrain" ? "bg-primary text-white" : "text-text-muted hover:text-text-main"
            }`}
          >
            TERRAIN GRAPH
          </button>
        </div>
      </div>

      {/* Main Map Frame */}
      <div className="flex-1 relative flex flex-col md:flex-row">
        
        {/* Left Hand Leaflet Map Div */}
        <div className="flex-1 h-full min-h-[300px]">
          <div ref={mapContainerRef} className="w-full h-full relative" />
          {!mapLoaded && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center space-x-2 z-10">
              <RefreshCw className="w-4 h-4 text-secondary animate-spin" />
              <span className="text-[10px] font-bold text-text-muted">INITIALIZING GPS MAP MATRICES...</span>
            </div>
          )}
        </div>

        {/* Right Info telemetry details */}
        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-border bg-card p-4 space-y-4 overflow-y-auto h-full shrink-0">
          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-widest border-b border-border/50 pb-2">
            TELEMETRY MATRIX
          </span>

          {selectedMarker ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-text-main uppercase">{selectedMarker.id}</span>
                <span className={`px-2 py-0.5 text-[9px] rounded font-bold text-white ${getHotspotColor(selectedMarker.type)}`}>
                  {selectedMarker.type.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1.5 bg-background border border-border/50 p-2.5 rounded-lg text-[10px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Crop Variety:</span>
                  <span className="text-text-main font-bold">{selectedMarker.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Plot Size:</span>
                  <span className="text-text-main font-bold">{selectedMarker.size} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">NDVI Level:</span>
                  <span className="text-text-main font-bold text-accent">{selectedMarker.ndvi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Coordinates:</span>
                  <span className="text-text-main font-bold">{selectedMarker.gps[0].toFixed(3)}°, {selectedMarker.gps[1].toFixed(3)}°</span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Click other map coordinate points to pull dynamic spectral index reports.
              </p>
            </div>
          ) : (
            <div className="text-center py-10 text-text-muted space-y-2">
              <Compass className="w-8 h-8 mx-auto text-border animate-pulse" />
              <p className="text-[10px]">Select any active hotspot node on the map to query telemetry data.</p>
            </div>
          )}

          {/* Quick Legend */}
          <div className="border-t border-border/50 pt-4 space-y-2">
            <span className="text-[9px] text-text-muted font-bold block uppercase">HOTSPOT LEGEND</span>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" />
                <span className="text-text-main">Foliar Pathology</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                <span className="text-text-main">Irrigation/Water Deficit</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
                <span className="text-text-main">Nutrient Depletion</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" />
                <span className="text-text-main">Optimal Health (Healthy)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
