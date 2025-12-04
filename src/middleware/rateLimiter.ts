import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter Configuration
 * Note: In a serverless environment (like Vercel), this in-memory store 
 * will reset on every function cold start. For production serverless, 
 * use an external store like Redis (e.g., Upstash) with 'rate-limit-redis'.
 */

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please slow down.'
  }
});
