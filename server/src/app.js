import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authLimiter } from './middleware/rateLimiter.js';
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import departmentRoutes from './modules/departments/routes.js';
import approvalRoutes from './modules/approvals/routes.js';
import eventRoutes from './modules/events/routes.js';
import analyticsRoutes from './modules/analytics/routes.js';
import auditRoutes from './modules/audit/routes.js';
import leadershipRoutes from './modules/leadership/routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/leadership', leadershipRoutes);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

app.use(errorHandler);

export default app;
