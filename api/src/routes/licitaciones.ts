import { Router } from 'express';
import * as c from '../controllers/licitaciones.js';
import multer from 'multer';
import path from 'path';
import { getUploadsPath } from '../utils/paths.js';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadsPath = getUploadsPath();
		cb(null, uploadsPath);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	}
});
const upload = multer({ storage });

const r = Router();
// Rutas específicas PRIMERO (antes de las rutas con parámetros)
r.get('/plantilla/descargar', c.descargarPlantilla);
r.get('/', c.list);
r.get('/:id', c.getOne);
r.get('/:id/pdf', c.getPdf);
r.post('/', upload.single('pdf'), c.create);
r.post('/:id/revalidar', c.revalidarPdf);
r.put('/:id', upload.single('pdf'), c.update);
r.delete('/:id', c.remove);
export default r;
