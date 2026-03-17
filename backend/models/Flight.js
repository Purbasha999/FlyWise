const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  airline: {
    type: String,
    required: [true, 'Airline name is required'],
  },
  airlineCode: {
    type: String,
    required: true,
    uppercase: true,
  },
  source: {
    city: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
  },
  destination: {
    city: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
  },
  departureTime: {
    type: Date,
    required: true,
  },
  arrivalTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 60,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  aircraft: {
    type: String,
    default: 'Airbus A320',
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED'],
    default: 'SCHEDULED',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Virtual for occupancy percentage
flightSchema.virtual('occupancyPercent').get(function () {
  return ((this.totalSeats - this.availableSeats) / this.totalSeats) * 100;
});

module.exports = mongoose.model('Flight', flightSchema);
