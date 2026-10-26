import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  FolderGit2,
  User,
  Briefcase,
  Cpu,
  HelpCircle,
  Mail,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  LogOut,
  Terminal,
  ExternalLink,
  Github,
  Play,
  Save,
  Database
} from 'lucide-react';
import {
  ProfileData,
  ProjectData,
  ExperienceData,
  SkillCategoryData,
  FaqData,
  ContactMessageData,
  TelemetryData,
  getAuthToken,
  loginAdmin,
  verifyAdminSession,
  removeAuthToken,
  changeAdminPassword,
  fetchProfile,
  updateAdminProfile,
  fetchProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  fetchExperiences,
  createAdminExperience,
  updateAdminExperience,
  deleteAdminExperience,
  fetchSkills,
  updateAdminSkills,
  fetchFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
  fetchAdminMessages,
  markAdminMessageRead,
  deleteAdminMessage,
  fetchTelemetry
} from '../utils/api';
import { terminalSound } from '../utils/terminalSound';

interface OwnerDashboardProps {
  onShowToast: (msg: string) => void;
  onClose?: () => void;
}

type AdminTab = 'overview' | 'projects' | 'profile' | 'experience' | 'skills' | 'faqs' | 'messages' | 'security';

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onShowToast, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Admin Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<AdminTab>('overview');

  // Loaded Data States
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [skills, setSkills] = useState<SkillCategoryData[]>([]);
  const [faqs, setFaqs] = useState<FaqData[]>([]);
  const [messages, setMessages] = useState<ContactMessageData[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Modals & Form States
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedProject, setSelectedProject] = useState<Partial<ProjectData>>({});
  const [tagsInput, setTagsInput] = useState<string>('');

  const [expModalMode, setExpModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedExp, setSelectedExp] = useState<Partial<ExperienceData>>({});
  const [bulletsInput, setBulletsInput] = useState<string>('');

  const [faqModalMode, setFaqModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<Partial<FaqData>>({});
  const [faqTagsInput, setFaqTagsInput] = useState<string>('');

  const [skillModalMode, setSkillModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedSkillCat, setSelectedSkillCat] = useState<Partial<SkillCategoryData>>({});
  const [skillsListInput, setSkillsListInput] = useState<string>('');

  // Password Change State
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passChangeStatus, setPassChangeStatus] = useState<string | null>(null);

  // Verify auth session on mount
  useEffect(() => {
    async function checkAuth() {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }
      try {
        await verifyAdminSession();
        setIsAuthenticated(true);
        loadAllData();
      } catch {
        removeAuthToken();
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  const loadAllData = async () => {
    setIsLoadingData(true);
    try {
      const [profData, projData, expData, skillData, faqData, msgData, telemData] = await Promise.all([
        fetchProfile().catch(() => null),
        fetchProjects().catch(() => []),
        fetchExperiences().catch(() => []),
        fetchSkills().catch(() => []),
        fetchFaqs().catch(() => []),
        fetchAdminMessages().catch(() => []),
        fetchTelemetry().catch(() => null)
      ]);

      if (profData) setProfile(profData);
      setProjects(projData);
      setExperiences(expData);
      setSkills(skillData);
      setFaqs(faqData);
      setMessages(msgData);
      setTelemetry(telemData);
    } catch (err: any) {
      onShowToast(`Failed to load some dashboard data: ${err.message}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      await loginAdmin(passwordInput.trim());
      terminalSound.playSuccess();
      setIsAuthenticated(true);
      setPasswordInput('');
      onShowToast('Welcome, Toluwanimi. Root privileges granted.');
      loadAllData();
    } catch (err: any) {
      terminalSound.playError();
      setLoginError(err.message || 'Authentication rejected. Check password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    terminalSound.playKeyClick();
    removeAuthToken();
    setIsAuthenticated(false);
    onShowToast('Logged out of Admin Console.');
  };

  // ── Project Actions ────────────────────────────────────────────────────────
  const openCreateProject = () => {
    setSelectedProject({
      title: '',
      category: 'fullstack',
      badge: 'PROD',
      description: '',
      longDescription: '',
      tags: [],
      metrics: '',
      github: '',
      live: '',
      status: 'live',
      year: new Date().getFullYear().toString()
    });
    setTagsInput('');
    setProjectModalMode('create');
  };

  const openEditProject = (p: ProjectData) => {
    setSelectedProject({ ...p });
    setTagsInput(p.tags?.join(', ') || '');
    setProjectModalMode('edit');
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject.title) return;

    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      title: selectedProject.title,
      category: selectedProject.category || 'fullstack',
      badge: selectedProject.badge || 'PROD',
      description: selectedProject.description || '',
      longDescription: selectedProject.longDescription || '',
      tags: parsedTags,
      metrics: selectedProject.metrics || '',
      github: selectedProject.github || '',
      live: selectedProject.live || '',
      status: selectedProject.status || 'live',
      year: selectedProject.year || '2026'
    };

    try {
      if (projectModalMode === 'create') {
        const res = await createAdminProject(payload as any);
        setProjects(prev => [...prev, res.project]);
        onShowToast(`Created project: ${res.project.title}`);
      } else if (projectModalMode === 'edit' && selectedProject.id) {
        const res = await updateAdminProject(selectedProject.id, payload);
        setProjects(prev => prev.map(p => (p.id === selectedProject.id ? res.project : p)));
        onShowToast(`Updated project: ${res.project.title}`);
      }
      terminalSound.playSuccess();
      setProjectModalMode(null);
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error saving project: ${err.message}`);
    }
  };

  const deleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteAdminProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      terminalSound.playSuccess();
      onShowToast(`Project [ID: ${id}] deleted from database.`);
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error deleting project: ${err.message}`);
    }
  };

  // ── Profile Actions ────────────────────────────────────────────────────────
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await updateAdminProfile(profile);
      setProfile(res.profile);
      terminalSound.playSuccess();
      onShowToast('Profile & Neofetch telemetry updated in database.');
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error updating profile: ${err.message}`);
    }
  };

  // ── Experience Actions ─────────────────────────────────────────────────────
  const openCreateExp = () => {
    setSelectedExp({
      year: '2026',
      company: '',
      role: '',
      location: 'Remote',
      badge: 'Engineering',
      color: '#38bdf8',
      bullets: []
    });
    setBulletsInput('');
    setExpModalMode('create');
  };

  const openEditExp = (exp: ExperienceData) => {
    setSelectedExp({ ...exp });
    setBulletsInput(exp.bullets?.join('\n') || '');
    setExpModalMode('edit');
  };

  const saveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExp.company || !selectedExp.role) return;

    const parsedBullets = bulletsInput.split('\n').map(b => b.trim()).filter(Boolean);
    const payload = {
      year: selectedExp.year || '2026',
      company: selectedExp.company,
      role: selectedExp.role,
      location: selectedExp.location || 'Remote',
      badge: selectedExp.badge || 'Engineering',
      color: selectedExp.color || '#38bdf8',
      bullets: parsedBullets
    };

    try {
      if (expModalMode === 'create') {
        const res = await createAdminExperience(payload as any);
        setExperiences(prev => [...prev, res.experience]);
        onShowToast(`Added experience: ${res.experience.company}`);
      } else if (expModalMode === 'edit' && selectedExp.id) {
        const res = await updateAdminExperience(selectedExp.id, payload);
        setExperiences(prev => prev.map(e => (e.id === selectedExp.id ? res.experience : e)));
        onShowToast(`Updated experience: ${res.experience.company}`);
      }
      terminalSound.playSuccess();
      setExpModalMode(null);
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error saving experience: ${err.message}`);
    }
  };

  const deleteExp = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career entry?')) return;
    try {
      await deleteAdminExperience(id);
      setExperiences(prev => prev.filter(e => e.id !== id));
      terminalSound.playSuccess();
      onShowToast(`Experience entry deleted.`);
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error deleting experience: ${err.message}`);
    }
  };

  // ── FAQs Actions ───────────────────────────────────────────────────────────
  const openCreateFaq = () => {
    setSelectedFaq({ q: '', a: '', tags: [] });
    setFaqTagsInput('');
    setFaqModalMode('create');
  };

  const openEditFaq = (f: FaqData) => {
    setSelectedFaq({ ...f });
    setFaqTagsInput(f.tags?.join(', ') || '');
    setFaqModalMode('edit');
  };

  const saveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaq.q || !selectedFaq.a) return;
    const parsedTags = faqTagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { q: selectedFaq.q, a: selectedFaq.a, tags: parsedTags };

    try {
      if (faqModalMode === 'create') {
        const res = await createAdminFaq(payload as any);
        setFaqs(prev => [...prev, res.faq]);
        onShowToast('Created new AMA interview response.');
      } else if (faqModalMode === 'edit' && selectedFaq.id) {
        const res = await updateAdminFaq(selectedFaq.id, payload);
        setFaqs(prev => prev.map(f => (f.id === selectedFaq.id ? res.faq : f)));
        onShowToast('Updated AMA question.');
      }
      terminalSound.playSuccess();
      setFaqModalMode(null);
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error saving FAQ: ${err.message}`);
    }
  };

  const deleteFaq = async (id: number) => {
    if (!confirm('Delete this interview question?')) return;
    try {
      await deleteAdminFaq(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      terminalSound.playSuccess();
      onShowToast('Interview question deleted.');
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error deleting question: ${err.message}`);
    }
  };

  // ── Skills Actions ──────────────────────────────────────────────────────────
  const openCreateSkillCat = () => {
    setSelectedSkillCat({ key: '', title: '', skills: [] });
    setSkillsListInput('');
    setSkillModalMode('create');
  };

  const openEditSkillCat = (cat: SkillCategoryData) => {
    setSelectedSkillCat(cat);
    setSkillsListInput(cat.skills ? cat.skills.join(', ') : '');
    setSkillModalMode('edit');
  };

  const saveSkillCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillCat.key || !selectedSkillCat.title) return;
    const parsedSkills = skillsListInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let updatedList: SkillCategoryData[];
    const cleanKey = selectedSkillCat.key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (skillModalMode === 'create') {
      updatedList = [...skills, {
        key: cleanKey,
        title: selectedSkillCat.title,
        skills: parsedSkills,
      }];
    } else {
      updatedList = skills.map(s => s.key === selectedSkillCat.key ? {
        ...s,
        title: selectedSkillCat.title || s.title,
        skills: parsedSkills,
      } : s);
    }

    try {
      await updateAdminSkills(updatedList);
      setSkills(updatedList);
      setSkillModalMode(null);
      terminalSound.playSuccess();
      onShowToast('Skills category updated successfully!');
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error saving skills: ${err.message}`);
    }
  };

  const deleteSkillCat = async (key: string) => {
    if (!confirm(`Delete skill category "${key}"?`)) return;
    const updatedList = skills.filter(s => s.key !== key);
    try {
      await updateAdminSkills(updatedList);
      setSkills(updatedList);
      terminalSound.playSuccess();
      onShowToast(`Category ${key} deleted.`);
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error deleting skill category: ${err.message}`);
    }
  };

  // ── Message Actions ────────────────────────────────────────────────────────
  const toggleMessageRead = async (id: number, currentRead: boolean) => {
    try {
      const res = await markAdminMessageRead(id, !currentRead);
      setMessages(prev => prev.map(m => (m.id === id ? res.message : m)));
      terminalSound.playKeyClick();
    } catch (err: any) {
      onShowToast(`Error updating message: ${err.message}`);
    }
  };

  const deleteMsg = async (id: number) => {
    if (!confirm('Delete this contact inquiry?')) return;
    try {
      await deleteAdminMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      terminalSound.playSuccess();
      onShowToast('Message removed from inbox.');
    } catch (err: any) {
      terminalSound.playError();
      onShowToast(`Error deleting message: ${err.message}`);
    }
  };

  // ── Password Change ────────────────────────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPass || !newPass) return;
    try {
      const res = await changeAdminPassword(currPass, newPass);
      setPassChangeStatus(res.message);
      setCurrPass('');
      setNewPass('');
      terminalSound.playSuccess();
      onShowToast('Admin passphrase updated.');
    } catch (err: any) {
      terminalSound.playError();
      setPassChangeStatus(`Error: ${err.message}`);
    }
  };

  // ── RENDER: Checking Auth State ────────────────────────────────────────────
  if (isCheckingAuth) {
    return (
      <div className="p-8 text-center font-mono text-xs text-zinc-400">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--term-primary)]" />
        <p>Verifying root cryptographic handshake...</p>
      </div>
    );
  }

  // ── RENDER: Locked Gate Screen (Unauthenticated) ────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="max-w-md mx-auto my-8 p-6 bg-[#0c0c0e] border border-[var(--term-border)] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] font-mono text-xs text-[#e4e4e7]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#27272a] mb-5">
          <div className="flex items-center gap-2 text-[var(--term-bright)]">
            <ShieldCheck className="w-5 h-5 text-[var(--term-primary)]" />
            <span className="font-bold tracking-wider text-sm">ROOT PRIVILEGE GATE</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/40 text-[10px] font-bold">
            LOCKED
          </span>
        </div>

        <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
          ToluOS Administrator Console. Enter the portfolio owner master passphrase to unlock live database editing capabilities.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] text-[var(--term-primary)] font-bold mb-1.5 flex items-center gap-1">
              <Key className="w-3.5 h-3.5" />
              <span>Master Passphrase:</span>
            </label>
            <input
              type="password"
              required
              autoFocus
              value={passwordInput}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="e.g. tolu-admin-2026"
              className="w-full px-3 py-2 bg-[#141418] border border-[#27272a] focus:border-[var(--term-primary)] rounded text-xs text-white font-mono outline-none"
            />
          </div>

          {loginError && (
            <div className="p-2.5 rounded bg-red-950/60 border border-red-500/50 text-red-300 text-[11px] flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">
              Default: <code className="text-zinc-400">tolu-admin-2026</code>
            </span>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="px-4 py-2 bg-[var(--term-primary)] text-black font-bold rounded hover:opacity-90 active:scale-95 transition-all text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>Authenticate Root</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── RENDER: Authenticated Owner Dashboard ──────────────────────────────────
  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div
      className="space-y-5 font-mono text-xs text-[#e4e4e7]"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar */}
      <div className="p-4 bg-[#0c0c0e] border border-[var(--term-border)] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--term-primary)] text-black">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                ToluOS Owner Console
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                ROOT AUTH: ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>Database Engine:</span>
              <span className="text-[#38bdf8] font-bold flex items-center gap-1">
                <Database className="w-3 h-3" />
                {telemetry?.driver === 'postgres' ? 'Cloud Relational Cluster' : 'Local Persistent Engine'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={isLoadingData}
            className="px-3 py-1.5 rounded bg-[#18181b] border border-[#27272a] hover:bg-[#222228] text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/80 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            title="Logout from root session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
          { id: 'profile', label: 'Profile & Specs', icon: User },
          { id: 'experience', label: `Experience (${experiences.length})`, icon: Briefcase },
          { id: 'skills', label: 'Skills Stack', icon: Cpu },
          { id: 'faqs', label: `Recruiter AMA (${faqs.length})`, icon: HelpCircle },
          { id: 'messages', label: `Inbox (${messages.length})${unreadCount > 0 ? ` [${unreadCount} NEW]` : ''}`, icon: Mail, highlight: unreadCount > 0 },
          { id: 'security', label: 'Security & DB', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                terminalSound.playKeyClick();
                setActiveSubTab(tab.id as AdminTab);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all font-mono font-bold cursor-pointer touch-manipulation ${
                isActive
                  ? 'bg-[var(--term-primary)] text-black shadow-sm'
                  : tab.highlight
                  ? 'bg-amber-950/60 border border-amber-500/60 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-[#121216] border border-[#27272a] text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── SUB-TAB: OVERVIEW ───────────────────────────────────────────────── */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Total Projects</span>
              <div className="text-2xl font-bold text-white">{projects.length}</div>
              <span className="text-[10px] text-emerald-400">All live in DB</span>
            </div>

            <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Unread Messages</span>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <span>{unreadCount}</span>
                {unreadCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />}
              </div>
              <span className="text-[10px] text-zinc-400">~/contact.sh inbox</span>
            </div>

            <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Database Driver</span>
              <div className="text-base font-bold text-[#38bdf8] truncate">
                {telemetry?.driver === 'postgres' ? 'Cloud Cluster' : 'Local Store'}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">100% Operational</span>
            </div>

            <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Server Memory</span>
              <div className="text-base font-bold text-white">
                {telemetry?.memory ? `${telemetry.memory.heapUsedMb} MB` : '18.4 MB'}
              </div>
              <span className="text-[10px] text-zinc-400">Node {telemetry?.nodeVersion || 'v20'}</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--term-primary)]" />
              <span>Quick Actions</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActiveSubTab('projects');
                  openCreateProject();
                }}
                className="px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#222228] border border-[#27272a] text-zinc-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add New Project</span>
              </button>
              <button
                onClick={() => {
                  setActiveSubTab('experience');
                  openCreateExp();
                }}
                className="px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#222228] border border-[#27272a] text-zinc-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add Career Milestone</span>
              </button>
              <button
                onClick={() => {
                  setActiveSubTab('faqs');
                  openCreateFaq();
                }}
                className="px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#222228] border border-[#27272a] text-zinc-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Recruiter AMA Question</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB: PROJECTS ───────────────────────────────────────────────── */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-xs">
              Manage all portfolio projects. Changes reflect instantly on <span className="text-[#38bdf8]">~/projects/</span>.
            </p>
            <button
              onClick={openCreateProject}
              className="px-3 py-1.5 bg-[var(--term-primary)] text-black font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map(p => (
              <div key={p.id} className="p-3.5 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-2 relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[#38bdf8] font-bold mr-1">[{p.id}]</span>
                    <span className="font-bold text-white text-xs">{p.title}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#18181b] text-emerald-400 border border-[#27272a]">
                    {p.badge}
                  </span>
                </div>

                <p className="text-zinc-400 text-[11px] line-clamp-2">{p.description}</p>

                <div className="text-[10px] text-[var(--term-bright)]">➜ {p.metrics}</div>

                <div className="flex items-center justify-between pt-2 border-t border-[#18181b]">
                  <span className="text-zinc-500 text-[10px]">Year: {p.year}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditProject(p)}
                      className="p-1 rounded bg-[#18181b] hover:bg-zinc-800 text-zinc-300"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Project Create/Edit Modal */}
          {projectModalMode && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
              <div className="w-full max-w-lg bg-[#0c0c0e] border border-[var(--term-border)] rounded-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <h3 className="font-bold text-white text-sm">
                    {projectModalMode === 'create' ? 'Add New Project to Database' : `Edit Project [ID: ${selectedProject.id}]`}
                  </h3>
                  <button onClick={() => setProjectModalMode(null)} className="p-1 text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={saveProject} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Project Title:</label>
                    <input
                      type="text"
                      required
                      value={selectedProject.title || ''}
                      onChange={e => setSelectedProject({ ...selectedProject, title: e.target.value })}
                      placeholder="e.g. RIAUM — AI Mental Wellness"
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none focus:border-[var(--term-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Category:</label>
                      <select
                        value={selectedProject.category || 'fullstack'}
                        onChange={e => setSelectedProject({ ...selectedProject, category: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      >
                        <option value="ai">AI / LLM</option>
                        <option value="devtools">Developer Tools</option>
                        <option value="3d">3D WebGL / R3F</option>
                        <option value="fullstack">Full-Stack Web</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Badge Text:</label>
                      <input
                        type="text"
                        value={selectedProject.badge || ''}
                        onChange={e => setSelectedProject({ ...selectedProject, badge: e.target.value })}
                        placeholder="e.g. PROD LIVE"
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Short Description:</label>
                    <textarea
                      rows={2}
                      value={selectedProject.description || ''}
                      onChange={e => setSelectedProject({ ...selectedProject, description: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Metrics / Performance Highlights:</label>
                    <input
                      type="text"
                      value={selectedProject.metrics || ''}
                      onChange={e => setSelectedProject({ ...selectedProject, metrics: e.target.value })}
                      placeholder="e.g. Sub-2s page load · 100% Type-safe"
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Tags (comma-separated):</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      placeholder="React, TypeScript, Node.js, MongoDB"
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Live URL:</label>
                      <input
                        type="text"
                        value={selectedProject.live || ''}
                        onChange={e => setSelectedProject({ ...selectedProject, live: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">GitHub Repo URL:</label>
                      <input
                        type="text"
                        value={selectedProject.github || ''}
                        onChange={e => setSelectedProject({ ...selectedProject, github: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                    <button
                      type="button"
                      onClick={() => setProjectModalMode(null)}
                      className="px-3 py-1.5 rounded bg-[#18181b] text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[var(--term-primary)] text-black font-bold hover:opacity-90"
                    >
                      Save Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB: PROFILE & SPEC ─────────────────────────────────────────── */}
      {activeSubTab === 'profile' && profile && (
        <div className="p-5 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
            <div>
              <h3 className="font-bold text-white text-sm">Neofetch & Developer Profile Settings</h3>
              <p className="text-[11px] text-zinc-400">Controls Neofetch output on ~/welcome.sh and CV header.</p>
            </div>
            <button
              onClick={saveProfile}
              className="px-4 py-1.5 rounded bg-[var(--term-primary)] text-black font-bold hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

          <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Display Name:</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Engineering Title:</label>
              <input
                type="text"
                value={profile.title}
                onChange={e => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Status Line / Availability:</label>
              <input
                type="text"
                value={profile.status || ''}
                onChange={e => setProfile({ ...profile, status: e.target.value })}
                placeholder="● Available for Work"
                className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Location / Host Workstation:</label>
              <input
                type="text"
                value={profile.host || ''}
                onChange={e => setProfile({ ...profile, host: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Contact Email:</label>
              <input
                type="email"
                value={profile.contact_email || ''}
                onChange={e => setProfile({ ...profile, contact_email: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Years Experience / MAU Count:</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={profile.experience_years || 4}
                  onChange={e => setProfile({ ...profile, experience_years: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                />
                <input
                  type="number"
                  value={profile.mau_supported || 100000}
                  onChange={e => setProfile({ ...profile, mau_supported: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] text-zinc-400 mb-1">Core Tech Stack Description:</label>
              <input
                type="text"
                value={profile.core_stack || ''}
                onChange={e => setProfile({ ...profile, core_stack: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] text-zinc-400 mb-1">Summary Bio:</label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none resize-none"
              />
            </div>
          </form>
        </div>
      )}

      {/* ── SUB-TAB: EXPERIENCE ─────────────────────────────────────────────── */}
      {activeSubTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-xs">
              Career milestones rendered on <span className="text-[#38bdf8]">~/experience.log</span> and <span className="text-[#38bdf8]">~/about.sh</span>.
            </p>
            <button
              onClick={openCreateExp}
              className="px-3 py-1.5 bg-[var(--term-primary)] text-black font-bold rounded hover:opacity-90 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          <div className="space-y-3">
            {experiences.map(e => (
              <div key={e.id} className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">
                      [{e.year}] {e.company}
                    </h4>
                    <span className="text-[#38bdf8] text-[11px]">{e.role} · {e.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditExp(e)}
                      className="p-1 rounded bg-[#18181b] hover:bg-zinc-800 text-zinc-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteExp(e.id)}
                      className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <ul className="space-y-1 text-zinc-400 text-[11px] pl-2 border-l border-[#27272a]">
                  {e.bullets?.map((b, bi) => (
                    <li key={bi}>➜ {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Exp Modal */}
          {expModalMode && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
              <div className="w-full max-w-lg bg-[#0c0c0e] border border-[var(--term-border)] rounded-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <h3 className="font-bold text-white text-sm">
                    {expModalMode === 'create' ? 'Add Experience Entry' : 'Edit Experience Entry'}
                  </h3>
                  <button onClick={() => setExpModalMode(null)} className="p-1 text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={saveExp} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Company / Organization:</label>
                      <input
                        type="text"
                        required
                        value={selectedExp.company || ''}
                        onChange={e => setSelectedExp({ ...selectedExp, company: e.target.value })}
                        placeholder="e.g. ByTeom Technologies"
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Role Title:</label>
                      <input
                        type="text"
                        required
                        value={selectedExp.role || ''}
                        onChange={e => setSelectedExp({ ...selectedExp, role: e.target.value })}
                        placeholder="e.g. Lead Full-Stack Engineer"
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Years / Period:</label>
                      <input
                        type="text"
                        value={selectedExp.year || ''}
                        onChange={e => setSelectedExp({ ...selectedExp, year: e.target.value })}
                        placeholder="2023–PRES"
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Location:</label>
                      <input
                        type="text"
                        value={selectedExp.location || ''}
                        onChange={e => setSelectedExp({ ...selectedExp, location: e.target.value })}
                        placeholder="Dubai / Remote"
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Achievement Bullets (One per line):</label>
                    <textarea
                      rows={4}
                      value={bulletsInput}
                      onChange={e => setBulletsInput(e.target.value)}
                      placeholder="Shipped multi-gateway payment architecture..."
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none resize-none font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                    <button
                      type="button"
                      onClick={() => setExpModalMode(null)}
                      className="px-3 py-1.5 rounded bg-[#18181b] text-zinc-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[var(--term-primary)] text-black font-bold"
                    >
                      Save Experience
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB: SKILLS STACK ────────────────────────────────────────────── */}
      {activeSubTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-xs">
              Technical stack categories dynamically rendered on <span className="text-[#38bdf8]">~/skills.json</span>.
            </p>
            <button
              onClick={openCreateSkillCat}
              className="px-3 py-1.5 bg-[var(--term-primary)] text-black font-bold rounded hover:opacity-90 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skills.map(cat => (
              <div key={cat.key} className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-2.5">
                <div className="flex items-start justify-between gap-2 border-b border-[#18181b] pb-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono">key: "{cat.key}"</span>
                    <h4 className="font-bold text-white text-xs">{cat.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditSkillCat(cat)}
                      className="p-1 rounded bg-[#18181b] hover:bg-zinc-800 text-zinc-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSkillCat(cat.key)}
                      className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cat.skills?.map((s, si) => (
                    <span key={si} className="px-2 py-0.5 rounded bg-[#18181b] text-zinc-300 border border-[#27272a] text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Skill Modal */}
          {skillModalMode && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
              <div className="w-full max-w-lg bg-[#0c0c0e] border border-[var(--term-border)] rounded-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <h3 className="font-bold text-white text-sm">
                    {skillModalMode === 'create' ? 'Add Skill Category' : 'Edit Skill Category'}
                  </h3>
                  <button onClick={() => setSkillModalMode(null)} className="p-1 text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={saveSkillCat} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Category Key:</label>
                      <input
                        type="text"
                        required
                        disabled={skillModalMode === 'edit'}
                        value={selectedSkillCat.key || ''}
                        onChange={e => setSelectedSkillCat({ ...selectedSkillCat, key: e.target.value })}
                        placeholder="e.g. mobile_dev"
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Display Title:</label>
                      <input
                        type="text"
                        required
                        value={selectedSkillCat.title || ''}
                        onChange={e => setSelectedSkillCat({ ...selectedSkillCat, title: e.target.value })}
                        placeholder="e.g. Mobile Engineering"
                        className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Skills (Comma-separated):</label>
                    <textarea
                      rows={3}
                      required
                      value={skillsListInput}
                      onChange={e => setSkillsListInput(e.target.value)}
                      placeholder="React Native, Expo, Swift, Kotlin..."
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none resize-none font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                    <button
                      type="button"
                      onClick={() => setSkillModalMode(null)}
                      className="px-3 py-1.5 rounded bg-[#18181b] text-zinc-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[var(--term-primary)] text-black font-bold"
                    >
                      Save Skills
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB: FAQS / RECRUITER AMA ────────────────────────────────────── */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-xs">
              Recruiter AMA questions dynamically rendered on <span className="text-[#38bdf8]">~/about.sh</span>.
            </p>
            <button
              onClick={openCreateFaq}
              className="px-3 py-1.5 bg-[var(--term-primary)] text-black font-bold rounded hover:opacity-90 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map(f => (
              <div key={f.id} className="p-4 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-xs">Q: {f.q}</h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditFaq(f)}
                      className="p-1 rounded bg-[#18181b] hover:bg-zinc-800 text-zinc-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFaq(f.id)}
                      className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          {/* FAQ Modal */}
          {faqModalMode && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
              <div className="w-full max-w-lg bg-[#0c0c0e] border border-[var(--term-border)] rounded-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <h3 className="font-bold text-white text-sm">
                    {faqModalMode === 'create' ? 'Add Interview Question' : 'Edit Interview Question'}
                  </h3>
                  <button onClick={() => setFaqModalMode(null)} className="p-1 text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={saveFaq} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Question / Prompt:</label>
                    <input
                      type="text"
                      required
                      value={selectedFaq.q || ''}
                      onChange={e => setSelectedFaq({ ...selectedFaq, q: e.target.value })}
                      placeholder="e.g. How do you handle high-load backend scaling?"
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Answer / Response:</label>
                    <textarea
                      rows={5}
                      required
                      value={selectedFaq.a || ''}
                      onChange={e => setSelectedFaq({ ...selectedFaq, a: e.target.value })}
                      placeholder="Explain architecture, engineering philosophy, and measurable impact..."
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none resize-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Tags (comma-separated):</label>
                    <input
                      type="text"
                      value={faqTagsInput}
                      onChange={e => setFaqTagsInput(e.target.value)}
                      placeholder="Architecture, Scaling, Node.js"
                      className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
                    <button
                      type="button"
                      onClick={() => setFaqModalMode(null)}
                      className="px-3 py-1.5 rounded bg-[#18181b] text-zinc-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[var(--term-primary)] text-black font-bold"
                    >
                      Save Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB: INBOX / MESSAGES ────────────────────────────────────────── */}
      {activeSubTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-xs">
              Live inquiries received from visitors via <span className="text-[#38bdf8]">~/contact.sh</span>.
            </p>
            <span className="text-[11px] text-zinc-500">
              Total Messages: <strong className="text-white">{messages.length}</strong>
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="p-8 text-center bg-[#0c0c0e] border border-[#27272a] rounded-xl text-zinc-500">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Inbox clean. No incoming contact transmissions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all ${
                    m.is_read
                      ? 'bg-[#0c0c0e] border-[#27272a] text-zinc-400'
                      : 'bg-[#121217] border-emerald-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] text-[#e4e4e7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-[#18181b] pb-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{m.name}</span>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-[#38bdf8] text-[11px] hover:underline"
                        >
                          &lt;{m.email}&gt;
                        </a>
                        {!m.is_read && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleMessageRead(m.id, m.is_read)}
                        className="px-2 py-1 rounded bg-[#18181b] text-zinc-300 hover:text-white text-[10px]"
                      >
                        {m.is_read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={() => deleteMsg(m.id)}
                        className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB: SECURITY & DB SETTINGS ─────────────────────────────────── */}
      {activeSubTab === 'security' && (
        <div className="space-y-4 max-w-xl">
          <div className="p-5 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-[var(--term-primary)]" />
              <span>Change Master Admin Passphrase</span>
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Current Passphrase:</label>
                <input
                  type="password"
                  required
                  value={currPass}
                  onChange={e => setCurrPass(e.target.value)}
                  placeholder="Current master password"
                  className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">New Passphrase (min 6 chars):</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="New secure passphrase"
                  className="w-full px-3 py-1.5 bg-[#141418] border border-[#27272a] rounded text-white text-xs outline-none"
                />
              </div>

              {passChangeStatus && (
                <p className="text-xs text-[var(--term-bright)]">{passChangeStatus}</p>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-[var(--term-primary)] text-black font-bold rounded hover:opacity-90 cursor-pointer"
              >
                Update Password Hash
              </button>
            </form>
          </div>

          <div className="p-5 bg-[#0c0c0e] border border-[#27272a] rounded-xl space-y-2 text-zinc-400 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#38bdf8]" />
              <span>Database Cluster Info</span>
            </h4>
            <p>Database Status: <strong className="text-emerald-400">{telemetry?.databaseStatus || 'CONNECTED'}</strong></p>
            <p>Active Engine: <strong className="text-white">{telemetry?.driver === 'postgres' ? 'Relational Cluster (Online)' : (telemetry?.driver || 'Relational Engine')}</strong></p>
            <p className="text-[11px] text-zinc-500 mt-2">
              To connect to a remote database cluster (Supabase, Neon, AWS RDS), edit <code className="text-zinc-300">backend/.env</code> with your <code className="text-zinc-300">DATABASE_URL</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
