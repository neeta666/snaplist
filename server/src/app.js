// Express app configuration.
//
// Separated from server.js (which just starts listening) so the app itself
// can be imported directly by tests later (Slice 9) without binding a port.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers (ADR / Technical Design Document, section 11).
app.use(helmet());

// CORS restricted to the configured frontend origin — never a wildcard,
// per the Technical Design Document's security strategy.
app.use(cors({ origin: env.corsOrigin, credentials: true }));

// Request logging. 'dev' format is concise and readable locally; a more
// structured logger can replace this in Slice 9 if needed.
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// Order matters: notFound only fires for unmatched routes, and must be
// registered after all real routes but before the error handler.
app.use(notFound);
app.use(errorHandler);

export default app;
