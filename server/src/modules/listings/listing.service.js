import { AppError } from '../../utils/AppError.js';
import { listingRepository } from './listing.repository.js';

function toPublicListing(doc) {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    highlights: doc.highlights,
    condition: doc.condition,
    brand: doc.brand,
    age: doc.age,
    originalPrice: doc.originalPrice,
    askingPrice: doc.askingPrice,
    estimatedPriceRange: doc.estimatedPriceRange,
    platformStyle: doc.platformStyle,
    status: doc.status,
    image: doc.images[0],
    aiMeta: doc.aiMeta,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const listingService = {
  async create({ userId, listingData, aiMeta }) {
    // The public API accepts one image, while MongoDB stores a
    // one-element array for possible future multi-image support.
    const { image, ...content } = listingData;

    const listing = await listingRepository.create({
      ...content,
      userId,
      images: [image],

      // AI provenance must come from trusted server-side code.
      aiMeta,
    });

    return toPublicListing(listing);
  },

  async getAll({
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
    const { items, totalItems } = await listingRepository.findAllByUser({
      userId,
      page,
      limit,
      search,
      status,
      category,
      platformStyle,
      sortBy,
      sortOrder,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: items.map(toPublicListing),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getById({ userId, id }) {
    const listing = await listingRepository.findOneByIdAndUser({
      id,
      userId,
    });

    // Do not reveal whether a listing exists for another user.
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    return toPublicListing(listing);
  },

  async update({ userId, id, updates }) {
    const listing = await listingRepository.updateOneByIdAndUser({
      id,
      userId,
      updates,
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    return toPublicListing(listing);
  },

  async remove({ userId, id }) {
    const listing = await listingRepository.deleteOneByIdAndUser({
      id,
      userId,
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    return {
      image: listing.images[0],
    };
  },
};