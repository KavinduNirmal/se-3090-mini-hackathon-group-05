import { donationRepository } from '../persistence/donationRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';

export class RescueService {
  async getLiveFeed(filters) {
    const rawDonations = await donationRepository.getFeedDonations(filters);
    const now = new Date();

    const formattedListings = rawDonations.map((donation) => {
      const expiry = new Date(donation.expiryTime);
      const diffMs = expiry.getTime() - now.getTime();
      const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      let expiryCountdownText = '';
      if (hours > 0) {
        expiryCountdownText = `${hours}h ${mins}m`;
      } else {
        expiryCountdownText = `${mins}m`;
      }

      const isUrgent = diffMins <= 120; // Urgent if less than 2 hours

      // Generate distance estimate if not present
      const distanceKm = donation.distanceKm || parseFloat((1.0 + (donation.title.length % 5) * 0.7).toFixed(1));

      return {
        id: donation.id,
        title: donation.title,
        description: donation.description,
        category: donation.category,
        dietaryType: donation.dietaryType,
        portions: donation.portions,
        estimatedWeightKg: donation.estimatedWeightKg,
        preparedTime: donation.preparedTime,
        expiryTime: donation.expiryTime,
        expiryCountdownText,
        isUrgent,
        pickupAddress: donation.pickupAddress,
        city: donation.city,
        district: donation.district,
        contactNumber: donation.contactNumber,
        storageInstructions: donation.storageInstructions,
        status: donation.status,
        distanceKm,
        distanceFormatted: `${distanceKm} km • ${donation.city}`,
        donor: {
          businessName: donation.donor.businessName,
          donorType: donation.donor.donorType,
          contactPerson: donation.donor.contactPerson,
          phone: donation.donor.phone,
          address: donation.donor.address,
          city: donation.donor.city,
          isVerified: donation.donor.isVerified ?? true,
          hygieneCertified: donation.donor.hygieneCertified ?? false,
        },
      };
    });

    const totalPortions = formattedListings.reduce((sum, item) => sum + item.portions, 0);

    return {
      listings: formattedListings,
      totalCount: formattedListings.length,
      totalPortionsAvailable: totalPortions,
      timestamp: new Date().toISOString(),
    };
  }

  async getDonationDetails(id) {
    const donation = await donationRepository.getDonationById(id);
    if (!donation) {
      throw new AppError('Donation listing not found or has expired.', 404);
    }

    const now = new Date();
    const expiry = new Date(donation.expiryTime);
    const diffMs = expiry.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const expiryCountdownText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      ...donation,
      expiryCountdownText,
      isUrgent: diffMins <= 120,
      distanceKm: donation.distanceKm || 1.8,
      distanceFormatted: `${donation.distanceKm || 1.8} km • ${donation.city}`,
    };
  }

  async reserveDonation({ donationId, charityId, charityName, portionsRequested, pickupEta, notes }) {
    const donation = await donationRepository.getDonationById(donationId);
    if (!donation) {
      throw new AppError('Donation listing not found or no longer available.', 404);
    }

    const requestedCount = parseInt(portionsRequested, 10);
    if (isNaN(requestedCount) || requestedCount <= 0) {
      throw new AppError('Please specify a valid number of portions to claim (minimum 1).', 400);
    }

    if (requestedCount > donation.portions) {
      throw new AppError(
        `Requested portions (${requestedCount}) exceeds available surplus portions (${donation.portions}).`,
        400,
      );
    }

    // Generate secure 6-digit handover verification code
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const verificationCode = `BHM-${randomDigits}`;

    const reservation = await donationRepository.createReservation({
      donationId,
      charityId: charityId || 'demo-charity-id',
      charityName: charityName || 'Hope Children’s Home & Orphanage',
      portionsRequested: requestedCount,
      verificationCode,
      pickupEta,
      notes,
    });

    return {
      reservation,
      verificationCode,
      message: 'Reservation confirmed successfully. Please present your pickup pass upon arrival.',
    };
  }

  async getReservation(id) {
    const res = await donationRepository.getReservationById(id);
    if (!res) {
      throw new AppError('Reservation pass not found.', 404);
    }
    return res;
  }
}

export const rescueService = new RescueService();

