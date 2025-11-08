import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  userName: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(5, 'La contraseña debe tener al menos 5 caracteres'),
  userRole: z.enum(['user', 'admin']).default('user'),
});


export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  userName: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(5, 'La contraseña debe tener al menos 5 caracteres'),
  userRole: z.enum(['user', 'admin']).default('user'),
});

export const patchUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio').optional(),
  lastName: z.string().min(1, 'El apellido es obligatorio').optional(),
  userName: z.string().min(3, 'Debe tener al menos 3 caracteres').optional(),
  email: z.string().email('Debe ser un email válido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  userRole: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional()
});


export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type PatchUserDTO = z.infer<typeof patchUserSchema>;
