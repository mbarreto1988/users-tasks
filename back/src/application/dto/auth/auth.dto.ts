import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  userName: z.string().min(3, 'Debe tener al menos 3 caracteres'),
  email: z.email('Debe ser un email válido'),
  password: z.string().min(5, 'Debe tener al menos 5 caracteres'),
  userRole: z.enum(['user', 'admin']).default('user')
});
export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email('Debe ser un email válido'),
  password: z.string().min(5, 'Debe tener al menos 5 caracteres'),
});
export type LoginDTO = z.infer<typeof loginSchema>;
