import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Cpu, ArrowUpRight, Calendar, MapPin } from 'lucide-react';

interface AboutProps {
  darkMode: boolean;
}

const About: React.FC<AboutProps> = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'experience' | 'education'>('skills');

  const skillCategories = [
    {
      title: 'Frontend & 3D Engineering',
      skills: ['React.js', 'Next.js', 'TypeScript', 'React Three Fiber (3D)', 'Three.js', 'Tailwind CSS', 'Recharts', 'Framer Motion', 'WCAG Accessibility'],
    },
    {
      title: 'Backend, APIs & Microservices',
      skills: ['Node.js', 'Nest.js', 'Express.js', 'Python (Flask)', 'RESTful APIs', 'WebSockets (Socket.io)', 'GraphQL', 'JWT Auth & RBAC', 'Clean Architecture'],
    },
    {
      title: 'AI / LLM & Prompt Architecture',
      skills: ['Gemini Pro API', 'OpenAI API', 'DeepSeek', 'Prompt Engineering', 'AI Agent Workflows', 'Automation Pipelines', 'Claude'],
    },
    {
      title: 'Databases & Cloud Storage',
      skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase / Firestore', 'Redis', 'SQLite', 'Prisma ORM'],
    },
    {
      title: 'Fintech & Payment Gateways',
      skills: ['Stripe', 'Apple Pay', 'Google Pay', 'Paystack', 'PayPal', 'Webhook Handlers', 'Idempotency'],
    },
    {
      title: 'DevOps, CI/CD & Systems',
      skills: ['Docker', 'GitHub Actions', 'CI/CD Pipelines', 'AWS (S3, EC2)', 'Vercel', 'Netlify', 'Postman', 'Git / GitHub', 'Figma'],
    },
  ];

  const experience = [
    {
      role: 'Frontend Developer',
      company: 'eJaby by Tekeya',
      location: 'Dubai, UAE · Remote (Contract)',
      period: '2025 – 2026',
      link: 'https://ejaby.io/',
      highlights: [
        'Engineered the complete UI of the eJaby web and mobile platforms with React & TypeScript, delivering sub-2s load times.',
        'Architected multi-gateway payment integrations (Stripe, Apple Pay, Google Pay) reducing checkout drop-off by 30%.',
        'Spearheaded frontend performance optimizations (code splitting, lazy loading, memory caching) lifting Core Web Vitals by 40%.',
        'Partnered closely with cross-functional backend & QA teams in sprint cycles, resolving 60% of backlog tickets via shared design systems.',
      ],
    },
    {
      role: 'Principal Full-Stack Developer',
      company: 'ByTeom Technologies',
      location: 'Lagos, Nigeria',
      period: '2023 – Present',
      link: '',
      highlights: [
        'Architected and shipped multiple client-facing applications utilizing React, Node.js, Next.js, PostgreSQL and MongoDB.',
        'Engineered AI-driven workflow automation modules integrating LLM APIs, cutting manual processing overhead by 45%.',
        'Implemented secure RESTful endpoints with JWT & granular RBAC, handling 10,000+ monthly active users.',
        'Owned CI/CD automation and production deployment pipelines, reducing sprint release cycles by 25%.',
      ],
    },
    {
      role: 'Technical Co-Lead & Frontend Tutor',
      company: 'Google Developer Groups — ACU',
      location: 'Oyo, Nigeria',
      period: '2023 – 2025',
      link: '',
      highlights: [
        'Co-led a 200+ member developer community with hands-on bootcamps, workshops, and hackathons.',
        'Authored and taught modern frontend curriculum, mentoring 30+ students directly into tech internships and freelance roles.',
        'Spearheaded the flagship TechUp Summit attracting 150+ attendees and securing industry partnerships.',
      ],
    },
    {
      role: 'Software Engineering Intern',
      company: 'DoubleTon Solutions',
      location: 'Abuja, Nigeria',
      period: '2020 – 2023',
      link: '',
      highlights: [
        'Contributed full-stack feature codebases across client systems using React and Node.js/Express.',
        'Optimized critical database query indexing in MongoDB and SQL, driving a 35% speedup on high-traffic endpoints.',
        'Participated in code reviews and adopted clean architecture, modular component patterns, and documentation rigor.',
      ],
    },
  ];

  const education = [
    {
      degree: 'B.Sc. Computer Science',
      institution: 'Ajayi Crowther University',
      location: 'Oyo, Nigeria',
      period: '2021 – 2025',
      honors: [
        'Financial Secretary — National Association of Computer Science Students (NACOS)',
        'Technical Co-Lead — Google Developer Groups (ACU)',
        '1st Runner-Up — Hult Prize ACU Challenge 2025',
      ],
    },
  ];

  const certifications = [
    { title: 'CS50: Introduction to Computer Science', issuer: 'Harvard University (edX)' },
    { title: 'Full-Stack Web Development Specialization', issuer: 'HarvardX' },
    { title: 'Advanced AI Systems Development', issuer: 'Stanford Online' },
    { title: 'Machine Learning Pipelines with Azure ML Studio', issuer: 'ULSA' },
    { title: 'AWS Cloud Fundamentals & S3 Architecture', issuer: 'ULSA' },
    { title: 'Programming & Data Structures with Python', issuer: 'Udemy' },
    { title: 'Business Analysis & Process Management', issuer: 'ULSA' },
    { title: '1st Runner-Up — Hult Prize Innovation Challenge 2025', issuer: 'Faculty of Sciences, ACU' },
  ];

  const tabs = [
    { id: 'skills', label: 'Technical Matrix', icon: Cpu },
    { id: 'experience', label: 'Experience Timeline', icon: Briefcase },
    { id: 'education', label: 'Education & Honors', icon: GraduationCap },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 w-full relative z-10 font-sans">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Engineering Profile
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight">
            Background &amp; Capabilities
          </h2>
          <p className="text-sm opacity-60 mt-2 max-w-2xl leading-relaxed">
            Frontend-focused Full-Stack Engineer with 4+ years of hands-on experience shipping scalable web applications, real-time 3D simulation telemetry, and AI product integrations.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-hairline border-white/[0.08] pb-4 mb-10 overflow-x-auto text-xs font-mono">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? darkMode ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold'
                    : darkMode
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Icon className="w-4 h-4 opacity-70" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SKILLS */}
        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {skillCategories.map((cat, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border space-y-3 ${
                  darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
                }`}
              >
                <h3 className="font-display font-bold text-sm tracking-tight">{cat.title}</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.skills.map((skill, si) => (
                    <span
                      key={si}
                      className="px-2.5 py-1 rounded text-xs font-mono bg-white/[0.03] text-zinc-300 border border-white/[0.05]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 2: EXPERIENCE */}
        {activeTab === 'experience' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {experience.map((job, ji) => (
              <div
                key={ji}
                className={`p-6 sm:p-8 rounded-2xl border ${
                  darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/[0.06]">
                  <div>
                    <h3 className="font-display font-bold text-lg text-zinc-100">{job.role}</h3>
                    <p className="text-sm text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <span>{job.company}</span>
                      {job.link && (
                        <a href={job.link} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
                          <ArrowUpRight className="w-3.5 h-3.5 inline" />
                        </a>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end text-xs font-mono text-zinc-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {job.period}</span>
                    <span className="flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
                  {job.highlights.map((h, hi) => (
                    <li key={hi} className="flex items-start gap-2.5">
                      <span className="opacity-40 font-mono mt-0.5">—</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 3: EDUCATION */}
        {activeTab === 'education' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {education.map((ed, ei) => (
              <div
                key={ei}
                className={`p-6 sm:p-8 rounded-2xl border ${
                  darkMode ? 'bg-[#121215] border-white/[0.08]' : 'bg-white border-black/[0.08]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-zinc-100">{ed.degree}</h3>
                    <p className="text-sm text-zinc-400 mt-0.5">{ed.institution} · {ed.location}</p>
                  </div>
                  <span className="font-mono text-xs text-zinc-500">{ed.period}</span>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                  {ed.honors.map((h, hi) => (
                    <div key={hi} className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                      <span className="opacity-40">—</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-4">
                Verified Certifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certifications.map((cert, ci) => (
                  <div
                    key={ci}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      darkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-zinc-50 border-black/[0.06]'
                    }`}
                  >
                    <div>
                      <h4 className="font-display font-semibold text-xs text-zinc-200">{cert.title}</h4>
                      <p className="font-mono text-[11px] text-zinc-500 mt-0.5">{cert.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default About;