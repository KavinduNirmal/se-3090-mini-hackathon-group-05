import { prisma } from '../../../config/prisma.js';

export class CharityRepository {
  async list({ status, q } = {}) {
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    const query = typeof q === 'string' ? q.trim() : '';
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { registrationNo: { contains: query, mode: 'insensitive' } },
      ];
    }

    return prisma.charity.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  findById(id) {
    return prisma.charity.findUnique({ where: { id } });
  }

  update(id, data) {
    return prisma.charity.update({ where: { id }, data });
  }

  countByStatus() {
    return prisma.charity.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }
}

export const charityRepo = new CharityRepository();
