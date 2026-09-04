import { Router } from 'express';
import { rescueController } from './rescueController.js';

const router = Router();

// Feed & details
router.get('/feed', (req, res, next) => rescueController.getFeed(req, res, next));
router.get('/:id', (req, res, next) => rescueController.getDonationDetails(req, res, next));

// Reservation claim
router.post('/:id/reserve', (req, res, next) => rescueController.reserve(req, res, next));
router.get('/reservations/:id', (req, res, next) => rescueController.getReservation(req, res, next));

export default router;
