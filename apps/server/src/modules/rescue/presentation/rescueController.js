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
}

export const rescueController = new RescueController();
