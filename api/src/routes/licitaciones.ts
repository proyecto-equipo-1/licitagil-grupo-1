import { Router } from 'express';
import * as c from '../controllers/licitaciones.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(process.cwd(), 'uploads'));
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	}
});
const upload = multer({ storage });

const r = Router();
r.get('/', c.list);
r.get('/:id', c.getOne);
r.get('/:id/pdf', c.getPdf);
r.post('/', upload.single('pdf'), c.create);
r.put('/:id', upload.single('pdf'), c.update);
r.delete('/:id', c.remove);
export default r;
