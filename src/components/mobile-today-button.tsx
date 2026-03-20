"use client";

interface MobileTodayButtonProps {
  onScrollToToday: () => void;
}

export default function MobileTodayButton({ onScrollToToday }: MobileTodayButtonProps) {
  return (
    <div className="sm:hidden fixed top-12 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <button
        onClick={onScrollToToday}
        className="pointer-events-auto px-4 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-wider transition-all active:scale-95"
        style={{
          color: "#00ff41",
          background: "rgba(10,10,15,0.85)",
          border: "1px solid rgba(0,255,65,0.25)",
          boxShadow: "0 0 12px rgba(0,255,65,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        TODAY
      </button>
    </div>
  );
}
