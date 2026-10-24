import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, CornerDownLeft, Sparkles, Copy, Check } from 'lucide-react';

interface TerminalSectionProps {
  darkMode: boolean;
  onNavigate: (id: string) => void;
  onShowToast: (msg: string) => void;
}

interface CommandOutput {
  command: string;
  output: React.ReactNode;
  time: string;
}

const TerminalSection: React.FC<TerminalSectionProps> = ({ darkMode, onNavigate, onShowToast }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      command: 'init',
      output: (
        <div className="space-y-1">
          <p className="text-zinc-200 font-semibold font-mono">Toluwanimi Engineering Console [v4.2.0-prod]</p>
          <p className="text-zinc-400 font-mono">Type <span className="text-emerald-400 font-bold">help</span> to list system commands or select a quick chip below.</p>
        </div>
      ),
      time: '12:00:00',
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getTime = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    let res: React.ReactNode = null;

    switch (trimmed) {
      case 'help':
        res = (
          <div className="space-y-2 text-xs sm:text-sm font-mono">
            <p className="text-zinc-300 font-semibold">Available Commands:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-zinc-400">
              <div><span className="text-white font-bold">projects</span> — View key projects &amp; architecture</div>
              <div><span className="text-white font-bold">skills</span> — Inspect technical capabilities</div>
              <div><span className="text-white font-bold">experience</span> — Read career timeline &amp; metrics</div>
              <div><span className="text-white font-bold">contact</span> — Get direct contact coordinates</div>
              <div><span className="text-white font-bold">resume</span> — Download executive PDF resume</div>
              <div><span className="text-white font-bold">sudo hire</span> — Fast-track direct hiring inquiry</div>
              <div><span className="text-white font-bold">clear</span> — Reset terminal console screen</div>
            </div>
          </div>
        );
        break;

      case 'projects':
        res = (
          <div className="space-y-2 text-xs sm:text-sm font-mono">
            <p className="text-zinc-200 font-semibold">Featured Production Systems:</p>
            <ul className="space-y-1.5 text-zinc-300">
              <li>
                <span className="text-white font-bold">1. RIAUM</span> — Full-Stack AI Mental Wellness Platform (React, Node.js, MongoDB, Recharts, LLM API)
              </li>
              <li>
                <span className="text-white font-bold">2. WireBridge</span> — Polyglot Runtime API Wiring Engine (TypeScript, Python, Go, Ruby, PHP)
              </li>
              <li>
                <span className="text-white font-bold">3. Twin Turbine Simulator</span> — Real-Time 3D Digital Twin (React Three Fiber, Three.js, Telemetry)
              </li>
              <li>
                <span className="text-white font-bold">4. Swarm Intelligence Sim</span> — 3D Autonomous Multi-Agent Dashboard
              </li>
            </ul>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-zinc-400 hover:text-white underline flex items-center gap-1 font-mono pt-1"
            >
              → Jump to visual interactive project showcase
            </button>
          </div>
        );
        break;

      case 'skills':
        res = (
          <div className="space-y-1.5 text-xs sm:text-sm font-mono">
            <p className="text-zinc-200 font-semibold">Core Technical Capabilities:</p>
            <p className="text-zinc-300"><span className="text-white font-bold">Frontend:</span> React, Next.js, TypeScript, React Three Fiber (3D), Tailwind CSS, Recharts</p>
            <p className="text-zinc-300"><span className="text-white font-bold">Backend:</span> Node.js, Nest.js, Express, Flask (Python), WebSockets, REST, GraphQL</p>
            <p className="text-zinc-300"><span className="text-white font-bold">AI / LLM:</span> Gemini Pro, OpenAI API, DeepSeek, Agent Workflows, Prompt Architecture</p>
            <p className="text-zinc-300"><span className="text-white font-bold">Fintech:</span> Stripe, Apple Pay, Google Pay, Paystack, PayPal</p>
            <p className="text-zinc-300"><span className="text-white font-bold">Cloud &amp; DevOps:</span> Docker, CI/CD, GitHub Actions, Vercel, MongoDB, PostgreSQL, AWS</p>
          </div>
        );
        break;

      case 'experience':
        res = (
          <div className="space-y-2 text-xs sm:text-sm font-mono">
            <p className="text-zinc-200 font-semibold">Track Record &amp; International Delivery:</p>
            <div className="space-y-1 text-zinc-300">
              <p><strong className="text-white">eJaby by Tekeya</strong> (Dubai, UAE · Remote) — Frontend Developer (2025–2026)</p>
              <p className="text-xs text-zinc-400 pl-3">↳ 30% reduction in checkout drop-off, sub-2s load times, 60% bug backlog cut.</p>
              
              <p><strong className="text-white">ByTeom Technologies</strong> (Lagos, Nigeria) — Principal Full-Stack Developer (2023–Present)</p>
              <p className="text-xs text-zinc-400 pl-3">↳ Shipped AI workflow automation (45% time cut), JWT/RBAC auth for 10k+ MAU.</p>
              
              <p><strong className="text-white">Google Developer Groups (ACU)</strong> — Technical Co-Lead (2023–2025)</p>
              <p className="text-xs text-zinc-400 pl-3">↳ Mentored 30+ students into engineering roles, hosted TechUp Summit (150+ attendees).</p>
            </div>
          </div>
        );
        break;

      case 'contact':
        res = (
          <div className="space-y-1 text-xs sm:text-sm font-mono">
            <p className="text-zinc-200 font-semibold">Direct Coordinates:</p>
            <p className="text-zinc-300">Email: <a href="mailto:durojaiyetoluwani@gmail.com" className="text-white underline">durojaiyetoluwani@gmail.com</a></p>
            <p className="text-zinc-300">Phone: <a href="tel:+2348069838501" className="text-white underline">+234 806 983 8501</a></p>
            <p className="text-zinc-300">LinkedIn: <a href="https://www.linkedin.com/in/durojaiye-toluwanimi-9272b3294/" target="_blank" rel="noreferrer" className="text-white underline">durojaiye-toluwanimi</a></p>
            <p className="text-zinc-300">GitHub: <a href="https://github.com/davistolu" target="_blank" rel="noreferrer" className="text-white underline">github.com/davistolu</a></p>
          </div>
        );
        break;

      case 'resume':
        res = (
          <div className="space-y-1 text-xs sm:text-sm font-mono">
            <p className="text-zinc-300">Downloading Executive Resume PDF...</p>
            <a
              href="/Fullsatck.pdf"
              download="Toluwanimi_Davis_Resume.pdf"
              className="inline-block mt-1 px-3 py-1 bg-white/10 text-white border border-white/20 rounded text-xs hover:bg-white/20 transition-colors"
            >
              📥 Direct File Download
            </a>
          </div>
        );
        const link = document.createElement('a');
        link.href = '/Fullsatck.pdf';
        link.download = 'Toluwanimi_Durojaiye_Resume.pdf';
        link.click();
        onShowToast('Downloading resume...');
        break;

      case 'sudo hire':
      case 'hire':
        res = (
          <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl space-y-2 text-xs sm:text-sm font-mono">
            <p className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> [PROTOCOL: DIRECT HIRING / CONTRACT INQUIRY]
            </p>
            <p className="text-zinc-300">
              Status: <span className="text-white font-semibold">Available for full-time frontend/full-stack engineering, contract delivery, and relocation.</span>
            </p>
            <div className="flex gap-2 flex-wrap pt-1">
              <a
                href="mailto:durojaiyetoluwani@gmail.com?subject=Job%20Opportunity%20/%20Engineering%20Role"
                className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-xs hover:bg-zinc-200 transition-colors"
              >
                Send Direct Offer
              </a>
              <button
                onClick={() => onNavigate('contact')}
                className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-colors"
              >
                Open Contact Form
              </button>
            </div>
          </div>
        );
        break;

      case 'clear':
        setHistory([]);
        return;

      case '':
        return;

      default:
        res = (
          <div className="text-zinc-400 text-xs font-mono">
            Command not recognized: <span className="text-white font-bold">{cmd}</span>. Type <span className="text-white font-bold">help</span> to view all commands.
          </div>
        );
        break;
    }

    setHistory((prev) => [
      ...prev,
      {
        command: cmd,
        output: res,
        time: getTime(),
      },
    ]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleCommand(input);
    setInput('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const quickChips = ['help', 'projects', 'skills', 'experience', 'sudo hire', 'contact', 'clear'];

  return (
    <section id="terminal" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 w-full relative z-10 font-sans">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              Interactive Shell
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Developer CLI Console
          </h2>
          <p className="text-sm opacity-60 mt-1 max-w-xl">
            Inspect project architecture, run instant commands, and review engineering specs directly through the terminal.
          </p>
        </motion.div>

        {/* Terminal Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`rounded-2xl border overflow-hidden shadow-2xl ${
            darkMode
              ? 'bg-[#0c0c0e] border-white/[0.08]'
              : 'bg-[#18181b] border-black/[0.12] text-zinc-100 shadow-zinc-900/20'
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <span className="ml-2 text-xs font-mono opacity-50 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> tolu@engineer: ~
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500">
              <span>bash — 80×24</span>
            </div>
          </div>

          {/* Quick chips */}
          <div className="px-4 py-2 bg-black/20 border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto text-xs font-mono">
            <span className="text-zinc-500 text-[11px]">Quick run:</span>
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommand(chip);
                }}
                className={`px-2.5 py-0.5 rounded transition-all ${
                  chip === 'sudo hire'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Terminal Body */}
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm space-y-4 max-h-[380px] overflow-y-auto">
            {history.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-semibold">tolu@engineer</span>
                    <span className="opacity-40">:</span>
                    <span>~</span>
                    <span className="opacity-40">$</span>
                    <span className="text-white font-bold ml-1">{item.command}</span>
                  </div>
                  <span className="text-[10px] opacity-30">{item.time}</span>
                </div>
                <div className="pl-4 text-zinc-300">{item.output}</div>
              </div>
            ))}

            {/* Input Line */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-1 text-emerald-400 font-semibold text-xs sm:text-sm">
                <span>tolu@engineer</span>
                <span className="opacity-40 text-zinc-500">:</span>
                <span>~</span>
                <span className="opacity-40 text-zinc-500">$</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="type a command..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-white placeholder-zinc-600"
              />
              <button
                type="submit"
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
            <div ref={bottomRef} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TerminalSection;
