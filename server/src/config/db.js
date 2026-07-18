// MongoDB connection setup — connection only.
//
// Per Slice 0 scope, no Mongoose models/schemas are defined here or anywhere
// else yet. This file's only job is to establish and report on the database
// connection so the rest of the scaffolding (e.g. the health-check endpoint)
// can confirm connectivity. The User model begins in Slice 1 (alongside
// auth); the Listing model begins in Slice 4 (per the Development
// Checklist) — neither exists yet.
//
// Startup behavior is deliberately environment-dependent:
//   - In development, a missing MONGO_URI or a failed connection attempt
//     is logged as a warning, and the server still starts — the health
//     check will simply report "disconnected". This keeps the rest of the
//     scaffold inspectable without requiring a database for local review.
//   - In production, a missing MONGO_URI or a failed connection attempt is
//     treated as fatal: connectDB() throws, and server.js is responsible
//     for catching that and exiting the process with a non-zero code
//     rather than letting a partially-unusable API start listening and
//     report itself as healthy when it isn't.

import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  const isProduction = env.nodeEnv === 'production';

  if (!env.mongoUri) {
    if (isProduction) {
      throw new Error('MONGO_URI is not set. Refusing to start in production without a database connection.');
    }
    console.warn('[db] MONGO_URI is not set — skipping MongoDB connection (development only).');
    return;
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log('[db] MongoDB connected successfully.');
  } catch (error) {
    if (isProduction) {
      // Re-throw so the caller (server.js) can stop startup entirely,
      // rather than continuing to listen with a broken database.
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
    console.error('[db] MongoDB connection failed (continuing in development, reporting as disconnected):', error.message);
  }
}

export function getDbStatus() {
  // Mongoose connection readyState: 0 = disconnected, 1 = connected,
  // 2 = connecting, 3 = disconnecting. Used by the health-check endpoint.
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return stateMap[mongoose.connection.readyState] || 'unknown';
}
