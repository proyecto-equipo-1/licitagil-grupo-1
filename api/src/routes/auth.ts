import { Router } from 'express';
import { register, login, getUser, logout } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Rutas protegidas (requieren autenticación)
router.get('/user', authMiddleware, getUser);

export default router;
