import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API routes under /api/v1
const API_PREFIX = '/api/v1';

app.use(API_PREFIX, healthRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/employees`, employeeRoutes);
app.use(`${API_PREFIX}/departments`, departmentRoutes);
app.use(`${API_PREFIX}/leaves`, leaveRoutes);
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/announcements`, announcementRoutes);
app.use(`${API_PREFIX}/trainings`, trainingRoutes);
app.use(`${API_PREFIX}/holidays`, holidayRoutes);
app.use(`${API_PREFIX}/leave-policies`, policyRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/audit-logs`, auditRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on StaffSync server`
  });
});

// Central error handler
app.use(errorHandler);

export default app;

