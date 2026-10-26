import React, { useState, useEffect } from 'react';
import { User, Award, Brain, Zap, Target, BookOpen, MessageSquare, Briefcase, GraduationCap, CheckCircle2, ChevronRight, Terminal, Globe, Heart, Shield, Cpu } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';
import {
  fetchFaqs,
  fetchExperiences,
  fetchProfile,
  FaqData,
  ExperienceData,
  ProfileData
} from '../utils/api';

interface AboutToluProps {
  onExecuteCommand?: (cmd: string) => void;
}

const INTERVIEW_QUESTIONS = [
  {
    q: 'How did you cut checkout drop-off by 30% at eJaby Dubai?',
    a: 'At eJaby by Tekeya in Dubai, I re-architected the entire multi-gateway payment flow using React and TypeScript. I introduced Apple Pay, Google Pay, and Stripe with instant validation, optimistic UI updates, and intelligent fallback retry logic for failed transactions, reducing cart abandonment from 48% to 18%.',
    tags: ['Fintech', 'React', 'Payments', 'Dubai UAE'],
  },
  {
    q: 'What is your architectural approach to Frontend & Full-Stack performance?',
    a: 'I prioritize sub-2s initial load and sub-16ms render frames. My core approach combines strict TypeScript typing, route-based code splitting, memoized state trees, skeleton load states, and Web Workers for heavy data processing. In Node.js backends, I optimize database index paths and enforce structured logging with JWT/RBAC security.',
    tags: ['Performance', 'TypeScript', 'Node.js', 'Core Web Vitals'],
  },
  {
    q: 'Can you work across UAE, US, and European timezones?',
    a: 'Yes, 100%. Having delivered client work across Dubai (GST, UTC+4), the UK (GMT), Nigeria (WAT, UTC+1), and US remote teams, I maintain overlapping working hours with asynchronous documentation rigor, daily standups, and clear sprint milestones.',
    tags: ['Remote', 'Availability', 'Global Teams'],
  },
  {
    q: 'What did you achieve as Google Developer Groups Technical Co-Lead?',
    a: 'I led a 200+ member developer community at ACU, teaching hands-on React, Node.js, and API architecture bootcamps. I personally mentored 30+ students directly into junior engineering internships and freelance contracts, and spearheaded our 150+ attendee TechUp Summit.',
    tags: ['Leadership', 'Community', 'Mentorship', 'GDG'],
  },
  {
    q: 'What are your salary / contract rate expectations?',
    a: 'I am open to competitive full-time roles, contract-to-hire, or high-impact freelance engineering projects. Feel free to send a message via ~/contact.sh or email durojaiyetoluwani@gmail.com to discuss project scopes and compensation.',
    tags: ['Hiring', 'Contracts', 'Rates'],
  },
];

const TIMELINE_EVENTS = [
  {
    year: '2025 – 2026',
    title: 'Frontend Engineer @ eJaby by Tekeya (Dubai, UAE)',
    desc: 'Shipped complete web & mobile client platforms with React, TS, Apple Pay, Google Pay, and Stripe. Boosted Core Web Vitals 40%.',
    badge: 'Fintech & Scale',
    color: '#38bdf8',
  },
  {
    year: '2023 – Present',
    title: 'Principal Full-Stack Developer @ ByTeom Technologies',
    desc: 'Architected SaaS platforms, AI-driven automation pipelines (45% overhead cut), and microservices supporting 10,000+ MAU.',
    badge: 'Full-Stack & AI',
    color: '#22c55e',
  },
  {
    year: '2023 – 2025',
    title: 'Technical Co-Lead @ Google Developer Groups (ACU)',
    desc: 'Mentored 30+ aspiring engineers into tech careers; organized bootcamps and TechUp Summit for 150+ attendees.',
    badge: 'Leadership & GDG',
    color: '#f59e0b',
  },
  {
    year: '2021 – 2025',
    title: 'B.Sc. Computer Science @ Ajayi Crowther University',
    desc: 'Graduated in Computer Science with leadership roles in NACOS (Financial Secretary) and GDG.',
    badge: 'Academic Honor',
    color: '#a855f7',
  },
  {
    year: '2020 – 2023',
    title: 'Software Engineering Intern @ DoubleTon Solutions',
    desc: 'Full-stack development in React, Node.js/Express, and MongoDB query optimization (+35% speedup).',
    badge: 'Origin & Growth',
    color: '#4ade80',
  },
];

const PHILOSOPHY_PILLARS = [
  {
    icon: Zap,
    title: 'Sub-Second Perceived Speed',
    desc: 'Zero-latency feel with optimistic UI updates, skeleton states, and intelligent pre-fetching.',
    color: '#38bdf8',
  },
  {
    icon: Shield,
    title: 'Idempotent Payment Rigor',
    desc: 'Fail-safe payment processing, strict webhook signature validation, and cryptographic consistency.',
    color: '#22c55e',
  },
  {
    icon: Brain,
    title: 'AI-Augmented Engineering',
    desc: 'Not just wrapping LLMs, but building deterministic agentic workflows with prompt caching and tool calling.',
    color: '#a855f7',
  },
  {
    icon: Heart,
    title: 'Mentorship & Open Source',
    desc: 'Empowering junior developers, writing readable clean code, and contributing to community growth.',
    color: '#f43f5e',
  },
];

const AboutTolu: React.FC<AboutToluProps> = ({ onExecuteCommand }) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'story' | 'interview' | 'philosophy' | 'credentials'>('story');

  const [faqs, setFaqs] = useState<FaqData[]>(
    INTERVIEW_QUESTIONS.map((item, idx) => ({ id: idx + 1, ...item }))
  );
  const [experiences, setExperiences] = useState<ExperienceData[]>(
    TIMELINE_EVENTS.map((item, idx) => ({
      id: idx + 1,
      period: item.year,
      company: item.title,
      role: item.badge,
      bullets: [item.desc],
      location: ''
    }))
  );
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [liveFaqs, liveExp, liveProf] = await Promise.all([
          fetchFaqs(),
          fetchExperiences(),
          fetchProfile(),
        ]);
        if (!isMounted) return;
        if (liveFaqs && liveFaqs.length > 0) setFaqs(liveFaqs);
        if (liveExp && liveExp.length > 0) setExperiences(liveExp);
        if (liveProf) setProfile(liveProf);
      } catch (err) {
        console.warn('[AboutTolu] Live backend load info:', err);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tab: 'story' | 'interview' | 'philosophy' | 'credentials') => {
    terminalSound.playKeyClick();
    setActiveSubTab(tab);
  };

  const handleQuestionSelect = (idx: number) => {
    terminalSound.playKeyClick();
    setSelectedQuestionIndex(idx);
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c0c0e] border border-[#27272a] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--term-bg-subtle)] border border-[var(--term-border)] flex items-center justify-center text-[var(--term-bright)] font-bold text-base shadow-sm">
            TD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">{profile?.name || 'Toluwanimi Davis'}</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--term-bg-subtle)] text-[var(--term-bright)] font-bold border border-[var(--term-border)]">
                VERIFIED DEV LEAD
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">
              {profile?.title || 'Frontend-focused Full-Stack Engineer'} · {profile?.experience_years ? `${profile.experience_years}+ Years Experience` : '4+ Years Experience'} · {profile?.location || 'Dubai & Nigeria'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-1 text-[11px] text-[var(--term-bright)] bg-[#121216] px-2.5 py-1 rounded border border-[#27272a]">
            <span className="w-2 h-2 rounded-full bg-[var(--term-primary)] animate-pulse" />
            <span>{profile?.status || 'Available for Hire'}</span>
          </span>
        </div>
      </div>

      {/* Sub Navigation Bar (Mobile 2x2 Grid / Desktop Segmented Bar) */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 border-b border-[#27272a] pb-2">
        {[
          { id: 'story', label: '1:career-journey.log', icon: BookOpen },
          { id: 'interview', label: '2:recruiter-ama.sh', icon: MessageSquare },
          { id: 'philosophy', label: '3:engineering-pillars.md', icon: Target },
          { id: 'credentials', label: '4:certifications.json', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg flex items-center justify-center sm:justify-start gap-1.5 transition-all cursor-pointer touch-manipulation text-[11px] sm:text-xs ${
                isActive
                  ? 'bg-[var(--term-primary)] text-black font-bold shadow-md'
                  : 'bg-[#121216] border border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-700 active:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CAREER JOURNEY TIMELINE */}
      {activeSubTab === 'story' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
              The Journey of Toluwanimi Davis
            </h3>
            <p className="text-zinc-300 leading-relaxed text-xs">
              I am a product-minded Full-Stack Engineer passionate about crafting ultra-fast, visually stunning user experiences with bulletproof backend architectures. Over the past 4+ years, I have architected web platforms across fintech, e-commerce, AI automation, and community engineering for startups and international scale-ups in Dubai, UAE, Nigeria, and remote teams worldwide.
            </p>

            {/* Impact Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 bg-[#141418] border border-[#27272a] rounded">
                <div className="text-[10px] text-zinc-400">Production Experience</div>
                <div className="text-base font-bold text-[#22c55e]">4+ Years</div>
              </div>
              <div className="p-2.5 bg-[#141418] border border-[#27272a] rounded">
                <div className="text-[10px] text-zinc-400">Scale Handled</div>
                <div className="text-base font-bold text-[#38bdf8]">100K+ MAU</div>
              </div>
              <div className="p-2.5 bg-[#141418] border border-[#27272a] rounded">
                <div className="text-[10px] text-zinc-400">Cart Drop-off Reduction</div>
                <div className="text-base font-bold text-[#f59e0b]">-30% eJaby</div>
              </div>
              <div className="p-2.5 bg-[#141418] border border-[#27272a] rounded">
                <div className="text-[10px] text-zinc-400">Mentees Guided</div>
                <div className="text-base font-bold text-[#a855f7]">30+ Students</div>
              </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Chronological Career Milestones (Production Record)
            </h4>
            <div className="space-y-2.5">
              {experiences.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className="p-3.5 bg-[#0c0c0e] border border-[#27272a] rounded hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{ev.company} {ev.location ? `· ${ev.location}` : ''}</span>
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-bold border border-[#38bdf8]/40 text-[#38bdf8] bg-[#38bdf8]/10"
                      >
                        {ev.role}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs">{ev.bullets?.join(' · ') || ''}</p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 shrink-0 font-semibold">{ev.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECRUITER AMA & INTERVIEW SIMULATOR */}
      {activeSubTab === 'interview' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--term-bright)]" />
                Interactive Recruiter &amp; Founder Interview AMA
              </h3>
              <span className="text-[10px] text-zinc-500">Click a prompt to inspect answers</span>
            </div>
            <p className="text-zinc-400 text-xs">
              Simulate an interview with Toluwanimi Davis. Click any question below to see detailed answers on architectural decisions, past production metrics, and team collaboration.
            </p>

            {/* Question Selector List */}
            <div className="space-y-1.5 pt-2">
              {faqs.map((item, idx) => {
                const isSelected = selectedQuestionIndex === idx;
                return (
                  <button
                    key={item.id || idx}
                    onClick={() => handleQuestionSelect(idx)}
                    className={`w-full text-left p-2.5 rounded text-xs transition-all flex items-center justify-between gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--term-bg-subtle)] border-[var(--term-primary)] text-[var(--term-bright)] font-bold shadow-[0_0_10px_var(--term-glow)]'
                        : 'bg-[#141418] border-[#27272a] text-zinc-300 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-normal">Q{idx + 1}:</span>
                      <span>{item.q}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-[var(--term-bright)]' : 'text-zinc-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question & Live Answer Card */}
          {faqs[selectedQuestionIndex] && (
            <div className="p-4 bg-[#121216] border border-[var(--term-primary)]/50 rounded-lg space-y-3 shadow-[0_0_15px_var(--term-glow)]">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
                <span className="font-bold text-[var(--term-bright)] text-xs">
                  RESPONSE FROM {profile?.name?.toUpperCase() || 'TOLUWANIMI DAVIS'}:
                </span>
                <div className="flex gap-1 flex-wrap">
                  {faqs[selectedQuestionIndex].tags?.map((t, ti) => (
                    <span key={ti} className="px-1.5 py-0.2 rounded text-[9px] bg-[#18181b] text-zinc-400 border border-[#27272a]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-white text-xs leading-relaxed font-sans">
                "{faqs[selectedQuestionIndex].a}"
              </p>

              <div className="pt-2 border-t border-[#1f1f24] flex items-center justify-between text-[10px] text-zinc-500">
                <span>Have a custom question or specific role?</span>
                <button
                  onClick={() => onExecuteCommand && onExecuteCommand('contact')}
                  className="text-[var(--term-bright)] hover:underline font-bold cursor-pointer"
                >
                  Launch ~/contact.sh ➜
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ENGINEERING PHILOSOPHY & PILLARS */}
      {activeSubTab === 'philosophy' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#f59e0b]" />
              Core Engineering Pillars
            </h3>
            <p className="text-zinc-400 text-xs">
              How Toluwanimi approaches code craftsmanship, software scalability, and product delivery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {PHILOSOPHY_PILLARS.map((pillar, pi) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pi}
                  className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded hover:border-zinc-700 transition-all space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${pillar.color}20`, color: pillar.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-xs">{pillar.title}</h4>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATIONS & CREDENTIALS */}
      {activeSubTab === 'credentials' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#a855f7]" />
              Verified Academic Degrees &amp; Certifications
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-[#141418] border border-[#27272a] rounded space-y-1">
                <span className="text-[#38bdf8] font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Harvard University (edX)
                </span>
                <p className="font-bold text-white text-xs">CS50 Introduction to Computer Science</p>
                <p className="text-[11px] text-zinc-400">Algorithms, Data Structures, Memory Management (C, Python, SQL)</p>
              </div>

              <div className="p-3.5 bg-[#141418] border border-[#27272a] rounded space-y-1">
                <span className="text-[#22c55e] font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> HarvardX
                </span>
                <p className="font-bold text-white text-xs">Full-Stack Web Development</p>
                <p className="text-[11px] text-zinc-400">React, Django, API Design, Scalable Database Modeling</p>
              </div>

              <div className="p-3.5 bg-[#141418] border border-[#27272a] rounded space-y-1">
                <span className="text-[#a855f7] font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Stanford Online
                </span>
                <p className="font-bold text-white text-xs">Advanced AI Systems Development</p>
                <p className="text-[11px] text-zinc-400">Deep Learning, LLM Workflow Orchestration, Prompt Engineering</p>
              </div>

              <div className="p-3.5 bg-[#141418] border border-[#27272a] rounded space-y-1">
                <span className="text-[#f59e0b] font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ajayi Crowther University
                </span>
                <p className="font-bold text-white text-xs">B.Sc. Computer Science (2021–2025)</p>
                <p className="text-[11px] text-zinc-400">NACOS Financial Secretary &amp; GDG Technical Co-Lead</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutTolu;
