// API Client for Toluwanimi Davis Portfolio Backend

export interface ProfileData {
  id?: number;
  name: string;
  title: string;
  bio: string;
  os?: string;
  host?: string;
  experience_years?: number;
  mau_supported?: number;
  shell?: string;
  core_stack?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: string;
  location?: string;
  github?: string;
}

export interface ProjectData {
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
  sort_order?: number;
}

export interface ExperienceData {
  id: number;
  year: string;
  company: string;
  role: string;
  location: string;
  badge: string;
  color: string;
  bullets: string[];
  sort_order?: number;
}

export interface SkillCategoryData {
  key: string;
  title: string;
  skills: string[];
}

export interface FaqData {
  id: number;
  q: string;
  a: string;
  tags: string[];
}

export interface ActivityData {
  id: number;
  location: string;
  icon: string;
  text: string;
  timeAgo: string;
}

export interface ContactMessageData {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface TelemetryData {
  driver: 'postgres' | 'local_store';
  nodeVersion: string;
  uptimeSeconds: number;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  counts: {
    projects: number;
    unreadMessages: number;
  };
  databaseStatus: string;
}

const AUTH_KEY = 'toluos_admin_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_KEY, token);
  } catch {}
}

export function removeAuthToken() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {}
}

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function fetchProfile(): Promise<ProfileData> {
  return request<ProfileData>('/profile');
}

export async function fetchProjects(): Promise<ProjectData[]> {
  return request<ProjectData[]>('/projects');
}

export async function fetchExperiences(): Promise<ExperienceData[]> {
  return request<ExperienceData[]>('/experiences');
}

export async function fetchSkills(): Promise<SkillCategoryData[]> {
  return request<SkillCategoryData[]>('/skills');
}

export async function fetchFaqs(): Promise<FaqData[]> {
  return request<FaqData[]>('/faqs');
}

export async function fetchActivities(): Promise<ActivityData[]> {
  return request<ActivityData[]>('/activities');
}

export async function fetchTelemetry(): Promise<TelemetryData> {
  return request<TelemetryData>('/telemetry');
}

export async function sendContactMessage(name: string, email: string, message: string) {
  return request<{ success: boolean; data: ContactMessageData }>('/messages', {
    method: 'POST',
    body: JSON.stringify({ name, email, message }),
  });
}

// ── Admin Authentication API ─────────────────────────────────────────────────

export async function loginAdmin(password: string, username?: string) {
  const res = await request<{ success: boolean; token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (res.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function verifyAdminSession() {
  return request<{ valid: boolean; user: any }>('/auth/verify');
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  return request<{ success: boolean; message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ── Admin Protected CRUD API ─────────────────────────────────────────────────

export async function updateAdminProfile(data: Partial<ProfileData>) {
  return request<{ success: boolean; profile: ProfileData }>('/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function createAdminProject(data: Omit<ProjectData, 'id'>) {
  return request<{ success: boolean; project: ProjectData }>('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminProject(id: number, data: Partial<ProjectData>) {
  return request<{ success: boolean; project: ProjectData }>(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminProject(id: number) {
  return request<{ success: boolean; id: number }>(`/admin/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function createAdminExperience(data: Omit<ExperienceData, 'id'>) {
  return request<{ success: boolean; experience: ExperienceData }>('/admin/experiences', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminExperience(id: number, data: Partial<ExperienceData>) {
  return request<{ success: boolean; experience: ExperienceData }>(`/admin/experiences/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminExperience(id: number) {
  return request<{ success: boolean; id: number }>(`/admin/experiences/${id}`, {
    method: 'DELETE',
  });
}

export async function updateAdminSkills(skills: SkillCategoryData[]) {
  return request<{ success: boolean; skills: SkillCategoryData[] }>('/admin/skills', {
    method: 'PUT',
    body: JSON.stringify({ skills }),
  });
}

export async function createAdminFaq(data: Omit<FaqData, 'id'>) {
  return request<{ success: boolean; faq: FaqData }>('/admin/faqs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminFaq(id: number, data: Partial<FaqData>) {
  return request<{ success: boolean; faq: FaqData }>(`/admin/faqs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminFaq(id: number) {
  return request<{ success: boolean; id: number }>(`/admin/faqs/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminMessages(): Promise<ContactMessageData[]> {
  return request<ContactMessageData[]>('/admin/messages');
}

export async function markAdminMessageRead(id: number, isRead: boolean) {
  return request<{ success: boolean; message: ContactMessageData }>(`/admin/messages/${id}/read`, {
    method: 'PUT',
    body: JSON.stringify({ is_read: isRead }),
  });
}

export async function deleteAdminMessage(id: number) {
  return request<{ success: boolean; id: number }>(`/admin/messages/${id}`, {
    method: 'DELETE',
  });
}
