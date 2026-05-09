const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { createBooking, getBookingsByEmail, updateBookingStatus } = require('../controllers/bookingController');

const bookingValidation = [
  body('expertId').notEmpty().withMessage('Expert ID is required'),
  body('clientName').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('clientEmail').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('clientPhone').trim().notEmpty().withMessage('Phone number is required').matches(/^[\d\s\+\-\(\)]{7,15}$/).withMessage('Valid phone number is required'),
  body('date').notEmpty().withMessage('Date is required').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD').custom((value) => {
    const today = new Date().toISOString().split('T')[0];
    if (value < today) throw new Error('Date cannot be in the past');
    return true;
  }),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes max 500 characters'),
];

const statusValidation = [
  param('id').notEmpty().withMessage('Booking ID required'),
  body('status').notEmpty().withMessage('Status is required').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
];

router.get('/', getBookingsByEmail);
router.post('/', bookingValidation, createBooking);
router.patch('/:id/status', statusValidation, updateBookingStatus);

module.exports = router;
