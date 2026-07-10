import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-border flex justify-between items-center text-xs font-mono text-text-muted">
      <div>
        <h2 className="font-bold text-primary text-base font-display mb-1">AgriLens AI</h2>
        <p>&copy; 2024 AgriLens AI Stewardship. All rights reserved.</p>
      </div>
      
      <div className="flex space-x-8">
        <Link href="#" className="hover:text-primary transition-colors">Sustainability Report</Link>
        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
        <Link href="#" className="hover:text-primary transition-colors">Support</Link>
      </div>
    </footer>
  );
}
