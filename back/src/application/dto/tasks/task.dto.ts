import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'done']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  userId: z.number(),
  isActive: z.boolean().default(true),
});
export type CreateTaskDTO = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
