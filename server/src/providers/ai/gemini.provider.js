import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { AIProviderInterface } from './ai.interface.js';

const ai = new GoogleGenAI({ apiKey: env.gemini.apiKey });

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Mirrors GenerateListingOutput exactly — enforced both on the Gemini side
// (response_format) and here, since a schema-conformant response can still
// contain out-of-range values (e.g. min > max, empty strings).
const listingResponseSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    category: { type: 'string' },
    highlights: { type: 'array', items: { type: 'string' } },
    estimatedPriceRange: {
      type: 'object',
      properties: {
        min: { type: 'number' },
        max: { type: 'number' },
        currency: { type: 'string', enum: ['INR'] },
      },
      required: ['min', 'max', 'currency'],
      additionalProperties: false,
    },
  },
  required: ['title', 'description', 'category', 'highlights', 'estimatedPriceRange'],
  additionalProperties: false,
};

const listingOutputZodSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(2000),
    category: z.string().trim().min(1).max(50),
    highlights: z.array(z.string().trim().min(1).max(80)).min(1).max(6),
    estimatedPriceRange: z
      .object({
        min: z.number().nonnegative(),
        max: z.number().nonnegative(),
        currency: z.literal('INR'),
      })
      .refine((range) => range.min <= range.max, {
        message: 'estimatedPriceRange.min must be <= estimatedPriceRange.max',
      }),
  })
  .strict();

async function fetchImageAsInlineData(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to download image from ImageKit: ${res.status} ${res.statusText}`);
  }

  const mimeType = res.headers.get('content-type');
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported image type from ImageKit: ${mimeType}`);
  }

  const buffer = await res.arrayBuffer();
  const data = Buffer.from(buffer).toString('base64');
  return { data, mimeType };
}

function buildPrompt(input) {
  const details = [
    input.condition && `Condition: ${input.condition}`,
    input.brand && `Brand: ${input.brand}`,
    input.age && `Age: ${input.age}`,
    input.originalPrice !== undefined && `Original price: INR ${input.originalPrice}`,
    `Target platform style: ${input.platformStyle}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `You are generating a resale marketplace listing for the Indian market from the product photo provided.

${details}

Write a title, description, category, 3-5 highlights, and an estimated resale price range in INR based on the image and details above. Base the price on realistic Indian resale market value, not original retail price.`;
}

export const geminiProvider = {
  ...AIProviderInterface,

  async generateListing(input) {
    const { data, mimeType } = await fetchImageAsInlineData(input.imageUrl);

    const interaction = await ai.interactions.create({
      model: env.gemini.model,
      input: [
        { type: 'text', text: buildPrompt(input) },
        { type: 'image', data, mime_type: mimeType },
      ],
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: listingResponseSchema,
      },
    });

    let validated;
    try {
      const parsed = JSON.parse(interaction.output_text);
      validated = listingOutputZodSchema.parse(parsed);
    } catch {
      throw new Error('Gemini returned an invalid listing response.');
    }

    return validated;
  },
};