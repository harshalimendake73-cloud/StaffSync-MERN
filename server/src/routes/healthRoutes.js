import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    success: true,
    service: 'StaffSync HR Management System API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0'
  });
});

export default router;

