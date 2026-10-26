import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TerminalNavbar from './components/TerminalNavbar';
import TerminalView from './components/TerminalView';
import TerminalStatusLine from './components/TerminalStatusLine';
import MatrixRain from './components/MatrixRain';
import WorldActivityTicker from './components/WorldActivityTicker';
import CyberPet from './components/CyberPet';
import PersistentSpotifyPlayer from './components/PersistentSpotifyPlayer';
import MobileCommandBar from './components/MobileCommandBar';
import { Terminal } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<string>('welcome');
  const [isMatrixActive, setIsMatrixActive] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);
  const [terminalTheme, setTerminalTheme] = useState<string>('green');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [externalCommand, setExternalCommand] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', terminalTheme);
  }, [terminalTheme]);

  const showToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const executeCommand = (cmd: string) => {
    setExternalCommand(cmd);
  };

  return (
    <div
      data-theme={terminalTheme}
      className="min-h-screen bg-[#050507] text-[#e4e4e7] font-mono selection:bg-[var(--term-selection)] selection:text-[var(--term-bright)] relative overflow-x-hidden pb-12 transition-colors duration-200"
    >
      {/* Matrix Digital Rain Shader */}
      <MatrixRain isActive={isMatrixActive} theme={terminalTheme} />

      {/* Subtle Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 scanlines opacity-40" />

      {/* Terminal OS Navbar & Tmux Tabs */}
      <TerminalNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMatrixActive={isMatrixActive}
        setIsMatrixActive={setIsMatrixActive}
        isSoundEnabled={isSoundEnabled}
        setIsSoundEnabled={setIsSoundEnabled}
        terminalTheme={terminalTheme}
        setTerminalTheme={setTerminalTheme}
        onExecuteCommand={executeCommand}
      />

      {/* Real-time Global Hacker Mesh & Peer Ticker */}
      <WorldActivityTicker />

      {/* Main Terminal Workspace */}
      <main className="relative z-20">
        <TerminalView
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsMatrixActive={setIsMatrixActive}
          onShowToast={showToast}
          externalCommand={externalCommand}
          onCommandHandled={() => setExternalCommand(null)}
          setTerminalTheme={setTerminalTheme}
        />
      </main>

      {/* Persistent Spotify Location Radio (Plays real music in background across all tabs) */}
      <PersistentSpotifyPlayer activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Living Cyber Pet / Tamagotchi Daemon (Walking & Intelligent) */}
      <CyberPet onShowToast={showToast} activeTab={activeTab} terminalTheme={terminalTheme} />

      {/* Mobile-First Floating Command Dock (Quick 1-tap CLI launcher on mobile) */}
      <MobileCommandBar onExecuteCommand={executeCommand} activeTab={activeTab} />

      {/* Authentic Neovim / Tmux Statusline */}
      <TerminalStatusLine activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Toast Notification Stream */}
      <div className="fixed bottom-12 left-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="px-3 py-1.5 rounded bg-[#18181b] border border-[#22c55e]/40 text-[#4ade80] text-xs font-mono shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-auto"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;