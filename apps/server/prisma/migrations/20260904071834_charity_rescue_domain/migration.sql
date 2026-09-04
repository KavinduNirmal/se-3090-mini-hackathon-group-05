-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DONOR', 'CHARITY', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DonorType" AS ENUM ('RESTAURANT', 'HOTEL', 'BAKERY', 'SUPERMARKET', 'BANQUET', 'INDIVIDUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CharityType" AS ENUM ('ORPHANAGE', 'ELDER_CARE', 'COMMUNITY_KITCHEN', 'SHELTER', 'NGO_HUB', 'OTHER');

-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('RICE_CURRY', 'BAKERY_PASTRIES', 'COOKED_MEALS', 'PACKAGED_FOOD', 'SNACKS_BEVERAGES', 'FRUITS_VEGETABLES', 'OTHER');

-- CreateEnum
CREATE TYPE "DietaryType" AS ENUM ('PURE_VEG', 'NON_VEG', 'HALAL', 'VEGAN');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'COLLECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('REQUESTED', 'APPROVED', 'READY_FOR_PICKUP', 'COLLECTED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "donorType" "DonorType" NOT NULL DEFAULT 'RESTAURANT',
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "regNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "hygieneCertified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charity_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "charityType" "CharityType" NOT NULL DEFAULT 'SHELTER',
    "regNumber" TEXT,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "beneficiaryCount" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charity_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_donations" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "FoodCategory" NOT NULL DEFAULT 'COOKED_MEALS',
    "dietaryType" "DietaryType" NOT NULL DEFAULT 'NON_VEG',
    "portions" INTEGER NOT NULL,
    "estimatedWeightKg" DOUBLE PRECISION,
    "preparedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "contactNumber" TEXT NOT NULL,
    "storageInstructions" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "charityId" TEXT NOT NULL,
    "portionsRequested" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'REQUESTED',
    "verificationCode" TEXT NOT NULL,
    "pickupEta" TIMESTAMP(3),
    "notes" TEXT,
    "collectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "donor_profiles_userId_key" ON "donor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "charity_profiles_userId_key" ON "charity_profiles"("userId");

-- AddForeignKey
ALTER TABLE "donor_profiles" ADD CONSTRAINT "donor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charity_profiles" ADD CONSTRAINT "charity_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_donations" ADD CONSTRAINT "food_donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "food_donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "charity_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
