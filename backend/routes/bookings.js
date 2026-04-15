const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getBookingById,
  cancelBooking, getAllBookings, getStats,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/stats', protect, adminOnly, getStats);
router.get('/all', protect, adminOnly, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
