import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import crypto from 'crypto';

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Check if request is from RapidAPI
  const rapidApiSecret = req.headers['x-rapidapi-proxy-secret'] as string;
  if (rapidApiSecret && process.env.RAPIDAPI_PROXY_SECRET) {
    if (rapidApiSecret === process.env.RAPIDAPI_PROXY_SECRET) {
      // Valid RapidAPI request - bypass normal API key check
      return next();
    } else {
      console.warn('Invalid RapidAPI proxy secret');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid RapidAPI proxy secret',
      });
    }
  }

  // Normal API key authentication
  const apiKey = (req.headers['x-api-key'] as string) || (req.query.api_key as string);

  if (!apiKey || typeof apiKey !== 'string') {
    console.log('Auth failed: No API key provided');
    return res.status(401).json({
      status: 'error',
      message: 'Missing or invalid API key. Please provide x-api-key header or api_key query parameter.',
    });
  }

  // Normalize CLIENT_API_KEYS to array (handle both Zod-parsed array and raw string fallback)
  let clientKeys: string[] = [];
  if (Array.isArray(env.CLIENT_API_KEYS)) {
    clientKeys = env.CLIENT_API_KEYS;
  } else if (typeof env.CLIENT_API_KEYS === 'string') {
    // Fallback for when Zod validation fails and we get raw process.env
    clientKeys = (env.CLIENT_API_KEYS as string).split(',').map(k => k.trim()).filter(k => k.length > 0);
  }

  // Debug logging for Vercel
  if (clientKeys.length === 0) {
    console.error('CRITICAL: No CLIENT_API_KEYS configured in environment!');
  } else {
    // Log configured keys (masked) to help debug mismatch
    console.log(`Auth Debug: Received key length ${apiKey.length}. Configured keys: ${clientKeys.length}`);
    clientKeys.forEach((k: string, i: number) => {
        console.log(`Key [${i}]: length=${k.length}, prefix=${k.substring(0, 2)}***`);
    });
  }

  const providedKeyBuffer = Buffer.from(apiKey);
  let isValid = false;

  // Timing-safe comparison against all allowed keys
  for (const validKey of clientKeys) {
    const validKeyBuffer = Buffer.from(validKey);
    
    // Only compare if lengths match to avoid leaking length information via error or timing
    if (providedKeyBuffer.length === validKeyBuffer.length) {
      if (crypto.timingSafeEqual(providedKeyBuffer, validKeyBuffer)) {
        isValid = true;
        break;
      }
    }
  }

  if (!isValid) {
    console.warn(`Auth failed: Invalid key provided. (Key length: ${apiKey.length})`);
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized. Invalid API key.',
    });
  }

  next();
};
