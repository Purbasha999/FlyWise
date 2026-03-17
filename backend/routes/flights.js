const express = require('express');
const router = express.Router();
const {
  searchFlights, getFlightById, getAllFlights,
  createFlight, updateFlight, deleteFlight, getFlightPrice,
} = require('../controllers/flightController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/search', searchFlights);
router.get('/', protect, adminOnly, getAllFlights);
router.post('/', protect, adminOnly, createFlight);
router.get('/:id', getFlightById);
router.put('/:id', protect, adminOnly, updateFlight);
router.delete('/:id', protect, adminOnly, deleteFlight);
router.post('/:id/price', protect, getFlightPrice);

module.exports = router;
