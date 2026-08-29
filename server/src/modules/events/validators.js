import { z } from 'zod';


export const createEventSchema = z.object({
  title: z.string().min(2),
  date: z.string(), // or z.coerce.date()
  time: z.string()
});

export const updateEventSchema = z.object({
  title: z.string().min(2).optional(),
  date: z.string().optional(),
  time: z.string().optional()
});

export const updateEventStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'])
});

export const markAttendanceSchema = z.object({
  userId: z.string().uuid(),
  confidenceScore: z.number().min(0).max(100).optional()
});
