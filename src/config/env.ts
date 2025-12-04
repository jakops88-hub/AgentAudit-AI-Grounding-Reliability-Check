import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  CLIENT_API_KEYS: z.string().default('').transform((val) => val.split(',').map(k => k.trim()).filter(k => k.length > 0)),
  PRISMA_DATABASE_URL: z.string().min(1, "PRISMA_DATABASE_URL is required"),
  POSTGRES_URL: z.string().min(1, "POSTGRES_URL is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
