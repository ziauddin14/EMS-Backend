import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import healthRoutes from './modules/shared/routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import employeeRoutes from './modules/employee/employee.routes.js';
import employeeDocumentRoutes from './modules/employeeDocument/employeeDocument.routes.js';
import hierarchyRoutes from './modules/hierarchy/hierarchy.routes.js';
import employeeLifecycleRoutes from './modules/employeeLifecycle/employeeLifecycle.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { ApiResponse } from './core/responses/index.js';

const app = express();

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs || 15 * 60 * 1000,
  max: config.rateLimitMax || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());
app.use(cookieParser());
app.use(xss());
app.use(hpp());
app.use('/api', limiter);

app.get('/', (req, res) => {
  ApiResponse.success(res, 'EMS Backend API is running.', { version: 'v1' });
});

app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/employee-documents', employeeDocumentRoutes);
app.use('/api/v1/hierarchy', hierarchyRoutes);
app.use('/api/v1/lifecycle', employeeLifecycleRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.all('*', notFoundHandler);
app.use(globalErrorHandler);

export default app;
