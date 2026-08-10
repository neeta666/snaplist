import { dashboardService } from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

export const dashboardController = {
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getStats(req.user.id);

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Dashboard stats fetched successfully',
        data: stats,
      });
    } catch (error) {
      return next(error);
    }
  },
};