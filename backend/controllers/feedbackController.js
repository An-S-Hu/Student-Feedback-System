const db = require('../config/db');
const Sentiment = require('sentiment');
const { validationResult } = require('express-validator');
const sentiment = new Sentiment();

// Submit feedback (student)
const submitFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { course_id, teacher_id, rating, comment, anonymous } = req.body;
  const student_id = req.user.id;
  try {
    // Sentiment analysis
    const sentimentResult = sentiment.analyze(comment || '');
    const sentimentLabel = sentimentResult.score > 0 ? 'positive' : (sentimentResult.score < 0 ? 'negative' : 'neutral');
    // Insert feedback
    await db.query(
      'INSERT INTO feedback (student_id, course_id, teacher_id, rating, comment, sentiment, anonymous) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student_id, course_id, teacher_id, rating, comment, sentimentLabel, anonymous || false]
    );
    res.status(201).json({ message: 'Feedback submitted successfully', sentiment: sentimentLabel });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Feedback already submitted for this course' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all feedback (admin)
const getAllFeedback = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.*, s.name AS student_name, c.name AS course_name, t.name AS teacher_name
       FROM feedback f
       LEFT JOIN students s ON f.student_id = s.id
       LEFT JOIN courses c ON f.course_id = c.id
       LEFT JOIN teachers t ON f.teacher_id = t.id
       ORDER BY f.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get feedback with filters (admin)
const getFilteredFeedback = async (req, res) => {
  const { course_id, teacher_id, sentiment: sentimentQ, from, to } = req.query;
  let query = `SELECT f.*, s.name AS student_name, c.name AS course_name, t.name AS teacher_name
    FROM feedback f
    LEFT JOIN students s ON f.student_id = s.id
    LEFT JOIN courses c ON f.course_id = c.id
    LEFT JOIN teachers t ON f.teacher_id = t.id
    WHERE 1=1`;
  const params = [];
  if (course_id) {
    query += ' AND f.course_id = ?';
    params.push(course_id);
  }
  if (teacher_id) {
    query += ' AND f.teacher_id = ?';
    params.push(teacher_id);
  }
  if (sentimentQ) {
    query += ' AND f.sentiment = ?';
    params.push(sentimentQ);
  }
  if (from) {
    query += ' AND f.created_at >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND f.created_at <= ?';
    params.push(to);
  }
  query += ' ORDER BY f.created_at DESC';
  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update feedback (student: own, admin: any)
const updateFeedback = async (req, res) => {
  const feedbackId = req.params.id;
  const { rating, comment, anonymous } = req.body;
  const user = req.user;
  try {
    // Check ownership or admin
    const [rows] = await db.query('SELECT * FROM feedback WHERE id = ?', [feedbackId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Feedback not found' });
    const feedback = rows[0];
    if (user.role !== 'admin' && feedback.student_id !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Sentiment analysis if comment is updated
    let sentimentLabel = feedback.sentiment;
    if (comment !== undefined) {
      const sentimentResult = sentiment.analyze(comment);
      sentimentLabel = sentimentResult.score > 0 ? 'positive' : (sentimentResult.score < 0 ? 'negative' : 'neutral');
    }
    await db.query(
      'UPDATE feedback SET rating = COALESCE(?, rating), comment = COALESCE(?, comment), sentiment = ?, anonymous = COALESCE(?, anonymous) WHERE id = ?',
      [rating, comment, sentimentLabel, anonymous, feedbackId]
    );
    res.json({ message: 'Feedback updated successfully', sentiment: sentimentLabel });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete feedback (student: own, admin: any)
const deleteFeedback = async (req, res) => {
  const feedbackId = req.params.id;
  const user = req.user;
  try {
    const [rows] = await db.query('SELECT * FROM feedback WHERE id = ?', [feedbackId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Feedback not found' });
    const feedback = rows[0];
    if (user.role !== 'admin' && feedback.student_id !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await db.query('DELETE FROM feedback WHERE id = ?', [feedbackId]);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get feedback for a specific course
const getFeedbackByCourse = async (req, res) => {
  const { course_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT f.*, s.name AS student_name, t.name AS teacher_name
       FROM feedback f
       LEFT JOIN students s ON f.student_id = s.id
       LEFT JOIN teachers t ON f.teacher_id = t.id
       WHERE f.course_id = ?
       ORDER BY f.created_at DESC`,
      [course_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get feedback for a specific teacher
const getFeedbackByTeacher = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT f.*, s.name AS student_name, c.name AS course_name
       FROM feedback f
       LEFT JOIN students s ON f.student_id = s.id
       LEFT JOIN courses c ON f.course_id = c.id
       WHERE f.teacher_id = ?
       ORDER BY f.created_at DESC`,
      [teacher_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Analytics for a course
const getCourseAnalytics = async (req, res) => {
  const { course_id } = req.params;
  try {
    const [[stats]] = await db.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_feedback FROM feedback WHERE course_id = ?`,
      [course_id]
    );
    const [sentiments] = await db.query(
      `SELECT sentiment, COUNT(*) AS count FROM feedback WHERE course_id = ? GROUP BY sentiment`,
      [course_id]
    );
    res.json({ ...stats, sentiments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Analytics for a teacher
const getTeacherAnalytics = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const [[stats]] = await db.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_feedback FROM feedback WHERE teacher_id = ?`,
      [teacher_id]
    );
    const [sentiments] = await db.query(
      `SELECT sentiment, COUNT(*) AS count FROM feedback WHERE teacher_id = ? GROUP BY sentiment`,
      [teacher_id]
    );
    res.json({ ...stats, sentiments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFilteredFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackByCourse,
  getFeedbackByTeacher,
  getCourseAnalytics,
  getTeacherAnalytics
}; 