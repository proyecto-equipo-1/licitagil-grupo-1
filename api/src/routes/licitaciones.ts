import { Router } from 'express';
import * as c from '../controllers/licitaciones.js';

const r = Router();
r.get('/', c.list);
r.get('/:id', c.getOne);
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);
export default r;
