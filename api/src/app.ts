import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import licitacionesRouter from './routes/licitaciones.js';
import authRouter from './routes/auth.js';
import path from 'path';

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
  origin: (origin, callback) => {
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
app.use('/api/auth', authRouter);
app.use('/api/licitaciones', licitacionesRouter);

export default app;
