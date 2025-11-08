import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development','test','production']).default('development'),

  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.coerce.number(),
  DB_ENCRYPT: z.coerce.boolean(),
  DB_TRUST_SERVER_CERT: z.coerce.boolean(),
  DB_POOL_MIN: z.coerce.number().default(0),
  DB_POOL_MAX: z.coerce.number().default(10),
  DB_POOL_IDLE: z.coerce.number().default(30000),

  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number(),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10)
});

export const env = envSchema.parse(process.env);
