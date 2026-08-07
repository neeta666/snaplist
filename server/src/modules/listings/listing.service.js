import { AppError } from '../../utils/AppError.js';
import { listingRepository } from './listing.repository.js';
import { imagekitProvider } from '../../providers/storage/imagekit.provider.js';
import { geminiProvider } from '../../providers/ai/gemini.provider.js';

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

  async generateDraft({ file, fields }) {
    let uploadedImage;
    try {
      uploadedImage = await imagekitProvider.uploadImage(file.buffer);
    } catch {
      throw new AppError('Image storage service is temporarily unavailable', 503);
    }

    let draftContent;
    try {
      draftContent = await geminiProvider.generateListing({
        imageUrl: uploadedImage.url,
        condition: fields.condition,
        brand: fields.brand,
        age: fields.age,
        originalPrice: fields.originalPrice,
        platformStyle: fields.platformStyle,
      });
    } catch (generationError) {
      try {
        await imagekitProvider.deleteImage(uploadedImage.publicId);
      } catch (cleanupError) {
        // Cleanup failure is a secondary, lower-severity problem — the
        // orphaned asset is an already-accepted MVP tradeoff (API Contract
        // 3.1). It must not mask the original Gemini failure.
        console.error('[listing.generateDraft] Failed to clean up orphaned ImageKit asset', cleanupError);
      }

      const providerStatus = generationError.status ?? generationError.statusCode;
      if (providerStatus === 503) {
        throw new AppError('AI service is temporarily unavailable', 503);
      }
      throw new AppError('AI generation failed', 502);
    }

    return {
      title: draftContent.title,
      description: draftContent.description,
      category: draftContent.category,
      highlights: draftContent.highlights,
      estimatedPriceRange: draftContent.estimatedPriceRange,
      image: {
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
      },
    };
  },
};