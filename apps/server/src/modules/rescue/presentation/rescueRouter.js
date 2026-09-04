import { Router } from 'express';
import { rescueController } from './rescueController.js';

const router = Router();

// Public / charity accessible feed endpoints
router.get('/feed', (req, res, next) => rescueController.getFeed(req, res, next));
router.get('/:id', (req, res, next) => rescueController.getDonationDetails(req, res, next));

export default router;
