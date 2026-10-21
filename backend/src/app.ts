import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { toNodeHandler } from 'better-auth/node';
import { verifyConnection } from './config/database.js';
import { createApiRouter } from './routes/api.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { logger } from './utils/logger.js';
import { auth } from './config/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3001';

logger.info('Starting Hajri Backend API');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Port: ${PORT}`);

// Middleware
app.use(helmet());
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(compression());
app.use(pinoHttp({ logger }));

app.use((req, _res, next) => {
  req.headers['x-real-ip'] = req.ip;
  next();
});

// Better Auth must receive the raw request body before Express body parsers.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (_req, res) => {
  res.json({ message: 'Hajri Backend API' });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', createApiRouter());

// Error handling
app.use(errorHandler(logger));

// Start server
const startServer = async () => {
  try {
    await verifyConnection();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
