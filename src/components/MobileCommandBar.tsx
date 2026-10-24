import React, { useState } from 'react';
import { Terminal, FolderGit2, User, Send, Gamepad2, Radio, Download, Sparkles, Trash2, HelpCircle, Bot, ChevronUp, ChevronDown } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface MobileCommandBarProps {
  onExecuteCommand: (cmd: string) => void;
  activeTab: string;
}

const QUICK_ACTIONS = [
  { id: 'projects', label: 'Projects', icon: FolderGit2, cmd: 'projects' },
  { id: 'about', label: 'Bio / AMA', icon: User, cmd: 'about' },
  { id: 'pet', label: 'Pet Nexus-9', icon: Sparkles, cmd: 'pet' },
  { id: 'contact', label: 'Contact', icon: Send, cmd: 'contact' },
  { id: 'games', label: 'Snake Game', icon: Gamepad2, cmd: 'snake' },
  { id: 'npc', label: 'Cyber NPCs', icon: Bot, cmd: 'npc' },
  { id: 'radio', label: 'Spotify Radio', icon: Radio, cmd: 'radio' },
  { id: 'resume', label: 'Download CV', icon: Download, cmd: 'resume' },
  { id: 'weather', label: 'Weather Dubai', icon: Sparkles, cmd: 'weather Dubai' },
  { id: 'clear', label: 'Clear CLI', icon: Trash2, cmd: 'clear' },
  { id: 'help', label: 'All Help', icon: HelpCircle, cmd: 'help' },
];

const MobileCommandBar: React.FC<MobileCommandBarProps> = ({ onExecuteCommand, activeTab }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = (cmd: string) => {
    terminalSound.playKeyClick();
    onExecuteCommand(cmd);
    setIsExpanded(false);
  };

  return (
    <div className="md:hidden fixed bottom-[30px] left-0 right-0 z-30 px-2 select-none pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto pointer-events-auto bg-[#0c0c0e]/95 border border-[#27272a] rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden transition-all duration-200">
        {/* Main Quick Action Pill Carousel */}
        <div className="flex items-center justify-between px-2 py-1.5 gap-1.5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x py-0.5 flex-1 text-xs">
            {QUICK_ACTIONS.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.cmd)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-mono text-[11px] font-medium transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
                    isActive
                      ? 'bg-[var(--term-primary)] text-black font-bold shadow-sm'
                      : 'bg-[#18181b] border border-[#27272a] text-zinc-300 active:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Expand Drawer Button */}
          <button
            onClick={() => {
              terminalSound.playKeyClick();
              setIsExpanded((prev) => !prev);
            }}
            className="p-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white shrink-0 active:scale-95"
            title="More quick commands"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expanded Grid Drawer for All Mobile Shortcuts */}
        {isExpanded && (
          <div className="p-2.5 pt-1.5 border-t border-[#1f1f24] bg-[#09090b] grid grid-cols-2 gap-1.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
            {QUICK_ACTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.cmd)}
                  className="p-2 rounded bg-[#141418] hover:bg-[#1f1f24] border border-[#27272a] text-zinc-300 flex items-center gap-2 text-left active:scale-95 touch-manipulation cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-[var(--term-bright)] shrink-0" />
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-white leading-tight">{item.label}</div>
                    <div className="text-[9px] text-zinc-500 font-mono">${item.cmd}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCommandBar;
