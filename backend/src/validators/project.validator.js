import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Tên project không được để trống'),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Tên project không được để trống'),
});

export { createProjectSchema, updateProjectSchema };
