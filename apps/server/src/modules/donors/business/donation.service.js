import { prisma } from '../../../config/prisma.js';

// In-memory fallback repository when DB connection is not initialized in dev
let inMemoryDonations = [];

export async function createDonation(payload) {
  const {
    donorId,
    donorName = 'Cinnamon Grand Bakery & Buffet',
    foodName,
    title,
    category = 'Prepared Meals',
    portions,
    estimatedWeight,
    weightKg,
    dietary = [],
    temperature = 'Hot-Held (>60°C)',
    preparedTime,
    expiryTime,
    pickupAddress,
    contactNumber,
    pickupNotes = '',
  } = payload;

  const itemTitle = (title || foodName || '').trim();
  if (!itemTitle) {
    throw new Error('Food name/title is required.');
  }

  const portionsNum = Number(portions);
  if (isNaN(portionsNum) || portionsNum <= 0) {
    throw new Error('Validation Error: Number of portions must be greater than 0.');
  }

  const weightNum = Number(weightKg || estimatedWeight || 10);
  if (isNaN(weightNum) || weightNum <= 0) {
    throw new Error('Validation Error: Estimated weight must be greater than 0 kg.');
  }

  if (!expiryTime) {
    throw new Error('Validation Error: Expiry time is required.');
  }

  const expiryDate = new Date(expiryTime);
  const currentDate = new Date();
  if (isNaN(expiryDate.getTime()) || expiryDate <= currentDate) {
    throw new Error('Validation Error: Expiry time must be in the future (expiryTime > currentTime).');
  }

  if (!pickupAddress || !pickupAddress.trim()) {
    throw new Error('Validation Error: Pickup address and city are required.');
  }

  if (!contactNumber || !contactNumber.trim()) {
    throw new Error('Validation Error: Contact number is required.');
  }

  const donationData = {
    donorId: donorId || null,
    donorName,
    title: itemTitle,
    category,
    portions: portionsNum,
    weightKg: weightNum,
    dietary: Array.isArray(dietary) ? dietary : [dietary],
    status: 'active',
    temperature,
    preparedTime: preparedTime ? new Date(preparedTime) : new Date(),
    expiryTime: expiryDate,
    pickupAddress: pickupAddress.trim(),
    contactNumber: contactNumber.trim(),
    pickupNotes: pickupNotes.trim(),
  };

  try {
    const created = await prisma.donation.create({
      data: donationData,
    });
    console.log('[db] Donation inserted successfully into NeonDB:', created.id);
    return created;
  } catch (err) {
    console.error('[db] Prisma insert error:', err);
    const newDonation = {
      id: `LIST-${100 + inMemoryDonations.length + 1}`,
      ...donationData,
      preparedTime: donationData.preparedTime.toISOString(),
      expiryTime: donationData.expiryTime.toISOString(),
      createdAt: new Date().toISOString(),
    };
    inMemoryDonations.unshift(newDonation);
    return newDonation;
  }
}

export async function getAllDonations({ status, query } = {}) {
  let list = [];
  try {
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    list = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    list = [...inMemoryDonations];
    if (status && status !== 'all') {
      list = list.filter((item) => item.status === status);
    }
  }

  if (query) {
    const q = query.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.pickupAddress.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getDonationMetrics() {
  const all = await getAllDonations();
  const totalDonations = all.length;
  const activeListings = all.filter((d) => d.status === 'active').length;
  const foodCollected = all.filter((d) => d.status === 'collected').length;
  const totalKgDonated = Number(
    all.reduce((acc, curr) => acc + (curr.weightKg || 0), 0).toFixed(1)
  );

  return {
    totalDonations,
    activeListings,
    foodCollected,
    totalKgDonated,
  };
}

export async function updateDonationStatus(id, status) {
  try {
    const updated = await prisma.donation.update({
      where: { id },
      data: { status },
    });
    return updated;
  } catch (err) {
    const found = inMemoryDonations.find((item) => item.id === id);
    if (found) {
      found.status = status;
      return found;
    }
    throw new Error(`Donation listing ${id} not found.`);
  }
}
