import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { connectDB } from '../src/config/db';

jest.setTimeout(30000);

describe('API Integration Tests', () => {
  // We need valid tokens for roles. Normally we'd fetch them via login, or mock them.
  // Assuming the DB is seeded, we can use the seed users.
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await connectDB();
    
    // Get Admin token
    const adminRes = await request(app).post('/api/auth/login').send({
      userId: 'admin001',
      password: 'Admin@123',
      role: 'ADMIN'
    });
    adminToken = adminRes.body.token;

    // Get User token
    const userRes = await request(app).post('/api/auth/login').send({
      userId: 'user001',
      password: 'User@123',
      role: 'GENERAL_USER'
    });
    userToken = userRes.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should reject login if role mismatches', async () => {
    const res = await request(app).post('/api/auth/login').send({
      userId: 'user001',
      password: 'User@123',
      role: 'ADMIN' // Invalid role for user001
    });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/role/i);
  });

  it('should return 403 when general user accesses /api/users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('should scope records to the general user', async () => {
    // Admin gets all records
    const adminRes = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.records.length).toBeGreaterThan(0);

    // User gets only their records
    const userRes = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${userToken}`);
    expect(userRes.status).toBe(200);
    
    // Ensure every record returned belongs to user001
    const allUserRecords = userRes.body.records;
    allUserRecords.forEach((record: any) => {
      expect(record.ownerUserId).toBe('user001');
    });
  });

  it('should clamp delay middleware value between 0 and 10000', async () => {
    const start = Date.now();
    // Ask for 15000ms delay, but it should be clamped to 10000ms
    const res = await request(app)
      .get('/api/records?delay=15000')
      .set('Authorization', `Bearer ${adminToken}`);
    const duration = Date.now() - start;
    
    expect(res.status).toBe(200);
    expect(duration).toBeGreaterThanOrEqual(9800); // give 200ms leeway for JS timer inaccuracies
    expect(duration).toBeLessThan(12000); // Should definitely not be 15000
  }, 15000);
});
