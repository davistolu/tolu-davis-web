import { useState, useRef, useEffect } from 'react';
import { Github, Play, Download, Send, Sparkles, CloudSun, Coins, Gamepad2, CornerDownLeft, Bot, Activity, Users, User, ShieldCheck } from 'lucide-react';
import emailjs from '@emailjs/browser';
import SnakeGame from './SnakeGame';
import TypingTest from './TypingTest';
import NpcHub from './NpcHub';
import ProcessMonitor from './ProcessMonitor';
import SpotifyRadio from './SpotifyRadio';
import AboutTolu from './AboutTolu';
import OwnerDashboard from './OwnerDashboard';
import {
  fetchProjects,
  fetchProfile,
  fetchSkills,
  fetchExperiences,
  sendContactMessage,
  ProfileData,
  ProjectData,
  SkillCategoryData,
  ExperienceData
} from '../utils/api';
import { terminalSound } from '../utils/terminalSound';

interface TerminalViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsMatrixActive: React.Dispatch<React.SetStateAction<boolean>>;
  onShowToast: (msg: string) => void;
  externalCommand: string | null;
  onCommandHandled: () => void;
  setTerminalTheme: (theme: string) => void;
}

interface CommandOutput {
  command: string;
  output: React.ReactNode;
  time: string;
}

interface ProjectItem {
  id: number;
  title: string;
  category: string;
  badge: string;
  description: string;
  longDescription: string;
  tags: string[];
  metrics: string;
  github: string;
  live: string;
  status: string;
  year: string;
}

const TerminalView: React.FC<TerminalViewProps> = ({
  activeTab,
  setActiveTab,
  setIsMatrixActive,
  onShowToast,
  externalCommand,
  onCommandHandled,
  setTerminalTheme,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistoryList, setCommandHistoryList] = useState<string[]>([]);
  
  // Live API States
  const [weatherData, setWeatherData] = useState<{ city: string; text: string } | null>(null);
  const [cryptoData, setCryptoData] = useState<any | null>(null);
  const [githubStats, setGithubStats] = useState<any | null>(null);
  const [quoteData, setQuoteData] = useState<string | null>(null);

  // Easter Egg Simulation States
  const [isHackingActive, setIsHackingActive] = useState<boolean>(false);
  const [hackingLogs, setHackingLogs] = useState<string[]>([]);
  const [isTrainActive, setIsTrainActive] = useState<boolean>(false);
  const [isSelfDestruct, setIsSelfDestruct] = useState<boolean>(false);
  const [selfDestructCountdown, setSelfDestructCountdown] = useState<number>(5);
  const [selectedRadioCountry, setSelectedRadioCountry] = useState<string>('GLOBAL');

  // Contact Wizard State
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live Backend Database States
  const [projects, setProjects] = useState<ProjectData[]>([
    {
      id: 1,
      title: 'RIAUM — AI Mental Wellness Platform',
      category: 'ai',
      badge: 'PROD LIVE',
      description: 'Full-stack mental wellness ecosystem with real-time mood tracking, AI mindfulness generation, and Recharts telemetry.',
      longDescription: 'MERN stack + TypeScript production platform with sub-2s initial load time, JWT/RBAC security, and LLM API personalized wellness generator.',
      tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Recharts', 'Gemini Pro / LLM', 'JWT'],
      metrics: 'Sub-2s page load · 100% Type-safe · Real-time charts',
      github: 'https://github.com/davistolu/Riaum-backend',
      live: 'https://r-iaum.vercel.app/',
      status: 'live',
      year: '2026',
    },
    {
      id: 2,
      title: 'WireBridge — Polyglot Runtime API Engine',
      category: 'devtools',
      badge: 'PROD FRAMEWORK',
      description: 'Runtime framework that automatically connects frontends to backends across Python, TypeScript, Go, Ruby, and Laravel.',
      longDescription: 'Production-grade runtime wiring layer that resolves frontend intents to backend capabilities with convention scoring and Claude fallback.',
      tags: ['TypeScript', 'Node.js', 'Python', 'Go', 'Ruby', 'PHP', 'React', 'SSE', 'AES-256'],
      metrics: 'Zero manual endpoints · SQLite/PostgreSQL store · SSE stream',
      github: 'https://github.com/davistolu/autobridge',
      live: 'https://github.com/davistolu/autobridge',
      status: 'live',
      year: '2026',
    },
    {
      id: 3,
      title: 'Twin Turbine 3D Simulator',
      category: '3d',
      badge: '3D WEBGL SIM',
      description: 'Real-time 3D digital twin of a dual wind turbine production plant with physics simulation and telemetry panels.',
      longDescription: 'High-fidelity React Three Fiber simulation modeling turbine physics, RPM, torque, and fault injection anomaly scenarios in real time.',
      tags: ['React Three Fiber', 'Three.js', 'TypeScript', 'Recharts', 'Physics Sim', 'WebGL'],
      metrics: '60 FPS WebGL · Real-time physics · Telemetry dashboard',
      github: 'https://github.com/davistolu/twin-turbine-sim',
      live: 'https://plant-simulator.netlify.app/',
      status: 'live',
      year: '2026',
    },
    {
      id: 4,
      title: 'Swarm Intelligence 3D Simulator',
      category: '3d',
      badge: 'MULTI-AGENT SIM',
      description: 'Animated 3D production line dashboard simulating autonomous swarm agent behavior with custom Three.js pipelines.',
      longDescription: 'Interactive 3D simulation of multi-agent swarm algorithms with real-time data viz and blueprint reporting.',
      tags: ['React Three Fiber', 'TypeScript', 'Three.js', 'Recharts', 'Python'],
      metrics: 'Custom Three.js shader · Autonomous agent logic',
      github: 'https://github.com/davistolu/swarm-intelligence-proj',
      live: 'https://swarm-intelli.netlify.app/',
      status: 'live',
      year: '2024',
    },
    {
      id: 5,
      title: 'AI Financial Assistant Chatbot',
      category: 'ai',
      badge: 'FINTECH & NLP',
      description: 'AI-powered personal finance assistant with budget tracking and natural-language advice via Gemini Pro.',
      longDescription: 'Architecture migration from GPT-3.5 to Flask + Gemini Pro API, achieving 35% latency cut and 50% API cost reduction.',
      tags: ['React', 'Flask', 'Gemini Pro API', 'Python', 'AI/ML'],
      metrics: '35% Latency cut · 50% API cost saved · Natural chat',
      github: 'https://github.com/davistolu/financial-assistant-chatbot',
      live: 'https://financial-assistant-chatbot.netlify.app/',
      status: 'live',
      year: '2024',
    },
    {
      id: 6,
      title: 'Freelancer Pricing & Escrow Marketplace',
      category: 'fullstack',
      badge: 'FINTECH ESCROW',
      description: 'Freelancer platform with dual payment gateway (Paystack & PayPal), WebSockets messaging, and subscription tiers.',
      longDescription: 'Full marketplace architecture with JWT authentication, RBAC, webhook payment listeners, and real-time chat.',
      tags: ['React', 'Node.js', 'Socket.io', 'Paystack', 'PayPal', 'MongoDB'],
      metrics: 'Dual Gateway · Real-time WebSockets · RBAC Auth',
      github: 'https://github.com/davistolu/freelance-earn',
      live: '',
      status: 'in-progress',
      year: '2024',
    },
    {
      id: 7,
      title: 'Blockchain E-Voting Platform',
      category: 'fullstack',
      badge: 'WEB3 & GOV',
      description: 'Decentralized voting system with Ethereum blockchain smart contracts for immutable, tamper-proof ballot recording.',
      longDescription: 'Cryptographic voter identity verification, on-chain vote immutability, and real-time auditable election tallies.',
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Blockchain', 'Web3.js'],
      metrics: 'Immutable on-chain storage · Zero tampering',
      github: 'https://github.com/davistolu/blockchain-e-voting-system',
      live: '',
      status: 'in-progress',
      year: '2024',
    },
  ]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategoryData[]>([]);
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);

  // Load live data from PostgreSQL Backend on mount
  useEffect(() => {
    let isMounted = true;
    const loadBackendData = async () => {
      try {
        const [projRes, profRes, skillRes, expRes] = await Promise.all([
          fetchProjects(),
          fetchProfile(),
          fetchSkills(),
          fetchExperiences(),
        ]);
        if (!isMounted) return;
        if (projRes && projRes.length > 0) setProjects(projRes);
        if (profRes) setProfile(profRes);
        if (skillRes && skillRes.length > 0) setSkillCategories(skillRes);
        if (expRes && expRes.length > 0) setExperiences(expRes);
      } catch (err) {
        console.warn('[TerminalView] Live backend load info:', err);
      }
    };
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getTime = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  // --- LIVE EXTERNAL API FETCHERS (Open-Meteo with 100% Open CORS & zero HTML leaks) ---
  const CITY_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
    lagos: { lat: 6.5244, lon: 3.3792, name: 'Lagos, Nigeria' },
    abuja: { lat: 9.0765, lon: 7.3986, name: 'Abuja, Nigeria' },
    dubai: { lat: 25.2048, lon: 55.2708, name: 'Dubai, UAE' },
    abudhabi: { lat: 24.4539, lon: 54.3773, name: 'Abu Dhabi, UAE' },
    london: { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
    tokyo: { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
    newyork: { lat: 40.7128, lon: -74.006, name: 'New York, USA' },
    nyc: { lat: 40.7128, lon: -74.006, name: 'New York, USA' },
    sanfrancisco: { lat: 37.7749, lon: -122.4194, name: 'San Francisco, USA' },
    paris: { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
    berlin: { lat: 52.52, lon: 13.405, name: 'Berlin, Germany' },
    toronto: { lat: 43.6532, lon: -79.3832, name: 'Toronto, Canada' },
    sydney: { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
    cairo: { lat: 30.0444, lon: 31.2357, name: 'Cairo, Egypt' },
    nairobi: { lat: -1.2921, lon: 36.8219, name: 'Nairobi, Kenya' },
    johannesburg: { lat: -26.2041, lon: 28.0473, name: 'Johannesburg, South Africa' },
  };

  const decodeWmoWeather = (code: number) => {
    if (code === 0) return 'Clear Sky ☀️';
    if (code === 1) return 'Mainly Clear 🌤️';
    if (code === 2) return 'Partly Cloudy ⛅';
    if (code === 3) return 'Overcast ☁️';
    if (code === 45 || code === 48) return 'Foggy 🌫️';
    if (code >= 51 && code <= 55) return 'Drizzle 🌧️';
    if (code >= 61 && code <= 67) return 'Rain 🌧️';
    if (code >= 71 && code <= 77) return 'Snow ❄️';
    if (code >= 80 && code <= 82) return 'Rain Showers 🌦️';
    if (code >= 95) return 'Thunderstorm ⛈️';
    return 'Clear ☀️';
  };

  const fetchLiveWeather = async (city: string = 'Lagos') => {
    const cleanKey = city.toLowerCase().replace(/[^a-z]/g, '');
    let lat = 6.5244;
    let lon = 3.3792;
    let cityName = 'Lagos, Nigeria';

    try {
      if (CITY_COORDINATES[cleanKey]) {
        lat = CITY_COORDINATES[cleanKey].lat;
        lon = CITY_COORDINATES[cleanKey].lon;
        cityName = CITY_COORDINATES[cleanKey].name;
      } else {
        // Geocode dynamically
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoJson = await geoRes.json();
        if (geoJson.results && geoJson.results.length > 0) {
          const first = geoJson.results[0];
          lat = first.latitude;
          lon = first.longitude;
          cityName = `${first.name}, ${first.country || ''}`;
        } else {
          cityName = city;
        }
      }

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`);
      const data = await res.json();
      
      if (data && data.current) {
        const tempC = Math.round(data.current.temperature_2m);
        const tempF = Math.round((tempC * 9) / 5 + 32);
        const wind = data.current.wind_speed_10m;
        const humidity = data.current.relative_humidity_2m;
        const condition = decodeWmoWeather(data.current.weather_code);

        const formatted = `${cityName}: ${condition} | Temp: ${tempC}°C (${tempF}°F) | Wind: ${wind} km/h | Humidity: ${humidity}%`;
        setWeatherData({ city: cityName, text: formatted });
        terminalSound.playSuccess();
        return formatted;
      } else {
        throw new Error('No current weather');
      }
    } catch (e) {
      const fallback = `${cityName}: Partly Cloudy ⛅ | Temp: 31°C (88°F) | Wind: 14 km/h | Humidity: 72%`;
      setWeatherData({ city: cityName, text: fallback });
      return fallback;
    }
  };

  const fetchLiveCrypto = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
      const json = await res.json();
      setCryptoData(json);
      terminalSound.playSuccess();
      return json;
    } catch (e) {
      const fallback = {
        bitcoin: { usd: 94250, usd_24h_change: 2.45 },
        ethereum: { usd: 3450, usd_24h_change: 1.8 },
        solana: { usd: 215, usd_24h_change: 5.2 },
      };
      setCryptoData(fallback);
      return fallback;
    }
  };

  const fetchLiveGitHub = async () => {
    try {
      const res = await fetch('https://api.github.com/users/davistolu');
      const json = await res.json();
      setGithubStats(json);
      terminalSound.playSuccess();
      return json;
    } catch (e) {
      const fallback = { public_repos: 42, followers: 18, public_gists: 5, bio: 'Frontend-focused Full-Stack Engineer' };
      setGithubStats(fallback);
      return fallback;
    }
  };

  const fetchLiveQuote = async () => {
    const quotes = [
      "“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra",
      "“Make it work, make it right, make it fast.” — Kent Beck",
      "“Talk is cheap. Show me the code.” — Linus Torvalds",
      "“Programs must be written for people to read, and only incidentally for machines to execute.” — Abelson & Sussman",
      "“Premature optimization is the root of all evil.” — Donald Knuth",
    ];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    setQuoteData(q);
    terminalSound.playSuccess();
    return q;
  };

  // --- EASTER EGG SIMULATORS ---
  const triggerHollywoodHack = () => {
    setIsHackingActive(true);
    setHackingLogs([]);
    terminalSound.playSuccess();

    const hackSteps = [
      'INITIALIZING EXPLOIT PAYLOAD: 0x7FFF9A2B...',
      'BYPASSING MAINFRAME FIREWALL (PORT: 443)...',
      'INJECTING SHELLCODE OVER SSH TUNNEL...',
      'DUMPING ENCRYPTED AES-256 MEMORY HEAP...',
      'CRACKING RSA-4096 ROOT PRIVATE KEY...',
      'ACCESS LEVEL: ELEVATED TO ROOT UID=0',
      'DOWNLOADING RESTRICTED ARCHIVES [100% COMPLETE]',
      'SYSTEM BREACH SUCCESSFUL: YOU ARE IN.',
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < hackSteps.length) {
        setHackingLogs((prev) => [...prev, hackSteps[i]]);
        terminalSound.playKeyClick();
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsHackingActive(false), 4000);
      }
    }, 450);
  };

  const triggerTrain = () => {
    setIsTrainActive(true);
    terminalSound.playSuccess();
    setTimeout(() => setIsTrainActive(false), 3500);
  };

  const triggerSelfDestruct = () => {
    setIsSelfDestruct(true);
    setSelfDestructCountdown(5);
    terminalSound.playError();

    const interval = setInterval(() => {
      setSelfDestructCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          terminalSound.playSuccess();
          setTimeout(() => {
            setIsSelfDestruct(false);
            setHistory([]);
            onShowToast('Emergency Reboot Complete. All files safe.');
          }, 1500);
          return 0;
        }
        terminalSound.playError();
        return prev - 1;
      });
    }, 1000);
  };

  // --- MAIN COMMAND DISPATCHER ---
  const handleCommandExecution = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    terminalSound.playKeyClick();
    setCommandHistoryList((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    let output: React.ReactNode = null;

    switch (mainCmd) {
      case 'help':
      case '?':
        terminalSound.playSuccess();
        output = (
          <div className="space-y-2 text-xs text-[#a1a1aa]">
            <p className="text-[#4ade80] font-bold">⚡ Tolu-OS Ultra Shell Commands:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 font-mono">
              <div><span className="text-[#38bdf8] font-bold">npc [agent]</span> / <span className="text-[#38bdf8] font-bold">talk</span> — Interactive AI Hub (Tolu, Tux, GLaDOS, Recruiter)</div>
              <div><span className="text-[#38bdf8] font-bold">htop</span> / <span className="text-[#38bdf8] font-bold">top</span> — Real-time process manager &amp; background daemons</div>
              <div><span className="text-[#38bdf8] font-bold">radio [country]</span> / <span className="text-[#38bdf8] font-bold">spotify</span> — Spotify Location-Aware Top 50 Worldwide Charts</div>
              <div><span className="text-[#38bdf8] font-bold">pet</span> / <span className="text-[#38bdf8] font-bold">feed [ramen|coffee]</span> — Interact with Nexus-9 CyberPet</div>
              <div><span className="text-[#38bdf8] font-bold">who</span> / <span className="text-[#38bdf8] font-bold">peers</span> — View concurrent global hacker mesh nodes</div>
              <div><span className="text-[#38bdf8] font-bold">weather [city]</span> — Live ASCII weather (e.g. `weather dubai`)</div>
              <div><span className="text-[#38bdf8] font-bold">crypto</span> — Real-time live CoinGecko BTC/ETH ticker</div>
              <div><span className="text-[#38bdf8] font-bold">gh stats</span> — Live GitHub profile metrics for @davistolu</div>
              <div><span className="text-[#38bdf8] font-bold">quote</span> — Random developer wisdom &amp; fortune</div>
              <div><span className="text-[#38bdf8] font-bold">snake</span> — Play retro Snake game inside terminal</div>
              <div><span className="text-[#38bdf8] font-bold">typing-test</span> — Benchmark code typing speed (WPM)</div>
              <div><span className="text-[#38bdf8] font-bold">hack</span> / <span className="text-[#38bdf8] font-bold">nmap</span> — Hollywood hacker exploit animation</div>
              <div><span className="text-[#38bdf8] font-bold">sl</span> — Steam locomotive animation</div>
              <div><span className="text-[#38bdf8] font-bold">cowsay &lt;text&gt;</span> — Classic Unix talking cow</div>
              <div><span className="text-[#38bdf8] font-bold">projects</span> / <span className="text-[#38bdf8] font-bold">run &lt;id&gt;</span> — Project Universe &amp; live runner</div>
              <div><span className="text-[#38bdf8] font-bold">skills</span> / <span className="text-[#38bdf8] font-bold">experience</span> — Inspect JSON stack &amp; logs</div>
              <div><span className="text-[#38bdf8] font-bold">contact</span> / <span className="text-[#38bdf8] font-bold">resume</span> — Send message / Download PDF</div>
              <div><span className="text-[#22c55e] font-bold">admin</span> / <span className="text-[#22c55e] font-bold">dashboard</span> — Owner Root Console</div>
              <div><span className="text-[#38bdf8] font-bold">theme &lt;name&gt;</span> — Switch CRT theme (`green`, `amber`, `cyan`, `dracula`)</div>
              <div><span className="text-[#38bdf8] font-bold">matrix</span> — Toggle digital matrix rain</div>
              <div><span className="text-[#38bdf8] font-bold">sudo rm -rf /</span> — Self-destruction simulation</div>
              <div><span className="text-[#38bdf8] font-bold">sudo hire</span> — Root access hiring offer protocol</div>
              <div><span className="text-[#38bdf8] font-bold">clear</span> — Reset screen buffer</div>
            </div>
          </div>
        );
        break;

      case 'weather':
        const targetCity = arg || 'Lagos';
        const wResult = await fetchLiveWeather(targetCity);
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded space-y-1 text-xs">
            <p className="text-[#38bdf8] font-bold flex items-center gap-1.5">
              <CloudSun className="w-4 h-4" /> Live Weather Report for {targetCity}:
            </p>
            <p className="font-mono text-[#e4e4e7]">{wResult}</p>
            <p className="text-[10px] text-[#71717a]">Live telemetry via Open-Meteo Global API</p>
          </div>
        );
        break;

      case 'crypto':
        const cResult = await fetchLiveCrypto();
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded space-y-2 text-xs">
            <p className="text-[#f59e0b] font-bold flex items-center gap-1.5">
              <Coins className="w-4 h-4" /> Live Cryptocurrency Rates (CoinGecko API):
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="p-2 bg-[#18181b] rounded border border-[#27272a]">
                <div className="text-white font-bold">BTC / USD</div>
                <div className="text-[#4ade80]">${cResult.bitcoin?.usd?.toLocaleString() || '94,250'}</div>
                <div className="text-[10px] text-zinc-400">{cResult.bitcoin?.usd_24h_change?.toFixed(2)}%</div>
              </div>
              <div className="p-2 bg-[#18181b] rounded border border-[#27272a]">
                <div className="text-white font-bold">ETH / USD</div>
                <div className="text-[#4ade80]">${cResult.ethereum?.usd?.toLocaleString() || '3,450'}</div>
                <div className="text-[10px] text-zinc-400">{cResult.ethereum?.usd_24h_change?.toFixed(2)}%</div>
              </div>
              <div className="p-2 bg-[#18181b] rounded border border-[#27272a]">
                <div className="text-white font-bold">SOL / USD</div>
                <div className="text-[#4ade80]">${cResult.solana?.usd?.toLocaleString() || '215'}</div>
                <div className="text-[10px] text-zinc-400">{cResult.solana?.usd_24h_change?.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        );
        break;

      case 'gh':
      case 'github':
        const ghResult = await fetchLiveGitHub();
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded space-y-2 text-xs">
            <p className="text-[#38bdf8] font-bold flex items-center gap-1.5">
              <Github className="w-4 h-4" /> GitHub Live Profile Stats (@davistolu):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
              <div className="p-2 bg-[#18181b] rounded border border-[#27272a]">
                <div className="text-[10px] text-zinc-500 uppercase">Public Repos</div>
                <div className="text-white font-bold text-sm">{ghResult.public_repos || 42}</div>
              </div>
              <div className="p-2 bg-[#18181b] rounded border border-[#27272a]">
                <div className="text-[10px] text-zinc-500 uppercase">Followers</div>
                <div className="text-white font-bold text-sm">{ghResult.followers || 18}</div>
              </div>
              <div className="p-2 bg-[#18181b] rounded border border-[#27272a]">
                <div className="text-[10px] text-zinc-500 uppercase">Gists</div>
                <div className="text-white font-bold text-sm">{ghResult.public_gists || 5}</div>
              </div>
              <div className="p-2 bg-[#18181b] rounded border border-[#27272a]">
                <div className="text-[10px] text-zinc-500 uppercase">Status</div>
                <div className="text-[#4ade80] font-bold text-xs">ACTIVE</div>
              </div>
            </div>
          </div>
        );
        break;

      case 'quote':
      case 'fortune':
        const qResult = await fetchLiveQuote();
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded text-xs space-y-1">
            <p className="text-[#f59e0b] font-bold">🔮 Engineering Wisdom:</p>
            <p className="italic text-zinc-200">{qResult}</p>
          </div>
        );
        break;
      case 'about':
      case 'bio':
      case 'story':
      case 'ama':
      case 'interview':
      case 'why-hire':
      case 'philosophy':
      case 'credentials':
        setActiveTab('about');
        terminalSound.playSuccess();
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded text-xs space-y-1">
            <p className="text-[#22c55e] font-bold flex items-center gap-1.5">
              <User className="w-4 h-4" /> Switched buffer to ~/about.sh:
            </p>
            <p className="text-zinc-300">
              Loaded Toluwanimi Davis's career journey, engineering pillars, interactive recruiter AMA, and verified credentials.
            </p>
          </div>
        );
        break;

      case 'npc':
      case 'bot':
      case 'talk':
      case 'chat':
        setActiveTab('npc');
        terminalSound.playSuccess();
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded text-xs space-y-1">
            <p className="text-[#22c55e] font-bold flex items-center gap-1.5">
              <Bot className="w-4 h-4" /> Cyber NPC Neural Hub Connected:
            </p>
            <p className="text-zinc-300">
              Active daemons: <span className="text-[#22c55e] font-bold">@tolu-ai</span>, <span className="text-[#38bdf8] font-bold">@tux</span>, <span className="text-[#f59e0b] font-bold">@glados</span>, <span className="text-[#a855f7] font-bold">@recruiter</span>. Switched buffer to ~/npc-hub.
            </p>
          </div>
        );
        break;

      case 'htop':
      case 'top':
      case 'ps':
      case 'daemons':
        setActiveTab('htop');
        terminalSound.playSuccess();
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded text-xs space-y-1">
            <p className="text-[#38bdf8] font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Process Manager (HTOP) Initialized:
            </p>
            <p className="text-zinc-300">Displaying real-time CPU/MEM metrics, background worker threads, and process inspector.</p>
          </div>
        );
        break;

      case 'spotify':
      case 'radio':
      case 'music':
        const cleanArg = arg.toLowerCase().trim();
        setActiveTab('radio');
        terminalSound.playSuccess();

        if (cleanArg.includes('nigeria') || cleanArg === 'ng') {
          setSelectedRadioCountry('NG');
          output = <p className="text-[#1db954]">📻 Connected to Spotify Top 50 — Nigeria 🇳🇬</p>;
        } else if (cleanArg.includes('usa') || cleanArg.includes('us') || cleanArg.includes('america')) {
          setSelectedRadioCountry('US');
          output = <p className="text-[#1db954]">📻 Connected to Spotify Top 50 — USA 🇺🇸</p>;
        } else if (cleanArg.includes('uk') || cleanArg.includes('britain') || cleanArg.includes('london')) {
          setSelectedRadioCountry('GB');
          output = <p className="text-[#1db954]">📻 Connected to Spotify Top 50 — United Kingdom 🇬🇧</p>;
        } else if (cleanArg.includes('uae') || cleanArg.includes('dubai')) {
          setSelectedRadioCountry('AE');
          output = <p className="text-[#1db954]">📻 Connected to Spotify Top 50 — UAE &amp; Middle East 🇦🇪</p>;
        } else if (cleanArg.includes('japan') || cleanArg.includes('tokyo') || cleanArg === 'jp') {
          setSelectedRadioCountry('JP');
          output = <p className="text-[#1db954]">📻 Connected to Spotify Top 50 — Japan 🇯🇵</p>;
        } else if (cleanArg.includes('lofi') || cleanArg.includes('code') || cleanArg.includes('chill')) {
          setSelectedRadioCountry('LOFI');
          output = <p className="text-[#1db954]">📻 Connected to Spotify Cyberpunk Lo-Fi Coding Beats 💻</p>;
        } else if (cleanArg.includes('viral')) {
          setSelectedRadioCountry('VIRAL');
          output = <p className="text-[#1db954]">📻 Connected to Spotify Viral 50 Global 🔥</p>;
        } else {
          output = (
            <p className="text-[#1db954]">
              📻 Switched buffer to ~/spotify.fm (Location-Aware Spotify Top 50 Stream)
            </p>
          );
        }
        break;

      case 'feed':
        terminalSound.playEat();
        const treat = arg || 'ramen';
        onShowToast(`Nexus-9 happily devoured ${treat}! 🍜`);
        output = (
          <p className="text-[#4ade80]">
            😋 Nexus-9 devoured the {treat}! Happiness +20%, Energy +25%. (nom nom nom)
          </p>
        );
        break;

      case 'who':
      case 'peers':
      case 'nodes':
      case 'users':
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded text-xs space-y-2">
            <p className="text-[#22c55e] font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Global Hacker Mesh — Active Peer Nodes (14):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-1.5 bg-[#18181b] rounded border border-[#27272a]">
                <span className="text-[#38bdf8] font-bold">🇯🇵 Tokyo [Node 81]</span>
                <div className="text-zinc-400">anon_404 · Inspecting WireBridge</div>
              </div>
              <div className="p-1.5 bg-[#18181b] rounded border border-[#27272a]">
                <span className="text-[#38bdf8] font-bold">🇺🇸 San Francisco [Node 12]</span>
                <div className="text-zinc-400">recruiter_sarah · Reviewing Resume</div>
              </div>
              <div className="p-1.5 bg-[#18181b] rounded border border-[#27272a]">
                <span className="text-[#38bdf8] font-bold">🇳🇬 Lagos [Local Host]</span>
                <div className="text-zinc-400">tolu@mbp · Principal Engineer (Online)</div>
              </div>
              <div className="p-1.5 bg-[#18181b] rounded border border-[#27272a]">
                <span className="text-[#38bdf8] font-bold">🇩🇪 Berlin [Node 04]</span>
                <div className="text-zinc-400">dev_klaus · Playing Snake CLI</div>
              </div>
            </div>
          </div>
        );
        break;

      case 'snake':
      case 'game':
        setActiveTab('games');
        output = <p className="text-[#4ade80]">Active buffer: ~/games/ (Snake &amp; Typing benchmark loaded)</p>;
        break;

      case 'typing-test':
      case 'typespeed':
        setActiveTab('games');
        output = <p className="text-[#4ade80]">Active buffer: ~/games/ (Code typing benchmark loaded)</p>;
        break;

      case 'hack':
      case 'nmap':
      case 'hollywood':
        triggerHollywoodHack();
        output = <p className="text-[#4ade80]">Initiating Hollywood Cyberpunk Exploit Stream...</p>;
        break;

      case 'sl':
        triggerTrain();
        output = <p className="text-[#f59e0b]">Choo-choo! 🚂</p>;
        break;

      case 'cowsay':
        const msg = arg || 'Toluwanimi Davis is an exceptional Full-Stack Engineer!';
        output = (
          <div className="font-mono text-xs text-[var(--term-bright)] leading-tight select-none">
            <pre>
{`  ________________________________________
< ${msg} >
  ----------------------------------------
         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||`}
            </pre>
          </div>
        );
        break;

      case 'theme':
        const validThemes = ['green', 'amber', 'cyan', 'dracula', 'white', 'red'];
        if (validThemes.includes(arg.toLowerCase().trim())) {
          const selectedT = arg.toLowerCase().trim();
          setTerminalTheme(selectedT);
          terminalSound.playSuccess();
          onShowToast(`Theme switched to: ${selectedT}`);
          output = <p className="text-[var(--term-bright)] font-bold">Theme switched to {selectedT}. CRT phosphors updated.</p>;
        } else {
          output = <p className="text-zinc-400">Usage: `theme &lt;green|amber|cyan|dracula|white|red&gt;`</p>;
        }
        break;

      case 'sudo':
        if (arg === 'admin' || arg.startsWith('admin') || arg === 'dashboard' || arg === 'root') {
          setActiveTab('dashboard');
          terminalSound.playSuccess();
          output = (
            <div className="p-3 bg-[#0c0c0e] border border-[#22c55e]/40 rounded text-xs space-y-1">
              <p className="text-[#22c55e] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> [SUDO OWNER CONSOLE GRANTED]
              </p>
              <p className="text-zinc-300">Opening ~/admin.sh owner root console...</p>
            </div>
          );
        } else if (arg.includes('rm -rf') || arg.includes('destroy')) {
          triggerSelfDestruct();
          output = <p className="text-[#ef4444] font-bold">WARNING: SELF-DESTRUCTION INITIALIZED...</p>;
        } else if (arg === 'hire' || arg.startsWith('hire')) {
          output = (
            <div className="p-3 bg-[#18181b] border border-[#22c55e]/30 rounded text-xs space-y-2">
              <p className="text-[#4ade80] font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> [PROTOCOL: ROOT ACCESS GRANTED]
              </p>
              <p className="text-[#e4e4e7]">
                Status: <strong className="text-white">Available for full-time frontend/full-stack engineering roles, international contracts, and high-impact systems.</strong>
              </p>
              <div className="flex gap-2 flex-wrap pt-1">
                <a
                  href="mailto:durojaiyetoluwani@gmail.com?subject=Job%20Opportunity%20/%20Offer"
                  className="px-3 py-1 bg-[#22c55e] text-black font-bold rounded text-xs hover:bg-[#16a34a] transition-colors"
                >
                  Send Direct Offer
                </a>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="px-3 py-1 bg-[#27272a] text-white rounded text-xs hover:bg-[#3f3f46] transition-colors"
                >
                  Open Contact Terminal Wizard
                </button>
              </div>
            </div>
          );
        } else {
          output = <p className="text-[#ef4444]">sudo: command not found: {arg}</p>;
        }
        break;

      case 'admin':
      case 'dashboard':
      case 'owner':
      case 'root':
        setActiveTab('dashboard');
        terminalSound.playSuccess();
        output = (
          <div className="p-3 bg-[#0c0c0e] border border-[#22c55e]/40 rounded text-xs space-y-1">
            <p className="text-[#22c55e] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> [OWNER ROOT CONSOLE ACCESS]
            </p>
            <p className="text-zinc-300">
              Navigating to ~/admin.sh (Owner Root Console). Authenticate with owner passphrase.
            </p>
          </div>
        );
        break;

      case 'neofetch':
      case 'whoami':
        terminalSound.playSuccess();
        output = renderNeofetch();
        break;

      case 'ls':
      case 'dir':
        output = (
          <div className="space-y-1 text-xs">
            <p className="text-[#71717a]">total 11 items, 7 directories</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <span className="text-[#38bdf8] font-bold">📁 projects/</span>
              <span className="text-[#4ade80] font-bold">📁 games/</span>
              <span className="text-[#22c55e] font-bold">📁 npc-hub/</span>
              <span className="text-[#38bdf8] font-bold">📁 htop.sh*</span>
              <span className="text-[#f59e0b] font-bold">📁 live-apis/</span>
              <span className="text-[#f59e0b]">📄 skills.json</span>
              <span className="text-[#a855f7]">📄 experience.log</span>
              <span className="text-[#ef4444]">📄 resume.pdf</span>
              <span className="text-[#22c55e] font-bold">⚡ contact.sh*</span>
              <span className="text-[#22c55e] font-bold">🔒 admin.sh*</span>
              <span className="text-[#71717a]">📄 welcome.txt</span>
            </div>
          </div>
        );
        break;

      case 'cat':
        if (arg.includes('skill')) {
          setActiveTab('skills');
          output = <p className="text-[#4ade80]">Switched buffer to ~/skills.json</p>;
        } else if (arg.includes('exp')) {
          setActiveTab('experience');
          output = <p className="text-[#4ade80]">Switched buffer to ~/experience.log</p>;
        } else if (arg.includes('resume')) {
          setActiveTab('resume');
          output = <p className="text-[#4ade80]">Rendering ~/resume.pdf...</p>;
        } else if (arg.includes('admin') || arg.includes('dashboard')) {
          setActiveTab('dashboard');
          output = <p className="text-[#4ade80]">Switched buffer to ~/admin.sh (Owner Console)</p>;
        } else if (arg.includes('welcome')) {
          setActiveTab('welcome');
          output = <p className="text-[#4ade80]">Switched buffer to ~/welcome.sh</p>;
        } else {
          output = <p className="text-[#ef4444]">cat: {arg || 'file'}: No such file. Try `cat skills.json` or `ls`</p>;
        }
        break;

      case 'cd':
        if (arg === 'projects' || arg === 'projects/') {
          setActiveTab('projects');
          output = <p className="text-[#4ade80]">Navigated into ~/projects/</p>;
        } else if (arg === 'games' || arg === 'games/') {
          setActiveTab('games');
          output = <p className="text-[#4ade80]">Navigated into ~/games/</p>;
        } else if (arg === 'npc' || arg === 'npc-hub' || arg === 'npc-hub/') {
          setActiveTab('npc');
          output = <p className="text-[#4ade80]">Navigated into ~/npc-hub/</p>;
        } else if (arg === 'htop' || arg === 'htop.sh') {
          setActiveTab('htop');
          output = <p className="text-[#4ade80]">Navigated into ~/htop.sh</p>;
        } else if (arg === 'radio' || arg === 'spotify' || arg === 'spotify.fm') {
          setActiveTab('radio');
          output = <p className="text-[#4ade80]">Navigated into ~/spotify.fm</p>;
        } else if (arg === 'apis' || arg === 'live-apis') {
          setActiveTab('apis');
          output = <p className="text-[#4ade80]">Navigated into ~/live-apis/</p>;
        } else if (arg === 'admin' || arg === 'admin.sh' || arg === 'dashboard') {
          setActiveTab('dashboard');
          output = <p className="text-[#4ade80]">Navigated into ~/admin.sh (Owner Dashboard)</p>;
        } else if (arg === '..' || arg === '~' || arg === '/') {
          setActiveTab('welcome');
          output = <p className="text-[#4ade80]">Navigated to ~/</p>;
        } else {
          output = <p className="text-[#ef4444]">cd: {arg}: directory not found.</p>;
        }
        break;

      case 'projects':
        setActiveTab('projects');
        output = <p className="text-[#4ade80]">Active buffer: ~/projects/</p>;
        break;

      case 'skills':
        setActiveTab('skills');
        output = <p className="text-[#4ade80]">Active buffer: ~/skills.json</p>;
        break;

      case 'experience':
        setActiveTab('experience');
        output = <p className="text-[#4ade80]">Active buffer: ~/experience.log</p>;
        break;

      case 'resume':
      case 'curl':
        setActiveTab('resume');
        const link = document.createElement('a');
        link.href = '/Fullsatck.pdf';
        link.download = 'Toluwanimi_Durojaiye_Resume.pdf';
        link.click();
        terminalSound.playSuccess();
        onShowToast('Resume downloaded (Fullsatck.pdf)');
        output = (
          <div className="text-xs space-y-1">
            <p className="text-[#4ade80]">HTTP/2 200 OK — 126 KB downloaded [Fullsatck.pdf]</p>
            <p className="text-[#71717a]">Saved to local disk.</p>
          </div>
        );
        break;

      case 'run':
        const projId = parseInt(arg);
        const targetProj = projects.find((p) => p.id === projId);
        if (targetProj && targetProj.live) {
          window.open(targetProj.live, '_blank');
          terminalSound.playSuccess();
          output = <p className="text-[#4ade80]">⚡ Executing {targetProj.title} in new tab: {targetProj.live}</p>;
        } else if (targetProj) {
          window.open(targetProj.github, '_blank');
          terminalSound.playSuccess();
          output = <p className="text-[#4ade80]">⚡ Opening repository for {targetProj.title}: {targetProj.github}</p>;
        } else {
          output = <p className="text-[#ef4444]">Usage: `run &lt;1-7&gt;` (e.g. `run 1` for RIAUM, `run 3` for Twin Turbine)</p>;
        }
        break;

      case 'contact':
      case './contact.sh':
        setActiveTab('contact');
        output = <p className="text-[#4ade80]">Starting interactive message wizard (~/contact.sh)...</p>;
        break;

      case 'matrix':
        setIsMatrixActive((prev) => {
          const next = !prev;
          terminalSound.playSuccess();
          onShowToast(`Matrix digital rain: ${next ? 'ENABLED' : 'DISABLED'}`);
          return next;
        });
        output = <p className="text-[#4ade80]">Matrix Rain toggled.</p>;
        break;

      case 'pet':
      case 'tamagotchi':
      case 'nexus':
        const petArg = arg.toLowerCase().trim();
        terminalSound.playChirp();
        if (petArg === 'feed' || petArg === 'food' || petArg === 'ramen') {
          onShowToast('Fed Nexus-9 delicious cyber ramen (+20 EXP)!');
          output = <p className="text-[#4ade80]">🍜 Nexus-9 ate cyber ramen! Happiness &amp; Energy increased.</p>;
        } else if (petArg === 'dance') {
          onShowToast('Nexus-9 is dancing to the music!');
          output = <p className="text-[#38bdf8]">💃 Nexus-9 is dancing to the cyber beats!</p>;
        } else if (petArg === 'bug' || petArg === 'hunt') {
          onShowToast('Glitch bug deployed for Nexus-9 to hunt!');
          output = <p className="text-[#ef4444]">🐛 Memory bug spawned! Nexus-9 is sprinting across the screen to capture it.</p>;
        } else if (petArg === 'follow' || petArg === 'cursor') {
          onShowToast('Nexus-9 cursor following toggled!');
          output = <p className="text-[#38bdf8]">🎯 Cursor tracking engaged! Nexus-9 is following your pointer.</p>;
        } else if (petArg === 'laser') {
          onShowToast('Laser pointer activated!');
          output = <p className="text-[#ef4444]">🔴 Laser pointer active! Nexus-9 is chasing the red laser beam.</p>;
        } else if (petArg === 'sleep') {
          output = <p className="text-[#a855f7]">😴 Nexus-9 is taking a power nap.</p>;
        } else {
          output = (
            <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded text-xs space-y-1">
              <p className="text-[var(--term-bright)] font-bold">🐾 Nexus-9 Autonomous Living Companion:</p>
              <p className="text-zinc-300">Free-roaming 2D physics entity with full cursor tracking &amp; portfolio element exploration!</p>
              <p className="text-zinc-400 text-[11px]">Commands: `pet feed`, `pet dance`, `pet bug`, `pet follow`, `pet laser`, `pet sleep` or click Nexus-9 on screen!</p>
            </div>
          );
        }
        break;

      case 'clear':
        setHistory([]);
        terminalSound.playSuccess();
        return;

      default:
        terminalSound.playError();
        output = (
          <p className="text-[#ef4444] text-xs">
            zsh: command not found: <span className="text-white font-bold">{mainCmd}</span>. Type <span className="text-[#4ade80] font-bold">help</span> to view all commands.
          </p>
        );
        break;
    }

    setHistory((prev) => [
      ...prev,
      {
        command: trimmed,
        output,
        time: getTime(),
      },
    ]);
  };

  useEffect(() => {
    if (externalCommand) {
      handleCommandExecution(externalCommand);
      onCommandHandled();
    }
  }, [externalCommand]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommandExecution(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    terminalSound.playKeyClick();
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistoryList.length > 0) {
        const nextIndex = historyIndex === -1 ? commandHistoryList.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInput(commandHistoryList[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandHistoryList.length) {
          setHistoryIndex(nextIndex);
          setInput(commandHistoryList[nextIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    }
  };

  const submitContactWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactFeedback(null);
    terminalSound.playKeyClick();

    try {
      // 1. Persist directly to PostgreSQL database messages table
      await sendContactMessage(contactData.name, contactData.email, contactData.message);

      // 2. Also forward to EmailJS SMTP delivery
      try {
        emailjs.init('D-J_eJQjG9-qF6GBb');
        await emailjs.send('service_6ne6ui5', 'template_qrdyyvs', {
          from_name: contactData.name,
          from_email: contactData.email,
          message: contactData.message,
          to_name: 'Toluwanimi Davis',
        });
      } catch (mailErr) {
        console.warn('[Contact] EmailJS relay info:', mailErr);
      }

      terminalSound.playSuccess();
      setContactFeedback('SUCCESS: Message recorded to inbox & dispatched to durojaiyetoluwani@gmail.com!');
      onShowToast('Message transmitted successfully!');
      setContactData({ name: '', email: '', message: '' });
    } catch (err: any) {
      terminalSound.playError();
      setContactFeedback(`ERROR: ${err.message || 'Transmission failed'}. Please email durojaiyetoluwani@gmail.com.`);
      onShowToast('Transmission error');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (history.length > 0 || hackingLogs.length > 0) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeTab, hackingLogs]);

  const handleTerminalContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If viewing the admin dashboard, never steal focus from its forms
    if (activeTab === 'dashboard') return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Never steal focus if clicking inside inputs, textareas, buttons, links, or form controls
    if (
      target.closest(
        'input, textarea, button, select, a, form, label, [contenteditable="true"], [role="button"], [role="dialog"], [data-no-focus-steal="true"]'
      )
    ) {
      return;
    }

    // Never steal focus if the user is highlighting/selecting text to copy
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    inputRef.current?.focus();
  };

  const renderNeofetch = () => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 my-3 p-3 sm:p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl text-xs font-mono shadow-sm">
      <div className="md:col-span-4 text-[var(--term-primary)] leading-tight select-none flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-0 border-b md:border-b-0 border-[#1f1f24] pb-2.5 md:pb-0">
        <pre className="text-[8.5px] sm:text-xs leading-none shrink-0">
{`   ████████╗██████╗ 
   ╚══██╔══╝██╔══██╗
      ██║   ██║  ██║
      ██║   ██║  ██║
      ██║   ██████╔╝
      ╚═╝   ╚═════╝ `}
        </pre>
        <div className="mt-0 md:mt-2 text-[#a1a1aa] text-[11px]">
          <p className="text-white font-bold">{profile?.name || 'Toluwanimi Davis'}</p>
          <p className="text-[#38bdf8] text-[10.5px]">{profile?.title || 'Frontend-focused Full-Stack Lead'}</p>
        </div>
      </div>

      <div className="md:col-span-8 space-y-1.5 text-[11px] sm:text-xs text-[#a1a1aa]">
        <p><strong className="text-[#38bdf8]">OS:</strong> {profile?.os || 'ToluOS 4.2.0 Ultra (x86_64-darwin)'}</p>
        <p><strong className="text-[#38bdf8]">Host:</strong> {profile?.location || 'Remote / UAE · Nigeria Workstation'}</p>
        <p><strong className="text-[#38bdf8]">Experience:</strong> {profile?.experience_years ? `${profile.experience_years}+ Years in Production Delivery` : '4+ Years in Production Delivery'}</p>
        <p><strong className="text-[#38bdf8]">MAU:</strong> {profile?.mau_supported ? `${profile.mau_supported.toLocaleString()}+ monthly active users scaled` : '100,000+ monthly active users scaled'}</p>
        <p><strong className="text-[#38bdf8]">Shell:</strong> {profile?.shell || 'zsh 5.9 (tmux: ultra)'}</p>
        <p><strong className="text-[#38bdf8]">Core Stack:</strong> {profile?.core_stack || 'React, Next.js, Node.js, TypeScript, Three.js, AI/LLM'}</p>
        <p><strong className="text-[#38bdf8]">Contact:</strong> <a href={`mailto:${profile?.email || 'durojaiyetoluwani@gmail.com'}`} className="text-white underline">{profile?.email || 'durojaiyetoluwani@gmail.com'}</a></p>
        <p><strong className="text-[#38bdf8]">Status:</strong> <span className="text-[var(--term-bright)] font-bold">● {profile?.status || 'Available for Work'}</span></p>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-2.5 sm:p-6 lg:p-8 pb-48 sm:pb-28 font-mono text-xs sm:text-sm max-w-6xl mx-auto cursor-text text-[#e4e4e7]"
      onClick={handleTerminalContainerClick}
    >
      {/* --- EASTER EGG: STEAM LOCOMOTIVE ANIMATION --- */}
      {isTrainActive && (
        <div className="overflow-hidden whitespace-pre font-mono text-xs text-[#f59e0b] my-4 animate-pulse">
          <pre className="animate-marquee leading-tight">
{`      ====        ________                ___________ 
  _D _|  |_______/        \\__I_I_____===__|_________| 
   |(_)---  |   H\\________/ _____ |   (|____|_______) 
   /     |  |   H  |  |     )|  | |      |       |    
  |      |  |   H  |__--------------------|       |    
  | ________|___H__/__|_____/[][]~\\_______|       |    
  |/ |   |_____I|[[[[[[[[[[[|       |  <==/====\\==|    
 (O) (O) (O)     \\  \\        \\_____/     \\()   ()|    `}
          </pre>
        </div>
      )}

      {/* --- EASTER EGG: HOLLYWOOD HACKING STREAM --- */}
      {isHackingActive && (
        <div className="p-4 bg-black/90 border-2 border-[var(--term-primary)] rounded my-4 space-y-1 font-mono text-xs text-[var(--term-primary)]">
          <p className="font-bold text-sm animate-pulse">*** HOLLYWOOD INFILTRATION ENGAGED ***</p>
          {hackingLogs.map((log, li) => (
            <div key={li} className="flex items-center gap-2">
              <span>➜</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      )}

      {/* --- EASTER EGG: SELF DESTRUCT SIMULATION --- */}
      {isSelfDestruct && (
        <div className="p-6 bg-red-950/90 border-2 border-red-500 rounded my-4 text-center space-y-3 text-red-400 font-mono">
          <p className="text-xl font-bold animate-ping">⚠️ SELF-DESTRUCTION SEQUENCE ENGAGED ⚠️</p>
          <p className="text-3xl font-extrabold text-white">REBOOT IN: {selfDestructCountdown}s</p>
          <p className="text-xs">Executing emergency memory snapshot &amp; safe state purge...</p>
        </div>
      )}

      {/* --- TAB 1: WELCOME.SH --- */}
      {activeTab === 'welcome' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Responsive ASCII Banner (Compact on mobile, Full on desktop) */}
          <div className="text-[var(--term-primary)] select-none overflow-x-hidden">
            {/* Desktop / Tablet Full ASCII Banner */}
            <pre className="hidden sm:block text-[9px] sm:text-xs leading-none font-bold overflow-x-auto scrollbar-none">
{`████████╗ ██████╗ ██╗     ██╗   ██╗██╗    ██╗ █████╗ ███╗   ██╗██╗███╗   ███╗██╗
╚══██╔══╝██╔═══██╗██║     ██║   ██║██║    ██║██╔══██╗████╗  ██║██║████╗ ████║██║
   ██║   ██║   ██║██║     ██║   ██║██║ █╗ ██║███████║██╔██╗ ██║██║██╔████╔██║██║
   ██║   ██║   ██║██║     ██║   ██║██║███╗██║██╔══██║██║╚██╗██║██║██║╚██╔╝██║██║
   ██║   ╚██████╔╝███████╗╚██████╔╝╚███╔███╔╝██║  ██║██║ ╚████║██║██║ ╚═╝ ██║██║
   ╚═╝    ╚═════╝ ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝`}
            </pre>
            {/* Mobile Compact Retro Banner (Fits perfectly on 320px–480px phones) */}
            <div className="sm:hidden p-3 bg-[#0c0c0e] border border-[var(--term-border)] rounded-lg text-center shadow-[0_0_15px_var(--term-glow)]">
              <div className="text-[var(--term-bright)] font-bold text-sm tracking-widest">
                [ TOLUWANIMI DAVIS ]
              </div>
              <div className="text-[10px] text-[#38bdf8] font-mono mt-0.5">
                ⚡ FRONTEND &amp; FULL-STACK ARCHITECT ⚡
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0c0c0e] border border-[#27272a] rounded flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[var(--term-bright)] font-bold">➜</span>
              <span className="text-xs">Type <span className="text-[#38bdf8] font-bold">about</span>, <span className="text-[#4ade80] font-bold">projects</span>, or <span className="text-[#f59e0b] font-bold">snake</span>.</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#71717a]">
              <span>[Dubai · Nigeria · Remote]</span>
              <span className="hidden xs:inline">[4+ Yrs Exp]</span>
            </div>
          </div>

          {renderNeofetch()}

          {/* Quick Command Launcher Chips (Mobile-First Touch Target) */}
          <div className="space-y-2">
            <p className="text-[#71717a] text-xs">Tap to execute immediate command:</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
              {[
                { cmd: 'about', label: 'about tolu' },
                { cmd: 'interview', label: 'recruiter ama' },
                { cmd: 'projects', label: 'projects' },
                { cmd: 'npc', label: 'talk to NPCs' },
                { cmd: 'htop', label: 'htop daemons' },
                { cmd: 'radio', label: 'spotify radio' },
                { cmd: 'snake', label: 'play snake' },
                { cmd: 'weather Dubai', label: 'weather Dubai' },
                { cmd: 'crypto', label: 'curl crypto' },
                { cmd: 'skills', label: 'skills.json' },
                { cmd: 'experience', label: 'experience.log' },
                { cmd: 'hack', label: 'run hack' },
                { cmd: 'sudo hire', label: 'sudo hire' },
              ].map((chip) => (
                <button
                  key={chip.cmd}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommandExecution(chip.cmd);
                  }}
                  className="px-2.5 py-1.5 bg-[#121215] active:bg-[#1f1f24] text-[#38bdf8] border border-[#27272a] rounded-lg font-mono transition-all cursor-pointer touch-manipulation active:scale-95 text-[11px] sm:text-xs min-h-[32px] flex items-center"
                >
                  $ {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ABOUT.SH (INTERACTIVE DEVELOPER PROFILE & STORY) --- */}
      {activeTab === 'about' && (
        <div className="space-y-4">
          <AboutTolu onExecuteCommand={handleCommandExecution} />
        </div>
      )}

      {/* --- TAB 3: PROJECTS/ --- */}
      {activeTab === 'projects' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <p className="text-[#4ade80] font-bold text-xs sm:text-sm">~/projects/ — Selected Production Case Studies (7)</p>
            <span className="text-[11px] text-[#71717a] hidden sm:inline">type `run &lt;id&gt;` to launch</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-3.5 sm:p-4 bg-[#0c0c0e] border border-[#27272a] hover:border-[#38bdf8]/50 rounded-lg space-y-2.5 sm:space-y-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[#38bdf8] text-xs font-bold mr-1.5">[{p.id}]</span>
                    <h3 className="inline font-bold text-[#f4f4f5] text-xs sm:text-sm">{p.title}</h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] bg-[#18181b] border border-[#27272a] text-[#4ade80] shrink-0">
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {p.description}
                </p>

                <div className="text-[11px] text-[var(--term-bright)] font-mono">
                  ➜ {p.metrics}
                </div>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {p.tags.map((t, ti) => (
                    <span key={ti} className="px-1.5 py-0.5 bg-[#18181b] text-[#a1a1aa] border border-[#27272a] rounded">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#18181b] text-xs">
                  <div className="flex items-center gap-2">
                    {p.live && (
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/40 text-[#38bdf8] hover:bg-[#38bdf8]/25 font-bold transition-colors touch-manipulation min-h-[34px]"
                      >
                        <Play className="w-3 h-3" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors touch-manipulation min-h-[34px]"
                      >
                        <Github className="w-3 h-3" />
                        <span>Code Repo</span>
                      </a>
                    )}
                  </div>
                  <span className="text-[#71717a] text-[10px]">Year {p.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: GAMES/ (RETRO TERMINAL PLAYGROUND) --- */}
      {activeTab === 'games' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <p className="text-[#4ade80] font-bold">~/games/ — Retro Terminal Arcade &amp; Benchmarks</p>
            <span className="text-xs text-[#71717a]">Audio enabled</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#22c55e] mb-3 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4" /> 1. Playable Retro Snake
              </h3>
              <SnakeGame />
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#38bdf8] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 2. Developer Code Speed Benchmark
              </h3>
              <TypingTest />
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: NPC-HUB (INTERACTIVE AI AGENTS) --- */}
      {activeTab === 'npc' && (
        <div className="space-y-4">
          <NpcHub />
        </div>
      )}

      {/* --- TAB 5: HTOP.SH (PROCESS MANAGER & BACKGROUND DAEMONS) --- */}
      {activeTab === 'htop' && (
        <div className="space-y-4">
          <ProcessMonitor />
        </div>
      )}

      {/* --- TAB 6: SPOTIFY.FM (LOCATION-AWARE TOP CHARTS RADIO) --- */}
      {activeTab === 'radio' && (
        <div className="space-y-4">
          <SpotifyRadio initialCountry={selectedRadioCountry} />
        </div>
      )}

      {/* --- TAB 4: LIVE-APIS (REAL-TIME DATA TELEMETRY) --- */}
      {activeTab === 'apis' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <p className="text-[#f59e0b] font-bold">~/live-apis — Live REST Endpoints &amp; Telemetry</p>
            <span className="text-xs text-[#71717a]">Real-Time Data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather Module */}
            <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#38bdf8] flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4" /> Live Global Weather Telemetry
                </h3>
                <button
                  onClick={() => fetchLiveWeather('Dubai')}
                  className="text-[10px] px-2 py-0.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-300 rounded"
                >
                  Fetch Dubai
                </button>
              </div>
              <p className="text-xs font-mono text-[#4ade80]">
                {weatherData ? weatherData.text : 'Lagos, Nigeria: Partly Cloudy ⛅ | Temp: 31°C (88°F) | Wind: 14 km/h | Humidity: 72%'}
              </p>
              <div className="flex gap-1.5 text-[10px]">
                {['Lagos', 'Dubai', 'London', 'Tokyo', 'New York'].map((c) => (
                  <button
                    key={c}
                    onClick={() => fetchLiveWeather(c)}
                    className="px-2 py-0.5 bg-[#18181b] hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Crypto Ticker */}
            <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#f59e0b] flex items-center gap-1.5">
                  <Coins className="w-4 h-4" /> CoinGecko Rates
                </h3>
                <button
                  onClick={fetchLiveCrypto}
                  className="text-[10px] px-2 py-0.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-300 rounded"
                >
                  Refresh Rates
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1.5 bg-[#18181b] rounded">
                  <div className="text-[10px] text-zinc-500">BTC</div>
                  <div className="font-bold text-white">${cryptoData?.bitcoin?.usd?.toLocaleString() || '94,250'}</div>
                </div>
                <div className="p-1.5 bg-[#18181b] rounded">
                  <div className="text-[10px] text-zinc-500">ETH</div>
                  <div className="font-bold text-white">${cryptoData?.ethereum?.usd?.toLocaleString() || '3,450'}</div>
                </div>
                <div className="p-1.5 bg-[#18181b] rounded">
                  <div className="text-[10px] text-zinc-500">SOL</div>
                  <div className="font-bold text-white">${cryptoData?.solana?.usd?.toLocaleString() || '215'}</div>
                </div>
              </div>
            </div>

            {/* GitHub Stats */}
            <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#a855f7] flex items-center gap-1.5">
                  <Github className="w-4 h-4" /> GitHub Live Metrics (@davistolu)
                </h3>
                <button
                  onClick={fetchLiveGitHub}
                  className="text-[10px] px-2 py-0.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-300 rounded"
                >
                  Ping GitHub
                </button>
              </div>
              <p className="text-xs text-[#a1a1aa]">
                Public Repos: <strong className="text-white">{githubStats?.public_repos || 42}</strong> · Followers: <strong className="text-white">{githubStats?.followers || 18}</strong>
              </p>
            </div>

            {/* Developer Quote */}
            <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#22c55e] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Fortune / Quote
                </h3>
                <button
                  onClick={fetchLiveQuote}
                  className="text-[10px] px-2 py-0.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-300 rounded"
                >
                  New Quote
                </button>
              </div>
              <p className="text-xs italic text-zinc-300">
                {quoteData || "“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: SKILLS.JSON --- */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <p className="text-[#f59e0b] font-bold">~/skills.json — Technical Competencies &amp; Stack</p>
            <span className="text-xs text-[#71717a]">Production Record</span>
          </div>

          <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded overflow-x-auto text-xs leading-relaxed font-mono">
            <pre className="text-[#e4e4e7]">
{JSON.stringify(
  skillCategories.length > 0
    ? skillCategories.reduce(
        (acc: Record<string, any>, cat) => {
          const categoryKey = cat.key || (cat as any).category || (cat as any).title?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'skills';
          acc[categoryKey] = cat.skills;
          return acc;
        },
        {
          engineer: {
            name: profile?.name || 'Toluwanimi Davis',
            specialization: profile?.title || 'Frontend-focused Full-Stack Engineering',
            experience_years: profile?.experience_years || 4,
            mau_supported: profile?.mau_supported || 100000,
          },
        }
      )
    : {
        engineer: {
          name: profile?.name || 'Toluwanimi Davis',
          specialization: profile?.title || 'Frontend-focused Full-Stack Engineering',
          experience_years: profile?.experience_years || 4,
          mau_supported: profile?.mau_supported || 100000,
        },
        frontend_3d: [
          'React.js', 'Next.js', 'TypeScript', 'React Three Fiber (3D)',
          'Three.js', 'Tailwind CSS', 'Recharts', 'Framer Motion'
        ],
        backend_apis: [
          'Node.js', 'Nest.js', 'Express.js', 'Python (Flask)',
          'RESTful APIs', 'WebSockets (Socket.io)', 'GraphQL', 'JWT / RBAC'
        ],
        ai_llm_systems: [
          'Gemini Pro API', 'OpenAI API', 'DeepSeek',
          'Prompt Engineering', 'AI Agent Workflows', 'Claude / Cursor'
        ],
        databases: [
          'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Redis', 'SQLite'
        ],
        fintech_payments: [
          'Stripe', 'Apple Pay', 'Google Pay', 'Paystack', 'PayPal'
        ],
        devops_cloud: [
          'Docker', 'GitHub Actions CI/CD', 'AWS (S3, EC2)', 'Vercel', 'Netlify'
        ]
      },
  null,
  2
)}
            </pre>
          </div>
        </div>
      )}

      {/* --- TAB 6: EXPERIENCE.LOG --- */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <p className="text-[#a855f7] font-bold">~/experience.log — Verified Production Engineering Log</p>
            <span className="text-xs text-[#71717a]">syslog format (Live DB)</span>
          </div>

          <div className="space-y-4">
            {(experiences.length > 0 ? experiences : [
              {
                id: 1,
                period: '2025–2026',
                company: 'eJaby by Tekeya',
                location: 'Dubai, UAE · Remote Contract',
                role: 'Frontend Developer',
                bullets: [
                  'Engineered complete UI with React & TypeScript — sub-2s initial load time.',
                  'Architected multi-gateway payment (Stripe, Apple Pay, Google Pay) cutting drop-off 30%.',
                  'Performance optimizations lifted Core Web Vitals by 40%.',
                  'Resolved 60% of backlog through reusable design system architecture.'
                ]
              },
              {
                id: 2,
                period: '2023–PRES',
                company: 'ByTeom Technologies',
                location: 'Lagos, Nigeria',
                role: 'Principal Full-Stack Developer',
                bullets: [
                  'Architected full-stack features using React, Node.js, Next.js, PostgreSQL and MongoDB.',
                  'Built AI workflow automation modules integrating LLM APIs — 45% manual processing cut.',
                  'Implemented secure RESTful APIs with JWT & RBAC supporting 10,000+ MAU.',
                  'Owned CI/CD pipelines & DevOps — 25% reduction in release cycle time.'
                ]
              },
              {
                id: 3,
                period: '2023–2025',
                company: 'Google Developer Groups (ACU)',
                location: 'Oyo, Nigeria',
                role: 'Technical Co-Lead',
                bullets: [
                  'Co-led 200+ member developer community; mentored 30+ students into engineering roles.',
                  'Spearheaded TechUp Summit attracting 150+ attendees with industry sponsors.'
                ]
              },
              {
                id: 4,
                period: '2020–2023',
                company: 'DoubleTon Solutions',
                location: 'Abuja, Nigeria',
                role: 'Software Engineering Intern',
                bullets: [
                  'Contributed full-stack features in React + Node.js/Express.',
                  'Optimized MongoDB & SQL queries — 35% speed improvement on high-traffic endpoints.'
                ]
              }
            ]).map((exp) => (
              <div key={exp.id} className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#a1a1aa] border-b border-[#18181b] pb-2">
                  <span className="font-bold text-white">[{exp.period}] {exp.company} {exp.location ? `(${exp.location})` : ''}</span>
                  <span className="text-[#38bdf8]">Role: {exp.role}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#a1a1aa] pl-2">
                  {exp.bullets.map((b, bi) => (
                    <li key={bi}>➜ {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 7: RESUME.PDF --- */}
      {activeTab === 'resume' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <p className="text-[#ef4444] font-bold">~/resume.pdf — Official Curriculum Vitae</p>
            <button
              onClick={() => handleCommandExecution('resume')}
              className="px-3 py-1 bg-[#ef4444] text-white font-bold rounded text-xs hover:bg-[#dc2626] transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF File
            </button>
          </div>

          <div className="p-6 bg-[#0c0c0e] border border-[#27272a] rounded space-y-4 text-xs">
            <div className="border-b border-[#18181b] pb-3">
              <h2 className="text-base font-bold text-white">Toluwanimi Davis</h2>
              <p className="text-[#38bdf8]">Frontend-focused Full-Stack Engineer</p>
              <p className="text-[#71717a] mt-1">Lagos, Nigeria · Dubai, UAE · durojaiyetoluwani@gmail.com · +234 806 983 8501</p>
            </div>

            <div className="space-y-1 text-[#a1a1aa]">
              <p className="text-white font-bold">[SUMMARY]</p>
              <p>4+ years delivering scalable, production-grade web applications for clients across UAE, Nigeria, and remote teams. Specialized in React/TypeScript, Node.js microservices, 3D WebGL telemetry, and AI/LLM integrations.</p>
            </div>

            <div className="space-y-1 text-[#a1a1aa]">
              <p className="text-white font-bold">[EDUCATION &amp; CERTIFICATIONS]</p>
              <p>• B.Sc. Computer Science — Ajayi Crowther University (2021–2025)</p>
              <p>• CS50 Introduction to Computer Science — Harvard University (edX)</p>
              <p>• Full-Stack Web Development — HarvardX</p>
              <p>• Advanced AI Systems Development — Stanford Online</p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 8: CONTACT.SH --- */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <p className="text-[#22c55e] font-bold">~/contact.sh — Interactive Terminal Transmission Wizard</p>
            <span className="text-xs text-[#71717a]">SMTP Dispatch</span>
          </div>

          <div className="p-6 bg-[#0c0c0e] border border-[#27272a] rounded space-y-4">
            <p className="text-xs text-[#a1a1aa]">
              Fill the terminal fields below to transmit an immediate message to <strong className="text-white">durojaiyetoluwani@gmail.com</strong>.
            </p>

            <form onSubmit={submitContactWizard} className="space-y-4">
              <div>
                <label className="block text-xs text-[#38bdf8] mb-1 font-bold">
                  ➜ Enter your Name:
                </label>
                <input
                  type="text"
                  required
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] text-white rounded text-xs font-mono outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#38bdf8] mb-1 font-bold">
                  ➜ Enter your Email Address:
                </label>
                <input
                  type="email"
                  required
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  placeholder="e.g. alex@company.com"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] text-white rounded text-xs font-mono outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#38bdf8] mb-1 font-bold">
                  ➜ Enter Message / Scope:
                </label>
                <textarea
                  required
                  rows={3}
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  placeholder="Tell me about your product, engineering role, or contract needs..."
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] text-white rounded text-xs font-mono outline-none focus:border-[#22c55e] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="px-5 py-2 bg-[#22c55e] text-black font-bold rounded text-xs hover:bg-[#16a34a] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingContact ? (
                    <span>Transmitting packet...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute ./send_message</span>
                    </>
                  )}
                </button>

                {contactFeedback && (
                  <span className="text-xs text-[#4ade80] font-mono">
                    {contactFeedback}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 13: ADMIN.SH (OWNER ROOT CONSOLE) --- */}
      {activeTab === 'dashboard' && (
        <OwnerDashboard onShowToast={onShowToast} onClose={() => setActiveTab('welcome')} />
      )}

      {/* --- COMMAND HISTORY STREAM --- */}
      <div className="mt-8 space-y-4 pt-4 border-t border-[#18181b]">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-[#71717a] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--term-primary)] font-bold">tolu@mbp</span>
                <span className="text-[#3f3f46]">:</span>
                <span className="text-[#38bdf8]">~</span>
                <span className="text-[#3f3f46]">$</span>
                <span className="text-white font-bold ml-1">{item.command}</span>
              </div>
              <span className="text-[10px] text-[#52525b]">{item.time}</span>
            </div>
            <div className="pl-4 text-[#e4e4e7]">{item.output}</div>
          </div>
        ))}

        {/* ACTIVE COMMAND INPUT PROMPT (Mobile Ergonomic) */}
        <form onSubmit={onSubmit} className="flex items-center gap-1.5 sm:gap-2 pt-2 text-xs sm:text-sm bg-[#0c0c0e] p-2 rounded-lg border border-[#27272a] focus-within:border-[var(--term-primary)] transition-all">
          <div className="flex items-center gap-1 text-[var(--term-primary)] font-bold shrink-0 text-[11px] sm:text-xs">
            <span>tolu@mbp</span>
            <span className="text-[#3f3f46]">:</span>
            <span className="text-[#38bdf8] max-w-[80px] sm:max-w-none truncate">~/{activeTab}</span>
            <span className="text-[#3f3f46]">$</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type command (e.g. help, about, snake, run 1)..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none font-mono text-[var(--term-bright)] placeholder-[#52525b] text-xs sm:text-sm"
          />
          {input.length > 0 && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="p-1 rounded text-zinc-500 hover:text-zinc-300 text-[10px] touch-manipulation cursor-pointer"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="p-1.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[var(--term-bright)] border border-[#27272a] active:scale-95 touch-manipulation cursor-pointer shrink-0"
            title="Execute Command"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default TerminalView;
