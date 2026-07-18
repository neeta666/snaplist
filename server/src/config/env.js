// Centralized environment variable access.
//
// Design decision: every other file in the app imports `env` from here rather
// than calling `process.env.X` directly. This gives us one place to see every
// variable the backend depends on, and one place to add validation later
// (e.g., "throw at startup if JWT_SECRET is missing") without hunting through
// the codebase. In Slice 0, we only read the variables scaffolding needs;
// later slices (auth, Cloudinary, Gemini) will add their own keys here rather
// than reading process.env inline in their own modules.

import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGO_URI || '',

  // Placeholders for future slices. Left undefined-safe here so Slice 0 can
  // boot without them; later slices will add real validation (e.g. refusing
  // to start if a required secret is missing).
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
