"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Info, Droplets, TriangleAlert, FileDown, ArrowRight, Activity } from "lucide-react";

const RealTimeMap = dynamic(() => import("@/components/RealTimeMap"), { ssr: false });

export function LiveMapWidget() {
  return (
    <div className="relative w-full h-full flex-1 rounded-2xl overflow-hidden shadow-sm border border-border">
      <RealTimeMap />
      
      {/* Coordinates */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-text-main px-3 py-1.5 rounded-lg text-xs font-mono z-10 shadow-sm border border-border">
        LAT: 19.7515° N | LONG: 75.7139° E
      </div>

      {/* Live Scanning Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur px-5 py-2 rounded-full shadow-lg flex items-center space-x-2 z-10 border border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
        <span className="text-sm font-bold text-primary">Live Field Scanning...</span>
      </div>
    </div>
  );
}

export function CropHealthWidget() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-primary font-display">Crop Health Index</h3>
        <Info className="w-5 h-5 text-text-muted" />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Fake Circular Progress */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E8E0D9" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1B4332" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="45" className="drop-shadow-md" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-primary font-display">82%</span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Healthy</span>
          </div>
        </div>
        <p className="text-sm text-text-muted text-center italic font-sans max-w-[200px]">
          Overall vigor is above average for early-season corn.
        </p>
      </div>
    </div>
  );
}

export function SoilNutrientsWidget() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full">
      <h3 className="font-bold text-primary font-display mb-6">Soil & Nutrients</h3>
      
      <div className="space-y-6 flex-1 flex flex-col justify-center">
        {/* Moisture */}
        <div>
          <div className="flex justify-between text-xs font-bold text-text-muted mb-2 font-mono">
            <span>Moisture</span>
            <span>64%</span>
          </div>
          <div className="h-2.5 w-full bg-[#FAF3EE] rounded-full overflow-hidden">
            <div className="h-full bg-[#52B4FF] rounded-full" style={{ width: "64%" }}></div>
          </div>
        </div>
        
        {/* Nitrogen */}
        <div>
          <div className="flex justify-between text-xs font-bold text-text-muted mb-2 font-mono">
            <span>Nitrogen (N)</span>
            <span>42%</span>
          </div>
          <div className="h-2.5 w-full bg-[#FAF3EE] rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: "42%" }}></div>
          </div>
        </div>
        
        {/* Potassium */}
        <div>
          <div className="flex justify-between text-xs font-bold text-text-muted mb-2 font-mono">
            <span>Potassium (K)</span>
            <span>78%</span>
          </div>
          <div className="h-2.5 w-full bg-[#FAF3EE] rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "78%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIChatWidget() {
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Hello! I am AgriLens AI, your agricultural intelligence assistant. How can I help you analyze your field data today?" }
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      
      const data = await response.json();
      const assistantMessage = data.choices[0].message;
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="bg-primary rounded-2xl p-5 shadow-lg text-white flex flex-col h-[280px]">
      <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-white/10 shrink-0">
        <Activity className="w-4 h-4 text-secondary" />
        <h3 className="font-bold font-display text-base">AI Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar flex flex-col">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm font-sans ${
              msg.role === "user" 
                ? "bg-secondary text-white rounded-br-none" 
                : "bg-[#EFECE8] text-text-main rounded-bl-none"
            }`}>
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#EFECE8] text-text-main rounded-2xl rounded-bl-none p-3 flex space-x-1">
              <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crop health or irrigation..."
            className="w-full bg-[#163828] text-white placeholder-white/50 border border-white/20 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-1.5 bg-secondary text-white rounded-full hover:bg-white hover:text-primary transition-colors disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
