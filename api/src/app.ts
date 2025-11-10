import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import licitacionesRouter from './routes/licitaciones.js';
import authRouter from './routes/auth.js';
import departamentosRouter from './routes/departamentos.js';
import path from 'path';
import { prisma } from './db/prisma.js';

const app = express();

// Configuración de CORS más flexible para producción
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
  // Permitir dominios de AWS Amplify
  /\.amplifyapp\.com$/,
].filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (como Postman o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está permitido
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Servir archivos PDF estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Endpoint de debug (TEMPORAL - remover en producción)
app.get('/api/debug/config', (_req, res) => {
  const dbUrl = process.env.DATABASE_URL || 'not set';
  const dbUrlMasked = dbUrl.replace(/:[^:@]+@/, ':****@'); // Ocultar password
  
  res.json({
    env: process.env.NODE_ENV,
    databaseUrl: dbUrlMasked,
    cwd: process.cwd(),
    port: process.env.PORT,
    corsOrigin: process.env.CORS_ORIGIN,
  });
});

app.get('/api/debug/db-stats', async (_req, res) => {
  try {
    const [userCount, licitacionCount] = await Promise.all([
      prisma.user.count(),
      prisma.licitacion.count(),
    ]);
    
    const recentLicitaciones = await prisma.licitacion.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      select: {
        id: true,
        titulo: true,
        estado: true,
        estadoValidacion: true,
        pdfPath: true,
        fechaCreacion: true,
      }
    });
    
    res.json({
      stats: {
        users: userCount,
        licitaciones: licitacionCount,
      },
      recentLicitaciones,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/licitaciones', licitacionesRouter);
app.use('/api/departamentos', departamentosRouter);

export default app;
