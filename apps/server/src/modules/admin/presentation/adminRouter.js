import { Router } from 'express';
import { adminService } from '../business/adminService.js';

const router = Router();

function ok(res, data, message) {
  res.json({ status: 'success', ...(message ? { message } : {}), data });
}

async function handle(handler, req, res, next) {
  try {
    await handler(req, res);
  } catch (err) {
    next(err);
  }
}

// --- Dashboard overview -------------------------------------------------
router.get('/overview', (req, res, next) =>
  handle(async (req, res) => ok(res, await adminService.getOverview()), req, res, next),
);

// --- Restaurant registry ------------------------------------------------
router.get('/restaurants', (req, res, next) =>
  handle(
    async (req, res) =>
      ok(
        res,
        await adminService.listRestaurants({
          status: req.query.status,
          q: req.query.q,
        }),
      ),
    req,
    res,
    next,
  ),
);

router.patch('/restaurants/:id', (req, res, next) =>
  handle(
    async (req, res) =>
      ok(
        res,
        await adminService.changeRestaurantStatus(req.params.id, req.body?.action),
        'Restaurant updated.',
      ),
    req,
    res,
    next,
  ),
);

// --- Charity registry ---------------------------------------------------
router.get('/charities', (req, res, next) =>
  handle(
    async (req, res) =>
      ok(
        res,
        await adminService.listCharities({
          status: req.query.status,
          q: req.query.q,
        }),
      ),
    req,
    res,
    next,
  ),
);

router.patch('/charities/:id', (req, res, next) =>
  handle(
    async (req, res) =>
      ok(
        res,
        await adminService.changeCharityStatus(req.params.id, req.body?.action),
        'Charity updated.',
      ),
    req,
    res,
    next,
  ),
);

// --- Donation monitoring ------------------------------------------------
router.get('/donations', (req, res, next) =>
  handle(
    async (req, res) =>
      ok(
        res,
        await adminService.listDonations({
          status: req.query.status,
          flagged: req.query.flagged,
        }),
      ),
    req,
    res,
    next,
  ),
);

router.post('/donations/:id/flag', (req, res, next) =>
  handle(
    async (req, res) =>
      ok(
        res,
        await adminService.flagDonation(req.params.id, req.body?.reason),
        'Donation flagged.',
      ),
    req,
    res,
    next,
  ),
);

router.post('/donations/:id/remove', (req, res, next) =>
  handle(
    async (req, res) =>
      ok(
        res,
        await adminService.removeDonation(req.params.id),
        'Donation removed.',
      ),
    req,
    res,
    next,
  ),
);

// --- Impact analytics ---------------------------------------------------
router.get('/impact', (req, res, next) =>
  handle(async (req, res) => ok(res, await adminService.getImpact()), req, res, next),
);

// --- Reports ------------------------------------------------------------
router.get('/reports/monthly', (req, res, next) =>
  handle(
    async (req, res) =>
      ok(res, await adminService.getMonthlyReport(req.query.year)),
    req,
    res,
    next,
  ),
);

router.get('/reports/restaurants', (req, res, next) =>
  handle(
    async (req, res) => ok(res, await adminService.getRestaurantsReport()),
    req,
    res,
    next,
  ),
);

router.get('/reports/charities', (req, res, next) =>
  handle(
    async (req, res) => ok(res, await adminService.getCharitiesReport()),
    req,
    res,
    next,
  ),
);

export default router;
