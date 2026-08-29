import { z } from 'zod';

export const signupMemberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rollNumber: z.string().optional(),
  branch: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
  module: z.string().optional(),
  contactNumber: z.string().optional(),
  photos: z.array(z.string()).min(5).max(5)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const signupCoordinatorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rollNumber: z.string().optional(),
  branch: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
  module: z.string().optional(),
  contactNumber: z.string().optional(),
  departmentId: z.string().uuid(),
  photos: z.array(z.string()).min(5).max(5)
});
