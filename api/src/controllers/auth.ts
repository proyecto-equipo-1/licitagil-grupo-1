import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * POST /auth/register
 * Registrar nuevo usuario
 */
export async function register(req: Request, res: Response) {
  try {
    // Validar datos de entrada
    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors 
      });
    }

    const { email, password, name } = validation.data;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generar token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

/**
 * POST /auth/login
 * Iniciar sesión
 */
export async function login(req: Request, res: Response) {
  try {
    // Validar datos de entrada
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors 
      });
    }

    const { email, password } = validation.data;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      });
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      });
    }

    // Generar token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

/**
 * GET /auth/user
 * Obtener datos del usuario autenticado
 */
export async function getUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Error en getUser:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
}

/**
 * POST /auth/logout
 * Cerrar sesión (en frontend se elimina el token)
 */
export function logout(req: Request, res: Response) {
  // En un sistema basado en JWT, el logout se maneja en el cliente
  // eliminando el token del localStorage
  // Aquí solo confirmamos la acción
  res.json({ message: 'Sesión cerrada exitosamente' });
}
