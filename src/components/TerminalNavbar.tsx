import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, FolderGit2, Cpu, FileText, Download, Send, Zap, Volume2, VolumeX, Gamepad2, Globe, Radio, Bot, Activity, Music, User, Menu, X, ChevronRight, ShieldCheck } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';
import { spotifyPlayer, SpotifyPlayerState } from '../utils/spotifyPlayer';

interface TerminalNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMatrixActive: boolean;
  setIsMatrixActive: React.Dispatch<React.SetStateAction<boolean>>;
  isSoundEnabled: boolean;
  setIsSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  terminalTheme: string;
  setTerminalTheme: (theme: string) => void;
  onExecuteCommand: (cmd: string) => void;
}

const TerminalNavbar: React.FC<TerminalNavbarProps> = ({
  activeTab,
  setActiveTab,
  isMatrixActive,
  setIsMatrixActive,
  isSoundEnabled,
  setIsSoundEnabled,
  terminalTheme,
  setTerminalTheme,
  onExecuteCommand,
}) => {
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>(spotifyPlayer.state);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = spotifyPlayer.subscribe((state) => {
      setPlayerState(state);
    });
    return () => unsub();
  }, []);

  const { isPlaying, station } = playerState;

  const tabs = [
    { id: 'welcome', label: '1:welcome.sh', desc: 'Neofetch & Overview', icon: Terminal },
    { id: 'about', label: '2:about.sh', desc: 'Career, Bio & Recruiter AMA', icon: User },
    { id: 'projects', label: '3:projects/', desc: 'Live Case Studies (7)', icon: FolderGit2 },
    { id: 'games', label: '4:games/', desc: 'Snake & Speed Typing', icon: Gamepad2 },
    { id: 'npc', label: '5:npc-hub', desc: 'Interactive Cyber Daemons', icon: Bot },
    { id: 'htop', label: '6:htop.sh', desc: 'Process & CPU Monitor', icon: Activity },
    { id: 'radio', label: '7:spotify.fm', desc: 'Global Spotify Location Radio', icon: Radio },
    { id: 'apis', label: '8:live-apis', desc: 'Live Weather, Crypto & Quotes', icon: Globe },
    { id: 'skills', label: '9:skills.json', desc: 'MERN, 3D & AI Tech Stack', icon: Cpu },
    { id: 'experience', label: '10:experience.log', desc: 'eJaby, ByTeom & GDG Logs', icon: FileText },
    { id: 'resume', label: '11:resume.pdf', desc: 'Download Official CV', icon: Download },
    { id: 'contact', label: '12:contact.sh', desc: 'Instant SMTP Message Wizard', icon: Send },
    { id: 'dashboard', label: '13:admin.sh', desc: 'Owner DB Management Console', icon: ShieldCheck },
  ];

  const themes = [
    { id: 'green', label: 'Phosphor Green', color: '#22c55e' },
    { id: 'amber', label: 'Amber CRT', color: '#f59e0b' },
    { id: 'cyan', label: 'Cyberpunk Cyan', color: '#06b6d4' },
    { id: 'dracula', label: 'Dracula Purple', color: '#a855f7' },
    { id: 'white', label: 'Mono Silver', color: '#f4f4f5' },
    { id: 'red', label: 'Cyber Red', color: '#ef4444' },
  ];

  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      terminalSound.enabled = next;
      if (next) terminalSound.playSuccess();
      return next;
    });
  };

  const toggleRadio = () => {
    terminalSound.playKeyClick();
    spotifyPlayer.toggle();
  };

  const nextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    terminalSound.playKeyClick();
    spotifyPlayer.next();
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    terminalSound.playKeyClick();
    setIsMobileMenuOpen(false);
    if (tabId === 'resume') {
      onExecuteCommand('resume');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/95 border-b border-[#27272a] backdrop-blur-md select-none">
      {/* OS Window Top Bar */}
      <div className="flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#0c0c0e] border-b border-[#18181b] text-xs font-mono">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 mr-0.5 sm:mr-1 shrink-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ef4444] border border-[#dc2626]/50 inline-block" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#f59e0b] border border-[#d97706]/50 inline-block" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#22c55e] border border-[#16a34a]/50 inline-block" />
          </div>
          <span className="text-[#a1a1aa] flex items-center gap-1 font-medium truncate text-[11px] sm:text-xs">
            <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--term-primary)] shrink-0" />
            <span className="hidden md:inline">tolu@mbp: ~/portfolio — zsh (tmux: ultra)</span>
            <span className="md:hidden truncate">tolu@mbp:~</span>
          </span>
        </div>

        {/* Action Toggles: Mobile Menu, Radio, SFX, Matrix, Theme */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Tab Drawer Trigger Button */}
          <button
            onClick={() => {
              terminalSound.playKeyClick();
              setIsMobileMenuOpen((prev) => !prev);
            }}
            className="sm:hidden flex items-center gap-1 px-2 py-1 bg-[var(--term-bg-subtle)] text-[var(--term-bright)] border border-[var(--term-border)] rounded text-[10px] font-bold"
            title="Open Mobile Tabs Menu"
          >
            {isMobileMenuOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
            <span>Tabs</span>
          </button>

          {/* Spotify Location Radio Background Stream (Hidden on mobile top bar to prevent clutter) */}
          <div className="hidden sm:flex items-center bg-[#141418] border border-[#27272a] rounded px-1.5 py-0.5 text-[10px]">
            <button
              onClick={toggleRadio}
              className={`flex items-center gap-1 transition-colors ${
                isPlaying ? 'text-[#1db954] font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title={isPlaying ? `Now Playing: ${playerState.playingArtistName} — ${playerState.playingTrackName}` : 'Toggle Spotify Location Radio Background Stream'}
            >
              <Music className={`w-3 h-3 ${isPlaying ? 'animate-bounce text-[#1db954]' : ''}`} />
              <span className="hidden md:inline truncate max-w-[120px]">
                {isPlaying ? `${playerState.playingTrackName}` : 'Spotify: OFF'}
              </span>
              <span className="md:hidden">{isPlaying ? 'ON' : 'Radio'}</span>
              {isPlaying && (
                <div className="flex items-end gap-[1px] h-2.5">
                  <span className="w-[2px] bg-[#1db954] h-full animate-bounce" />
                  <span className="w-[2px] bg-[#22c55e] h-2/3 animate-pulse" />
                  <span className="w-[2px] bg-[#38bdf8] h-full animate-bounce" />
                </div>
              )}
            </button>
            {isPlaying && (
              <button
                onClick={nextTrack}
                className="ml-1 pl-1 border-l border-zinc-700 text-zinc-400 hover:text-white text-[9px]"
                title="Next Spotify Top Track"
              >
                ⏭️
              </button>
            )}
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`px-1.5 sm:px-2 py-0.5 rounded border text-[10px] sm:text-[11px] font-mono transition-colors flex items-center gap-1 ${
              isSoundEnabled
                ? 'bg-[var(--term-bg-subtle)] text-[var(--term-bright)] border-[var(--term-border)] font-bold'
                : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-[#e4e4e7]'
            }`}
            title="Toggle Web Audio Mechanical Clicks & 8-bit Sounds"
          >
            {isSoundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span className="hidden lg:inline">SFX: {isSoundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Matrix Rain Toggle */}
          <button
            onClick={() => setIsMatrixActive((prev) => !prev)}
            className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono transition-colors ${
              isMatrixActive
                ? 'bg-[var(--term-bg-subtle)] text-[var(--term-bright)] border-[var(--term-border)] font-bold'
                : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-[#e4e4e7]'
            }`}
            title="Toggle Matrix Digital Rain"
          >
            <Zap className="w-3 h-3" />
            <span>Matrix: {isMatrixActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Owner Dashboard Root Trigger */}
          <button
            onClick={() => {
              terminalSound.playKeyClick();
              handleSelectTab('dashboard');
            }}
            className={`px-2 py-0.5 rounded border text-[10px] sm:text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[var(--term-primary)] text-black font-bold border-[var(--term-primary)] shadow-sm'
                : 'bg-[#18181b] text-zinc-300 border-[#27272a] hover:text-[#38bdf8] hover:border-[#38bdf8]/50'
            }`}
            title="Owner Console & Portfolio Management"
          >
            <ShieldCheck className="w-3 h-3 text-[var(--term-primary)]" />
            <span className="hidden xs:inline">Admin</span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] rounded px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-[11px] font-mono max-w-[110px] sm:max-w-none">
            <span
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full inline-block shrink-0 shadow-sm"
              style={{ backgroundColor: `var(--term-primary)` }}
            />
            <select
              value={terminalTheme}
              onChange={(e) => {
                terminalSound.playKeyClick();
                setTerminalTheme(e.target.value);
              }}
              className="bg-transparent text-[var(--term-bright)] font-bold outline-none cursor-pointer text-[10px] sm:text-[11px] truncate"
              title="CRT Terminal Phosphor Theme"
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#121215] text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal Tmux Tabs (with touch-pan-x for smooth mobile swiping) */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#09090b] overflow-x-auto text-xs font-mono scrollbar-none touch-pan-x -webkit-overflow-scrolling-touch">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                isActive
                  ? 'bg-[var(--term-bg-subtle)] text-[var(--term-bright)] border-b-2 border-[var(--term-primary)] font-bold shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                  : 'text-[#71717a] hover:text-[#d4d4d8] hover:bg-[#121215]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Tabs Modal / Drawer Sheet (Rendered via Portal to break out of header stacking context) */}
      {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="sm:hidden fixed inset-0 z-[99999] bg-[#060608]/98 backdrop-blur-2xl flex flex-col font-mono text-xs select-none animate-in fade-in duration-150">
          {/* Top Bar inside Drawer */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#27272a] bg-[#0c0c0e] shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--term-primary)]" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Buffer / Tab Navigator (12 Modules)
              </span>
            </div>
            <button
              onClick={() => {
                terminalSound.playKeyClick();
                setIsMobileMenuOpen(false);
              }}
              className="p-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white active:scale-95 cursor-pointer"
              title="Close Tab Navigator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Tabs List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24 touch-pan-y">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition-all border text-left cursor-pointer touch-manipulation active:scale-98 ${
                    isActive
                      ? 'bg-[var(--term-bg-subtle)] border-[var(--term-primary)] text-[var(--term-bright)] font-bold shadow-[0_0_15px_var(--term-glow)]'
                      : 'bg-[#101014] border-[#222228] text-zinc-300 active:bg-[#18181f]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isActive ? 'bg-[var(--term-primary)] text-black' : 'bg-[#18181b] border border-[#27272a] text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span>{tab.label}</span>
                        {isActive && (
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-[var(--term-primary)] text-black font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans truncate">{tab.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--term-bright)]' : 'text-zinc-600'}`} />
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default TerminalNavbar;
