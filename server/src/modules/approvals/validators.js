import { z } from 'zod';
import { REVIEW_STATUS } from '../../config/constants.js';

export const reviewSchema = z.object({
  status: z.enum([REVIEW_STATUS.APPROVED, REVIEW_STATUS.REJECTED]),
  remarks: z.string().optional()
});
