"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import DashboardHeader from "@/components/DashboardHeader";
import AnalysisDropzone from "@/components/AnalysisDropzone";
import SampleImages from "@/components/SampleImages";
import { 
  LiveMapWidget, 
  AIChatWidget 
} from "@/components/DashboardWidgets";
import Footer from "@/components/Footer";
import FieldAnalysis from "@/components/FieldAnalysis";
import ScientificLoading from "@/components/ScientificLoading";

export default function Home() {
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setLoadingStep(1);
    setErrorMessage(null);

    // Simulate multi-step progress in parallel with the request
    let step = 1;
    const interval = setInterval(() => {
      if (step < 6) {
        step += 1;
        setLoadingStep(step);
      }
    }, 1500);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const result = await response.json();

      // Wait a bit to ensure the loading animation finishes step 6 smoothly
      setTimeout(() => {
        clearInterval(interval);
        setAnalysisResult(result.data);
        setIsAnalyzing(false);
        setIsAnalyzed(true);
      }, Math.max(0, 9000 - (step * 1500)));

    } catch (error: any) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setErrorMessage(error.message || "An unexpected error occurred");
    }
  };

  const handleReset = () => {
    setIsAnalyzed(false);
    setAnalysisResult(null);
    setLoadingStep(1);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-10">
        {isAnalyzing ? (
          <div className="my-10">
            <ScientificLoading step={loadingStep} />
          </div>
        ) : !isAnalyzed ? (
          <>
            <DashboardHeader />
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
                <strong>Error: </strong> {errorMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 items-stretch">
              
              {/* Left Column (Upload & Samples) */}
              <div className="lg:col-span-4 flex flex-col space-y-4">
                <div>
                  <AnalysisDropzone onFileSelected={handleFileSelected} />
                </div>
                <div className="flex-1">
                  <SampleImages onSelectSample={handleFileSelected} />
                </div>
              </div>
              
              {/* Right Column (Widgets) */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                {/* Top Map Row */}
                <div className="flex-1 min-h-0 flex">
                  <LiveMapWidget />
                </div>
                
                {/* Bottom Insights Row */}
                <div className="shrink-0">
                  <AIChatWidget />
                </div>
              </div>
              
            </div>
          </>
        ) : (
          <div className="mt-8">
            {analysisResult && <FieldAnalysis result={analysisResult} onReset={handleReset} />}
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}

