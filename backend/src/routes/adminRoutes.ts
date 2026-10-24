import { Router, Response } from 'express';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';
import {
  updateProfile,
  createProject,
  updateProject,
  deleteProject,
  createExperience,
  updateExperience,
  deleteExperience,
  updateSkills,
  createFaq,
  updateFaq,
  deleteFaq,
  getMessages,
  markMessageRead,
  deleteMessage,
  createActivity
} from '../db/db.js';

const router = Router();

// Protect all admin endpoints
router.use(requireAdminAuth);

// ── Profile ──────────────────────────────────────────────────────────────────
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateProfile(req.body);
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// ── Projects CRUD ────────────────────────────────────────────────────────────
router.post('/projects', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await createProject(req.body);
    res.status(201).json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project' });
  }
});

router.put('/projects/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const updated = await updateProject(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, project: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update project' });
  }
});

router.delete('/projects/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const ok = await deleteProject(id);
    if (!ok) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete project' });
  }
});

// ── Experiences CRUD ─────────────────────────────────────────────────────────
router.post('/experiences', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const exp = await createExperience(req.body);
    res.status(201).json({ success: true, experience: exp });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create experience' });
  }
});

router.put('/experiences/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const updated = await updateExperience(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Experience not found' });
    res.json({ success: true, experience: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update experience' });
  }
});

router.delete('/experiences/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const ok = await deleteExperience(id);
    if (!ok) return res.status(404).json({ error: 'Experience not found' });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete experience' });
  }
});

// ── Skills ───────────────────────────────────────────────────────────────────
router.put('/skills', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateSkills(req.body.skills || req.body);
    res.json({ success: true, skills: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update skills' });
  }
});

// ── FAQs (Recruiter AMA) ─────────────────────────────────────────────────────
router.post('/faqs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faq = await createFaq(req.body);
    res.status(201).json({ success: true, faq });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create FAQ' });
  }
});

router.put('/faqs/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const updated = await updateFaq(id, req.body);
    if (!updated) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ success: true, faq: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update FAQ' });
  }
});

router.delete('/faqs/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const ok = await deleteFaq(id);
    if (!ok) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete FAQ' });
  }
});

// ── Messages Inbox ───────────────────────────────────────────────────────────
router.get('/messages', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = await getMessages();
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch messages' });
  }
});

router.put('/messages/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const isRead = req.body.is_read !== undefined ? Boolean(req.body.is_read) : true;
    const updated = await markMessageRead(id, isRead);
    if (!updated) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true, message: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update message' });
  }
});

router.delete('/messages/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const ok = await deleteMessage(id);
    if (!ok) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete message' });
  }
});

// ── Activities ───────────────────────────────────────────────────────────────
router.post('/activities', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const act = await createActivity(req.body);
    res.status(201).json({ success: true, activity: act });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create activity' });
  }
});

export default router;
