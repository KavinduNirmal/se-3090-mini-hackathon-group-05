import { prisma } from '../../../config/prisma.js';

// Realistic sample listings for Sri Lankan food rescue ecosystem
const MOCK_DONATIONS = [
  {
    id: 'don-001',
    title: '50 Portions • Vegetable Biryani & Dhal Curry',
    description: 'Freshly prepared buffet surplus from lunchtime banquet. Kept under temperature-controlled hot warmers. Packaged in sanitized food containers.',
    category: 'COOKED_MEALS',
    dietaryType: 'PURE_VEG',
    portions: 50,
    estimatedWeightKg: 22.5,
    preparedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    pickupAddress: '77 Galle Road, Kollupitiya',
    city: 'Colombo 03',
    district: 'Colombo',
    contactNumber: '011 243 7437',
    storageInstructions: 'Keep warm (>60°C) or refrigerate immediately upon collection.',
    status: 'AVAILABLE',
    donor: {
      businessName: 'Cinnamon Grand Colombo (Banquet Kitchen)',
      donorType: 'HOTEL',
      contactPerson: 'Chef Duminda Perera',
      phone: '077 345 8920',
      address: '77 Galle Road',
      city: 'Colombo 03',
      district: 'Colombo',
      isVerified: true,
      hygieneCertified: true,
    },
    distanceKm: 1.2,
  },
  {
    id: 'don-002',
    title: '35 Portions • Fresh Baked Loaves, Buns & Pastries',
    description: 'End-of-day bakery surplus including sandwich bread loaves, vegetable patties, and tea buns. Baked fresh this morning.',
    category: 'BAKERY_PASTRIES',
    dietaryType: 'PURE_VEG',
    portions: 35,
    estimatedWeightKg: 14.0,
    preparedTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 4.0 * 60 * 60 * 1000).toISOString(),
    pickupAddress: '244 Havelock Road, Colombo 05',
    city: 'Colombo 05',
    district: 'Colombo',
    contactNumber: '011 258 9871',
    storageInstructions: 'Store in cool, dry area. Best consumed within 24 hours.',
    status: 'AVAILABLE',
    donor: {
      businessName: 'Perera & Sons Bakery',
      donorType: 'BAKERY',
      contactPerson: 'Nimali Jayasinghe',
      phone: '071 889 2314',
      address: '244 Havelock Road',
      city: 'Colombo 05',
      district: 'Colombo',
      isVerified: true,
      hygieneCertified: true,
    },
    distanceKm: 2.8,
  },
  {
    id: 'don-003',
    title: '40 Portions • Halal Chicken Curry with Basmati Rice',
    description: 'Hot kitchen prep surplus. 100% Halal certified chicken with yellow basmati rice and brinjal moju.',
    category: 'RICE_CURRY',
    dietaryType: 'HALAL',
    portions: 40,
    estimatedWeightKg: 20.0,
    preparedTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 1.2 * 60 * 60 * 1000).toISOString(),
    pickupAddress: '15 Sir Chittampalam A. Gardiner Mawatha',
    city: 'Colombo 02',
    district: 'Colombo',
    contactNumber: '011 249 2492',
    storageInstructions: 'Transport in thermal insulated containers.',
    status: 'AVAILABLE',
    donor: {
      businessName: 'Hilton Colombo (Graze Kitchen)',
      donorType: 'HOTEL',
      contactPerson: 'Chef Farhan Razik',
      phone: '077 912 3456',
      address: '15 Sir Chittampalam A. Gardiner Mawatha',
      city: 'Colombo 02',
      district: 'Colombo',
      isVerified: true,
      hygieneCertified: true,
    },
    distanceKm: 3.4,
  },
  {
    id: 'don-004',
    title: '25 Portions • Traditional Rice & Curry Packets',
    description: 'Individual lunch packets with Samba rice, dhal, pol sambol, and fish ambul thiyal.',
    category: 'RICE_CURRY',
    dietaryType: 'NON_VEG',
    portions: 25,
    estimatedWeightKg: 12.5,
    preparedTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 1.8 * 60 * 60 * 1000).toISOString(),
    pickupAddress: '416 R. A. De Mel Mawatha',
    city: 'Colombo 03',
    district: 'Colombo',
    contactNumber: '011 257 5634',
    storageInstructions: 'Consume within 3 hours of pickup.',
    status: 'AVAILABLE',
    donor: {
      businessName: 'Green Cabin Restaurant',
      donorType: 'RESTAURANT',
      contactPerson: 'Sunil Wickramasinghe',
      phone: '076 432 1098',
      address: '416 R. A. De Mel Mawatha',
      city: 'Colombo 03',
      district: 'Colombo',
      isVerified: true,
      hygieneCertified: true,
    },
    distanceKm: 0.9,
  },
  {
    id: 'don-005',
    title: '60 Portions • Assorted Sandwiches & Savoury Rolls',
    description: 'Corporate catering surplus: egg salad sandwiches, chicken sausage rolls, and vegetable wraps.',
    category: 'BAKERY_PASTRIES',
    dietaryType: 'NON_VEG',
    portions: 60,
    estimatedWeightKg: 15.0,
    preparedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 3.0 * 60 * 60 * 1000).toISOString(),
    pickupAddress: '114 Reid Avenue, Cinnamon Gardens',
    city: 'Colombo 07',
    district: 'Colombo',
    contactNumber: '011 258 4305',
    storageInstructions: 'Keep in chilled bag during transport.',
    status: 'AVAILABLE',
    donor: {
      businessName: 'Dutch Burgher Union Café',
      donorType: 'RESTAURANT',
      contactPerson: 'David Van Dort',
      phone: '077 765 4321',
      address: '114 Reid Avenue',
      city: 'Colombo 07',
      district: 'Colombo',
      isVerified: true,
      hygieneCertified: false,
    },
    distanceKm: 2.1,
  },
  {
    id: 'don-006',
    title: '30 Portions • Kandy Hill-Country Vegetable Rice & Soya',
    description: 'Fresh lunch surplus from lakeside dining room. Fragrant red rice with devilled soya meat, beans, and pumpkin curry.',
    category: 'RICE_CURRY',
    dietaryType: 'PURE_VEG',
    portions: 30,
    estimatedWeightKg: 13.0,
    preparedTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    expiryTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    pickupAddress: 'Sangharaja Mawatha, Kandy Lake Round',
    city: 'Kandy',
    district: 'Kandy',
    contactNumber: '081 223 3444',
    storageInstructions: 'Hot food boxes. Reheat before serving.',
    status: 'AVAILABLE',
    donor: {
      businessName: 'Earl’s Regency Kandy (Lakeside Kitchen)',
      donorType: 'HOTEL',
      contactPerson: 'K. Bandara',
      phone: '071 223 9988',
      address: 'Sangharaja Mawatha',
      city: 'Kandy',
      district: 'Kandy',
      isVerified: true,
      hygieneCertified: true,
    },
    distanceKm: 4.5,
  },
];

export class DonationRepository {
  async getFeedDonations({ city, dietary, category, search }) {
    try {
      const now = new Date();

      const where = {
        status: 'AVAILABLE',
        expiryTime: { gt: now },
      };

      if (city && city !== 'ALL') {
        where.city = { contains: city, mode: 'insensitive' };
      }

      if (dietary && dietary !== 'ALL') {
        where.dietaryType = dietary;
      }

      if (category && category !== 'ALL') {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { donor: { businessName: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const dbDonations = await prisma.foodDonation.findMany({
        where,
        include: {
          donor: true,
        },
        orderBy: {
          expiryTime: 'asc',
        },
      });

      if (dbDonations && dbDonations.length > 0) {
        return dbDonations;
      }
    } catch (err) {
      console.warn('[db] falling back to seed mock listings for rescue feed:', err.message);
    }

    // Return filtered sample items if DB is newly initialized or empty
    return this.filterMockDonations({ city, dietary, category, search });
  }

  filterMockDonations({ city, dietary, category, search }) {
    const now = new Date().getTime();
    return MOCK_DONATIONS.filter((item) => {
      if (item.status !== 'AVAILABLE') return false;
      const expiry = new Date(item.expiryTime).getTime();
      if (expiry <= now) return false;

      if (city && city !== 'ALL') {
        const cityMatch = item.city.toLowerCase().includes(city.toLowerCase()) ||
          item.district.toLowerCase().includes(city.toLowerCase());
        if (!cityMatch) return false;
      }

      if (dietary && dietary !== 'ALL') {
        if (item.dietaryType !== dietary) return false;
      }

      if (category && category !== 'ALL') {
        if (item.category !== category) return false;
      }

      if (search && search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDonor = item.donor.businessName.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDonor && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime());
  }

  async getDonationById(id) {
    try {
      const donation = await prisma.foodDonation.findUnique({
        where: { id },
        include: { donor: true },
      });
      if (donation) return donation;
    } catch (err) {
      console.warn('[db] finding donation in mock pool:', err.message);
    }

    return MOCK_DONATIONS.find((d) => d.id === id) || null;
  }
}

export const donationRepository = new DonationRepository();
