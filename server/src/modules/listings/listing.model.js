import mongoose from 'mongoose';

const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const estimatedPriceRangeSchema = new Schema(
  {
    min: {
      type: Number,
      required: true,
      min: 0,
    },
    max: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['INR'],
      default: 'INR',
      required: true,
    },
  },
  {
    _id: false,
  }
);

const aiMetaSchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    generatedAt: {
      type: Date,
      required: true,
      immutable: true,
    },
  },
  {
    _id: false,
  }
);

const listingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    highlights: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 80,
        },
      ],
      default: [],
      validate: {
        validator: (items) => items.length <= 6,
        message: 'Highlights cannot contain more than 6 items',
      },
    },

    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair'],
      default: 'good',
    },

    brand: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    age: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    originalPrice: {
      type: Number,
      min: 0,
    },

    askingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedPriceRange: {
      type: estimatedPriceRangeSchema,
      validate: {
        validator(value) {
          return !value || value.min <= value.max;
        },
        message:
          'Estimated price minimum cannot be greater than the maximum',
      },
    },

    platformStyle: {
      type: String,
      enum: ['general', 'olx', 'facebook'],
      required: true,
    },

    status: {
      type: String,
      enum: ['draft', 'active', 'sold'],
      default: 'draft',
      required: true,
    },

    // Stored internally as a one-element array while the public API
    // continues to expose a singular image object.
    images: {
      type: [imageSchema],
      required: true,
      immutable: true,
      validate: {
        validator: (images) => images.length === 1,
        message: 'A listing must contain exactly one image',
      },
    },

    // AI provenance is assigned only by the backend.
    aiMeta: {
      type: aiMetaSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

listingSchema.index({ userId: 1, status: 1 });
listingSchema.index({ userId: 1, category: 1 });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;