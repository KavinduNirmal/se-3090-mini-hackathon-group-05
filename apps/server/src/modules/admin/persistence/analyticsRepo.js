import { prisma } from '../../../config/prisma.js';

// Raw analytical aggregates over the registry + donation tables. Business
// shaping (meals conversion, trend buckets, leaderboards) lives in the
// service layer; this repo only touches the database.
export class AnalyticsRepository {
  countRestaurantsByStatus() {
    return prisma.restaurant.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }

  countCharitiesByStatus() {
    return prisma.charity.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }

  async sumKgByCategory({ from, to } = {}) {
    const where = { status: 'collected' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const rows = await prisma.donation.groupBy({
      by: ['category'],
      where,
      _sum: { weightKg: true },
      _count: { _all: true },
      _avg: { weightKg: true },
    });

    return rows.map((row) => ({
      category: row.category,
      kg: Math.round((row._sum.weightKg ?? 0) * 10) / 10,
      rescues: row._count._all,
    }));
  }

  async sumKgByDonor({ from, to } = {}, take = 10) {
    const where = { status: 'collected' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const rows = await prisma.donation.groupBy({
      by: ['donorName'],
      where,
      _sum: { weightKg: true },
      _count: { _all: true },
      orderBy: { _sum: { weightKg: 'desc' } },
      take,
    });

    return rows.map((row) => ({
      donorName: row.donorName,
      kg: Math.round((row._sum.weightKg ?? 0) * 10) / 10,
      rescues: row._count._all,
    }));
  }

  // Collected donations in a window (used for charity/trend computations that
  // rely on the claimedByCharity JSON payload, which cannot be groupBy'd).
  findCollectedBetween({ from, to } = {}) {
    const where = { status: 'collected' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    return prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        donorName: true,
        category: true,
        portions: true,
        weightKg: true,
        status: true,
        createdAt: true,
        claimedByCharity: true,
      },
    });
  }
}

export const analyticsRepo = new AnalyticsRepository();
