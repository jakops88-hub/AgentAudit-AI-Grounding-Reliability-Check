import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import crypto from 'crypto';

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Allow API key from header OR query parameter (for easier browser testing)
  const apiKey = (req.headers['x-api-key'] as string) || (req.query.api_key as string);

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({
      status: 'error',
      message: 'Missing or invalid API key. Please provide x-api-key header or api_key query parameter.',
    });
  }

  const providedKeyBuffer = Buffer.from(apiKey);
  let isValid = false;

  // Timing-safe comparison against all allowed keys
  for (const validKey of env.CLIENT_API_KEYS) {
    const validKeyBuffer = Buffer.from(validKey);
    
    // Only compare if lengths match to avoid leaking length information via error or timing
    if (providedKeyBuffer.length === validKeyBuffer.length) {
      if (crypto.timingSafeEqual(providedKeyBuffer, validKeyBuffer)) {
        isValid = true;
      }
    }
  }

  if (!isValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized. Invalid API key.',
    });
  }

  next();
};
