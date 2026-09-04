import { rescueService } from '../business/rescueService.js';

export class RescueController {
  async getFeed(req, res, next) {
    try {
      const { city, dietary, category, search } = req.query;
      const feed = await rescueService.getLiveFeed({ city, dietary, category, search });
      res.status(200).json({
        status: 'success',
        data: feed,
      });
    } catch (err) {
      next(err);
    }
  }

  async getDonationDetails(req, res, next) {
    try {
      const { id } = req.params;
      const donation = await rescueService.getDonationDetails(id);
      res.status(200).json({
        status: 'success',
        data: { donation },
      });
    } catch (err) {
      next(err);
    }
  }

  async reserve(req, res, next) {
    try {
      const { id } = req.params;
      const { portionsRequested, pickupEta, notes, charityName, charityId } = req.body;

      const result = await rescueService.reserveDonation({
        donationId: id,
        charityId: charityId || req.user?.charityProfile?.id,
        charityName: charityName || req.user?.charityProfile?.orgName,
        portionsRequested,
        pickupEta,
        notes,
      });

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getReservation(req, res, next) {
    try {
      const { id } = req.params;
      const reservation = await rescueService.getReservation(id);
      res.status(200).json({
        status: 'success',
        data: { reservation },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const rescueController = new RescueController();

