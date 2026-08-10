import mongoose from 'mongoose';
import Listing from './listing.model.js';

function isCastError(error) {
  return error?.name === 'CastError';
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildUserListingQuery({
  userId,
  search,
  status,
  category,
  platformStyle,
}) {
  const query = { userId };

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');

    query.$or = [
      { title: pattern },
      { description: pattern },
    ];
  }

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (platformStyle) {
    query.platformStyle = platformStyle;
  }

  return query;
}

function buildSort(sortBy, sortOrder) {
  const sortField = sortBy === 'price' ? 'askingPrice' : sortBy;
  const direction = sortOrder === 'asc' ? 1 : -1;

  return {
    [sortField]: direction,
    _id: direction,
  };
}

export const listingRepository = {
  async create(listingData) {
    return Listing.create(listingData);
  },

  async findAllByUser({
    userId,
    page = 1,
    limit = 10,
    search,
    status,
    category,
    platformStyle,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  }) {
    const skip = (page - 1) * limit;

    const query = buildUserListingQuery({
      userId,
      search,
      status,
      category,
      platformStyle,
    });

    const sort = buildSort(sortBy, sortOrder);

    const [items, totalItems] = await Promise.all([
      Listing.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(query),
    ]);

    return {
      items,
      totalItems,
    };
  },

  async findOneByIdAndUser({ id, userId }) {
    try {
      // Combining id and owner prevents listing-existence disclosure.
      return await Listing.findOne({
        _id: id,
        userId,
      });
    } catch (error) {
      if (isCastError(error)) {
        return null;
      }

      throw error;
    }
  },

  async updateOneByIdAndUser({ id, userId, updates }) {
    try {
      return await Listing.findOneAndUpdate(
        {
          _id: id,
          userId,
        },
        {
          $set: updates,
        },
        {
          new: true,
          runValidators: true,
          context: 'query',
        }
      );
    } catch (error) {
      if (isCastError(error)) {
        return null;
      }

      throw error;
    }
  },

  async deleteOneByIdAndUser({ id, userId }) {
    try {
      return await Listing.findOneAndDelete({
        _id: id,
        userId,
      });
    } catch (error) {
      if (isCastError(error)) {
        return null;
      }

      throw error;
    }
  },

  // Single aggregation, scoped to userId, for dashboard stats (API
  // Contract 4.1). $facet avoids four separate queries. $match needs a
  // real ObjectId — unlike find()/findOne(), aggregate() does not cast.
  async getStatsByUser(userId) {
    const [result] = await Listing.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          categoryCounts: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
        },
      },
    ]);

    return result;
  },
};