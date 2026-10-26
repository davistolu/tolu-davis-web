import React from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, Phone, Linkedin, Github, FileText } from 'lucide-react';

interface ResumeProps {
  darkMode: boolean;
  onShowToast: (msg: string) => void;
}

const Resume: React.FC<ResumeProps> = ({ darkMode, onShowToast }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/Fullsatck.pdf';
    link.download = 'Toluwanimi_Davis_Resume.pdf';
    link.click();
    onShowToast('Resume PDF downloaded');
  };

  const experience = [
    {
      role: 'Frontend Developer',
      company: 'eJaby by Tekeya (ejaby.io)',
      location: 'Dubai, UAE · Remote (Contract)',
      period: '2025 – 2026',
      link: 'https://ejaby.io/',
      bullets: [
        'Engineered complete UI architecture of the eJaby platform using React and TypeScript with sub-2s load times.',
        'Architected and integrated multi-gateway payments (Stripe, Apple Pay, Google Pay) reducing checkout drop-off by 30%.',
        'Drove performance optimization (lazy loading, code splitting, asset caching) improving Core Web Vitals by 40%.',
        'Partnered with backend and QA teams in cross-functional Agile workflows, owning component lifecycles from Figma handoff through release.',
        'Reduced UI bug backlog by 60% through component refactoring and a unified design system.',
      ],
    },
    {
      role: 'Principal Full-Stack Developer',
      company: 'ByTeom Technologies',
      location: 'Lagos, Nigeria',
      period: '2023 – Present',
      link: '',
      bullets: [
        'Architected and shipped multiple client-facing applications using React, Node.js, Nest.js, PostgreSQL and MongoDB.',
        'Built and deployed AI-driven workflow automation modules integrating LLM APIs, reducing manual processing time by 45%.',
        'Implemented secure RESTful APIs with JWT auth and RBAC, supporting 10,000+ monthly active users.',
        'Owned DevOps & Git strategy, CI/CD automation pipelines, and production release cycles (25% faster shipping).',
      ],
    },
    {
      role: 'Technical Co-Lead & Frontend Tutor',
      company: 'Google Developer Groups — ACU',
      location: 'Oyo, Nigeria',
      period: '2023 – 2025',
      link: '',
      bullets: [
        'Co-led a 200+ member developer community with workshops, talks, and bootcamps on modern React, AI, and APIs.',
        'Designed and delivered a structured frontend curriculum — 30+ students secured internships and freelance contracts.',
      ],
    },
    {
      role: 'Software Engineering Intern',
      company: 'DoubleTon Solutions',
      location: 'Abuja, Nigeria',
      period: '2020 – 2023',
      link: '',
      bullets: [
        'Contributed full-stack features across client projects using React and Node.js/Express.',
        'Optimized critical MongoDB and SQL queries, delivering a 35% speed improvement on high-traffic endpoints.',
      ],
    },
  ];

  const skillGroups = [
    { label: 'Languages', items: 'JavaScript (ES2022+), TypeScript, Python, Dart, HTML5, CSS3' },
    { label: 'Frontend', items: 'React.js, Next.js, Tailwind CSS, React Three Fiber, Recharts, Chart.js' },
    { label: 'Backend', items: 'Node.js, Nest.js, Express.js, Flask, RESTful APIs, WebSockets, GraphQL' },
    { label: 'Databases', items: 'MongoDB, MySQL, PostgreSQL, Firebase, Redis, SQLite' },
    { label: 'AI / ML', items: 'Gemini Pro API, OpenAI API, DeepSeek, LLM Prompt Engineering, Claude' },
    { label: 'Payments', items: 'Stripe, Apple Pay, Google Pay, Paystack, PayPal' },
    { label: 'DevOps', items: 'Git, GitHub Actions, CI/CD, Docker, Vercel, Netlify, Postman, Figma, AWS' },
  ];

  return (
    <section id="resume" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 w-full relative z-10 font-sans">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Curriculum Vitae
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
              Executive Resume
            </h2>
          </div>

          <button
            onClick={handleDownload}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs transition-all ${
              darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>

        {/* Document Frame */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`rounded-2xl border overflow-hidden ${
            darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
          }`}
        >
          {/* Document Header */}
          <div className={`p-6 sm:p-8 border-b ${
            darkMode ? 'bg-black/30 border-white/[0.06]' : 'bg-zinc-50 border-black/[0.06]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-2xl tracking-tight">
                  Toluwanimi Davis
                </h3>
                <p className="font-mono text-xs text-zinc-400 font-semibold mt-0.5">
                  Frontend-focused Full-Stack Engineer
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-xs font-mono text-zinc-400">
                <a href="mailto:durojaiyetoluwani@gmail.com" className="hover:text-white">Email</a>
                <span>·</span>
                <a href="https://www.linkedin.com/in/durojaiye-toluwanimi-9272b3294/" target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>
                <span>·</span>
                <a href="https://github.com/davistolu" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">

            {/* Summary */}
            <div className="space-y-1.5">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Summary
              </h4>
              <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm">
                Frontend-focused Full-Stack Engineer with <strong>4+ years</strong> of hands-on experience shipping scalable web applications and AI-powered product integrations for international clients across the <strong>UAE, Nigeria, and remote-first teams</strong>. Proven track record in multi-gateway payment flows (Stripe, Paystack, PayPal), real-time 3D simulation telemetry, and high-performance React frontends.
              </p>
            </div>

            {/* Experience */}
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Experience
              </h4>
              <div className="space-y-4">
                {experience.map((job, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="font-display font-bold text-sm text-zinc-100">
                        {job.role} <span className="opacity-40">·</span> <span className="text-zinc-400 font-normal">{job.company}</span>
                      </div>
                      <span className="font-mono text-xs text-zinc-500">{job.period} | {job.location}</span>
                    </div>

                    <ul className="space-y-1 text-zinc-400 pl-1">
                      {job.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2">
                          <span className="opacity-40 font-mono mt-0.5">—</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Technical Competencies
              </h4>
              <div className="grid sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {skillGroups.map((sg, si) => (
                  <div key={si} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-zinc-300 font-bold block mb-0.5">{sg.label}:</span>
                    <span className="text-zinc-400">{sg.items}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Resume;