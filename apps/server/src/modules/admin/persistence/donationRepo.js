import { prisma } from '../../../config/prisma.js';

const DONATION_STATUSES = ['active', 'claimed', 'collected', 'expired', 'removed'];

export class DonationRepository {
  async list({ status, flagged } = {}) {
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (flagged === 'true' || flagged === true) {
      where.flagged = true;
    } else if (flagged === 'false' || flagged === false) {
      where.flagged = false;
    }

    return prisma.donation.findMany({
      where,
      orderBy: [{ flagged: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findById(id) {
    return prisma.donation.findUnique({ where: { id } });
  }

  update(id, data) {
    return prisma.donation.update({ where: { id }, data });
  }

  countFlagged() {
    return prisma.donation.count({ where: { flagged: true } });
  }

  countByStatus() {
    return prisma.donation.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }

  countByDonorAndStatus() {
    return prisma.donation.groupBy({
      by: ['donorName', 'status'],
      _count: { _all: true },
    });
  }
}

export const donationRepo = new DonationRepository();

export { DONATION_STATUSES };
