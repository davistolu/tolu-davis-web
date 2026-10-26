import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ArrowUpRight, Terminal, Download, ArrowDown } from 'lucide-react';

interface HeroProps {
  darkMode: boolean;
  onNavigate: (id: string) => void;
  onShowToast: (msg: string) => void;
}

const Hero: React.FC<HeroProps> = ({ darkMode, onNavigate, onShowToast }) => {
  const socials = [
    { icon: Github, href: 'https://github.com/davistolu', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/durojaiye-toluwanimi-9272b3294/', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:durojaiyetoluwani@gmail.com', label: 'Email' },
  ];

  const techStack = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Nest.js', 'React Three Fiber', 'AI / LLM Integration', 
    'Tailwind CSS', 'MongoDB', 'PostgreSQL', 'Docker', 'Stripe', 'Paystack', 'GraphQL', 'WebSockets',
  ];

  const handleDownloadResume = () => {
    const link = document.createElement('a');
    link.href = '/Fullsatck.pdf';
    link.download = 'Toluwanimi_Davis_Resume.pdf';
    link.click();
    onShowToast('Resume downloaded');
  };

  return (
    <section id="hero" className="min-h-[92vh] pt-28 sm:pt-36 pb-12 px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-between relative z-10 font-sans">
      <div className="container mx-auto max-w-6xl">
        
        {/* Top Minimal Telemetry Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 sm:mb-12 border-b border-hairline border-white/[0.08]"
        >
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-200">Available for Full-time Roles &amp; Engineering Contracts</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-zinc-400">
            <span>UAE · Nigeria · Remote</span>
            <span className="opacity-40">/</span>
            <span>4+ Yrs Exp</span>
          </div>
        </motion.div>

        {/* Main Editorial Headline */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-16">
          
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                Frontend-focused Full-Stack Engineer
              </p>
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                Toluwanimi <br />
                <span className={darkMode ? 'text-zinc-400' : 'text-zinc-500'}>Davis.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed font-sans"
            >
              Engineering scalable web applications, real-time 3D simulation telemetry, and AI-powered systems for international companies across the UAE, Nigeria, and global markets.
            </motion.p>

            {/* Tactile Action Triggers */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <button
                onClick={() => onNavigate('projects')}
                className={`group inline-flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-xs tracking-tight transition-all duration-200 ${
                  darkMode
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-black text-white hover:bg-zinc-800'
                }`}
              >
                <span>View Selected Work</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('terminal')}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-mono text-xs border transition-all ${
                  darkMode
                    ? 'bg-[#121215] border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/20'
                    : 'bg-white border-black/[0.08] text-zinc-700 hover:text-black hover:border-black/20'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 opacity-60" />
                <span>Open Terminal</span>
              </button>

              <button
                onClick={handleDownloadResume}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-mono text-xs border transition-all ${
                  darkMode
                    ? 'bg-transparent border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                    : 'bg-transparent border-black/[0.08] text-zinc-600 hover:text-black hover:border-black/20'
                }`}
              >
                <Download className="w-3.5 h-3.5 opacity-60" />
                <span>CV (PDF)</span>
              </button>

              {/* Social links */}
              <div className="flex items-center gap-1.5 pl-2">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`p-2.5 rounded-xl border transition-all ${
                      darkMode
                        ? 'bg-[#121215] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                        : 'bg-white border-black/[0.08] text-zinc-600 hover:text-black hover:border-black/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Technical Stats Card */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`p-6 rounded-2xl border space-y-6 ${
                darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                  <img
                    src="/me.jpg"
                    alt="Toluwanimi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      (e.currentTarget.parentElement as HTMLElement).innerHTML =
                        '<div class="w-full h-full flex items-center justify-center font-bold text-xs">TD</div>';
                    }}
                  />
                </div>
                <div>
                  <div className="font-display font-bold text-sm">Toluwanimi Durojaiye</div>
                  <div className="font-mono text-xs text-zinc-400">Full-Stack Engineer</div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-hairline border-white/[0.08]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Total Experience</span>
                  <span className="font-semibold text-zinc-200">4+ Years</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Monthly Active Users</span>
                  <span className="font-semibold text-zinc-200">100,000+</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Core Markets</span>
                  <span className="font-semibold text-zinc-200">Dubai (UAE) · Nigeria</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Education</span>
                  <span className="font-semibold text-zinc-200">B.Sc Computer Science ('25)</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Minimal Monochromatic Tech Ticker */}
        <div className="pt-4 border-t border-hairline border-white/[0.08]">
          <div className="flex items-center gap-4 overflow-hidden">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 shrink-0">
              Stack:
            </span>
            <div className="overflow-hidden relative w-full">
              <div className="animate-ticker space-x-6 text-xs font-mono text-zinc-400">
                {techStack.concat(techStack).map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                  >
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;