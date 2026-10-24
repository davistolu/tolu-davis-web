import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Command, Clock, User, FolderGit2, Terminal, FileText, Send } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  darkMode: boolean;
  onOpenCommandPalette: () => void;
  onNavigate: (id: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  darkMode,
  onOpenCommandPalette,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timeString, setTimeString] = useState('');

  // Live time ticker (WAT / Lagos & Dubai UTC+1)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTimeString(new Intl.DateTimeFormat([], options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress(totalScroll > 0 ? (currentScroll / totalScroll) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Index', icon: User },
    { id: 'about', label: 'About', icon: User },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'terminal', label: 'CLI Terminal', icon: Terminal },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'contact', label: 'Contact', icon: Send },
  ];

  return (
    <>
      {/* Scroll progress hairline */}
      <div className="fixed top-0 left-0 right-0 h-[1.5px] z-[60] bg-transparent">
        <div
          className={`h-full transition-all duration-150 ${darkMode ? 'bg-white' : 'bg-black'}`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Island HUD Navbar */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 max-w-6xl mx-auto flex items-center justify-between pointer-events-none"
      >
        {/* Left: Identity Badge */}
        <div
          onClick={() => onNavigate('hero')}
          className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full border shadow-sm backdrop-blur-xl cursor-pointer transition-all ${
            darkMode
              ? 'bg-[#121215]/90 border-white/[0.08] text-white hover:border-white/20'
              : 'bg-white/90 border-black/[0.08] text-black hover:border-black/20'
          }`}
        >
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
            <img
              src="/me.jpg"
              alt="Toluwanimi"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement).innerHTML =
                  '<div class="w-full h-full flex items-center justify-center font-bold text-[10px]">TD</div>';
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xs tracking-tight">
              Toluwanimi <span className="opacity-40 font-normal">Davis</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Available for work" />
          </div>
        </div>

        {/* Center: Desktop Nav Items */}
        <nav
          className={`pointer-events-auto hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-xl ${
            darkMode
              ? 'bg-[#121215]/90 border-white/[0.08] text-zinc-400'
              : 'bg-white/90 border-black/[0.08] text-zinc-600'
          }`}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                  isActive
                    ? darkMode
                      ? 'text-white font-medium'
                      : 'text-black font-medium'
                    : darkMode
                    ? 'hover:text-white'
                    : 'hover:text-black'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className={`absolute inset-0 rounded-full ${
                      darkMode ? 'bg-white/10 border border-white/10' : 'bg-black/[0.06] border border-black/10'
                    }`}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry & Cmd+K Trigger */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Telemetry Clock */}
          <div
            className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-mono backdrop-blur-xl ${
              darkMode
                ? 'bg-[#121215]/90 border-white/[0.08] text-zinc-400'
                : 'bg-white/90 border-black/[0.08] text-zinc-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5 opacity-60" />
            <span>WAT {timeString || '18:30:00'}</span>
          </div>

          {/* Search Launcher */}
          <button
            onClick={onOpenCommandPalette}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-sm backdrop-blur-xl text-xs font-mono transition-all ${
              darkMode
                ? 'bg-[#121215]/90 border-white/[0.08] text-zinc-300 hover:border-white/20 hover:text-white'
                : 'bg-white/90 border-black/[0.08] text-zinc-700 hover:border-black/20 hover:text-black'
            }`}
          >
            <Command className="w-3.5 h-3.5 opacity-60" />
            <span className="hidden sm:inline">Search</span>
            <kbd
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                darkMode ? 'bg-white/10 text-zinc-300' : 'bg-black/[0.06] text-zinc-700'
              }`}
            >
              ⌘K
            </kbd>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-full border shadow-sm backdrop-blur-xl transition-colors ${
              darkMode
                ? 'bg-[#121215]/90 border-white/[0.08] text-white'
                : 'bg-white/90 border-black/[0.08] text-black'
            }`}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className={`fixed inset-0 z-40 md:hidden flex flex-col justify-between p-6 pt-24 backdrop-blur-2xl ${
              darkMode ? 'bg-[#09090b]/95 text-white' : 'bg-[#fafaf9]/95 text-black'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="font-mono text-xs uppercase tracking-widest opacity-40">Navigation</span>
                <span className="font-mono text-xs opacity-40">06 Sections</span>
              </div>

              <div className="space-y-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? darkMode
                            ? 'bg-white/10 text-white font-semibold'
                            : 'bg-black/[0.06] text-black font-semibold'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 font-display text-base">
                        <Icon className="w-4 h-4 opacity-50" />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-mono text-xs opacity-40">0{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs font-mono space-y-1.5 ${
              darkMode ? 'bg-[#121215] border-white/[0.08] text-zinc-400' : 'bg-white border-black/[0.08] text-zinc-600'
            }`}>
              <div className="flex items-center justify-between">
                <span>Location: Lagos · Dubai · Remote</span>
                <span className="text-emerald-500">● Available</span>
              </div>
              <div className="opacity-75">durojaiyetoluwani@gmail.com</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;