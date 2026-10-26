import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  INITIAL_PROFILE,
  INITIAL_PROJECTS,
  INITIAL_EXPERIENCES,
  INITIAL_SKILLS,
  INITIAL_FAQS,
  INITIAL_ACTIVITIES,
  SeedProject,
  SeedExperience,
  SeedSkillCategory,
  SeedFaq,
  SeedActivity
} from './seedData.js';

dotenv.config();

const { Pool } = pg;

export type DbDriver = 'postgres' | 'local_store';

let activeDriver: DbDriver = 'local_store';
let pool: pg.Pool | null = null;
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = isServerless ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

let memoryStore: LocalStoreData | null = null;

interface LocalStoreData {
  profile: typeof INITIAL_PROFILE;
  projects: SeedProject[];
  experiences: SeedExperience[];
  skills: SeedSkillCategory[];
  faqs: SeedFaq[];
  messages: Array<{
    id: number;
    name: string;
    email: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>;
  activities: SeedActivity[];
  admin_user: {
    username: string;
    password_hash: string;
  };
}

// Ensure local fallback store directory exists if possible
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem in serverless, will operate in-memory
}

function readLocalStore(): LocalStoreData {
  if (memoryStore) return memoryStore;

  if (fs.existsSync(STORE_PATH)) {
    try {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      memoryStore = JSON.parse(content);
      return memoryStore!;
    } catch {
      // Fallback to default
    }
  }

  const defaultAdminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'tolu-admin-2026', 10);
  const initialStore: LocalStoreData = {
    profile: { ...INITIAL_PROFILE },
    projects: [...INITIAL_PROJECTS],
    experiences: [...INITIAL_EXPERIENCES],
    skills: [...INITIAL_SKILLS],
    faqs: [...INITIAL_FAQS],
    messages: [],
    activities: [...INITIAL_ACTIVITIES],
    admin_user: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password_hash: defaultAdminHash
    }
  };

  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialStore, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem, maintain in memoryStore
  }
  memoryStore = initialStore;
  return initialStore;
}

function writeLocalStore(data: LocalStoreData) {
  memoryStore = data;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem, saved in memory
  }
}

// Ensure the portfolio database exists before connecting to it
async function ensureDatabaseExists(connectionString: string) {
  try {
    // Managed cloud database instances manage their own databases, skip check
    if (
      connectionString.includes('neon.tech') ||
      connectionString.includes('supabase.co') ||
      connectionString.includes('pooler.supabase.com') ||
      connectionString.includes('render.com') ||
      connectionString.includes('railway') ||
      process.env.VERCEL
    ) {
      return;
    }

    const url = new URL(connectionString);
    const targetDb = url.pathname.replace(/^\//, '');
    if (!targetDb || targetDb === 'postgres') return;

    const maintenanceUrl = new URL(connectionString);
    maintenanceUrl.pathname = '/postgres';

    const isSslRequired = connectionString.includes('sslmode=require') || connectionString.includes('supabase') || connectionString.includes('neon');
    const adminPool = new Pool({
      connectionString: maintenanceUrl.toString(),
      ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 3500,
    });

    const client = await adminPool.connect();
    try {
      const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
      if (res.rowCount === 0) {
        console.log(`[DB] Database "${targetDb}" not found. Creating database "${targetDb}"...`);
        await client.query(`CREATE DATABASE "${targetDb.replace(/"/g, '""')}"`);
        console.log(`[DB] Database "${targetDb}" created successfully.`);
      }
    } finally {
      client.release();
      await adminPool.end();
    }
  } catch (err: any) {
    // If maintenance check fails, allow direct connection to try
  }
}

// Initialize PostgreSQL Connection
export async function initDatabase(): Promise<DbDriver> {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/portfolio';
  
  try {
    await ensureDatabaseExists(connectionString);

    const isSslRequired = connectionString.includes('sslmode=require') ||
                          connectionString.includes('supabase') ||
                          connectionString.includes('neon') ||
                          connectionString.includes('render.com') ||
                          connectionString.includes('railway') ||
                          process.env.NODE_ENV === 'production' ||
                          !!process.env.VERCEL;

    pool = new Pool({
      connectionString,
      ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 3500,
      idleTimeoutMillis: 30000,
      max: isServerless ? 3 : 10
    });

    const client = await pool.connect();
    activeDriver = 'postgres';
    console.log(`[DB] Connected successfully to PostgreSQL database.`);
    
    // Create Tables if not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        bio TEXT NOT NULL,
        os TEXT,
        host TEXT,
        experience_years INT,
        mau_supported INT,
        shell TEXT,
        core_stack TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        status TEXT,
        location TEXT,
        github TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        badge TEXT,
        description TEXT,
        long_description TEXT,
        tags JSONB,
        metrics TEXT,
        github TEXT,
        live TEXT,
        status TEXT,
        year TEXT,
        sort_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        year TEXT NOT NULL,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT,
        badge TEXT,
        color TEXT,
        bullets JSONB,
        sort_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        skills JSONB,
        sort_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        q TEXT NOT NULL,
        a TEXT NOT NULL,
        tags JSONB,
        sort_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        location TEXT NOT NULL,
        icon TEXT NOT NULL,
        text TEXT NOT NULL,
        time_ago TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if initial seeding is needed
    const projectsCount = await client.query('SELECT COUNT(*) FROM projects');
    if (parseInt(projectsCount.rows[0].count, 10) === 0) {
      console.log('[DB] Seeding PostgreSQL with initial portfolio records...');
      
      // Seed Profile
      await client.query(`
        INSERT INTO profiles (name, title, bio, os, host, experience_years, mau_supported, shell, core_stack, contact_email, contact_phone, status, location, github)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        INITIAL_PROFILE.name,
        INITIAL_PROFILE.title,
        INITIAL_PROFILE.bio,
        INITIAL_PROFILE.os,
        INITIAL_PROFILE.host,
        INITIAL_PROFILE.experience_years,
        INITIAL_PROFILE.mau_supported,
        INITIAL_PROFILE.shell,
        INITIAL_PROFILE.core_stack,
        INITIAL_PROFILE.contact_email,
        INITIAL_PROFILE.contact_phone,
        INITIAL_PROFILE.status,
        INITIAL_PROFILE.location,
        INITIAL_PROFILE.github
      ]);

      // Seed Projects
      for (let i = 0; i < INITIAL_PROJECTS.length; i++) {
        const p = INITIAL_PROJECTS[i];
        await client.query(`
          INSERT INTO projects (title, category, badge, description, long_description, tags, metrics, github, live, status, year, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          p.title, p.category, p.badge, p.description, p.longDescription,
          JSON.stringify(p.tags), p.metrics, p.github, p.live, p.status, p.year, i
        ]);
      }

      // Seed Experiences
      for (let i = 0; i < INITIAL_EXPERIENCES.length; i++) {
        const e = INITIAL_EXPERIENCES[i];
        await client.query(`
          INSERT INTO experiences (year, company, role, location, badge, color, bullets, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          e.year, e.company, e.role, e.location, e.badge, e.color, JSON.stringify(e.bullets), i
        ]);
      }

      // Seed Skills
      for (let i = 0; i < INITIAL_SKILLS.length; i++) {
        const s = INITIAL_SKILLS[i];
        await client.query(`
          INSERT INTO skills (key, title, skills, sort_order)
          VALUES ($1, $2, $3, $4)
        `, [s.key, s.title, JSON.stringify(s.skills), i]);
      }

      // Seed FAQs
      for (let i = 0; i < INITIAL_FAQS.length; i++) {
        const f = INITIAL_FAQS[i];
        await client.query(`
          INSERT INTO faqs (q, a, tags, sort_order)
          VALUES ($1, $2, $3, $4)
        `, [f.q, f.a, JSON.stringify(f.tags), i]);
      }

      // Seed Activities
      for (const a of INITIAL_ACTIVITIES) {
        await client.query(`
          INSERT INTO activities (location, icon, text, time_ago)
          VALUES ($1, $2, $3, $4)
        `, [a.location, a.icon, a.text, a.timeAgo]);
      }

      // Seed Admin
      const initialHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'tolu-admin-2026', 10);
      await client.query(`
        INSERT INTO admin_users (username, password_hash)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
      `, [process.env.ADMIN_USERNAME || 'admin', initialHash]);

      console.log('[DB] PostgreSQL initial seeding complete.');
    }

    client.release();
    return 'postgres';
  } catch (err: any) {
    activeDriver = 'local_store';
    console.warn(`[DB WARNING] Could not connect to PostgreSQL (${err.message}).`);
    console.log(`[DB] Falling back seamlessly to local persistent JSON store (data/store.json).`);
    readLocalStore(); // Ensure store is initialized
    return 'local_store';
  }
}

export function getActiveDriver(): DbDriver {
  return activeDriver;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA ACCESS LAYER (Transparently routes to PostgreSQL or Local Fallback Store)
// ─────────────────────────────────────────────────────────────────────────────

// Profile
export async function getProfile() {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('SELECT * FROM profiles LIMIT 1');
    if (res.rows.length > 0) return res.rows[0];
  }
  return readLocalStore().profile;
}

export async function updateProfile(data: Partial<typeof INITIAL_PROFILE>) {
  if (activeDriver === 'postgres' && pool) {
    const current = await getProfile();
    const updated = { ...current, ...data };
    await pool.query(`
      UPDATE profiles SET
        name = $1, title = $2, bio = $3, os = $4, host = $5,
        experience_years = $6, mau_supported = $7, shell = $8,
        core_stack = $9, contact_email = $10, contact_phone = $11,
        status = $12, location = $13, github = $14, updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
    `, [
      updated.name, updated.title, updated.bio, updated.os, updated.host,
      updated.experience_years, updated.mau_supported, updated.shell,
      updated.core_stack, updated.contact_email, updated.contact_phone,
      updated.status, updated.location, updated.github, current.id || 1
    ]);
    return updated;
  } else {
    const store = readLocalStore();
    store.profile = { ...store.profile, ...data };
    writeLocalStore(store);
    return store.profile;
  }
}

// Projects
export async function getProjects() {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('SELECT id, title, category, badge, description, long_description as "longDescription", tags, metrics, github, live, status, year, sort_order FROM projects ORDER BY sort_order ASC, id ASC');
    return res.rows.map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
    }));
  }
  return readLocalStore().projects;
}

export async function createProject(p: Omit<SeedProject, 'id'>) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query(`
      INSERT INTO projects (title, category, badge, description, long_description, tags, metrics, github, live, status, year)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, title, category, badge, description, long_description as "longDescription", tags, metrics, github, live, status, year
    `, [
      p.title, p.category, p.badge, p.description, p.longDescription,
      JSON.stringify(p.tags || []), p.metrics, p.github, p.live, p.status, p.year
    ]);
    const r = res.rows[0];
    return { ...r, tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags };
  } else {
    const store = readLocalStore();
    const newId = store.projects.length > 0 ? Math.max(...store.projects.map(item => item.id)) + 1 : 1;
    const newProject = { id: newId, ...p };
    store.projects.push(newProject);
    writeLocalStore(store);
    return newProject;
  }
}

export async function updateProject(id: number, p: Partial<SeedProject>) {
  if (activeDriver === 'postgres' && pool) {
    const existing = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (existing.rows.length === 0) return null;
    const cur = existing.rows[0];
    const updated = {
      title: p.title ?? cur.title,
      category: p.category ?? cur.category,
      badge: p.badge ?? cur.badge,
      description: p.description ?? cur.description,
      long_description: p.longDescription ?? cur.long_description,
      tags: p.tags ? JSON.stringify(p.tags) : (typeof cur.tags === 'string' ? cur.tags : JSON.stringify(cur.tags)),
      metrics: p.metrics ?? cur.metrics,
      github: p.github ?? cur.github,
      live: p.live ?? cur.live,
      status: p.status ?? cur.status,
      year: p.year ?? cur.year
    };

    const res = await pool.query(`
      UPDATE projects SET
        title = $1, category = $2, badge = $3, description = $4,
        long_description = $5, tags = $6, metrics = $7, github = $8,
        live = $9, status = $10, year = $11
      WHERE id = $12
      RETURNING id, title, category, badge, description, long_description as "longDescription", tags, metrics, github, live, status, year
    `, [
      updated.title, updated.category, updated.badge, updated.description,
      updated.long_description, updated.tags, updated.metrics, updated.github,
      updated.live, updated.status, updated.year, id
    ]);
    const r = res.rows[0];
    return { ...r, tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags };
  } else {
    const store = readLocalStore();
    const idx = store.projects.findIndex(item => item.id === id);
    if (idx === -1) return null;
    store.projects[idx] = { ...store.projects[idx], ...p };
    writeLocalStore(store);
    return store.projects[idx];
  }
}

export async function deleteProject(id: number) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    return res.rowCount ? res.rowCount > 0 : false;
  } else {
    const store = readLocalStore();
    const initialLen = store.projects.length;
    store.projects = store.projects.filter(item => item.id !== id);
    writeLocalStore(store);
    return store.projects.length < initialLen;
  }
}

// Experiences
export async function getExperiences() {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('SELECT id, year, company, role, location, badge, color, bullets, sort_order FROM experiences ORDER BY sort_order ASC, id ASC');
    return res.rows.map(r => ({
      ...r,
      bullets: typeof r.bullets === 'string' ? JSON.parse(r.bullets) : r.bullets
    }));
  }
  return readLocalStore().experiences;
}

export async function createExperience(e: Omit<SeedExperience, 'id'>) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query(`
      INSERT INTO experiences (year, company, role, location, badge, color, bullets)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, year, company, role, location, badge, color, bullets
    `, [e.year, e.company, e.role, e.location, e.badge, e.color, JSON.stringify(e.bullets || [])]);
    const r = res.rows[0];
    return { ...r, bullets: typeof r.bullets === 'string' ? JSON.parse(r.bullets) : r.bullets };
  } else {
    const store = readLocalStore();
    const newId = store.experiences.length > 0 ? Math.max(...store.experiences.map(item => item.id)) + 1 : 1;
    const newExp = { id: newId, ...e };
    store.experiences.push(newExp);
    writeLocalStore(store);
    return newExp;
  }
}

export async function updateExperience(id: number, e: Partial<SeedExperience>) {
  if (activeDriver === 'postgres' && pool) {
    const existing = await pool.query('SELECT * FROM experiences WHERE id = $1', [id]);
    if (existing.rows.length === 0) return null;
    const cur = existing.rows[0];
    const updated = {
      year: e.year ?? cur.year,
      company: e.company ?? cur.company,
      role: e.role ?? cur.role,
      location: e.location ?? cur.location,
      badge: e.badge ?? cur.badge,
      color: e.color ?? cur.color,
      bullets: e.bullets ? JSON.stringify(e.bullets) : (typeof cur.bullets === 'string' ? cur.bullets : JSON.stringify(cur.bullets))
    };
    const res = await pool.query(`
      UPDATE experiences SET
        year = $1, company = $2, role = $3, location = $4,
        badge = $5, color = $6, bullets = $7
      WHERE id = $8
      RETURNING id, year, company, role, location, badge, color, bullets
    `, [updated.year, updated.company, updated.role, updated.location, updated.badge, updated.color, updated.bullets, id]);
    const r = res.rows[0];
    return { ...r, bullets: typeof r.bullets === 'string' ? JSON.parse(r.bullets) : r.bullets };
  } else {
    const store = readLocalStore();
    const idx = store.experiences.findIndex(item => item.id === id);
    if (idx === -1) return null;
    store.experiences[idx] = { ...store.experiences[idx], ...e };
    writeLocalStore(store);
    return store.experiences[idx];
  }
}

export async function deleteExperience(id: number) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('DELETE FROM experiences WHERE id = $1', [id]);
    return res.rowCount ? res.rowCount > 0 : false;
  } else {
    const store = readLocalStore();
    const initialLen = store.experiences.length;
    store.experiences = store.experiences.filter(item => item.id !== id);
    writeLocalStore(store);
    return store.experiences.length < initialLen;
  }
}

// Skills
export async function getSkills() {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('SELECT key, title, skills, sort_order FROM skills ORDER BY sort_order ASC, id ASC');
    return res.rows.map(r => ({
      key: r.key,
      title: r.title,
      skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills
    }));
  }
  return readLocalStore().skills;
}

export async function updateSkills(categories: SeedSkillCategory[]) {
  if (activeDriver === 'postgres' && pool) {
    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      await pool.query(`
        INSERT INTO skills (key, title, skills, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (key) DO UPDATE SET
          title = EXCLUDED.title,
          skills = EXCLUDED.skills,
          sort_order = EXCLUDED.sort_order
      `, [c.key, c.title, JSON.stringify(c.skills), i]);
    }
    return getSkills();
  } else {
    const store = readLocalStore();
    store.skills = categories;
    writeLocalStore(store);
    return store.skills;
  }
}

// FAQs (Recruiter AMA)
export async function getFaqs() {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('SELECT id, q, a, tags, sort_order FROM faqs ORDER BY sort_order ASC, id ASC');
    return res.rows.map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
    }));
  }
  return readLocalStore().faqs;
}

export async function createFaq(faq: Omit<SeedFaq, 'id'>) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query(`
      INSERT INTO faqs (q, a, tags)
      VALUES ($1, $2, $3)
      RETURNING id, q, a, tags
    `, [faq.q, faq.a, JSON.stringify(faq.tags || [])]);
    const r = res.rows[0];
    return { ...r, tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags };
  } else {
    const store = readLocalStore();
    const newId = store.faqs.length > 0 ? Math.max(...store.faqs.map(item => item.id)) + 1 : 1;
    const newFaq = { id: newId, ...faq };
    store.faqs.push(newFaq);
    writeLocalStore(store);
    return newFaq;
  }
}

export async function updateFaq(id: number, faq: Partial<SeedFaq>) {
  if (activeDriver === 'postgres' && pool) {
    const existing = await pool.query('SELECT * FROM faqs WHERE id = $1', [id]);
    if (existing.rows.length === 0) return null;
    const cur = existing.rows[0];
    const updated = {
      q: faq.q ?? cur.q,
      a: faq.a ?? cur.a,
      tags: faq.tags ? JSON.stringify(faq.tags) : (typeof cur.tags === 'string' ? cur.tags : JSON.stringify(cur.tags))
    };
    const res = await pool.query(`
      UPDATE faqs SET q = $1, a = $2, tags = $3 WHERE id = $4
      RETURNING id, q, a, tags
    `, [updated.q, updated.a, updated.tags, id]);
    const r = res.rows[0];
    return { ...r, tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags };
  } else {
    const store = readLocalStore();
    const idx = store.faqs.findIndex(item => item.id === id);
    if (idx === -1) return null;
    store.faqs[idx] = { ...store.faqs[idx], ...faq };
    writeLocalStore(store);
    return store.faqs[idx];
  }
}

export async function deleteFaq(id: number) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('DELETE FROM faqs WHERE id = $1', [id]);
    return res.rowCount ? res.rowCount > 0 : false;
  } else {
    const store = readLocalStore();
    const initialLen = store.faqs.length;
    store.faqs = store.faqs.filter(item => item.id !== id);
    writeLocalStore(store);
    return store.faqs.length < initialLen;
  }
}

// Messages (Contact Form Inquiries)
export async function getMessages() {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    return res.rows;
  }
  return readLocalStore().messages;
}

export async function createMessage(msg: { name: string; email: string; message: string }) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query(`
      INSERT INTO messages (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [msg.name, msg.email, msg.message]);
    return res.rows[0];
  } else {
    const store = readLocalStore();
    const newId = store.messages.length > 0 ? Math.max(...store.messages.map(item => item.id)) + 1 : 1;
    const newMsg = {
      id: newId,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      is_read: false,
      created_at: new Date().toISOString()
    };
    store.messages.unshift(newMsg);
    writeLocalStore(store);
    return newMsg;
  }
}

export async function markMessageRead(id: number, isRead: boolean) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('UPDATE messages SET is_read = $1 WHERE id = $2 RETURNING *', [isRead, id]);
    return res.rows[0] || null;
  } else {
    const store = readLocalStore();
    const m = store.messages.find(item => item.id === id);
    if (!m) return null;
    m.is_read = isRead;
    writeLocalStore(store);
    return m;
  }
}

export async function deleteMessage(id: number) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    return res.rowCount ? res.rowCount > 0 : false;
  } else {
    const store = readLocalStore();
    const initialLen = store.messages.length;
    store.messages = store.messages.filter(item => item.id !== id);
    writeLocalStore(store);
    return store.messages.length < initialLen;
  }
}

// Activities (Hacker mesh stream)
export async function getActivities() {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('SELECT id, location, icon, text, time_ago as "timeAgo" FROM activities ORDER BY created_at DESC LIMIT 15');
    return res.rows;
  }
  return readLocalStore().activities;
}

export async function createActivity(act: { location: string; icon: string; text: string; timeAgo?: string }) {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query(`
      INSERT INTO activities (location, icon, text, time_ago)
      VALUES ($1, $2, $3, $4)
      RETURNING id, location, icon, text, time_ago as "timeAgo"
    `, [act.location, act.icon, act.text, act.timeAgo || 'Just now']);
    return res.rows[0];
  } else {
    const store = readLocalStore();
    const newId = store.activities.length > 0 ? Math.max(...store.activities.map(item => item.id)) + 1 : 1;
    const newAct = { id: newId, location: act.location, icon: act.icon, text: act.text, timeAgo: act.timeAgo || 'Just now' };
    store.activities.unshift(newAct);
    writeLocalStore(store);
    return newAct;
  }
}

// Admin User Authentication
export async function getAdminUser() {
  if (activeDriver === 'postgres' && pool) {
    const res = await pool.query('SELECT * FROM admin_users LIMIT 1');
    if (res.rows.length > 0) return res.rows[0];
  }
  return readLocalStore().admin_user;
}

export async function updateAdminPassword(newPasswordHash: string) {
  if (activeDriver === 'postgres' && pool) {
    await pool.query('UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP', [newPasswordHash]);
    return true;
  } else {
    const store = readLocalStore();
    store.admin_user.password_hash = newPasswordHash;
    writeLocalStore(store);
    return true;
  }
}

// System Telemetry
export async function getSystemTelemetry() {
  const mem = process.memoryUsage();
  const uptime = Math.floor(process.uptime());
  
  let projectsCount = 0;
  let unreadMessages = 0;

  if (activeDriver === 'postgres' && pool) {
    try {
      const pRes = await pool.query('SELECT COUNT(*) FROM projects');
      projectsCount = parseInt(pRes.rows[0].count, 10);
      const mRes = await pool.query('SELECT COUNT(*) FROM messages WHERE is_read = false');
      unreadMessages = parseInt(mRes.rows[0].count, 10);
    } catch {
      // fallback
    }
  } else {
    const store = readLocalStore();
    projectsCount = store.projects.length;
    unreadMessages = store.messages.filter(m => !m.is_read).length;
  }

  return {
    driver: activeDriver,
    nodeVersion: process.version,
    uptimeSeconds: uptime,
    memory: {
      rssMb: +(mem.rss / (1024 * 1024)).toFixed(1),
      heapUsedMb: +(mem.heapUsed / (1024 * 1024)).toFixed(1),
      heapTotalMb: +(mem.heapTotal / (1024 * 1024)).toFixed(1)
    },
    counts: {
      projects: projectsCount,
      unreadMessages
    },
    databaseStatus: activeDriver === 'postgres' ? 'CONNECTED_POSTGRES' : 'RUNNING_LOCAL_STORE'
  };
}
