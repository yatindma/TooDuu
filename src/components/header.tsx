"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Terminal, Zap, LogIn, UserPlus, LogOut, User } from "lucide-react";

interface HeaderProps {
  version: string;
  completedToday: number;
  totalToday: number;
  time: string;
  user: { id: string; email: string; name: string | null } | null;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onScrollToToday: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function Header({
  version,
  completedToday,
  totalToday,
  time,
  user,
  onScrollLeft,
  onScrollRight,
  onScrollToToday,
  onLogout,
  onOpenLogin,
  onOpenRegister,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3"
      style={{
        background: "linear-gradient(to bottom, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 60%, transparent 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Terminal size={16} className="text-[#00ff41]" />
        <span
          className="font-mono text-xs sm:text-sm font-bold tracking-widest uppercase"
          style={{
            background: "linear-gradient(135deg, #00ff41 0%, #00cc33 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 8px rgba(0,255,65,0.3))",
          }}
        >
          TOODUU<span style={{ animation: "blink 1s step-end infinite", WebkitTextFillColor: "#00ff41" }}>_</span>
        </span>
        <span className="font-mono text-[10px] text-[#00ff41]/20 ml-1 hidden sm:inline" style={{ animation: "blink 1.2s step-end infinite" }}>v{version}</span>
      </div>

      {/* Stats bar */}
      <div className="stats-bar hidden md:flex" style={{ color: "rgba(0,255,65,0.7)" }}>
        <div className="stat-item">
          <div className={`stat-dot ${totalToday === 0 ? "amber" : completedToday === totalToday && totalToday > 0 ? "" : "amber"}`} />
          <span>{completedToday}/{totalToday} tasks</span>
        </div>
        <div className="stat-item">
          <Zap size={10} className="text-[#00ff41]" />
          <span>{time.slice(0, 5)}<span style={{ animation: "blink 1s step-end infinite" }}>{time.slice(5)}</span></span>
        </div>
      </div>

      {/* Nav + Auth */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onScrollLeft}
          className="hidden sm:block p-2 rounded-lg transition-all hover:bg-[rgba(0,255,65,0.08)] active:scale-90"
        >
          <ChevronLeft size={18} className="text-[#00ff41]/50" />
        </button>
        <button
          onClick={onScrollToToday}
          className="hidden sm:block px-3 py-1.5 rounded-lg font-mono text-[11px] tracking-wider transition-all hover:bg-[rgba(0,255,65,0.1)] active:scale-95"
          style={{
            color: "#00ff41",
            border: "1px solid rgba(0,255,65,0.2)",
            boxShadow: "0 0 12px rgba(0,255,65,0.06)",
          }}
        >
          TODAY
        </button>
        <button
          onClick={onScrollRight}
          className="hidden sm:block p-2 rounded-lg transition-all hover:bg-[rgba(0,255,65,0.08)] active:scale-90"
        >
          <ChevronRight size={18} className="text-[#00ff41]/50" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 mx-1" style={{ background: "rgba(0,255,65,0.15)" }} />

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-1.5">
            <div className="sm:hidden flex items-center px-2 py-1.5 rounded-lg" style={{ background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.2)" }}>
              <User size={14} color="#00ff41" />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(0,255,65,0.06)" }}>
              <User size={12} color="#00ff41" />
              <span className="text-[10px] font-mono font-bold text-[#00ff41] max-w-[120px] truncate">
                {user.name || user.email.split("@")[0]}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
              style={{
                color: "#ff6666",
                background: "rgba(255,68,68,0.08)",
                border: "1px solid rgba(255,68,68,0.25)",
                boxShadow: "0 0 10px rgba(255,68,68,0.06)",
              }}
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={onOpenLogin}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
              style={{
                color: "#00ff41",
                background: "rgba(0,255,65,0.12)",
                border: "1px solid rgba(0,255,65,0.3)",
                boxShadow: "0 0 12px rgba(0,255,65,0.08)",
              }}
            >
              <LogIn size={13} />
              LOGIN
            </button>
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-[rgba(0,255,65,0.08)] active:scale-95"
                style={{ color: "#00ff41" }}
              >
                <LogIn size={13} />
                LOGIN
              </button>
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                style={{
                  color: "#00ff41",
                  background: "rgba(0,255,65,0.1)",
                  border: "1px solid rgba(0,255,65,0.2)",
                }}
              >
                <UserPlus size={13} />
                SIGNUP
              </button>
            </div>
          </>
        )}
      </div>
    </motion.header>
  );
}
