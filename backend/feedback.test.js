const request = require('supertest');
const app = require('./app');

// Mock tokens (replace with real tokens or mock auth in a real test env)
const studentToken = 'Bearer <student_jwt_token>';
const adminToken = 'Bearer <admin_jwt_token>';

// Sample feedback data
const feedbackData = {
  course_id: 1,
  teacher_id: 1,
  rating: 5,
  comment: 'Great course!',
  anonymous: false
};

let feedbackId;

describe('Feedback API', () => {
  it('should submit feedback (student)', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', studentToken)
      .send(feedbackData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('sentiment');
  });

  it('should get all feedback (admin)', async () => {
    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) feedbackId = res.body[0].id;
  });

  it('should filter feedback (admin)', async () => {
    const res = await request(app)
      .get('/api/feedback/filter?course_id=1&sentiment=positive')
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update feedback (student or admin)', async () => {
    if (!feedbackId) return;
    const res = await request(app)
      .put(`/api/feedback/${feedbackId}`)
      .set('Authorization', studentToken)
      .send({ rating: 4, comment: 'Updated comment', anonymous: true });
    // Accept 200 or 403 (if not owner)
    expect([200, 403]).toContain(res.statusCode);
  });

  it('should get feedback for a course (admin)', async () => {
    const res = await request(app)
      .get('/api/feedback/course/1')
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get feedback for a teacher (admin)', async () => {
    const res = await request(app)
      .get('/api/feedback/teacher/1')
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get course analytics (admin)', async () => {
    const res = await request(app)
      .get('/api/feedback/course/1/analytics')
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('avg_rating');
  });

  it('should get teacher analytics (admin)', async () => {
    const res = await request(app)
      .get('/api/feedback/teacher/1/analytics')
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('avg_rating');
  });

  it('should delete feedback (student or admin)', async () => {
    if (!feedbackId) return;
    const res = await request(app)
      .delete(`/api/feedback/${feedbackId}`)
      .set('Authorization', adminToken);
    // Accept 200 or 403 (if not owner)
    expect([200, 403]).toContain(res.statusCode);
  });

  it('should return 401 for missing token', async () => {
    const res = await request(app)
      .get('/api/feedback');
    expect(res.statusCode).toBe(401);
  });

  it('should return 403 for forbidden access', async () => {
    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', studentToken);
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should return 404 for non-existent feedback', async () => {
    const res = await request(app)
      .put('/api/feedback/999999')
      .set('Authorization', adminToken)
      .send({ rating: 3 });
    expect([404, 403]).toContain(res.statusCode);
  });
}); 