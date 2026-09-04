import { prisma } from '../../../config/prisma.js';

// A "rescue" is a donation that has been picked up by a charity, i.e. a
// Donation row whose status is `collected` (or currently being claimed).
// There is no separate rescue table in the shared schema, so this repo
// projects rescue records straight off the Donation model.
export class RescueRepository {
  findCollectedBetween({ from, to } = {}) {
    const where = { status: 'collected' };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    return prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  countCollected() {
    return prisma.donation.count({ where: { status: 'collected' } });
  }

  countClaimed() {
    return prisma.donation.count({ where: { status: 'claimed' } });
  }

  countActive() {
    return prisma.donation.count({ where: { status: 'active' } });
  }

  countExpired() {
    return prisma.donation.count({ where: { status: 'expired' } });
  }
}

export const rescueRepo = new RescueRepository();
