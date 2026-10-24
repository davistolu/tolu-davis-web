import { Router, Request, Response } from 'express';
import {
  getProfile,
  getProjects,
  getExperiences,
  getSkills,
  getFaqs,
  getActivities,
  createMessage,
  createActivity,
  getSystemTelemetry
} from '../db/db.js';

const router = Router();

// GET /api/profile
router.get('/profile', async (_req: Request, res: Response) => {
  try {
    const profile = await getProfile();
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch profile' });
  }
});

// GET /api/projects
router.get('/projects', async (_req: Request, res: Response) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch projects' });
  }
});

// GET /api/experiences
router.get('/experiences', async (_req: Request, res: Response) => {
  try {
    const experiences = await getExperiences();
    res.json(experiences);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch experiences' });
  }
});

// GET /api/skills
router.get('/skills', async (_req: Request, res: Response) => {
  try {
    const skills = await getSkills();
    res.json(skills);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch skills' });
  }
});

// GET /api/faqs
router.get('/faqs', async (_req: Request, res: Response) => {
  try {
    const faqs = await getFaqs();
    res.json(faqs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch FAQs' });
  }
});

// GET /api/activities
router.get('/activities', async (_req: Request, res: Response) => {
  try {
    const activities = await getActivities();
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch activities' });
  }
});

// GET /api/telemetry
router.get('/telemetry', async (_req: Request, res: Response) => {
  try {
    const telemetry = await getSystemTelemetry();
    res.json(telemetry);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch telemetry' });
  }
});

// POST /api/messages (Submit contact inquiry from ~/contact.sh)
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const created = await createMessage({ name, email, message });

    // Also push a live world activity event!
    await createActivity({
      location: 'Visitor Terminal',
      icon: '✉️',
      text: `${name} dispatched packet via ~/contact.sh`,
      timeAgo: 'Just now'
    });

    res.status(201).json({
      success: true,
      message: 'Transmission successfully written to database buffer.',
      data: created
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record message' });
  }
});

export default router;
