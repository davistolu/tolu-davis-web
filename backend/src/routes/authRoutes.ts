import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAdminUser, updateAdminPassword } from '../db/db.js';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const admin = await getAdminUser();
    // Allow either matching username or default admin login
    const targetUsername = username || process.env.ADMIN_USERNAME || 'admin';
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid master passphrase or credentials.' });
    }

    const secret = process.env.JWT_SECRET || 'super-secret-cyber-jwt-key-2026-toluwanimi-davis';
    const token = jwt.sign(
      { username: targetUsername, role: 'owner' },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        username: targetUsername,
        role: 'owner'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// GET /api/auth/verify
router.get('/verify', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// POST /api/auth/change-password
router.post('/change-password', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const admin = await getAdminUser();
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updateAdminPassword(newHash);

    res.json({ success: true, message: 'Admin master passphrase updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Password update failed' });
  }
});

export default router;
