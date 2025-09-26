import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('role').isIn(['admin', 'builder', 'painter', 'plumber', 'carpenter', 'electrician']),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  register
);

router.post('/login', login);
router.get('/me', auth, me);

router.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign(
      { id: payload.id, role: payload.role }, // Pass role in new token
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});

export default router;