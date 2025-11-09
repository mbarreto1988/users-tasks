import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  userName: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters long'),
  userRole: z.enum(['user', 'admin']).default('user'),
});
export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters long'),
});
export type LoginDTO = z.infer<typeof loginSchema>;
