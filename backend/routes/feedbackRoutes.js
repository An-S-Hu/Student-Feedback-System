const express = require('express');
const { body } = require('express-validator');
const { submitFeedback, getAllFeedback, getFilteredFeedback, updateFeedback, deleteFeedback, getFeedbackByCourse, getFeedbackByTeacher, getCourseAnalytics, getTeacherAnalytics } = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Submit feedback (student)
router.post('/',
  authenticate,
  authorize('student'),
  [
    body('course_id').isInt().withMessage('Course is required'),
    body('teacher_id').isInt().withMessage('Teacher is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().isString(),
    body('anonymous').optional().isBoolean(),
  ],
  submitFeedback
);

// Get all feedback (admin)
router.get('/',
  authenticate,
  authorize('admin'),
  getAllFeedback
);

// Get filtered feedback (admin)
router.get('/filter',
  authenticate,
  authorize('admin'),
  getFilteredFeedback
);

// Update feedback (student: own, admin: any)
router.put('/:id',
  authenticate,
  updateFeedback
);

// Delete feedback (student: own, admin: any)
router.delete('/:id',
  authenticate,
  deleteFeedback
);

// Analytics for a course
router.get('/course/:course_id/analytics',
  authenticate,
  authorize('admin'),
  getCourseAnalytics
);

// Analytics for a teacher
router.get('/teacher/:teacher_id/analytics',
  authenticate,
  authorize('admin'),
  getTeacherAnalytics
);

// Get feedback for a specific course
router.get('/course/:course_id',
  authenticate,
  authorize('admin'),
  getFeedbackByCourse
);

// Get feedback for a specific teacher
router.get('/teacher/:teacher_id',
  authenticate,
  authorize('admin'),
  getFeedbackByTeacher
);

module.exports = router; 