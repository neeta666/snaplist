import { listingService } from './listing.service.js';

function getUserId(req) {
  return req.user.id;
}

export const listingController = {
  async create(req, res, next) {
    try {
      const listing = await listingService.create({
        userId: getUserId(req),
        listingData: req.body,

        // Temporary server-controlled metadata until the AI provider
        // integration supplies the actual configured values.
        aiMeta: {
          provider: process.env.AI_PROVIDER || 'pending',
          model: process.env.AI_MODEL || 'pending',
          generatedAt: new Date(),
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Listing saved successfully',
        data: {
          listing,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const data = await listingService.getAll({
        userId: getUserId(req),
        ...req.validatedQuery,
      });

      return res.status(200).json({
        success: true,
        message: 'Listings fetched successfully',
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const listing = await listingService.getById({
        userId: getUserId(req),
        id: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: 'Listing fetched successfully',
        data: {
          listing,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const listing = await listingService.update({
        userId: getUserId(req),
        id: req.params.id,
        updates: req.body,
      });

      return res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        data: {
          listing,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await listingService.remove({
        userId: getUserId(req),
        id: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: 'Listing deleted successfully',
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  },

  async generateDraft(req, res, next) {
    try {
      const draft = await listingService.generateDraft({
        file: req.file,
        fields: req.body,
      });

      return res.status(200).json({
        success: true,
        message: 'Listing draft generated successfully',
        data: {
          draft,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};