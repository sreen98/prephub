import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X } from 'lucide-react';

const messages = {
  3: { emoji: '🔥', text: "3-day streak! You're getting started!" },
  7: { emoji: '🔥', text: "7-day streak! A whole week of learning!" },
  14: { emoji: '⚡', text: "14-day streak! Consistency is key!" },
  30: { emoji: '🏆', text: "30-day streak! A full month — amazing!" },
  60: { emoji: '💎', text: "60-day streak! You're unstoppable!" },
  100: { emoji: '👑', text: "100-day streak! Legendary dedication!" },
  365: { emoji: '🌟', text: "365-day streak! A full year! Incredible!" },
};

const particles = Array.from({ length: 12 }, (_, i) => ({
  angle: (i * 30 * Math.PI) / 180,
  delay: i * 0.05,
  distance: 80 + Math.random() * 40,
  size: 6 + Math.random() * 6,
  color: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][i % 6],
}));

export default function StreakCelebration({ milestone, onClose }) {
  const msg = messages[milestone];
  if (!msg) return null;

  return (
    <AnimatePresence>
      {milestone && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-80 max-w-[90vw]"
          >
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Particle burst */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {particles.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(p.angle) * p.distance,
                      y: Math.sin(p.angle) * p.distance,
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 1, delay: 0.2 + p.delay, ease: 'easeOut' }}
                    style={{ width: p.size, height: p.size, borderRadius: '50%', background: p.color, position: 'absolute' }}
                  />
                ))}
              </div>

              <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={16} />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="text-5xl mb-4"
              >
                {msg.emoji}
              </motion.div>

              <h2 className="text-xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {milestone}-Day Streak!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                {msg.text}
              </p>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                Keep Going!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
