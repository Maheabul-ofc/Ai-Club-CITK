import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Temporarily increased to 100 so you can test without being locked out
  message: { success: false, message: 'Too many requests, please try again later.' }
});
