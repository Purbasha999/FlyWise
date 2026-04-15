const express = require('express');
const router = express.Router();
const { getSeats, lockSeats, unlockSeats } = require('../controllers/seatController');
const { protect } = require('../middleware/auth');

router.get('/:flightId', getSeats);
router.post('/lock', protect, lockSeats);
router.post('/unlock', protect, unlockSeats);

module.exports = router;
