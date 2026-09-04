import { prisma } from '../../../config/prisma.js';

export class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        charityProfile: true,
        donorProfile: true,
      },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        charityProfile: true,
        donorProfile: true,
      },
    });
  }

  async createCharityUser({
    email,
    passwordHash,
    orgName,
    charityType,
    regNumber,
    contactPerson,
    phone,
    address,
    city,
    district,
    beneficiaryCount,
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: 'CHARITY',
          status: 'ACTIVE',
        },
      });

      const charityProfile = await tx.charityProfile.create({
        data: {
          userId: user.id,
          orgName,
          charityType: charityType || 'SHELTER',
          regNumber: regNumber || null,
          contactPerson,
          phone,
          address,
          city,
          district: district || null,
          beneficiaryCount: beneficiaryCount ? parseInt(beneficiaryCount, 10) : null,
          isVerified: false,
        },
      });

      return {
        ...user,
        charityProfile,
      };
    });
  }

  async createDonorUser({
    email,
    passwordHash,
    businessName,
    donorType,
    contactPerson,
    phone,
    address,
    city,
    district,
    regNumber,
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: 'DONOR',
          status: 'ACTIVE',
        },
      });

      const donorProfile = await tx.donorProfile.create({
        data: {
          userId: user.id,
          businessName,
          donorType: donorType || 'RESTAURANT',
          contactPerson,
          phone,
          address,
          city,
          district: district || null,
          regNumber: regNumber || null,
          isVerified: false,
        },
      });

      return {
        ...user,
        donorProfile,
      };
    });
  }
}

export const userRepository = new UserRepository();
