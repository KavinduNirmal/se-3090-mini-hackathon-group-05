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
    return donation;
  }
}

export const rescueService = new RescueService();
