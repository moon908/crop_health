"use client";

import React, { useEffect, useRef } from "react";

export default function RealTimeMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (mapInstanceRef.current || (mapContainerRef.current as any)._leaflet_id) return;

    let isMounted = true;
    let L: any;

    const initMap = async () => {
      L = await import("leaflet");
      if (!isMounted) return;

      if (mapInstanceRef.current || (mapContainerRef.current as any)._leaflet_id) return;

      const map = L.map(mapContainerRef.current, {
        center: [19.7515, 75.7139], // Coordinates for Maharashtra, India
        zoom: 15,
        zoomControl: false,
        attributionControl: false, // Cleaner look for dashboard
      });

      mapInstanceRef.current = map;

      // Base Satellite Imagery
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
      }).addTo(map);

      // Simulated field scanning rectangles overlaying the map (adjusted for Maharashtra)
      const fields = [
        { bounds: [[19.746, 75.708], [19.751, 75.714]], color: "#2D6A4F" }, // Secondary Green
        { bounds: [[19.751, 75.708], [19.756, 75.714]], color: "#0077B6" }, // Tertiary Blue
        { bounds: [[19.746, 75.714], [19.751, 75.720]], color: "#1B4332" }, // Primary Dark Green
        { bounds: [[19.751, 75.714], [19.756, 75.720]], color: "#F59E0B" }, // Warning Amber
      ];

      fields.forEach(field => {
        L.rectangle(field.bounds, { 
          color: field.color, 
          weight: 2, 
          fillColor: field.color, 
          fillOpacity: 0.3 
        }).addTo(map);
      });
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

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
