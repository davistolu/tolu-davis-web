import React, { useState, useEffect } from 'react';
import { Clock, GitBranch, ShieldCheck, Activity, Music, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { spotifyPlayer, SpotifyPlayerState } from '../utils/spotifyPlayer';
import { terminalSound } from '../utils/terminalSound';

interface TerminalStatusLineProps {
  activeTab: string;
  onSelectTab?: (tab: string) => void;
}

const TerminalStatusLine: React.FC<TerminalStatusLineProps> = ({ activeTab, onSelectTab }) => {
  const [timeString, setTimeString] = useState('');
  const [cpu, setCpu] = useState<number>(3.8);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>(spotifyPlayer.state);

  useEffect(() => {
    const unsub = spotifyPlayer.subscribe((state) => {
      setPlayerState(state);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTimeString(new Intl.DateTimeFormat([], options).format(d));
      setCpu(+((Math.random() * 2 + 2.5).toFixed(1)));
    };
    update();
    const int = setInterval(update, 2000);
    return () => clearInterval(int);
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    terminalSound.playKeyClick();
    spotifyPlayer.toggle();
  };

  const nextSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    terminalSound.playKeyClick();
    spotifyPlayer.next();
  };

  const prevSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    terminalSound.playKeyClick();
    spotifyPlayer.prev();
  };

  const { isPlaying, station, playingArtistName, playingTrackName } = playerState;

  const displayArtist = playingArtistName || 'Spotify Live';
  const displayTitle = playingTrackName || station.playlistTitle;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 border-t border-[#27272a] text-[11px] font-mono text-[#a1a1aa] flex items-center justify-between px-2.5 sm:px-3 py-1 pb-[calc(env(safe-area-inset-bottom,0px)+4px)] select-none backdrop-blur-md">
      {/* Left: Mode + Git + Tab */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="bg-[var(--term-primary)] text-black font-bold px-1.5 py-0.5 rounded text-[10px] shadow-sm">
          NORMAL
        </span>
        <span className="hidden sm:flex items-center gap-1 text-[#71717a]">
          <GitBranch className="w-3 h-3" /> main*
        </span>
        <span className="text-[#3f3f46]">|</span>
        <span className="text-[#e4e4e7] font-medium max-w-[70px] sm:max-w-none truncate">~/{activeTab}</span>
      </div>

      {/* Center: Live Spotify Background Player with Artist & Song */}
      <div className="flex items-center gap-1.5 sm:gap-2 max-w-[45%] sm:max-w-[50%] truncate">
        <div
          onClick={() => onSelectTab && onSelectTab('radio')}
          className={`cursor-pointer flex items-center gap-1 sm:gap-1.5 transition-colors truncate ${
            isPlaying ? 'text-[#1db954]' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Click to view Spotify Location Radio"
        >
          <Music className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'animate-bounce text-[#1db954]' : ''}`} />
          
          <div className="flex items-center gap-1 truncate text-[10px] sm:text-[11px]">
            <span className="font-semibold text-zinc-400 hidden lg:inline">NOW PLAYING:</span>
            <span className="text-white font-bold truncate">
              {displayArtist} — {displayTitle}
            </span>
            <span className="text-zinc-500 text-[10px] hidden md:inline">
              [{station.flag} {station.name}]
            </span>
          </div>

          {isPlaying && (
            <div className="hidden sm:flex items-end gap-[1.5px] h-3 ml-1 shrink-0">
              <span className="w-[2px] bg-[#1db954] h-full animate-bounce" />
              <span className="w-[2px] bg-[#22c55e] h-2/3 animate-pulse" />
              <span className="w-[2px] bg-[#38bdf8] h-4/5 animate-bounce" />
              <span className="w-[2px] bg-[#1db954] h-1/2 animate-pulse" />
            </div>
          )}
        </div>

        {/* Quick Media Controls directly in Status Bar */}
        <div className="flex items-center gap-0.5 sm:gap-1 ml-0.5 bg-[#141418] border border-[#27272a] rounded px-1 py-0.5 shrink-0">
          <button
            onClick={prevSong}
            className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors touch-manipulation cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={togglePlay}
            className={`p-0.5 rounded transition-colors touch-manipulation cursor-pointer ${isPlaying ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'}`}
            title={isPlaying ? 'Pause' : 'Play Background Stream'}
          >
            {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 fill-current" />}
          </button>
          <button
            onClick={nextSong}
            className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors touch-manipulation cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Right: Telemetry & Clock */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <span className="hidden md:inline-flex items-center gap-1 text-zinc-400 text-[10px]">
          <Activity className="w-3 h-3 text-[#38bdf8]" /> CPU {cpu}%
        </span>
        <span className="hidden sm:inline text-[#3f3f46]">|</span>
        <span className="hidden md:inline-flex items-center gap-1 text-[var(--term-bright)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--term-primary)] animate-pulse" />
          <span>PROD</span>
        </span>
        <span className="hidden sm:inline text-[#71717a]">utf-8</span>
        <span className="hidden xs:inline text-[#3f3f46]">|</span>
        <span className="text-[#d4d4d8] flex items-center gap-1 text-[10px] sm:text-[11px]">
          <Clock className="w-3 h-3 text-[#71717a] hidden xs:inline" /> {timeString || '19:05'}
        </span>
        <span className="hidden xs:inline bg-[#18181b] border border-[#27272a] text-[var(--term-bright)] px-1.5 py-0.5 rounded text-[10px]">
          0 ERR
        </span>
      </div>
    </footer>
  );
};

export default TerminalStatusLine;
