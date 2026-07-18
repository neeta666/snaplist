// Server entry point.
//
// Connects to MongoDB, then starts the HTTP listener. Kept separate from
// app.js so app.js stays importable on its own (useful for future
// integration tests that don't need a real listening port).
//
// Startup failure handling: connectDB() throws in production if MONGO_URI
// is missing or the connection fails (see config/db.js). That failure is
// caught here explicitly and turned into a logged error plus a non-zero
// process exit, so a broken production database never results in either an
// unhandled promise rejection or an HTTP listener starting up and reporting
// itself as healthy while unable to actually serve data. In development,
// connectDB() never throws for these cases — it just logs and returns — so
// this catch block is only ever exercised in production.

import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  try {
    await connectDB();
  } catch (error) {
    console.error('[server] Fatal startup error — could not establish a required database connection:', error.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`[server] SnapList API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start();
