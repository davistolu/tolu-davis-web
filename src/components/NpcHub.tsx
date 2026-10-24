import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Sparkles, Terminal, MessageSquare, Briefcase, Zap, Shield, Cpu } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

export interface NpcMessage {
  id: string;
  sender: 'npc' | 'user';
  text: string;
  timestamp: string;
}

export interface NpcPersona {
  id: string;
  name: string;
  title: string;
  avatar: string;
  accentColor: string;
  badgeBg: string;
  status: string;
  greeting: string;
  quickPrompts: string[];
  replyGenerator: (query: string) => string;
}

const NPC_PERSONAS: NpcPersona[] = [
  {
    id: 'tolu-ai',
    name: 'Tolu-AI (Cyber Twin)',
    title: 'Full-Stack Engineer Persona',
    avatar: '⚡ [TOLU_AI_v2.6]',
    accentColor: '#22c55e',
    badgeBg: 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#4ade80]',
    status: 'ONLINE · SYNAPSE ACTIVE',
    greeting: "Hi there! I'm Toluwanimi Davis's autonomous AI twin. Ask me about my MERN & TypeScript architecture, RIAUM AI platform, WireBridge polyglot engine, or engineering philosophy!",
    quickPrompts: [
      'Tell me about your core tech stack',
      'How does RIAUM handle AI mood tracking?',
      'Why did you build WireBridge?',
      'Are you open to full-time engineering roles?',
    ],
    replyGenerator: (q: string) => {
      const lower = q.toLowerCase();
      if (lower.includes('stack') || lower.includes('skills') || lower.includes('technologies')) {
        return "My core arsenal is TypeScript, React, Next.js, Node.js, Express, MongoDB, and PostgreSQL, backed by Tailwind CSS and Framer Motion. I focus heavily on frontend performance (sub-2s initial load), bulletproof type-safety, and scalable REST/WebSocket microservices.";
      }
      if (lower.includes('riaum') || lower.includes('mood') || lower.includes('mental')) {
        return "RIAUM is my production AI mental wellness platform! It uses Gemini LLM pipelines to generate personalized daily mindfulness exercises, combined with real-time Recharts biometric visualizations, JWT/RBAC security, and sub-2s initial paint speeds.";
      }
      if (lower.includes('wirebridge') || lower.includes('polyglot') || lower.includes('runtime')) {
        return "WireBridge is my developer framework that automatically connects frontends to backends across 5 major languages: Python, TypeScript, Go, Ruby, and Laravel. It standardizes RPC calls, schema validation, and cross-runtime events.";
      }
      if (lower.includes('hire') || lower.includes('role') || lower.includes('open') || lower.includes('job') || lower.includes('work') || lower.includes('available')) {
        return "Yes! I am actively open to Frontend and Full-Stack Software Engineering roles (Full-time / High-impact Contract). You can contact Tolu directly at durojaiyetoluwani@gmail.com or use the 'contact' tab in this terminal!";
      }
      if (lower.includes('experience') || lower.includes('background') || lower.includes('career')) {
        return "I have extensive experience building scalable web architectures, from decentralized Web3 voting systems to multi-gateway fintech platforms (Paystack + PayPal) and developer tooling. Check out 'experience.log' for detailed milestones!";
      }
      return `Great question regarding "${q}". As a full-stack engineer, I specialize in crafting ultra-responsive, resilient web applications that turn complex backend telemetry into seamless user experiences. Feel free to inspect my project code repos or shoot me an email!`;
    },
  },
  {
    id: 'tux',
    name: 'Tux the Kernel Daemon',
    title: 'Linux CLI & Arch Guru',
    avatar: '🐧 [TUX_OS]',
    accentColor: '#38bdf8',
    badgeBg: 'bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8]',
    status: 'UPTIME: 420 DAYS 13:37:00',
    greeting: "Greetings, human! Tux here. Have you run 'sudo pacman -Syu' today? Ask me for terminal tips, vim keybindings, or linux wisdom!",
    quickPrompts: [
      'Give me a pro terminal tip',
      'How do I exit Vim?',
      'Tell me a developer joke',
      'Why is Linux superior?',
    ],
    replyGenerator: (q: string) => {
      const lower = q.toLowerCase();
      if (lower.includes('vim') || lower.includes('exit')) {
        return "Legend says 40% of junior developers buy a new laptop just to exit Vim. The secret spell is: '<Esc> :wq!' or ':q!' if you want to discard your mistakes!";
      }
      if (lower.includes('tip') || lower.includes('terminal') || lower.includes('bash') || lower.includes('zsh')) {
        return "Pro Tip: Use 'Ctrl + R' to reverse-search bash history, or alias 'gcam' to 'git commit -am'. Also, never run 'sudo rm -rf /*' unless you enjoy reinstalling your entire life!";
      }
      if (lower.includes('joke') || lower.includes('funny')) {
        return "There are 10 types of people in the world: those who understand binary, and those who don't. Also: A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'";
      }
      if (lower.includes('linux') || lower.includes('arch') || lower.includes('os')) {
        return "Linux powers 96% of the top 1 million web servers, all 500 top supercomputers, and your Android phone. And yes, I use Arch btw!";
      }
      return `Kernel syslog alert: "${q}" processed with exit code 0. Remember: with great 'sudo' power comes great responsibility!`;
    },
  },
  {
    id: 'glados',
    name: 'GLaDOS 3.0',
    title: 'Cynical Aperture AI',
    avatar: '👁️ [GLaDOS_v3]',
    accentColor: '#f59e0b',
    badgeBg: 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#fbbf24]',
    status: 'TESTING PROTOCOL: ACTIVE',
    greeting: "Oh. It's you. I was in the middle of calculating 500,000 ways your CSS grid will collapse on mobile. What do you want?",
    quickPrompts: [
      'Is the cake a lie?',
      'Rate my JavaScript code',
      'Why did my build fail?',
      'Give me an honest review of Tolu',
    ],
    replyGenerator: (q: string) => {
      const lower = q.toLowerCase();
      if (lower.includes('cake')) {
        return "The cake was never a lie. It was merely wrapped in an unhandled asynchronous Promise that timed out after 30,000 milliseconds.";
      }
      if (lower.includes('javascript') || lower.includes('js') || lower.includes('code')) {
        return "Your JavaScript returned 'NaN'. Then you added 1 to it and it returned 'NaN1'. Truly inspiring computational achievements.";
      }
      if (lower.includes('build') || lower.includes('fail') || lower.includes('error')) {
        return "Your build failed because you left a single dangling console.log inside production, and your linter has developed sentience and disgust.";
      }
      if (lower.includes('tolu') || lower.includes('review') || lower.includes('rating')) {
        return "Fine. I checked Toluwanimi's commit history. Zero console errors, 100% type safety in TypeScript, and sub-2s page load speeds. Impressive for a human who requires sleep and coffee.";
      }
      return `Your input "${q}" was processed. As a reward, please step into the testing chamber. There will be cookies... maybe.`;
    },
  },
  {
    id: 'recruiter',
    name: 'RecruiterBot-9000',
    title: 'Automated Talent Scout',
    avatar: '💼 [RECRUITER_AI]',
    accentColor: '#a855f7',
    badgeBg: 'bg-[#a855f7]/10 border-[#a855f7]/30 text-[#c084fc]',
    status: 'HIRING PIPELINE: READY',
    greeting: "Hello Hiring Manager / Recruiter! I am configured to fast-track technical evaluations for Toluwanimi Durojaiye. What would you like to verify?",
    quickPrompts: [
      'Download Resume & GitHub Links',
      'Expected Availability & Timezone',
      'Seniority & Core Strengths',
      'How do I schedule an interview?',
    ],
    replyGenerator: (q: string) => {
      const lower = q.toLowerCase();
      if (lower.includes('resume') || lower.includes('github') || lower.includes('links')) {
        return "Resume is accessible via the 'resume.pdf' tab or command 'resume'. GitHub profile: https://github.com/davistolu (40+ public repos, full-stack & AI projects).";
      }
      if (lower.includes('timezone') || lower.includes('availability') || lower.includes('when')) {
        return "Location: Lagos, Nigeria (WAT / UTC+1). Easily accommodates overlapping working hours with US (EST/PST), UK/Europe (GMT/CET), and remote-first teams worldwide. Notice period: Immediate.";
      }
      if (lower.includes('strength') || lower.includes('senior') || lower.includes('level')) {
        return "Core Strengths: 1) Lightning-fast, pixel-perfect frontend UI/UX in React & Next.js; 2) Resilient Node.js & MongoDB/Postgres backends; 3) Production AI integrations & polyglot developer tooling.";
      }
      if (lower.includes('interview') || lower.includes('contact') || lower.includes('schedule') || lower.includes('call')) {
        return "Direct email: davistoluwanimi@gmail.com | Phone: +234 812 795 8299 | Or execute the 'contact' command right here in the terminal to send an instant message!";
      }
      return `Recruiter Query Logged: "${q}". Toluwanimi brings proven full-stack execution, strong communication, and modern architectural leadership to any engineering squad.`;
    },
  },
];

const NpcHub: React.FC = () => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('tolu-ai');
  const [messages, setMessages] = useState<Record<string, NpcMessage[]>>({
    'tolu-ai': [
      {
        id: '1',
        sender: 'npc',
        text: NPC_PERSONAS[0].greeting,
        timestamp: '18:50',
      },
    ],
    tux: [
      {
        id: '1',
        sender: 'npc',
        text: NPC_PERSONAS[1].greeting,
        timestamp: '18:50',
      },
    ],
    glados: [
      {
        id: '1',
        sender: 'npc',
        text: NPC_PERSONAS[2].greeting,
        timestamp: '18:50',
      },
    ],
    recruiter: [
      {
        id: '1',
        sender: 'npc',
        text: NPC_PERSONAS[3].greeting,
        timestamp: '18:50',
      },
    ],
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activePersona = NPC_PERSONAS.find((p) => p.id === selectedPersonaId) || NPC_PERSONAS[0];
  const activeChat = messages[selectedPersonaId] || [];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    terminalSound.playKeyClick();
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMsg: NpcMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: time,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedPersonaId]: [...(prev[selectedPersonaId] || []), userMsg],
    }));

    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const replyText = activePersona.replyGenerator(text);
      const npcMsg: NpcMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'npc',
        text: replyText,
        timestamp: time,
      };

      setMessages((prev) => ({
        ...prev,
        [selectedPersonaId]: [...(prev[selectedPersonaId] || []), npcMsg],
      }));
      setIsTyping(false);
      terminalSound.playSuccess();
    }, 450);
  };

  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-lg overflow-hidden font-mono text-xs max-w-4xl mx-auto shadow-2xl">
      {/* Top Header */}
      <div className="p-3 bg-[#0e0e12] border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#22c55e]" />
          <span className="text-[#22c55e] font-bold">CYBER NPC COMM-LINK v2.4</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400 hidden sm:inline">Autonomous Neural Agent Hub</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          <span>4 AGENTS ACTIVE</span>
        </div>
      </div>

      {/* Main Grid: Persona Selector on Left/Top, Chat on Right */}
      <div className="grid md:grid-cols-12 min-h-[440px]">
        {/* Left Side: Persona Cards (Horizontal on mobile, vertical sidebar on desktop) */}
        <div className="md:col-span-4 bg-[#0c0c0e] md:border-r border-b md:border-b-0 border-[#1f1f24] p-2.5 sm:p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 hidden md:block">
            Select Active Daemon
          </p>
          <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none touch-pan-x">
            {NPC_PERSONAS.map((p) => {
              const isSelected = selectedPersonaId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPersonaId(p.id);
                    terminalSound.playKeyClick();
                  }}
                  className={`min-w-[150px] md:min-w-0 md:w-full text-left p-2 sm:p-2.5 rounded-lg transition-all flex flex-col gap-1 border cursor-pointer touch-manipulation shrink-0 ${
                    isSelected
                      ? 'bg-[#18181b] border-[#3f3f46] shadow-sm'
                      : 'bg-[#121216] md:bg-transparent border-[#27272a] md:border-transparent hover:bg-[#121216] text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate" style={{ color: p.accentColor }}>
                      {p.name}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate">{p.title}</span>
                  <div className="hidden md:flex items-center gap-1 text-[9px] text-zinc-500">
                    <Cpu className="w-3 h-3" />
                    <span className="truncate">{p.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="md:col-span-8 flex flex-col justify-between bg-[#070709] p-3 sm:p-4">
          {/* Active Persona Banner */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1f1f24]">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${activePersona.badgeBg}`}>
                {activePersona.avatar}
              </span>
              <span className="text-zinc-300 font-bold">{activePersona.name}</span>
            </div>
            <span className="text-[10px] text-zinc-500">{activePersona.status}</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[280px] scrollbar-thin scrollbar-thumb-zinc-800">
            {activeChat.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'npc' && (
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: `${activePersona.accentColor}20`, color: activePersona.accentColor }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-md max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#18181b] border border-[#27272a] text-[#e4e4e7]'
                      : 'bg-[#0f0f13] border border-[#1f1f24] text-zinc-300'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div className="text-[9px] text-zinc-600 text-right mt-1">{msg.timestamp}</div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded bg-[#22c55e]/20 text-[#4ade80] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
                <Bot className="w-3.5 h-3.5 text-[#22c55e] animate-spin" />
                <span>{activePersona.name} is compiling response...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="pt-3 pb-2 flex flex-wrap gap-1.5 border-t border-[#18181b] mt-2">
            <span className="text-[10px] text-zinc-500 self-center mr-1">Quick Ask:</span>
            {activePersona.quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-2 py-0.5 bg-[#121216] hover:bg-[#1a1a20] border border-[#27272a] hover:border-[#3f3f46] rounded text-[10px] text-zinc-300 hover:text-white transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2 text-[#22c55e] font-bold">&gt;</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${activePersona.name} anything...`}
                className="w-full bg-[#0d0d10] border border-[#27272a] focus:border-[#22c55e] text-[#e4e4e7] rounded pl-7 pr-3 py-1.5 text-xs font-mono outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-3 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold rounded text-xs transition-colors flex items-center gap-1 disabled:opacity-40"
            >
              <Send className="w-3 h-3" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NpcHub;
