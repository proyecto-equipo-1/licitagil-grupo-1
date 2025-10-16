import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import licitacionesRouter from './routes/licitaciones.js';
import path from 'path';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos PDF estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.use('/api/licitaciones', licitacionesRouter);

export default app;
