import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import dotenv from 'dotenv';

dotenv.config();

let adminToken = '';
let managerToken = '';
let employeeToken = '';
let employeeUserId = '';
let adminUserId = '';

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // Login HR Admin
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@staffsync.com', password: 'StaffSync@2026' });
  adminToken = adminRes.body.token;
  adminUserId = adminRes.body.user.id;

  // Login Manager
  const mgrRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'manager.eng@staffsync.com', password: 'StaffSync@2026' });
  managerToken = mgrRes.body.token;

  // Login Employee
  const empRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'john.doe@staffsync.com', password: 'StaffSync@2026' });
  employeeToken = empRes.body.token;
  employeeUserId = empRes.body.user.id;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('StaffSync Backend API Integration Tests', () => {
  // 1. Health check
  it('GET /api/v1/health should return status healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });

  // 2. Authentication & Unauthorized Access
  describe('Authentication & Access Control', () => {
    it('should reject login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@staffsync.com', password: 'WrongPassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me should return current user profile with token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('admin@staffsync.com');
      expect(res.body.user.role).toBe('hr_admin');
    });

    it('should reject unauthenticated request to protected endpoints', async () => {
      const res = await request(app).get('/api/v1/employees');
      expect(res.status).toBe(401);
    });

    it('should prevent standard employee from creating a department (role-based)', async () => {
      const res = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ name: 'Unauthorized Dept', code: 'UNAUTH' });
      expect(res.status).toBe(403);
    });
  });

  // 3. Employee Management
  describe('Employee Management', () => {
    it('GET /api/v1/employees should return list of employees for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(5);
    });

    it('POST /api/v1/employees should allow HR admin to create a new employee', async () => {
      const deptsRes = await request(app)
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`);
      const deptId = deptsRes.body.data[0]._id;

      const newEmp = {
        employeeId: `TEST-${Date.now().toString().slice(-4)}`,
        firstName: 'Test',
        lastName: 'QA',
        email: `test.qa.${Date.now()}@staffsync.com`,
        role: 'employee',
        designation: 'QA Tester',
        department: deptId
      };

      const res = await request(app)
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newEmp);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeId).toBe(newEmp.employeeId);
    });
  });

  // 4. Leave Management & Balance Updates
  describe('Leave Management & Balances', () => {
    let createdLeaveId = '';

    it('GET /api/v1/leaves/balance/me should return valid leave balance bucket', async () => {
      const res = await request(app)
        .get('/api/v1/leaves/balance/me')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.casual).toBeDefined();
      expect(res.body.data.sick).toBeDefined();
    });

    it('POST /api/v1/leaves should allow employee to apply for leave', async () => {
      const res = await request(app)
        .post('/api/v1/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'sick',
          startDate: '2026-12-28',
          endDate: '2026-12-29',
          reason: 'Medical rest and recovery.'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      createdLeaveId = res.body.data._id;
    });

    it('should prevent overlapping leave request', async () => {
      const res = await request(app)
        .post('/api/v1/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'sick',
          startDate: '2026-12-28',
          endDate: '2026-12-29',
          reason: 'Duplicate dates application.'
        });
      expect(res.status).toBe(409);
    });

    it('PATCH /api/v1/leaves/:id/approve should allow manager/HR to approve leave and adjust balance', async () => {
      const res = await request(app)
        .patch(`/api/v1/leaves/${createdLeaveId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ comment: 'Approved for test verification' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('approved');
    });

    it('should reject duplicate approval on already approved leave', async () => {
      const res = await request(app)
        .patch(`/api/v1/leaves/${createdLeaveId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ comment: 'Duplicate try' });
      expect(res.status).toBe(400);
    });
  });

  // 5. Attendance & Duplicate Prevention
  describe('Attendance Management', () => {
    it('should prevent duplicate check-in if user already checked in today', async () => {
      // emp1 (john.doe) was already checked in during seed
      const res = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('PATCH /api/v1/attendance/check-out should check out employee and compute duration', async () => {
      const res = await request(app)
        .patch('/api/v1/attendance/check-out')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ notes: 'Testing checkout verification' });
      expect(res.status).toBe(200);
      expect(res.body.data.checkOut).toBeDefined();
    });

    it('should prevent invalid check-out when no active session exists', async () => {
      const res = await request(app)
        .patch('/api/v1/attendance/check-out')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.status).toBe(400);
    });
  });

  // 6. Announcements & Training
  describe('Announcements & Training Programs', () => {
    it('GET /api/v1/announcements should return published announcements', async () => {
      const res = await request(app)
        .get('/api/v1/announcements')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/trainings should return list of trainings with enrollment flags', async () => {
      const res = await request(app)
        .get('/api/v1/trainings')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // 7. Role-Specific Dashboards
  describe('Dashboard Analytics', () => {
    it('GET /api/v1/dashboard/hr should return comprehensive HR statistics', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/hr')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalActiveEmployees).toBeGreaterThan(0);
      expect(res.body.data.departmentDistribution).toBeDefined();
      expect(res.body.data.attendanceTrends).toBeDefined();
    });

    it('GET /api/v1/dashboard/manager should return assigned team stats', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/manager')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.teamSize).toBeGreaterThan(0);
      expect(res.body.data.teamAttendanceSummary).toBeDefined();
    });

    it('GET /api/v1/dashboard/employee should return personal stats and timer', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/employee')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.leaveBalance).toBeDefined();
      expect(res.body.data.todayAttendance).toBeDefined();
    });
  });
});

