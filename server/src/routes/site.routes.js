import { Router } from 'express';
// ✅ Import the new middleware
import { auth, adminOrBuilderOnly } from '../middleware/auth.js';
import { createSite, listSites, getSite, deleteSite } from '../controllers/site.controller.js';

const router = Router();

// This makes sure ALL site routes require login
router.use(auth);

// GET routes are accessible to everyone who is logged in
router.get('/', listSites);
router.get('/:id', getSite);

// ✅ Protect POST and DELETE routes
router.post('/', adminOrBuilderOnly, createSite);
router.delete('/:id', adminOrBuilderOnly, deleteSite);

export default router;