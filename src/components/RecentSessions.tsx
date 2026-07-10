import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function RecentSessions() {
  return (
    <div className="bg-[#FAF3EE] rounded-2xl p-6 w-full border border-border">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xs font-bold tracking-widest text-text-muted uppercase font-mono">
          Recent Sessions
        </h4>
        <button className="text-xs font-semibold text-text-muted hover:text-primary transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {/* Session Item */}
        <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-border overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1592982537447-6f2955f1f0a1?auto=format&fit=crop&q=80&w=100&h=100" 
                alt="Thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-primary font-sans">
                North_Section_B.tiff
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Analyzed 2h ago
              </p>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-secondary" />
        </div>
      </div>
    </div>
  );
}
