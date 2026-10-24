import React, { useState, useEffect } from 'react';
import { Music, Globe, Radio, Volume2, MapPin, Play, ExternalLink, RefreshCw, Disc3 } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';
import { REGIONAL_STATIONS, RegionStation, spotifyPlayer, SpotifyPlayerState } from '../utils/spotifyPlayer';

interface SpotifyRadioProps {
  initialCountry?: string;
}

const SpotifyRadio: React.FC<SpotifyRadioProps> = ({ initialCountry }) => {
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>(spotifyPlayer.state);
  const [selectedCode, setSelectedCode] = useState<string>(spotifyPlayer.state.stationCode);
  const [detectedLocation, setDetectedLocation] = useState<{ city: string; countryCode: string; countryName: string } | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(true);

  useEffect(() => {
    const unsub = spotifyPlayer.subscribe((state) => {
      setPlayerState(state);
      setSelectedCode(state.stationCode);
    });
    return () => unsub();
  }, []);

  // Auto detect user location on mount
  useEffect(() => {
    const detectUserCountry = async () => {
      setIsLoadingGeo(true);
      try {
        const res = await fetch('https://api.country.is/');
        const data = await res.json();
        const code = data?.country?.toUpperCase();

        if (code && REGIONAL_STATIONS[code]) {
          setSelectedCode(code);
          spotifyPlayer.setStation(code);
          setDetectedLocation({
            city: 'Detected Local Area',
            countryCode: code,
            countryName: REGIONAL_STATIONS[code].name,
          });
        } else if (code) {
          setDetectedLocation({
            city: 'Local Area',
            countryCode: code,
            countryName: `Country (${code})`,
          });
        }
      } catch {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz.includes('Lagos') || tz.includes('Africa/')) {
            setSelectedCode('NG');
            setDetectedLocation({ city: 'Lagos', countryCode: 'NG', countryName: 'Nigeria' });
          } else if (tz.includes('Dubai') || tz.includes('Asia/Dubai')) {
            setSelectedCode('AE');
            setDetectedLocation({ city: 'Dubai', countryCode: 'AE', countryName: 'UAE' });
          } else if (tz.includes('London') || tz.includes('Europe/London')) {
            setSelectedCode('GB');
            setDetectedLocation({ city: 'London', countryCode: 'GB', countryName: 'United Kingdom' });
          } else if (tz.includes('New_York') || tz.includes('America/')) {
            setSelectedCode('US');
            setDetectedLocation({ city: 'New York', countryCode: 'US', countryName: 'United States' });
          }
        } catch {}
      } finally {
        setIsLoadingGeo(false);
      }
    };

    if (initialCountry && REGIONAL_STATIONS[initialCountry.toUpperCase()]) {
      setSelectedCode(initialCountry.toUpperCase());
      spotifyPlayer.setStation(initialCountry.toUpperCase());
      setIsLoadingGeo(false);
    } else {
      detectUserCountry();
    }
  }, [initialCountry]);

  const activeStation = REGIONAL_STATIONS[selectedCode] || REGIONAL_STATIONS.GLOBAL;

  const handleSelectCountry = (code: string) => {
    setSelectedCode(code);
    spotifyPlayer.setStation(code);
    terminalSound.playKeyClick();
  };

  const displayArtist = playerState.playingArtistName || 'Spotify Live';
  const displayTitle = playerState.playingTrackName || activeStation.playlistTitle;

  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-lg overflow-hidden font-mono text-xs max-w-4xl mx-auto shadow-2xl space-y-4 p-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#27272a] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1db954]/20 text-[#1db954] flex items-center justify-center font-bold">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[#1db954] font-bold text-sm">SPOTIFY TOP CHARTS RADIO</span>
            <span className="text-zinc-500 text-[10px] ml-2">Location-Aware Global Music Stream</span>
          </div>
        </div>

        {/* Detected Location Badge */}
        <div className="flex items-center gap-1.5 text-[11px] bg-[#121216] border border-[#27272a] px-2.5 py-1 rounded">
          <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="text-zinc-400">User Region:</span>
          {isLoadingGeo ? (
            <span className="text-[#f59e0b] flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Detecting...
            </span>
          ) : (
            <span className="text-[#22c55e] font-bold">
              {detectedLocation ? `${detectedLocation.countryName} (${detectedLocation.countryCode})` : 'Worldwide'}
            </span>
          )}
        </div>
      </div>

      {/* Country / Regional Selector Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#38bdf8]" /> Select Worldwide / Regional Top 50 Station:
          </span>
          <span className="text-[10px] text-[#1db954] font-semibold">Continuous Background Audio</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {Object.values(REGIONAL_STATIONS).map((item) => {
            const isSelected = selectedCode === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleSelectCountry(item.code)}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#1db954]/20 border-[#1db954] text-[#1db954] font-bold shadow-[0_0_10px_rgba(29,185,84,0.25)]'
                    : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.name}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-ping" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Chart Banner & Metadata */}
      <div className="bg-[#0c0c0e] border border-[#1f1f24] p-3 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-base">{activeStation.flag}</span>
            <h4 className="text-sm font-bold text-white">{activeStation.playlistTitle}</h4>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30 font-bold">
              OFFICIAL SPOTIFY CHARTS
            </span>
          </div>
          <p className="text-zinc-300 text-xs font-semibold flex items-center gap-1.5">
            <Disc3 className="w-3.5 h-3.5 text-[#1db954] animate-spin" />
            <span>Now Playing:</span>
            <span className="text-[#1db954]">{displayArtist} — {displayTitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Quick Play/Pause Background Stream */}
          <button
            onClick={() => spotifyPlayer.toggle()}
            className="px-3.5 py-1.5 bg-[#1db954] hover:bg-[#16a34a] text-black font-bold rounded flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-[0_0_10px_rgba(29,185,84,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{playerState.isPlaying ? 'Pause' : 'Play / Pause'}</span>
          </button>

          <a
            href={`https://open.spotify.com/playlist/${activeStation.playlistId}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-200 hover:text-white rounded border border-[#27272a] flex items-center gap-1.5 transition-colors text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in App</span>
          </a>
        </div>
      </div>

      {/* Embedded High-Performance Spotify Iframe Player */}
      <div className="rounded-lg overflow-hidden border border-[#27272a] bg-[#000000] shadow-inner relative">
        <iframe
          key={activeStation.playlistId}
          src={`https://open.spotify.com/embed/playlist/${activeStation.playlistId}?utm_source=generator&theme=0`}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-lg"
          title={`Spotify Radio - ${activeStation.playlistTitle}`}
        />
      </div>

      {/* Terminal CLI Hint */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-[#18181b]">
        <span>💡 Stream continuous background tracks. Music stays active when you switch to any tab!</span>
        <span className="text-[#1db954] font-semibold flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5" /> Spotify Live Connected
        </span>
      </div>
    </div>
  );
};

export default SpotifyRadio;
