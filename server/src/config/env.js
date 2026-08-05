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

  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};