import React, { useState, useEffect } from 'react';
import { Globe, Radio, GitCommit, Users, Zap, Terminal } from 'lucide-react';
import { fetchActivities, ActivityData } from '../utils/api';

const SAMPLE_EVENTS: ActivityData[] = [
  { id: 1, location: 'Tokyo, JP', icon: '🇯🇵', text: 'cyber_node_81 ran `cat wirebridge.ts`', timeAgo: '2s ago' },
  { id: 2, location: 'San Francisco, US', icon: '🇺🇸', text: 'recruiter_sarah downloaded resume.pdf', timeAgo: '8s ago' },
  { id: 3, location: 'Lagos, NG', icon: '🇳🇬', text: 'tolu@mbp pushed commit to RIAUM backend', timeAgo: '14s ago' },
  { id: 4, location: 'London, UK', icon: '🇬🇧', text: 'dev_alex fetched live Open-Meteo weather', timeAgo: '21s ago' },
  { id: 5, location: 'Berlin, DE', icon: '🇩🇪', text: 'hacker_klaus reached score 120 in Snake CLI', timeAgo: '29s ago' },
  { id: 6, location: 'Toronto, CA', icon: '🇨🇦', text: 'engineer_marcus pinged CoinGecko ticker', timeAgo: '35s ago' },
  { id: 7, location: 'Sydney, AU', icon: '🇦🇺', text: 'anon_99 connected to DevFlow socket', timeAgo: '42s ago' },
];

const WorldActivityTicker: React.FC = () => {
  const [events, setEvents] = useState<ActivityData[]>(SAMPLE_EVENTS);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [onlineNodes, setOnlineNodes] = useState<number>(14);

  // Fetch live activities from backend
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        const live = await fetchActivities();
        if (isMounted && live && live.length > 0) {
          setEvents(live);
        }
      } catch (err) {
        // Silently use defaults
      }
    };
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cycle through events
  useEffect(() => {
    if (events.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % events.length);
      // Slight fluctuation in online users
      if (Math.random() > 0.6) {
        setOnlineNodes((prev) => Math.max(9, Math.min(24, prev + (Math.random() > 0.5 ? 1 : -1))));
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [events.length]);

  const event = events[currentIdx] || SAMPLE_EVENTS[0];

  return (
    <div className="w-full bg-[#08080a] border-y border-[#18181b] px-3 py-1 font-mono text-[11px] text-zinc-400 flex items-center justify-between overflow-hidden select-none">
      {/* Left: Global Node Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1 text-[#22c55e] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
          <Radio className="w-3 h-3 text-[#22c55e]" />
          <span className="hidden xs:inline">GLOBAL MESH:</span>
        </span>
        <span className="text-zinc-300 font-bold bg-[#141418] px-1.5 py-0.2 rounded border border-[#27272a] text-[10px]">
          {onlineNodes} PEERS ONLINE
        </span>
      </div>

      {/* Center: Live Rotating Activity Event */}
      <div className="flex-1 mx-3 truncate text-center sm:text-left">
        <span className="text-zinc-500 mr-1.5 hidden sm:inline">[{event.timeAgo}]</span>
        <span className="text-[#38bdf8] mr-1 font-medium">{event.icon} {event.location}:</span>
        <span className="text-zinc-300">{event.text}</span>
      </div>

      {/* Right: Telemetry Tag */}
      <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-500 shrink-0">
        <span className="text-[#a855f7]">P2P MESH</span>
        <span>LATENCY: <strong className="text-[#22c55e]">28ms</strong></span>
      </div>
    </div>
  );
};

export default WorldActivityTicker;
