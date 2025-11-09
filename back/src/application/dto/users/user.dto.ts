import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters long'),
  userRole: z.enum(['user', 'admin']).default('user'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters long'),
  userRole: z.enum(['user', 'admin']).default('user'),
});

export const patchUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  userName: z.string().min(3, 'Username must be at least 3 characters long').optional(),
  email: z.string().email('Must be a valid email address').optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .optional(),
  userRole: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type PatchUserDTO = z.infer<typeof patchUserSchema>;
