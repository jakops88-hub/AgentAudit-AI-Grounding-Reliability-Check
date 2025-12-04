import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import crypto from 'crypto';

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({
      status: 'error',
      message: 'Missing or invalid API key. Please provide x-api-key header.',
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
