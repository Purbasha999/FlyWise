/**
 * FlyWise Dynamic Pricing Engine
 * Rules:
 * - Base price from flight
 * - +1000 if >70% seats booked
 * - +1500 if booking within 2 days of departure
 * - +300 per window seat
 * - 18% GST on total
 */

const calculatePrice = (flight, seats, passengerCount = 1) => {
  const now = new Date();
  const departure = new Date(flight.departureTime);
  const daysUntilDeparture = (departure - now) / (1000 * 60 * 60 * 24);
  const occupancyPercent = ((flight.totalSeats - flight.availableSeats) / flight.totalSeats) * 100;

  let basePrice = flight.basePrice;

  // Demand surcharge: >70% seats booked
  let demandSurcharge = 0;
  if (occupancyPercent > 70) {
    demandSurcharge = 1000;
  }

  // Last-minute surcharge: within 2 days
  let lastMinuteSurcharge = 0;
  if (daysUntilDeparture <= 2) {
    lastMinuteSurcharge = 1500;
  }

  // Seat type charges
  let seatCharges = 0;
  if (seats && seats.length > 0) {
    seats.forEach(seat => {
      if (seat.seatType === 'WINDOW') {
        seatCharges += 300;
      } else if (seat.seatType === 'AISLE') {
        seatCharges += 150;
      }
    });
  }

  const pricePerPassenger = basePrice + demandSurcharge + lastMinuteSurcharge;
  const subtotal = (pricePerPassenger * passengerCount) + seatCharges;
  const taxes = Math.round(subtotal * 0.18); // 18% GST
  const totalPrice = subtotal + taxes;

  return {
    basePrice: basePrice * passengerCount,
    demandSurcharge: demandSurcharge * passengerCount,
    lastMinuteSurcharge: lastMinuteSurcharge * passengerCount,
    seatCharges,
    taxes,
    totalPrice,
    pricePerPassenger: pricePerPassenger + (seatCharges / passengerCount),
    occupancyPercent: Math.round(occupancyPercent),
    daysUntilDeparture: Math.round(daysUntilDeparture),
  };
};

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

module.exports = { calculatePrice, formatDuration };
