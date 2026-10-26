import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Disc3, Radio, Volume2, X, ExternalLink } from 'lucide-react';
import { REGIONAL_STATIONS, RegionStation, spotifyPlayer, SpotifyPlayerState } from '../utils/spotifyPlayer';

interface PersistentSpotifyPlayerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: any) => void;
    SpotifyIFrameAPI?: any;
  }
}

const PersistentSpotifyPlayer: React.FC<PersistentSpotifyPlayerProps> = ({ activeTab, setActiveTab }) => {
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>(spotifyPlayer.state);
  const [selectedStationCode, setSelectedStationCode] = useState<string>(spotifyPlayer.state.stationCode);
  // Default to side-docked so it doesn't block the screen
  const [isSideDocked, setIsSideDocked] = useState<boolean>(true);
  const [isMiniDockExpanded, setIsMiniDockExpanded] = useState<boolean>(true);

  const embedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = spotifyPlayer.subscribe((state) => {
      setPlayerState(state);
      setSelectedStationCode(state.stationCode);
    });
    return () => unsub();
  }, []);

  // Initialize Spotify Official Iframe Controller API on the persistent background element
  useEffect(() => {
    const scriptId = 'spotify-iframe-api-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const setupController = (IFrameAPI: any) => {
      const element = embedContainerRef.current;
      if (!element) return;

      element.innerHTML = '';
      const activePlaylistId = REGIONAL_STATIONS[selectedStationCode]?.playlistId || '37i9dQZEVXbMDoHDwVN2tF';

      const options = {
        uri: `spotify:playlist:${activePlaylistId}`,
        width: '100%',
        height: '152',
      };

      IFrameAPI.createController(element, options, (EmbedController: any) => {
        spotifyPlayer.setController(EmbedController);
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://open.spotify.com/embed-podcast/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.SpotifyIFrameAPI = IFrameAPI;
        setupController(IFrameAPI);
      };
    } else if (window.SpotifyIFrameAPI) {
      setupController(window.SpotifyIFrameAPI);
    }
  }, [selectedStationCode]);

  const activeStation = REGIONAL_STATIONS[selectedStationCode] || REGIONAL_STATIONS.GLOBAL;
  const isRadioTabActive = activeTab === 'radio';
  const displayArtist = playerState.playingArtistName || 'Spotify Radio';
  const displayTitle = playerState.playingTrackName || activeStation.playlistTitle;

  // If the user is currently on the dedicated full radio tab, hide the floating widget
  if (isRadioTabActive) {
    return (
      <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        <div ref={embedContainerRef} />
      </div>
    );
  }

  return (
    <div className="fixed z-40 bottom-24 sm:bottom-12 left-0 select-none font-mono text-xs pointer-events-auto">
      {/* ── Collapsed Side-Dock Tab (attached cleanly to the left edge) ── */}
      <AnimatePresence>
        {isSideDocked && (
          <motion.button
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={() => setIsSideDocked(false)}
            className="group flex items-center gap-1.5 sm:gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 sm:py-2 bg-[#0c0c0e]/95 hover:bg-[#141418] border-y border-r border-[#1db954]/60 hover:border-[#1db954] rounded-r-xl shadow-[0_0_20px_rgba(29,185,84,0.25)] backdrop-blur-md text-[#1db954] transition-all cursor-pointer hover:shadow-[0_0_25px_rgba(29,185,84,0.4)]"
            title="Open Spotify Radio Player (Click to expand)"
          >
            <Disc3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-[#1db954] shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="text-[9px] sm:text-[10px] font-bold text-white group-hover:text-[#1db954] transition-colors flex items-center gap-1">
                Spotify Radio
                <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse" />
              </span>
              <span className="text-[8px] text-zinc-400 max-w-[85px] sm:max-w-[110px] truncate">
                {displayTitle}
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all ml-0.5 shrink-0" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Expanded Player Card (Slides in from the left) ── */}
      <AnimatePresence>
        {!isSideDocked && (
          <motion.div
            initial={{ x: -340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -340, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="ml-2 sm:ml-4 w-[calc(100vw-1.5rem)] max-w-[325px]"
          >
            <div className="bg-[#0c0c0e]/98 border border-[#1db954]/70 rounded-xl shadow-[0_0_35px_rgba(0,0,0,0.95)] backdrop-blur-xl overflow-hidden flex flex-col font-mono text-xs">
              {/* Header Bar */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#121216] border-b border-[#222228] text-[11px]">
                <div className="flex items-center gap-2 text-[#1db954] truncate max-w-[180px]">
                  <Disc3 className="w-4 h-4 animate-spin shrink-0 text-[#1db954]" />
                  <span className="font-bold truncate text-white text-[11px]">
                    {displayArtist} — {displayTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-zinc-400 shrink-0">
                  <button
                    onClick={() => setActiveTab('radio')}
                    className="px-1.5 py-0.5 bg-[#1db954]/20 text-[#1db954] hover:bg-[#1db954] hover:text-black rounded text-[9px] font-bold transition-colors cursor-pointer"
                    title="Open Full Radio Station Tab"
                  >
                    STATION
                  </button>

                  <button
                    onClick={() => setIsMiniDockExpanded((prev) => !prev)}
                    className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#1f1f26] transition-colors cursor-pointer"
                    title={isMiniDockExpanded ? 'Compact View' : 'Expand View'}
                  >
                    {isMiniDockExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>

                  {/* Hide to side button */}
                  <button
                    onClick={() => setIsSideDocked(true)}
                    className="p-1 text-zinc-400 hover:text-[#1db954] rounded hover:bg-[#1f1f26] transition-colors cursor-pointer flex items-center gap-0.5"
                    title="Hide to side edge"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Controller Container */}
              <div
                className={`w-full transition-all duration-300 overflow-hidden bg-black ${
                  isMiniDockExpanded ? 'h-[152px]' : 'h-[80px]'
                }`}
              >
                <div ref={embedContainerRef} className="w-full h-full">
                  {/* Fallback iframe */}
                  <iframe
                    src={`https://open.spotify.com/embed/playlist/${activeStation.playlistId}?utm_source=generator&theme=0`}
                    width="100%"
                    height={isMiniDockExpanded ? '152' : '80'}
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify Live Stream"
                  />
                </div>
              </div>

              {/* Bottom Quick-Hide bar */}
              <div className="px-2.5 py-1 bg-[#09090c] border-t border-[#1a1a20] flex items-center justify-between text-[9px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1db954]" />
                  Live Stream Online
                </span>
                <button
                  onClick={() => setIsSideDocked(true)}
                  className="hover:text-zinc-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>◂ Hide to side</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersistentSpotifyPlayer;
