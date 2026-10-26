import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderGit2, User, FileText, Send, Terminal, Sun, Moon, ArrowRight, X, ExternalLink } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onNavigate: (id: string) => void;
  onShowToast: (msg: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  darkMode,
  toggleDarkMode,
  onNavigate,
  onShowToast,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    { id: 'hero', title: 'Index / Hero Identity', category: 'Navigation', icon: User, action: () => onNavigate('hero') },
    { id: 'about', title: 'About & Career Journey', category: 'Navigation', icon: User, action: () => onNavigate('about') },
    { id: 'projects', title: 'Selected Works & Case Studies', category: 'Navigation', icon: FolderGit2, action: () => onNavigate('projects') },
    { id: 'terminal', title: 'Interactive Developer Terminal', category: 'Navigation', icon: Terminal, action: () => onNavigate('terminal') },
    { id: 'resume', title: 'Executive Resume & PDF', category: 'Navigation', icon: FileText, action: () => onNavigate('resume') },
    { id: 'contact', title: 'Direct Contact & Inquiries', category: 'Navigation', icon: Send, action: () => onNavigate('contact') },
    
    // Quick Actions
    {
      id: 'theme',
      title: darkMode ? 'Switch to Light Palette' : 'Switch to Dark Palette',
      category: 'Actions',
      icon: darkMode ? Sun : Moon,
      action: () => {
        toggleDarkMode();
        onShowToast(`Switched to ${darkMode ? 'Light' : 'Dark'} mode`);
      },
    },
    {
      id: 'download-resume',
      title: 'Download Executive Resume (PDF)',
      category: 'Actions',
      icon: FileText,
      action: () => {
        const link = document.createElement('a');
        link.href = '/Fullsatck.pdf';
        link.download = 'Toluwanimi_Davis_Resume.pdf';
        link.click();
        onShowToast('Resume downloaded');
      },
    },
    {
      id: 'copy-email',
      title: 'Copy Direct Email Address',
      category: 'Actions',
      icon: Send,
      action: () => {
        navigator.clipboard.writeText('durojaiyetoluwani@gmail.com');
        onShowToast('Email copied (durojaiyetoluwani@gmail.com)');
      },
    },
    {
      id: 'github',
      title: 'Open GitHub (@davistolu)',
      category: 'External',
      icon: ExternalLink,
      action: () => {
        window.open('https://github.com/davistolu', '_blank');
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
            darkMode
              ? 'bg-[#121215] border-white/[0.08] text-white shadow-black/80'
              : 'bg-white border-black/[0.08] text-black shadow-slate-300/40'
          } backdrop-blur-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${darkMode ? 'border-white/[0.08]' : 'border-black/[0.08]'}`}>
            <Search className="w-4 h-4 opacity-50" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections, projects, or commands..."
              className={`w-full bg-transparent border-none outline-none font-sans text-sm ${
                darkMode ? 'text-white placeholder-zinc-500' : 'text-black placeholder-zinc-400'
              }`}
            />
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-black/[0.06] text-zinc-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-72 overflow-y-auto p-2 font-sans">
            {filteredItems.length === 0 ? (
              <div className="py-10 text-center text-xs opacity-50 font-mono">No matching actions.</div>
            ) : (
              filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? darkMode
                          ? 'bg-white/10 text-white'
                          : 'bg-black/[0.06] text-black'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 opacity-60" />
                      <div>
                        <div className="text-xs font-medium">{item.title}</div>
                        <div className="text-[10px] font-mono opacity-40">{item.category}</div>
                      </div>
                    </div>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 opacity-60" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-between px-4 py-2.5 border-t text-[11px] font-mono ${
              darkMode ? 'bg-black/40 border-white/[0.08] text-zinc-400' : 'bg-zinc-50 border-black/[0.08] text-zinc-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-[9px]">↑↓</kbd> navigate</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-[9px]">↵</kbd> select</span>
              <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-[9px]">esc</kbd> close</span>
            </div>
            <span className="opacity-40">Toluwanimi OS</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
