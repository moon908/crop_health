import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center py-5 px-10 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
      <h1 className="text-2xl font-bold text-primary font-display tracking-tight">
        <Link href="/">AgriLens</Link>
      </h1>
    </nav>
  );
}
