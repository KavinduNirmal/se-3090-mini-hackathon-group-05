// Seed script for the Share a Plate demo database.
// Usage (from apps/server): node --env-file-if-exists=.env src/scripts/seed.js
// Populates restaurants, charities and donations across statuses and ~4 months
// of history so the Admin + Impact Analytics module has data to show.
import { prisma } from '../config/prisma.js';

const now = new Date();

function daysAgo(days) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

function hoursFromNow(hours) {
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

function minutesAfter(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

const CATEGORY_RANGES = {
  'Prepared Meals': [16, 46],
  'Bakery & Pastry': [8, 26],
  'Fresh Produce': [6, 34],
  'Dairy & Beverages': [6, 20],
  'Dry Groceries': [12, 48],
};

const CATEGORY_TITLES = {
  'Prepared Meals': [
    'Surplus rice & curry banquet platter',
    'Evening hot-held dinner buffet',
    "Chef's batch of curries & sambol",
    'Catered lunchbox surplus',
  ],
  'Bakery & Pastry': [
    'Freshly baked buns & pastries',
    'Morning bread & short-eats tray',
    'Pastry case end-of-day selection',
  ],
  'Fresh Produce': [
    'Farm-fresh vegetable crates',
    'Daily fruit & vegetable surplus',
    'Graded produce near sell-by',
  ],
  'Dairy & Beverages': [
    'Chilled milk & beverage cartons',
    'Refrigerated dairy selection',
  ],
  'Dry Groceries': [
    'Packed dry groceries & staples',
    'Unopened pantry surplus',
  ],
};

const CATEGORIES = Object.keys(CATEGORY_RANGES);

const DIETARY = [
  ['halal', 'non-veg'],
  ['pure-veg'],
  ['halal', 'pure-veg', 'non-veg'],
  ['non-veg'],
];

const TEMPERATURES = [
  'Hot-Held (>60°C)',
  'Refrigerated (<4°C)',
  'Room Temp (<2h)',
  'Thermal Sealed Box',
];

const restaurants = [
  {
    name: 'Grand Ceylon Hotel',
    type: 'Hotel',
    address: '12 Galle Road, Kollupitiya',
    city: 'Colombo',
    phone: '+94 11 233 4455',
    licenseNo: 'HSE-2211',
    hygieneRating: 5,
    verified: true,
    status: 'active',
  },
  {
    name: 'Spice Route Restaurant',
    type: 'Restaurant',
    address: '88 Nawala Road, Nugegoda',
    city: 'Colombo',
    phone: '+94 11 544 3322',
    licenseNo: 'FDD-8845',
    hygieneRating: 5,
    verified: true,
    status: 'active',
  },
  {
    name: 'Sunrise Bakery & Café',
    type: 'Bakery',
    address: '45 Peradeniya Road',
    city: 'Kandy',
    phone: '+94 81 222 9900',
    licenseNo: 'BKR-1120',
    hygieneRating: 4,
    verified: true,
    status: 'active',
  },
  {
    name: 'Royal Lanka Banquets',
    type: 'Caterer',
    address: '3 Galle Face Terrace',
    city: 'Colombo',
    phone: '+94 11 700 2200',
    licenseNo: 'CAT-3090',
    hygieneRating: 5,
    verified: true,
    status: 'active',
  },
  {
    name: 'Marina Bay Grill',
    type: 'Restaurant',
    address: '21 Beach Road',
    city: 'Negombo',
    phone: '+94 31 493 7700',
    licenseNo: 'FDD-7721',
    hygieneRating: 5,
    verified: true,
    status: 'active',
  },
  {
    name: 'Emerald Garden Caterers',
    type: 'Caterer',
    address: '60 Hospital Street',
    city: 'Gampaha',
    phone: '+94 33 445 0099',
    licenseNo: 'CAT-4455',
    hygieneRating: 4,
    verified: true,
    status: 'active',
  },
  {
    name: 'Green Leaf Bistro',
    type: 'Restaurant',
    address: '9 Lake Drive',
    city: 'Kandy',
    phone: '+94 81 555 7700',
    licenseNo: 'FDD-9034',
    hygieneRating: 4,
    verified: false,
    status: 'pending',
  },
  {
    name: 'Ocean Pearl Seafood House',
    type: 'Restaurant',
    address: '110 De Saram Road',
    city: 'Mount Lavinia',
    phone: '+94 11 271 5566',
    licenseNo: 'FDD-5512',
    hygieneRating: 4,
    verified: false,
    status: 'pending',
  },
  {
    name: 'City View Café',
    type: 'Bakery',
    address: '27 Main Street',
    city: 'Colombo',
    phone: '+94 11 233 1122',
    licenseNo: 'BKR-6677',
    hygieneRating: 3,
    verified: true,
    status: 'suspended',
  },
  {
    name: 'Hill Country Thali',
    type: 'Restaurant',
    address: '5 Rajapihilla Mawatha',
    city: 'Kandy',
    phone: '+94 81 330 8899',
    licenseNo: 'FDD-0990',
    hygieneRating: 3,
    verified: false,
    status: 'rejected',
  },
];

const charities = [
  {
    name: "Little Hearts Children's Home",
    type: "Children's home",
    address: '14 Flower Road',
    city: 'Colombo',
    phone: '+94 11 268 3300',
    registrationNo: 'SOC-1001',
    verified: true,
    status: 'active',
  },
  {
    name: 'Amara Elders Shelter',
    type: 'Elderly home',
    address: '77 Kalapaluwawa Road',
    city: 'Colombo',
    phone: '+94 11 292 4455',
    registrationNo: 'SOC-1044',
    verified: true,
    status: 'active',
  },
  {
    name: 'Hope Community Kitchen',
    type: 'Community kitchen',
    address: '23 Waraka Road, Malabe',
    city: 'Colombo',
    phone: '+94 11 275 8890',
    registrationNo: 'SOC-1133',
    verified: true,
    status: 'active',
  },
  {
    name: 'Sunrise Children Village',
    type: "Children's home",
    address: '31 Kandy Road',
    city: 'Gampaha',
    phone: '+94 33 444 2211',
    registrationNo: 'SOC-1198',
    verified: true,
    status: 'active',
  },
  {
    name: 'Sahana Women Support Centre',
    type: 'Shelter',
    address: '8 Thimbirigasyaya Road',
    city: 'Colombo',
    phone: '+94 11 250 7788',
    registrationNo: 'SOC-1240',
    verified: true,
    status: 'active',
  },
  {
    name: 'Good Shepherd Children Home',
    type: "Children's home",
    address: '19 Udugama Road',
    city: 'Kandy',
    phone: '+94 81 234 0001',
    registrationNo: 'SOC-1402',
    verified: false,
    status: 'pending',
  },
  {
    name: 'Sathya Community Food Bank',
    type: 'Community kitchen',
    address: '52 Colombo Road',
    city: 'Negombo',
    phone: '+94 31 493 0022',
    registrationNo: 'SOC-1417',
    verified: false,
    status: 'pending',
  },
  {
    name: 'New Hope Youth Shelter',
    type: 'Shelter',
    address: '6 Hill Street',
    city: 'Gampaha',
    phone: '+94 33 222 8811',
    registrationNo: 'SOC-1509',
    verified: false,
    status: 'rejected',
  },
];

function pickDietary(seed) {
  return DIETARY[seed % DIETARY.length];
}

function pickTemperature(seed) {
  return TEMPERATURES[seed % TEMPERATURES.length];
}

function weightFor(category, seed) {
  const [min, max] = CATEGORY_RANGES[category];
  const raw = min + ((seed * 37) % (max - min));
  return Math.round(raw * 10) / 10;
}

function titleFor(category, seed) {
  const titles = CATEGORY_TITLES[category];
  return titles[seed % titles.length];
}

function pickupNotesFor(i) {
  const notes = [
    'Kitchen service dock. Ask for the head chef.',
    'Back entrance loading bay, ring security.',
    'Collect from the bakery counter before closing.',
    'Banquet hall rear access near the parking lot.',
  ];
  return notes[i % notes.length];
}

async function main() {
  console.log('[seed] clearing existing data...');
  await prisma.donation.deleteMany();
  await prisma.charity.deleteMany();
  await prisma.restaurant.deleteMany();

  const createdRestaurants = [];
  for (const r of restaurants) {
    createdRestaurants.push(await prisma.restaurant.create({ data: r }));
  }
  console.log(`[seed] created ${createdRestaurants.length} restaurants`);

  const createdCharities = [];
  for (const c of charities) {
    createdCharities.push(await prisma.charity.create({ data: c }));
  }
  console.log(`[seed] created ${createdCharities.length} charities`);

  const activeRestaurants = createdRestaurants.filter((r) => r.status === 'active');
  const activeCharities = createdCharities.filter((c) => c.status === 'active');

  const donations = [];
  let seedCounter = 0;
  const next = () => seedCounter++;

  function donationBase({ restaurant, category, s, createdAt, status, expiresAt, flagged = false, flagReason = null }) {
    const weightKg = weightFor(category, s);
    return {
      donorId: null,
      donorName: restaurant.name,
      title: titleFor(category, s),
      category,
      portions: Math.round(weightKg / 0.4),
      weightKg,
      dietary: pickDietary(s),
      temperature: pickTemperature(s),
      preparedTime: new Date(createdAt.getTime() - 40 * 60 * 1000),
      expiryTime: expiresAt,
      pickupAddress: `${restaurant.address}, ${restaurant.city}`,
      contactNumber: restaurant.phone,
      pickupNotes: pickupNotesFor(s),
      status,
      createdAt,
      flagged,
      flagReason,
    };
  }

  // --- Live / recent donations (status active or claimed) per active restaurant ---
  for (let i = 0; i < activeRestaurants.length; i++) {
    const restaurant = activeRestaurants[i];

    // Two live listings created within the last few hours.
    for (let l = 0; l < 2; l++) {
      const s = next();
      const category = CATEGORIES[(i + l) % CATEGORIES.length];
      const createdAt = hoursAgo((s % 5) + 1);
      const expHours = [1, 2, 4, 8][s % 4];
      donations.push(
        donationBase({
          restaurant,
          category,
          s,
          createdAt,
          status: 'active',
          expiresAt: hoursFromNow(expHours),
        }),
      );
    }

    // Every other restaurant has a live claim in progress.
    if (i % 2 === 0) {
      const s = next();
      const category = CATEGORIES[(i + 1) % CATEGORIES.length];
      const createdAt = hoursAgo(3);
      const charity = activeCharities[i % activeCharities.length];
      donations.push({
        ...donationBase({
          restaurant,
          category,
          s,
          createdAt,
          status: 'claimed',
          expiresAt: hoursFromNow(1),
        }),
        claimedByCharity: {
          name: charity.name,
          type: charity.type,
          verified: true,
          contactName: 'Rescue Coordinator',
          phone: charity.phone,
        },
      });
    }
  }

  // --- History donations (created days ago) driving the impact analytics ---
  for (let i = 0; i < activeRestaurants.length; i++) {
    const restaurant = activeRestaurants[i];
    const historyCount = 4 + (i % 4); // 4..7 per restaurant
    for (let h = 0; h < historyCount; h++) {
      const s = next();
      const category = CATEGORIES[(i + h) % CATEGORIES.length];
      const createdDaysAgo = 3 + ((i * 17 + h * 23) % 95); // 3..97 days
      const createdAt = daysAgo(createdDaysAgo);
      const outcome = s % 10;

      if (outcome < 6) {
        // COLLECTED — rescued and delivered
        const charity = activeCharities[(i * 3 + 1) % activeCharities.length];
        donations.push({
          ...donationBase({
            restaurant,
            category,
            s,
            createdAt,
            status: 'collected',
            expiresAt: minutesAfter(createdAt, 6 * 60),
          }),
          claimedByCharity: {
            name: charity.name,
            type: charity.type,
            verified: true,
            contactName: 'Rescue Coordinator',
            phone: charity.phone,
          },
        });
      } else if (outcome < 9) {
        // EXPIRED — never rescued in time
        donations.push(
          donationBase({
            restaurant,
            category,
            s,
            createdAt,
            status: 'expired',
            expiresAt: minutesAfter(createdAt, 4 * 60),
          }),
        );
      } else {
        // REMOVED — flagged by the operations team
        donations.push(
          donationBase({
            restaurant,
            category,
            s,
            createdAt,
            status: 'removed',
            expiresAt: minutesAfter(createdAt, 5 * 60),
            flagged: true,
            flagReason: 'Suspicious listing reported by rescue team',
          }),
        );
      }
    }
  }

  // A live flagged listing from the suspended side for the monitoring demo.
  const suspended = createdRestaurants.find((r) => r.status === 'suspended');
  if (suspended) {
    const s = next();
    donations.push(
      donationBase({
        restaurant: suspended,
        category: 'Dry Groceries',
        s,
        createdAt: hoursAgo(4),
        status: 'active',
        expiresAt: hoursFromNow(6),
        flagged: true,
        flagReason: 'Duplicate listing — under review',
      }),
    );
  }

  for (const d of donations) {
    await prisma.donation.create({ data: d });
  }
  console.log(`[seed] created ${donations.length} donations`);

  // --- Summary report for quick sanity checking ---
  const statusCounts = await prisma.donation.groupBy({ by: ['status'], _count: true });
  const collected = await prisma.donation.findMany({ where: { status: 'collected' } });
  const collectedKg = Math.round(collected.reduce((a, d) => a + d.weightKg, 0) * 10) / 10;
  const last30 = collected.filter((d) => d.createdAt > daysAgo(30));
  const last7 = collected.filter((d) => d.createdAt > daysAgo(7));
  const topDonors = {};
  for (const d of collected) {
    topDonors[d.donorName] = (topDonors[d.donorName] || 0) + d.weightKg;
  }

  console.log('[seed] donation statuses:', statusCounts);
  console.log(
    `[seed] total rescued: ${collectedKg} kg across ${collected.length} collected donations`,
  );
  console.log(`[seed] collected last 30d: ${last30.length} | last 7d: ${last7.length}`);
  console.log(
    '[seed] top donors:',
    Object.entries(topDonors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([n, k]) => `${n}=${Math.round(k)}`),
  );
  console.log('[seed] done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
