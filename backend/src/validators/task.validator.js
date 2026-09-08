import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề task không được để trống'),
  description: z.string().optional(),
  projectId: z.string().uuid('projectId không hợp lệ'),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export { createTaskSchema, updateTaskSchema };
