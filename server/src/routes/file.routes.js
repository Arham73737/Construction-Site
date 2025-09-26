import { Router } from 'express';
import { streamFile } from '../controllers/file.controller.js';

const router = Router();
router.get('/:id', streamFile);
export default router;
