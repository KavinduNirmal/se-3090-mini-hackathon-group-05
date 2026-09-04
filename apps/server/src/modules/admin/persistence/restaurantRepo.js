import { prisma } from '../../../config/prisma.js';

export class RestaurantRepository {
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
        { licenseNo: { contains: query, mode: 'insensitive' } },
      ];
    }

    return prisma.restaurant.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  findById(id) {
    return prisma.restaurant.findUnique({ where: { id } });
  }

  update(id, data) {
    return prisma.restaurant.update({ where: { id }, data });
  }

  countByStatus() {
    return prisma.restaurant.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }
}

export const restaurantRepo = new RestaurantRepository();
