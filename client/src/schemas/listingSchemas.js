import { z } from 'zod';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

// Mirrors the backend's empty-string normalization for optional multipart
// fields (API Contract 3.1) so blank inputs behave the same on both sides.
const emptyToUndefined = (value) => (value === '' ? undefined : value);

// For required numeric fields: converts non-empty input to a number here,
// so undefined reaches z.number()'s required check directly instead of
// z.coerce.number() turning it into NaN first (Number(undefined) === NaN).
const toRequiredNumber = (value) => {
  if (value === '' || value === undefined || value === null) return undefined;
  return typeof value === 'number' ? value : Number(value);
};

// Zod 4 replaced required_error/invalid_type_error with a single `error`
// function. issue.input is undefined only when the field was missing, so
// that's how "required" and "must be a number" are distinguished here.
const requiredNumberError = (label) => (issue) =>
  issue.input === undefined ? `${label} is required` : `${label} must be a number`;

export const generateListingSchema = z.object({
  // RHF's {...register('image')} on a file input supplies a FileList, not
  // a File — validate that shape, then transform to the single File so
  // every consumer downstream (onSubmit, listingService) gets a plain File.
  image: z
    .instanceof(FileList, { message: 'Image is required' })
    .refine((files) => files.length > 0, { message: 'Image is required' })
    .transform((files) => files[0])
    .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), {
      message: 'Image must be jpeg, png, or webp',
    })
    .refine((file) => file.size <= MAX_IMAGE_SIZE_BYTES, {
      message: 'Image must be 8MB or smaller',
    }),

  condition: z.preprocess(
    emptyToUndefined,
    z.enum(['new', 'like_new', 'good', 'fair']).optional()
  ),

  brand: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(50, 'Brand must be at most 50 characters').optional()
  ),

  age: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(30, 'Age must be at most 30 characters').optional()
  ),

  originalPrice: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: () => 'Original price must be a number' })
      .nonnegative('Original price cannot be negative')
      .optional()
  ),

  platformStyle: z.enum(['general', 'olx', 'facebook'], {
    error: () => 'Platform style is required',
  }),
});

// Save Listing (API Contract 3.2). image, condition/brand/age/platformStyle,
// and originalPrice all come from the already-generated draft carried
// forward from Generate, not re-entered by the user — askingPrice is the
// one genuinely new required input at this step.
const savedImageSchema = z.object({
  url: z.string().trim().url('Image URL must be valid'),
  publicId: z.string().trim().min(1, 'Image public ID is required'),
});

const savedHighlightsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'Highlight cannot be empty')
      .max(80, 'Each highlight must be at most 80 characters')
  )
  .max(6, 'Highlights cannot contain more than 6 items')
  .optional();

// Blank min/max must fail as missing, not silently become 0 — see
// toRequiredNumber above for why coerce.number() alone can't do this.
const estimatedPriceRangeSchema = z
  .object({
    min: z.preprocess(
      toRequiredNumber,
      z
        .number({ error: requiredNumberError('Estimated minimum price') })
        .nonnegative('Estimated minimum price cannot be negative')
    ),
    max: z.preprocess(
      toRequiredNumber,
      z
        .number({ error: requiredNumberError('Estimated maximum price') })
        .nonnegative('Estimated maximum price cannot be negative')
    ),
    currency: z.literal('INR'),
  })
  .refine((value) => value.min <= value.max, {
    message: 'Estimated minimum price cannot exceed maximum price',
    path: ['min'],
  })
  .optional();

export const saveListingSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),

  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description must be at most 2000 characters'),

  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .max(50, 'Category must be at most 50 characters'),

  highlights: savedHighlightsSchema,

  condition: z.preprocess(
    emptyToUndefined,
    z.enum(['new', 'like_new', 'good', 'fair']).optional()
  ),

  brand: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(50, 'Brand must be at most 50 characters').optional()
  ),

  age: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(30, 'Age must be at most 30 characters').optional()
  ),

  originalPrice: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: () => 'Original price must be a number' })
      .nonnegative('Original price cannot be negative')
      .optional()
  ),

  askingPrice: z.preprocess(
    toRequiredNumber,
    z
      .number({ error: requiredNumberError('Asking price') })
      .nonnegative('Asking price cannot be negative')
  ),

  estimatedPriceRange: estimatedPriceRangeSchema,

  platformStyle: z.enum(['general', 'olx', 'facebook'], {
    error: () => 'Platform style is required',
  }),

  status: z.enum(['draft', 'active', 'sold']).optional(),

  image: savedImageSchema,
});