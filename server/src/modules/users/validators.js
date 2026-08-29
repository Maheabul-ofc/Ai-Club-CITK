import { z } from 'zod';
import { ROLES } from '../../config/constants.js';

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(ROLES),
  departmentId: z.string().uuid("Invalid department ID").optional()
});

export const updateTeamMemberSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Invalid email").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
  role: z.nativeEnum(ROLES).optional(),
  departmentId: z.string().uuid("Invalid department ID").optional().nullable(),
  branch: z.string().optional().nullable(),
  semester: z.number().int().optional().nullable(),
});

export const createAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  contactNumber: z.string().optional(),
  branch: z.string().optional(),
  semester: z.number().int().optional(),
  module: z.string().optional()
});
