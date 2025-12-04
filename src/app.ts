import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import verifyRoutes from './routes/verifyRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { authenticateApiKey } from './middleware/auth';
import { apiLimiter } from './middleware/rateLimiter';
import { swaggerDocument } from './docs/swagger';

const app = express();

// Trust Proxy (Required for Vercel/Rate Limiting)
app.set('trust proxy', 1);

// Security & Performance Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting
app.use('/api', apiLimiter);

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/v1', authenticateApiKey, verifyRoutes);
app.use('/api/v1', authenticateApiKey, analyticsRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    env_check: {
      openai: !!process.env.OPENAI_API_KEY,
      prisma: !!process.env.PRISMA_DATABASE_URL,
      postgres: !!process.env.POSTGRES_URL
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;
