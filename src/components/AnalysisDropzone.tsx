import React, { useRef, useState } from "react";
import { UploadCloud, FileImage } from "lucide-react";

interface AnalysisDropzoneProps {
  onFileSelected?: (file: File) => void;
  disabled?: boolean;
}

export default function AnalysisDropzone({ onFileSelected, disabled }: AnalysisDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileSelected) {
      onFileSelected(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    // Check for local file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFileSelected) {
        onFileSelected(e.dataTransfer.files[0]);
      }
      return;
    }

    // Check for internal sample drag (URL/path text)
    const src = e.dataTransfer.getData("text/plain");
    if (src && onFileSelected) {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const filename = src.substring(src.lastIndexOf("/") + 1) || "sample.jpg";
        const file = new File([blob], filename, { type: blob.type });
        onFileSelected(file);
      } catch (err) {
        console.error("Failed to load dropped sample image:", err);
      }
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-full rounded-2xl py-6 px-4 items-center justify-center text-center border-2 border-dashed transition-all ${
        isDragOver 
          ? "bg-[#E2DDD5] border-secondary scale-[1.01]" 
          : "bg-[#EFECE8] border-[#D4CFC9]"
      }`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/png,image/webp" 
        className="hidden" 
        disabled={disabled}
      />
      
      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
        <UploadCloud className="w-6 h-6 text-white" />
      </div>
      
      <h3 className="text-xl font-bold font-display text-primary mb-2">
        Ready for Analysis
      </h3>
      
      <p className="text-text-muted text-xs max-w-xs mb-6 leading-relaxed font-sans">
        Drop your leaf/crop photo here or browse your local files. Support for JPEG, PNG, and WEBP.
      </p>
      
      <button 
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md text-sm cursor-pointer disabled:opacity-50"
      >
        <FileImage className="w-4 h-4" />
        <span>Upload Image</span>
      </button>
    </div>
  );
}
