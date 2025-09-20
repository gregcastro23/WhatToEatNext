import { z } from 'zod';

const envSchema = z.object({;
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  // Add other environment variables here
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    process.exit(1);
  }
}

export const env = validateEnv();

export function validateAstrologyConfig() {
  const required = ['NEXT_PUBLIC_PROKERALA_CLIENT_ID', 'NEXT_PUBLIC_PROKERALA_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }
}
