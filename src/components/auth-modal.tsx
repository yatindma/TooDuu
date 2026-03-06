"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Sync mode when initialMode prop changes (user clicks LOGIN vs SIGNUP)
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError("");
      setShowPassword(false);
    }
  }, [initialMode, isOpen]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result;
    if (mode === "login") {
      result = await login(email, password);
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      result = await register(email, password, name);
    }

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setEmail("");
      setPassword("");
      setName("");
      onClose();
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-[400px]"
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "#0a0c0f",
                border: "1px solid rgba(0,255,65,0.2)",
                boxShadow: "0 0 40px rgba(0,255,65,0.08), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Top glow */}
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-[200%] h-20 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse, rgba(0,255,65,0.1) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:bg-[rgba(255,68,68,0.15)] hover:shadow-[0_0_12px_rgba(255,68,68,0.2)] z-10"
                style={{ border: "1px solid rgba(255,68,68,0.2)" }}
              >
                <X size={16} color="#ff6666" />
              </button>

              <form onSubmit={handleSubmit} className="relative p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  {mode === "login" ? (
                    <LogIn size={20} color="#00ff41" />
                  ) : (
                    <UserPlus size={20} color="#00ff41" />
                  )}
                  <h2
                    className="text-lg font-mono font-bold uppercase tracking-widest"
                    style={{ color: "#00ff41" }}
                  >
                    {mode === "login" ? "LOGIN" : "REGISTER"}<span style={{ animation: "blink 1s step-end infinite" }}>_</span>
                  </h2>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="mb-4 px-3 py-2 rounded-lg text-[12px] font-mono font-medium"
                    style={{
                      background: "rgba(255,51,51,0.1)",
                      border: "1px solid rgba(255,51,51,0.3)",
                      color: "#ff6666",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Name (register only) */}
                {mode === "register" && (
                  <div className="mb-4">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5" style={{ color: "#6abf7b" }}>
                      NAME
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.15)" }}>
                      <User size={14} color="#5aaa70" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="flex-1 bg-transparent text-[13px] font-mono font-medium outline-none"
                        style={{ color: "#e8ffe8", caretColor: "#00ff41" }}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5" style={{ color: "#6abf7b" }}>
                    EMAIL
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.15)" }}>
                    <Mail size={14} color="#5aaa70" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                      className="flex-1 bg-transparent text-[13px] font-mono font-medium outline-none"
                      style={{ color: "#e8ffe8", caretColor: "#00ff41" }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-6">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5" style={{ color: "#6abf7b" }}>
                    PASSWORD
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.15)" }}>
                    <Lock size={14} color="#5aaa70" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="flex-1 bg-transparent text-[13px] font-mono font-medium outline-none"
                      style={{ color: "#e8ffe8", caretColor: "#00ff41" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-0.5 rounded transition-colors hover:bg-[rgba(0,255,65,0.1)]"
                    >
                      {showPassword ? <EyeOff size={14} color="#5aaa70" /> : <Eye size={14} color="#5aaa70" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-mono text-[13px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,255,65,0.2) 0%, rgba(0,255,65,0.08) 100%)",
                    color: "#00ff41",
                    border: "1px solid rgba(0,255,65,0.3)",
                    boxShadow: "0 0 20px rgba(0,255,65,0.08)",
                  }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : mode === "login" ? (
                    "LOGIN"
                  ) : (
                    "CREATE ACCOUNT"
                  )}
                </button>

                {/* Switch mode */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-[11px] font-mono font-medium transition-colors hover:underline"
                    style={{ color: "#6abf7b" }}
                  >
                    {mode === "login"
                      ? "Don't have an account? Register"
                      : "Already have an account? Login"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
