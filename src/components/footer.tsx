"use client";

import { motion } from "framer-motion";

interface FooterProps {
  selectedLabel: string;
}

export default function Footer({ selectedLabel }: FooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3"
      style={{
        background: "linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 60%, transparent 100%)",
      }}
    >
      <div className="font-mono text-[9px] sm:text-[11px] text-[#00ff41]/70 uppercase tracking-widest font-semibold hidden sm:block">
        <span style={{ animation: "blink 1.5s step-end infinite" }}>←</span> SCROLL <span style={{ animation: "blink 1.5s step-end infinite", animationDelay: "0.75s" }}>→</span>
      </div>
      <div
        className="font-mono text-[10px] sm:text-[11px] text-[#00ff41] uppercase tracking-wider sm:tracking-widest font-bold"
        style={{ textShadow: "0 0 8px rgba(0,255,65,0.3)" }}
      >
        {selectedLabel}<span style={{ animation: "blink 1s step-end infinite", color: "#00ff41" }}>_</span>
      </div>
      <div className="flex items-center gap-3 font-mono text-[9px] sm:text-[10px] text-[#00ff41]/60 uppercase tracking-wider font-medium">
        <span className="hidden sm:inline">PAST:∞</span>
        <span className="hidden sm:inline">FUTURE:15D</span>
        <span className="hidden sm:inline">[←→] NAV</span>
        <span className="sm:hidden">← SWIPE →</span>
      </div>
    </motion.footer>
  );
}
