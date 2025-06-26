const express = require('express');
const { body } = require('express-validator');
const { registerStudent, loginStudent, loginAdmin } = require('../controllers/authController');

const router = express.Router();

// Student registration
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department_id').isInt().withMessage('Department is required'),
], registerStudent);

// Student login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], loginStudent);

// Admin login
router.post('/admin/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], loginAdmin);

module.exports = router; 