import { Router } from 'express';
import {
  createDonation,
  getAllDonations,
  getDonationMetrics,
  getDonationById,
  updateDonationStatus,
  updateDonation,
  deleteDonation,
} from '../business/donation.service.js';

export const donorsRouter = Router();

// GET /api/donations/metrics - Fetch dashboard metric totals
donorsRouter.get('/metrics', async (_req, res) => {
  try {
    const metrics = await getDonationMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/donations - List food donations
donorsRouter.get('/', async (req, res) => {
  try {
    const { status, query } = req.query;
    const items = await getAllDonations({ status, query });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/donations/:id - Fetch single donation details
donorsRouter.get('/:id', async (req, res) => {
  try {
    const item = await getDonationById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/donations - Add new food donation listing
donorsRouter.post('/', async (req, res) => {
  try {
    const created = await createDonation(req.body);
    res.status(201).json({
      success: true,
      message: 'Food donation published successfully',
      data: created,
    });
  } catch (error) {
    const isValidationError = error.message.includes('Validation Error');
    res.status(isValidationError ? 400 : 500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/donations/:id - Update full food donation details
donorsRouter.put('/:id', async (req, res) => {
  try {
    const updated = await updateDonation(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Food donation updated successfully',
      data: updated,
    });
  } catch (error) {
    const isValidationError = error.message.includes('Validation Error');
    res.status(isValidationError ? 400 : 500).json({
      success: false,
      error: error.message,
    });
  }
});

// PATCH /api/donations/:id/status - Update listing status (e.g. collected)
donorsRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const updated = await updateDonationStatus(req.params.id, status);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// DELETE /api/donations/:id - Cancel/Delete food donation
donorsRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteDonation(req.params.id);
    res.json({ success: true, message: 'Donation deleted successfully', data: deleted });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});
