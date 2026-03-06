"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Trash2, Loader2 } from "lucide-react";

interface MigrateModalProps {
  isOpen: boolean;
  onMigrate: () => Promise<void>;
  onSkip: () => void;
  localCount: number;
}

export default function MigrateModal({ isOpen, onMigrate, onSkip, localCount }: MigrateModalProps) {
  const [loading, setLoading] = useState(false);

  const handleMigrate = async () => {
    setLoading(true);
    await onMigrate();
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-[420px]"
          >
            <div
              className="relative rounded-2xl overflow-hidden p-6"
              style={{
                background: "#0a0c0f",
                border: "1px solid rgba(0,255,65,0.2)",
                boxShadow: "0 0 40px rgba(0,255,65,0.08), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <ArrowRightLeft size={20} color="#00ff41" />
                <h2 className="text-base font-mono font-bold uppercase tracking-widest" style={{ color: "#00ff41" }}>
                  MIGRATE DATA?
                </h2>
              </div>

              <p className="text-[13px] font-mono font-medium leading-relaxed mb-6" style={{ color: "#a0ddb0" }}>
                You have <span style={{ color: "#00ff41", fontWeight: 700 }}>{localCount}</span> tasks saved locally in your browser.
                Would you like to move them to your account so they sync everywhere?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleMigrate}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[12px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,255,65,0.2) 0%, rgba(0,255,65,0.08) 100%)",
                    color: "#00ff41",
                    border: "1px solid rgba(0,255,65,0.3)",
                  }}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                  MOVE ALL
                </button>

                <button
                  onClick={onSkip}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[12px] font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    color: "#6abf7b",
                    border: "1px solid rgba(0,255,65,0.1)",
                  }}
                >
                  <Trash2 size={14} />
                  START FRESH
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
