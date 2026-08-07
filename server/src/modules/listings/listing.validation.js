import { z } from 'zod';
import { sendError } from '../../utils/response.js';

const conditionSchema = z.enum(['new', 'like_new', 'good', 'fair']);

const platformStyleSchema = z.enum(['general', 'olx', 'facebook']);

const statusSchema = z.enum(['draft', 'active', 'sold']);

const imageSchema = z
  .object({
    url: z.string().trim().url('Image URL must be valid'),
    publicId: z.string().trim().min(1, 'Image public ID is required'),
  })
  .strict();

const estimatedPriceRangeSchema = z
  .object({
    min: z
      .number()
      .nonnegative('Estimated minimum price cannot be negative'),
    max: z
      .number()
      .nonnegative('Estimated maximum price cannot be negative'),
    currency: z.literal('INR'),
  })
  .strict()
  .refine((value) => value.min <= value.max, {
    message: 'Estimated minimum price cannot exceed maximum price',
    path: ['min'],
  });

const highlightsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'Highlight cannot be empty')
      .max(80, 'Each highlight must be at most 80 characters')
  )
  .max(6, 'Highlights cannot contain more than 6 items');

const listingFields = {
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),

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

  highlights: highlightsSchema.optional(),

  condition: conditionSchema.optional(),

  brand: z
    .string()
    .trim()
    .max(50, 'Brand must be at most 50 characters')
    .optional(),

  age: z
    .string()
    .trim()
    .max(30, 'Age must be at most 30 characters')
    .optional(),

  originalPrice: z
    .number()
    .nonnegative('Original price cannot be negative')
    .optional(),

  askingPrice: z
    .number()
    .nonnegative('Asking price cannot be negative'),

  estimatedPriceRange: estimatedPriceRangeSchema.optional(),

  platformStyle: platformStyleSchema,

  status: statusSchema.optional(),
};

const saveListingSchema = z
  .object({
    ...listingFields,
    image: imageSchema,
  })
  .strict();

const updateListingSchema = z
  .object({
    title: listingFields.title.optional(),
    description: listingFields.description.optional(),
    category: listingFields.category.optional(),
    highlights: listingFields.highlights,
    condition: listingFields.condition,
    brand: listingFields.brand,
    age: listingFields.age,
    originalPrice: listingFields.originalPrice,
    askingPrice: listingFields.askingPrice.optional(),
    estimatedPriceRange: listingFields.estimatedPriceRange,
    platformStyle: listingFields.platformStyle.optional(),
    status: listingFields.status,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

// Multipart text fields arrive as strings, and optional fields left blank
// in a form arrive as "" rather than being omitted — so "" is normalized
// to undefined before the usual field schemas run, otherwise "" would fail
// enum/string validation and originalPrice="" would coerce to 0.
const emptyToUndefined = (value) => (value === '' ? undefined : value);

const generateListingSchema = z
  .object({
    condition: z.preprocess(emptyToUndefined, listingFields.condition),
    brand: z.preprocess(emptyToUndefined, listingFields.brand),
    age: z.preprocess(emptyToUndefined, listingFields.age),
    originalPrice: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .nonnegative('Original price cannot be negative')
        .optional()
    ),
    platformStyle: listingFields.platformStyle,
  })
  .strict();

const listingIdSchema = z.object({
  id: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Listing not found'),
});

const listingQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().min(1).optional(),
    status: statusSchema.optional(),
    category: z.string().trim().min(1).optional(),
    platformStyle: platformStyleSchema.optional(),
    sortBy: z.enum(['createdAt', 'price', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

function zodIssuesToErrors(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

function validateBody(schema) {
  return function validationMiddleware(req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return sendError(res, {
        statusCode: 422,
        message: 'Validation failed',
        errors: zodIssuesToErrors(result.error.issues),
      });
    }

    req.body = result.data;
    return next();
  };
}

export const validateSaveListing = validateBody(saveListingSchema);

export const validateUpdateListing = validateBody(updateListingSchema);

export const validateGenerateListing = validateBody(generateListingSchema);

export function validateListingId(req, res, next) {
  const result = listingIdSchema.safeParse(req.params);

  // Invalid, missing, and non-owned listing IDs must all look identical.
  if (!result.success) {
    return sendError(res, {
      statusCode: 404,
      message: 'Listing not found',
    });
  }

  req.params = {
    ...req.params,
    ...result.data,
  };

  return next();
}

export function validateListingQuery(req, res, next) {
  const result = listingQuerySchema.safeParse(req.query);

  if (!result.success) {
    return sendError(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: zodIssuesToErrors(result.error.issues),
    });
  }

  req.validatedQuery = result.data;

  return next();
}