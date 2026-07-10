import React from "react";
import { Image as ImageIcon } from "lucide-react";

const SAMPLES = [
  "/samples/1land.jpeg",
  "/samples/2land.jpeg",
  "/samples/3land.jpeg",
  "/samples/4land.jpeg",
  "/samples/5land.jpeg",
];

interface SampleImagesProps {
  onSelectSample?: (file: File) => void;
}

export default function SampleImages({ onSelectSample }: SampleImagesProps) {
  const handleSelect = async (src: string) => {
    if (!onSelectSample) return;
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const filename = src.substring(src.lastIndexOf("/") + 1) || "sample.jpg";
      const file = new File([blob], filename, { type: blob.type });
      onSelectSample(file);
    } catch (err) {
      console.error("Failed to load clicked sample image:", err);
    }
  };

  const handleDragStart = (e: React.DragEvent, src: string) => {
    e.dataTransfer.setData("text/plain", src);
  };

  return (
    <div className="bg-[#FAF3EE] rounded-2xl p-5 border border-border shadow-sm h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-3 shrink-0">
        <ImageIcon className="w-4 h-4 text-secondary" />
        <h3 className="font-bold font-display text-primary uppercase tracking-wider text-xs">Sample Imagery</h3>
      </div>
      
      <p className="text-[11px] text-text-muted mb-3 font-sans leading-tight">
        Drag a sample leaf image to the dropzone or click it to scan immediately.
      </p>
      
      <div className="grid grid-cols-3 gap-2">
        {SAMPLES.map((src, i) => (
          <div 
            key={i} 
            onClick={() => handleSelect(src)}
            onDragStart={(e) => handleDragStart(e, src)}
            draggable="true"
            className="aspect-square rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:ring-2 hover:ring-secondary transition-all active:scale-95"
          >
            <img src={src} alt={`Sample ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
