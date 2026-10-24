import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <motion.button
      onClick={toggleDarkMode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle Palette"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-lg backdrop-blur-xl transition-all ${
        darkMode
          ? 'bg-[#121215]/90 border-white/[0.08] text-white hover:border-white/20'
          : 'bg-white/90 border-black/[0.08] text-black hover:border-black/20'
      }`}
    >
      <div className="relative w-3.5 h-3.5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {darkMode ? (
            <motion.div
              key="sun"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="font-mono text-xs font-semibold uppercase tracking-wider hidden sm:inline">
        {darkMode ? 'Light' : 'Dark'}
      </span>
    </motion.button>
  );
};

export default DarkModeToggle;