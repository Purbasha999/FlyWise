const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const { calculatePrice } = require('../middleware/pricing');

// Helper: create seats for a flight
const createSeatsForFlight = async (flightId, totalSeats = 60) => {
  const rows = Math.ceil(totalSeats / 6);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats = [];

  for (let row = 1; row <= rows; row++) {
    for (let col of columns) {
      const seatNumber = `${row}${col}`;
      let seatType = 'MIDDLE';
      if (col === 'A' || col === 'F') seatType = 'WINDOW';
      else if (col === 'C' || col === 'D') seatType = 'AISLE';

      seats.push({
        flightId,
        seatNumber,
        row,
        column: col,
        seatType,
        class: row <= 3 ? 'BUSINESS' : 'ECONOMY',
        status: 'AVAILABLE',
      });
    }
  }

  await Seat.insertMany(seats);
};

// @desc    Search flights
// @route   GET /api/flights/search
const searchFlights = async (req, res) => {
  const now = new Date();
  const { source, destination, date, passengers = 1 } = req.query;

  if (!source || !destination) {
    return res.status(400).json({
      success: false,
      message: 'Source and destination are required.',
    });
  }

  // ⛔ 10-hour rule
  const minTime = new Date(now.getTime() + 10 * 60 * 60 * 1000);

  let departureFilter;

  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    departureFilter = {
      $gte: new Date(Math.max(searchDate, minTime)), // 🔥 important
      $lt: nextDay,
    };
  } else {
    // no date → future flights only
    departureFilter = {
      $gte: minTime,
    };
  }

  const query = {
    'source.city': { $regex: source, $options: 'i' },
    'destination.city': { $regex: destination, $options: 'i' },
    isActive: true,
    status: 'SCHEDULED',
    availableSeats: { $gte: parseInt(passengers) },
    departureTime: departureFilter, // ✅ applied once
  };

  const flights = await Flight.find(query).sort({ departureTime: 1 });

  const flightsWithPricing = flights.map(flight => {
    const pricing = calculatePrice(flight, [], parseInt(passengers));
    return {
      ...flight.toObject(),
      dynamicPrice: pricing.totalPrice,
      priceBreakdown: pricing,
    };
  });

  res.json({
    success: true,
    count: flights.length,
    flights: flightsWithPricing,
  });
};

// @desc    Get single flight
// @route   GET /api/flights/:id
const getFlightById = async (req, res) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) {
    return res.status(404).json({ success: false, message: 'Flight not found.' });
  }
  const pricing = calculatePrice(flight, [], 1);
  res.json({ success: true, flight: { ...flight.toObject(), priceBreakdown: pricing } });
};

// @desc    Get all flights (admin)
// @route   GET /api/flights
const getAllFlights = async (req, res) => {
  const flights = await Flight.find({}).sort({ departureTime: -1 });
  res.json({ success: true, count: flights.length, flights });
};

// @desc    Create flight (admin)
// @route   POST /api/flights
const createFlight = async (req, res) => {
  const {
    flightNumber, airline, airlineCode,
    sourceCity, sourceCode,
    destinationCity, destinationCode,
    departureTime, arrivalTime,
    basePrice, totalSeats, aircraft,
  } = req.body;

  const dep = new Date(departureTime);
  const arr = new Date(arrivalTime);
  const duration = Math.round((arr - dep) / (1000 * 60));

  const flight = await Flight.create({
    flightNumber,
    airline,
    airlineCode,
    source: { city: sourceCity, code: sourceCode },
    destination: { city: destinationCity, code: destinationCode },
    departureTime: dep,
    arrivalTime: arr,
    duration,
    basePrice,
    totalSeats: totalSeats || 60,
    availableSeats: totalSeats || 60,
    aircraft,
  });

  await createSeatsForFlight(flight._id, flight.totalSeats);

  res.status(201).json({ success: true, message: 'Flight created successfully.', flight });
};

// @desc    Update flight (admin)
// @route   PUT /api/flights/:id
const updateFlight = async (req, res) => {
  const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!flight) return res.status(404).json({ success: false, message: 'Flight not found.' });
  res.json({ success: true, flight });
};

// @desc    Delete flight (admin)
// @route   DELETE /api/flights/:id
const deleteFlight = async (req, res) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) return res.status(404).json({ success: false, message: 'Flight not found.' });
  await Seat.deleteMany({ flightId: flight._id });
  await flight.deleteOne();
  res.json({ success: true, message: 'Flight deleted.' });
};

// @desc    Get price preview
// @route   POST /api/flights/:id/price
const getFlightPrice = async (req, res) => {
  const { seatNumbers = [], passengers = 1 } = req.body;
  const flight = await Flight.findById(req.params.id);
  if (!flight) return res.status(404).json({ success: false, message: 'Flight not found.' });

  let seats = [];
  if (seatNumbers.length > 0) {
    seats = await Seat.find({ flightId: flight._id, seatNumber: { $in: seatNumbers } });
  }

  const pricing = calculatePrice(flight, seats, passengers);
  res.json({ success: true, pricing });
};

module.exports = {
  searchFlights, getFlightById, getAllFlights,
  createFlight, updateFlight, deleteFlight, getFlightPrice,
};
