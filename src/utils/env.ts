import { z } from 'zod';

let envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  // Add other environment variables here
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    // console.error('Invalid environment variables:', error);
    process.exit(1);
  }
}

export let env = validateEnv();

export function validateAstrologyConfig() {
  let required = [
    'NEXT_PUBLIC_PROKERALA_CLIENT_ID',
    'NEXT_PUBLIC_PROKERALA_CLIENT_SECRET',
  ];
  let missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // console.warn('Missing required environment variables:', missing);
  }
}
