import { restaurantRepo } from '../persistence/restaurantRepo.js';
import { charityRepo } from '../persistence/charityRepo.js';
import { donationRepo } from '../persistence/donationRepo.js';
import { analyticsRepo } from '../persistence/analyticsRepo.js';
import { AppError } from '../../../shared/errors/AppError.js';

// One serving is assumed to weigh ~0.4 kg (matches the rescue module).
export const MEAL_KG = 0.4;

const DAY_MS = 24 * 60 * 60 * 1000;

const RESTAURANT_ACTIONS = {
  verify: { patch: { status: 'active', verified: true }, from: ['pending', 'suspended'] },
  suspend: { patch: { status: 'suspended' }, from: ['pending', 'active'] },
  reject: { patch: { status: 'rejected', verified: false }, from: ['pending', 'active', 'suspended'] },
};

const CHARITY_ACTIONS = {
  verify: { patch: { status: 'active', verified: true }, from: ['pending'] },
  reject: { patch: { status: 'rejected', verified: false }, from: ['pending', 'active'] },
};

function round1(value) {
  return Math.round((value ?? 0) * 10) / 10;
}

function mealsFor(kg) {
  return Math.floor((kg ?? 0) / MEAL_KG);
}

function asStatusMap(rows, defaults) {
  const map = { ...defaults };
  for (const row of rows) {
    map[row.status] = row._count._all;
  }
  return map;
}

function parseClaim(claim) {
  if (!claim) return null;
  let obj = claim;
  if (typeof claim === 'string') {
    try {
      obj = JSON.parse(claim);
    } catch {
      return null;
    }
  }
  const name = obj?.name || obj?.orgName || obj?.businessName;
  return name ? { name, type: obj.type ?? null } : null;
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function bucketRowsByMonth(rows) {
  const buckets = {};
  for (const row of rows) {
    const key = monthKey(row.createdAt);
    const bucket = buckets[key] || (buckets[key] = { kg: 0, rescues: 0, portions: 0 });
    bucket.kg = round1(bucket.kg + row.weightKg);
    bucket.rescues += 1;
    bucket.portions += row.portions;
  }
  return buckets;
}

function lastNMonthKeys(n) {
  const keys = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

export class AdminService {
  async getOverview() {
    const [restaurantRows, charityRows, donationRows, flaggedCount, collected] =
      await Promise.all([
        restaurantRepo.countByStatus(),
        charityRepo.countByStatus(),
        donationRepo.countByStatus(),
        donationRepo.countFlagged(),
        analyticsRepo.findCollectedBetween(),
      ]);

    const restaurantsByStatus = asStatusMap(restaurantRows, {
      pending: 0,
      active: 0,
      suspended: 0,
      rejected: 0,
    });
    const charitiesByStatus = asStatusMap(charityRows, {
      pending: 0,
      active: 0,
      rejected: 0,
    });
    const donationsByStatus = asStatusMap(donationRows, {
      active: 0,
      claimed: 0,
      collected: 0,
      expired: 0,
      removed: 0,
    });

    const totalKgRescued = round1(
      collected.reduce((sum, row) => sum + row.weightKg, 0),
    );

    return {
      restaurantsByStatus,
      charitiesByStatus,
      donationsByStatus,
      totalRestaurants: Object.values(restaurantsByStatus).reduce((a, b) => a + b, 0),
      totalCharities: Object.values(charitiesByStatus).reduce((a, b) => a + b, 0),
      totalDonations: Object.values(donationsByStatus).reduce((a, b) => a + b, 0),
      activeDonations: donationsByStatus.active,
      claimedDonations: donationsByStatus.claimed,
      completedRescues: donationsByStatus.collected,
      expiredDonations: donationsByStatus.expired,
      removedDonations: donationsByStatus.removed,
      flaggedDonations: flaggedCount,
      totalKgRescued,
    };
  }

  async listRestaurants({ status, q }) {
    return restaurantRepo.list({ status, q });
  }

  async changeRestaurantStatus(id, action) {
    const transition = RESTAURANT_ACTIONS[action];
    if (!transition) {
      throw new AppError(
        `Unknown action "${action}". Expected one of: verify, suspend, reject.`,
        400,
      );
    }

    const restaurant = await restaurantRepo.findById(id);
    if (!restaurant) {
      throw new AppError('Restaurant not found.', 404);
    }
    if (!transition.from.includes(restaurant.status)) {
      throw new AppError(
        `Cannot ${action} a "${restaurant.status}" restaurant (expected ${transition.from.join(' or ')}).`,
        400,
      );
    }

    return restaurantRepo.update(id, transition.patch);
  }

  async listCharities({ status, q }) {
    return charityRepo.list({ status, q });
  }

  async changeCharityStatus(id, action) {
    const transition = CHARITY_ACTIONS[action];
    if (!transition) {
      throw new AppError(
        `Unknown action "${action}". Expected one of: verify, reject.`,
        400,
      );
    }

    const charity = await charityRepo.findById(id);
    if (!charity) {
      throw new AppError('Charity not found.', 404);
    }
    if (!transition.from.includes(charity.status)) {
      throw new AppError(
        `Cannot ${action} a "${charity.status}" charity (expected ${transition.from.join(' or ')}).`,
        400,
      );
    }

    return charityRepo.update(id, transition.patch);
  }

  async listDonations({ status, flagged }) {
    return donationRepo.list({ status, flagged });
  }

  async flagDonation(id, reason) {
    const donation = await donationRepo.findById(id);
    if (!donation) {
      throw new AppError('Donation not found.', 404);
    }
    if (donation.status === 'removed') {
      throw new AppError('This donation has already been removed.', 400);
    }

    return donationRepo.update(id, {
      flagged: true,
      flagReason: (reason ?? '').trim() || 'Flagged by admin',
    });
  }

  async removeDonation(id) {
    const donation = await donationRepo.findById(id);
    if (!donation) {
      throw new AppError('Donation not found.', 404);
    }
    if (donation.status === 'removed') {
      throw new AppError('This donation has already been removed.', 400);
    }
    if (donation.status === 'collected') {
      throw new AppError('A collected donation cannot be removed.', 400);
    }

    return donationRepo.update(id, {
      status: 'removed',
      flagged: true,
      flagReason: donation.flagReason || 'Removed by admin',
    });
  }

  async getImpact() {
    const collected = await analyticsRepo.findCollectedBetween();
    const now = Date.now();

    const totalKg = round1(collected.reduce((sum, row) => sum + row.weightKg, 0));

    const weekRows = collected.filter((row) => now - row.createdAt.getTime() <= 7 * DAY_MS);
    const monthRows = collected.filter((row) => now - row.createdAt.getTime() <= 30 * DAY_MS);

    const weekKg = round1(weekRows.reduce((sum, row) => sum + row.weightKg, 0));
    const monthKg = round1(monthRows.reduce((sum, row) => sum + row.weightKg, 0));

    // Category share.
    const byCategoryMap = new Map();
    for (const row of collected) {
      const entry = byCategoryMap.get(row.category) || { kg: 0, rescues: 0, portions: 0 };
      entry.kg = round1(entry.kg + row.weightKg);
      entry.rescues += 1;
      entry.portions += row.portions;
      byCategoryMap.set(row.category, entry);
    }
    const byCategory = [...byCategoryMap.entries()]
      .map(([category, entry]) => ({
        category,
        ...entry,
        meals: mealsFor(entry.kg),
      }))
      .sort((a, b) => b.kg - a.kg);

    // Donor leaderboard.
    const donorMap = new Map();
    for (const row of collected) {
      const entry = donorMap.get(row.donorName) || { kg: 0, rescues: 0 };
      entry.kg = round1(entry.kg + row.weightKg);
      entry.rescues += 1;
      donorMap.set(row.donorName, entry);
    }
    const topRestaurants = [...donorMap.entries()]
      .map(([name, entry]) => ({ name, ...entry, meals: mealsFor(entry.kg) }))
      .sort((a, b) => b.kg - a.kg)
      .slice(0, 5);

    // Recipient leaderboard (claimedByCharity JSON).
    const charityMap = new Map();
    for (const row of collected) {
      const claim = parseClaim(row.claimedByCharity);
      if (!claim) continue;
      const entry = charityMap.get(claim.name) || {
        name: claim.name,
        type: claim.type,
        kg: 0,
        rescues: 0,
      };
      entry.kg = round1(entry.kg + row.weightKg);
      entry.rescues += 1;
      charityMap.set(claim.name, entry);
    }
    const topCharities = [...charityMap.values()]
      .map((entry) => ({ ...entry, meals: mealsFor(entry.kg) }))
      .sort((a, b) => b.kg - a.kg)
      .slice(0, 5);

    // Monthly trend (last 6 calendar months, zero-filled).
    const buckets = bucketRowsByMonth(collected);
    const trend = lastNMonthKeys(6).map((key) => {
      const bucket = buckets[key] || { kg: 0, rescues: 0, portions: 0 };
      return { month: key, ...bucket, meals: mealsFor(bucket.kg) };
    });

    return {
      totalKg,
      mealsServed: mealsFor(totalKg),
      rescuesCompleted: collected.length,
      weekKg,
      weekRescues: weekRows.length,
      monthKg,
      monthRescues: monthRows.length,
      byCategory,
      topRestaurants,
      topCharities,
      trend,
    };
  }

  async getMonthlyReport(year) {
    const y = Number(year) || new Date().getFullYear();
    const from = new Date(Date.UTC(y, 0, 1));
    const to = new Date(Date.UTC(y + 1, 0, 1));

    const collected = await analyticsRepo.findCollectedBetween({ from, to });
    const buckets = bucketRowsByMonth(collected);

    const months = Array.from({ length: 12 }, (_, i) => {
      const key = `${y}-${String(i + 1).padStart(2, '0')}`;
      const bucket = buckets[key] || { kg: 0, rescues: 0, portions: 0 };
      return { month: key, ...bucket, meals: mealsFor(bucket.kg) };
    });

    return {
      year: y,
      months,
      totals: months.reduce(
        (acc, m) => ({
          kg: round1(acc.kg + m.kg),
          rescues: acc.rescues + m.rescues,
          portions: acc.portions + m.portions,
        }),
        { kg: 0, rescues: 0, portions: 0 },
      ),
    };
  }

  async getRestaurantsReport() {
    const [collected, registry, donorStatusRows] = await Promise.all([
      analyticsRepo.findCollectedBetween(),
      restaurantRepo.list(),
      donationRepo.countByDonorAndStatus(),
    ]);

    // Rescued totals per donor name.
    const rescued = new Map();
    for (const row of collected) {
      const entry = rescued.get(row.donorName) || { kg: 0, rescues: 0 };
      entry.kg = round1(entry.kg + row.weightKg);
      entry.rescues += 1;
      rescued.set(row.donorName, entry);
    }

    // Published counts per donor/status.
    const published = new Map();
    for (const row of donorStatusRows) {
      const entry = published.get(row.donorName) || {};
      entry[row.status] = row._count._all;
      published.set(row.donorName, entry);
    }

    const seen = new Set();
    const rows = [];

    for (const restaurant of registry) {
      const r = rescued.get(restaurant.name) || { kg: 0, rescues: 0 };
      const p = published.get(restaurant.name) || {};
      seen.add(restaurant.name);
      rows.push({
        id: restaurant.id,
        name: restaurant.name,
        type: restaurant.type,
        city: restaurant.city,
        status: restaurant.status,
        verified: restaurant.verified,
        hygieneRating: restaurant.hygieneRating,
        published: Object.values(p).reduce((a, b) => a + b, 0),
        active: p.active ?? 0,
        rescuedCount: r.rescues,
        kg: r.kg,
        meals: mealsFor(r.kg),
      });
    }

    for (const [name, entry] of rescued) {
      if (seen.has(name)) continue;
      rows.push({
        id: null,
        name,
        type: 'Unregistered donor',
        city: null,
        status: null,
        verified: false,
        hygieneRating: null,
        published: 0,
        active: 0,
        rescuedCount: entry.rescues,
        kg: entry.kg,
        meals: mealsFor(entry.kg),
      });
    }

    rows.sort((a, b) => b.kg - a.kg);
    const totals = rows.reduce(
      (acc, row) => ({
        kg: round1(acc.kg + row.kg),
        rescues: acc.rescues + row.rescuedCount,
        published: acc.published + row.published,
      }),
      { kg: 0, rescues: 0, published: 0 },
    );

    return { rows, totals };
  }

  async getCharitiesReport() {
    const [collected, registry] = await Promise.all([
      analyticsRepo.findCollectedBetween(),
      charityRepo.list(),
    ]);

    // Rescued totals per recipient (claimedByCharity JSON).
    const received = new Map();
    for (const row of collected) {
      const claim = parseClaim(row.claimedByCharity);
      if (!claim) continue;
      const entry = received.get(claim.name) || {
        name: claim.name,
        type: claim.type,
        kg: 0,
        rescues: 0,
        lastRescueAt: null,
      };
      entry.kg = round1(entry.kg + row.weightKg);
      entry.rescues += 1;
      if (!entry.lastRescueAt || row.createdAt > entry.lastRescueAt) {
        entry.lastRescueAt = row.createdAt;
      }
      received.set(claim.name, entry);
    }

    const seen = new Set();
    const rows = [];

    for (const charity of registry) {
      const entry = received.get(charity.name) || {
        kg: 0,
        rescues: 0,
        lastRescueAt: null,
      };
      seen.add(charity.name);
      rows.push({
        id: charity.id,
        name: charity.name,
        type: charity.type,
        city: charity.city,
        status: charity.status,
        verified: charity.verified,
        registrationNo: charity.registrationNo,
        rescuedCount: entry.rescues,
        kg: entry.kg,
        meals: mealsFor(entry.kg),
        lastRescueAt: entry.lastRescueAt,
      });
    }

    for (const [name, entry] of received) {
      if (seen.has(name)) continue;
      rows.push({
        id: null,
        name,
        type: entry.type,
        city: null,
        status: null,
        verified: false,
        registrationNo: null,
        rescuedCount: entry.rescues,
        kg: entry.kg,
        meals: mealsFor(entry.kg),
        lastRescueAt: entry.lastRescueAt,
      });
    }

    rows.sort((a, b) => b.kg - a.kg);
    const totals = rows.reduce(
      (acc, row) => ({
        kg: round1(acc.kg + row.kg),
        rescues: acc.rescues + row.rescuedCount,
      }),
      { kg: 0, rescues: 0 },
    );

    return { rows, totals };
  }
}

export const adminService = new AdminService();
