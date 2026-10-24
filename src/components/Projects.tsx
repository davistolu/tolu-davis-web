import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, X, ArrowUpRight, LayoutGrid, Terminal, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';

interface ProjectsProps {
  darkMode: boolean;
}

interface Project {
  id: number;
  title: string;
  category: 'ai' | '3d' | 'fullstack' | 'devtools';
  badge: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  github: string;
  live: string;
  features: string[];
  metrics: string[];
  status?: 'live' | 'in-progress' | 'demo';
  year?: string;
}

const Projects: React.FC<ProjectsProps> = ({ darkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'blueprint'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = [
    { id: 'all', label: 'All Works' },
    { id: 'ai', label: 'AI & LLM' },
    { id: '3d', label: '3D Sims / WebGL' },
    { id: 'fullstack', label: 'Full-Stack & Fintech' },
    { id: 'devtools', label: 'Dev Tools & Systems' },
  ];

  const projects: Project[] = [
    {
      id: 1,
      title: 'RIAUM — Mental Wellness Platform',
      category: 'ai',
      badge: 'Production AI System',
      description: 'Full-stack mental wellness ecosystem with real-time mood tracking, AI mindfulness generation, and interactive telemetry dashboards.',
      longDescription: 'A production-grade mental wellness platform built with the MERN stack and TypeScript. Combines real-time mood logging, interactive telemetry dashboards using Recharts, and personalized mindfulness recommendations powered by LLM APIs. Designed with modular microservice principles, sub-2s initial load time, and strict JWT/RBAC security protocols.',
      image: '/riaum.png',
      tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Recharts', 'Gemini Pro / LLM', 'JWT'],
      github: 'https://github.com/davistolu/Riaum-backend',
      live: 'https://r-iaum.vercel.app/',
      status: 'live',
      year: '2026',
      metrics: ['Sub-2s page loads', '100% Type-safe', 'Real-time mood charting'],
      features: [
        'AI-driven personalization using LLM APIs for real-time mindfulness suggestions',
        'Real-time mood tracking with Recharts data visualization',
        'Secure JWT + RBAC authentication and session management',
        'CI/CD pipelines via GitHub Actions + Vercel with production monitoring',
        'Sub-2s load times via lazy loading, memoization, and asset optimization',
      ]
    },
    {
      id: 2,
      title: 'WireBridge — Runtime API Framework',
      category: 'devtools',
      badge: 'Polyglot Runtime',
      description: 'Polyglot runtime wiring layer automatically connecting frontends to backends across Python, TypeScript, Go, Ruby, and Laravel without manual endpoints.',
      longDescription: 'WireBridge is a production-grade runtime framework that sits between client frontends and server backends. Instead of writing boilerplate API endpoints by hand, developers declare capabilities and WireBridge automatically resolves the match using convention scoring and Claude-powered synthesis fallback. Stored in SQLite/PostgreSQL with live SSE dashboard and AES-256 encrypted API key management.',
      image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['TypeScript', 'Node.js', 'Python', 'Go', 'Ruby', 'PHP', 'React', 'SSE', 'AES-256'],
      github: 'https://github.com/davistolu/autobridge',
      live: 'https://github.com/davistolu/autobridge',
      status: 'live',
      year: '2026',
      metrics: ['Zero manual boilerplate', 'Multi-language SDKs', 'SSE Live stream'],
      features: [
        'Runtime convention resolver — wires frontend intents to backend capabilities instantly with zero LLM calls',
        'Claude-powered synthesis fallback for novel pairings, cached as contracts after first resolution',
        'Proxy layer routes /bridge/* requests to the correct backend service at runtime',
        'SQLite & PostgreSQL contract store with automatic schema drift detection',
        'React dashboard with live Server-Sent Events (SSE) stream for contract monitoring',
      ]
    },
    {
      id: 3,
      title: 'Twin Turbine 3D Simulator',
      category: '3d',
      badge: '3D WebGL Telemetry',
      description: 'High-fidelity real-time 3D digital twin of a dual wind turbine production system with physics simulation and engineering telemetry.',
      longDescription: 'An interactive 3D digital twin simulator built using React Three Fiber, Three.js, and TypeScript. Accurately simulates turbine physics including rotational torque, wind speed dynamic response, power grid output, and anomaly fault injections with live telemetry charts and blueprint reporting.',
      image: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['React Three Fiber', 'Three.js', 'TypeScript', 'Recharts', 'Physics Sim', 'WebGL'],
      github: 'https://github.com/davistolu/twin-turbine-sim',
      live: 'https://plant-simulator.netlify.app/',
      status: 'live',
      year: '2026',
      metrics: ['60 FPS WebGL', 'Live physics engine', 'Fault injection mode'],
      features: [
        'Real-time 3D twin turbine model with physics-accurate rotation and wind response',
        'Live telemetry dashboard — RPM, torque, energy output per turbine',
        'Wind speed and direction controls with dynamic blade response',
        'Fault injection mode to simulate turbine anomalies and failures',
        'Recharts panels for historical and real-time data comparison'
      ]
    },
    {
      id: 4,
      title: 'Swarm Intelligence 3D Simulator',
      category: '3d',
      badge: 'Multi-Agent Simulation',
      description: 'Animated 3D production line dashboard simulating autonomous swarm agent behavior with custom Three.js pipelines.',
      longDescription: 'A cutting-edge 3D production line simulator built with React Three Fiber, TypeScript, and Recharts. Demonstrates complex autonomous swarm behavior in industrial environments, real-time path planning data viz, and stakeholder blueprint reporting.',
      image: '/swarm.png',
      tags: ['React Three Fiber', 'TypeScript', 'Three.js', 'Recharts', 'Python'],
      github: 'https://github.com/davistolu/swarm-intelligence-proj',
      live: 'https://swarm-intelli.netlify.app/',
      status: 'live',
      year: '2024',
      metrics: ['Complex agent logic', 'Custom shader pipeline', 'Live telemetry'],
      features: [
        'Animated 3D production line with swarm agent behavior simulation',
        'Custom Three.js rendering pipelines for complex visual states',
        'Real-time Recharts dashboards for data communication',
        'TypeScript for type-safe component architecture',
      ]
    },
    {
      id: 5,
      title: 'AI Financial Assistant Chatbot',
      category: 'ai',
      badge: 'Fintech & NLP',
      description: 'AI-powered personal finance assistant with budget tracking, expense categorization, and natural-language financial advice via Gemini Pro.',
      longDescription: 'An intelligent personal finance companion that analyzes expenses, manages budgets, and delivers personalized advice. Migrated backend architecture to Flask + Gemini Pro API, achieving a 35% reduction in latency and 50% cost savings compared to previous GPT-3.5 pipelines.',
      image: '/finbot.png',
      tags: ['React', 'Flask', 'Gemini Pro API', 'Python', 'AI/ML'],
      github: 'https://github.com/davistolu/financial-assistant-chatbot',
      live: 'https://financial-assistant-chatbot.netlify.app/',
      status: 'live',
      year: '2024',
      metrics: ['35% Latency Cut', '50% API Cost Saved', 'Smart categorization'],
      features: [
        'AI-powered natural language chat interface via Gemini Pro',
        'Budget tracking and expense categorization',
        'Flask backend with 35% lower latency vs prior architecture',
        '50% reduction in API cost after migration from GPT-3.5',
      ]
    },
    {
      id: 6,
      title: 'Freelancer Pricing & Escrow Platform',
      category: 'fullstack',
      badge: 'Fintech & Marketplace',
      description: 'Freelance marketplace with dual payment gateways (Paystack & PayPal), real-time WebSockets messaging, and subscription tiers.',
      longDescription: 'A full-featured freelance services marketplace engineered with React and Node.js. Includes secure payment handling with Paystack and PayPal, real-time client chat powered by Socket.io, role-based access control (RBAC), and webhook event listeners for payment verification.',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['React', 'Node.js', 'Socket.io', 'Paystack', 'PayPal', 'MongoDB'],
      github: 'https://github.com/davistolu/freelance-earn',
      live: '',
      status: 'in-progress',
      year: '2024',
      metrics: ['Dual Gateway Payment', 'Real-time WebSockets', 'RBAC Auth'],
      features: [
        'Freelancer and client account creation with role-based access',
        'Service listing and dynamic pricing system',
        'Secure payments with Paystack & PayPal dual gateway',
        'Real-time messaging via Socket.io',
      ]
    },
    {
      id: 7,
      title: 'Blockchain E-Voting Platform',
      category: 'fullstack',
      badge: 'Web3 & Governance',
      description: 'Decentralized e-voting platform integrating Ethereum smart contracts for immutable, tamper-proof ballot recording.',
      longDescription: 'A secure, transparent voting system built on the MERN stack with Web3.js blockchain integration. Guarantees tamper-proof vote casting, cryptographic voter verification, and instantaneous result tallies on an immutable ledger.',
      image: 'https://images.pexels.com/photos/1550340/pexels-photo-1550340.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Blockchain', 'Web3.js'],
      github: 'https://github.com/davistolu/blockchain-e-voting-system',
      live: '',
      status: 'in-progress',
      year: '2024',
      metrics: ['Immutable on-chain storage', 'Zero-tampering', 'Instant audit'],
      features: [
        'Decentralized voting via blockchain integration',
        'Immutable vote storage on-chain',
        'Voter registration and secure login',
      ]
    },
    {
      id: 8,
      title: 'Shan Interiors Modern Showcase',
      category: 'fullstack',
      badge: 'Interactive Experience',
      description: 'High-aesthetic interior decor web showcase with responsive carousels, custom interactions, and smooth transitions.',
      longDescription: 'A visually engaging luxury interior decor showcase platform built with React, TypeScript, and Shadcn UI. Optimized for mobile and desktop viewports with fluid animations, testimonial sliders, and inquiry workflows.',
      image: '/shan.png',
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'Shadcn UI', 'Framer Motion'],
      github: 'https://github.com/davistolu/shan-interiors-artistry',
      live: 'https://shan-interiors-demo.netlify.app/',
      status: 'live',
      year: '2025',
      metrics: ['100% Responsive', '95+ Lighthouse', 'Fluid Animations'],
      features: [
        'Responsive design across all devices',
        'Animated product showcases and image sliders',
        'Customer testimonials carousel',
      ]
    },
    {
      id: 9,
      title: 'Academic & Campus Utility Portal',
      category: 'fullstack',
      badge: 'Campus Automation',
      description: 'MERN stack campus portal with biometric attendance verification, medical chatbot, and AI-assisted exam preparation.',
      longDescription: 'An all-in-one student utility portal developed to serve university communities. Features biometric attendance recording, interactive campus map guides, AI exam quiz generator, and emergency medical assistance bots.',
      image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['React', 'Node.js', 'MongoDB', 'AI Chatbot', 'JWT', 'Biometrics'],
      github: 'https://github.com/davistolu/student-utility',
      live: 'https://student-portal-demo.netlify.app',
      status: 'demo',
      year: '2023',
      metrics: ['Biometric check-in', 'AI Exam module', '1,000+ Students'],
      features: [
        'Biometric attendance tracking system',
        'Interactive campus map for navigation and directions',
        'AI-powered exam preparation with personalized quizzes',
      ]
    }
  ];

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 w-full relative z-10 font-sans">
      <div className="container mx-auto max-w-6xl">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Selected Works
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight">
              Case Studies &amp; Projects
            </h2>
            <p className="text-sm opacity-60 mt-2 max-w-xl">
              Production web applications, 3D simulation digital twins, AI/LLM systems, and developer tooling.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className={`flex items-center p-1 rounded-xl border ${
              darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === 'grid'
                    ? darkMode ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>
              <button
                onClick={() => setViewMode('blueprint')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === 'blueprint'
                    ? darkMode ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Blueprint</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? darkMode ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold'
                  : darkMode
                  ? 'border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/20'
                  : 'border border-black/[0.08] text-zinc-600 hover:text-black hover:border-black/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* --- VIEW MODE 1: VISUAL SHOWCASE GRID --- */}
        {viewMode === 'grid' && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {filteredProjects.map((project, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`group rounded-2xl border overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  darkMode
                    ? 'bg-[#121215] border-white/[0.08] hover:border-white/25'
                    : 'bg-white border-black/[0.08] hover:border-black/20 shadow-sm'
                }`}
              >
                {/* Image Frame */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Badge & Year */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-black/75 text-zinc-200 border border-white/10 backdrop-blur-md">
                      {project.badge}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                      {project.year}
                    </span>
                  </div>

                  {/* Metrics preview */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 flex-wrap">
                    {project.metrics.slice(0, 2).map((m, mi) => (
                      <span key={mi} className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-zinc-200 border border-white/10">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-base group-hover:text-white transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Stack & Links */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 4).map((tag, ti) => (
                        <span
                          key={ti}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-400 border border-white/[0.04]"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500">
                          +{project.tags.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs font-mono">
                      <span className="text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1">
                        Case Study <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-zinc-400 hover:text-white transition-colors"
                            title="Code"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.live && (
                          <a
                            href={project.live}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-zinc-400 hover:text-white transition-colors"
                            title="Live"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* --- VIEW MODE 2: SYSTEM BLUEPRINT TABLE --- */}
        {viewMode === 'blueprint' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-2xl border overflow-hidden ${
              darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className={`border-b uppercase tracking-wider text-[11px] ${
                  darkMode ? 'bg-black/40 border-white/[0.08] text-zinc-400' : 'bg-zinc-50 border-black/[0.08] text-zinc-600'
                }`}>
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">System / Project</th>
                    <th className="py-3.5 px-4">Stack &amp; Architecture</th>
                    <th className="py-3.5 px-4">Key Metric</th>
                    <th className="py-3.5 px-4 text-right">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredProjects.map((p, idx) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className={`cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <td className="py-4 px-4 text-zinc-500 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-4 px-4">
                        <div className="font-display font-bold text-sm text-zinc-100">{p.title}</div>
                        <div className="text-[11px] opacity-50 line-clamp-1">{p.description}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.tags.slice(0, 3).map((t, ti) => (
                            <span key={ti} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-zinc-300 text-[11px]">{p.metrics[0]}</span>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 text-zinc-400">
                          {p.github && (
                            <a href={p.github} target="_blank" rel="noreferrer" className="p-1 hover:text-white">
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {p.live && (
                            <a href={p.live} target="_blank" rel="noreferrer" className="p-1 hover:text-white">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>

      {/* --- DEEP DIVE CASE STUDY MODAL --- */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />

            {/* Modal Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl z-10 ${
                darkMode
                  ? 'bg-[#121215] border-white/[0.08] text-white'
                  : 'bg-white border-black/[0.08] text-black'
              }`}
            >
              {/* Image banner */}
              <div className="relative aspect-[21/9] overflow-hidden bg-black">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black border border-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-black/80 text-zinc-200 border border-white/10">
                    {selectedProject.badge}
                  </span>
                  <span className="text-xs font-mono opacity-60 text-white">{selectedProject.year}</span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-display font-bold">
                    {selectedProject.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-2.5 leading-relaxed">
                    {selectedProject.longDescription}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
                    Key Features &amp; Architecture
                  </h4>
                  <div className="space-y-2">
                    {selectedProject.features.map((feat, fi) => (
                      <div
                        key={fi}
                        className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] text-xs leading-relaxed flex items-start gap-2.5 text-zinc-300"
                      >
                        <span className="opacity-40 font-mono mt-0.5">—</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stack */}
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
                    Technologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags.map((tag, ti) => (
                      <span
                        key={ti}
                        className="px-2.5 py-1 rounded text-xs font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {selectedProject.live && (
                      <a
                        href={selectedProject.live}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs ${
                          darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
                        }`}
                      >
                        <span>Open Live Demo</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                    {selectedProject.github && (
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs border border-white/[0.08] text-zinc-300 hover:text-white"
                      >
                        <Github className="w-4 h-4" />
                        <span>Repository</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-xs font-mono opacity-50 hover:opacity-100"
                  >
                    Close [ESC]
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Projects;