require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');

mongoose.connect(MONGO_URI);

const createSeats = async (flightId, totalSeats) => {
  const rows = Math.ceil(totalSeats / 6);
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats = [];
  for (let row = 1; row <= rows; row++) {
    for (let col of columns) {
      let seatType = 'MIDDLE';
      if (col === 'A' || col === 'F') seatType = 'WINDOW';
      else if (col === 'C' || col === 'D') seatType = 'AISLE';
      seats.push({
        flightId,
        seatNumber: `${row}${col}`,
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

const seed = async () => {
  await connectDB();
  await User.deleteMany({});
  await Flight.deleteMany({});
  await Seat.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@flywise.com',
    password: 'admin123',
    role: 'ADMIN',
    phone: '9999999999',
  });

  // Create test user
  await User.create({
    name: 'Test User',
    email: 'user@flywise.com',
    password: 'user1234',
    role: 'USER',
    phone: '8888888888',
  });

  // Flights data
  const now = new Date();
  const flightsData = [
    { flightNumber: 'FW101', airline: 'FlyWise Air', airlineCode: 'FW', source: { city: 'Mumbai', code: 'BOM' }, destination: { city: 'Delhi', code: 'DEL' }, daysOffset: 1, depHour: 6, duration: 120, basePrice: 4500 },
    { flightNumber: 'FW102', airline: 'FlyWise Air', airlineCode: 'FW', source: { city: 'Mumbai', code: 'BOM' }, destination: { city: 'Delhi', code: 'DEL' }, daysOffset: 1, depHour: 14, duration: 125, basePrice: 5200 },
    { flightNumber: 'FW201', airline: 'SkyJet', airlineCode: 'SJ', source: { city: 'Delhi', code: 'DEL' }, destination: { city: 'Bangalore', code: 'BLR' }, daysOffset: 1, depHour: 8, duration: 150, basePrice: 3800 },
    { flightNumber: 'FW202', airline: 'SkyJet', airlineCode: 'SJ', source: { city: 'Delhi', code: 'DEL' }, destination: { city: 'Bangalore', code: 'BLR' }, daysOffset: 1, depHour: 18, duration: 155, basePrice: 4100 },
    { flightNumber: 'FW301', airline: 'IndiaWings', airlineCode: 'IW', source: { city: 'Chennai', code: 'MAA' }, destination: { city: 'Hyderabad', code: 'HYD' }, daysOffset: 2, depHour: 10, duration: 80, basePrice: 2800 },
    { flightNumber: 'FW401', airline: 'AirBharat', airlineCode: 'AB', source: { city: 'Kolkata', code: 'CCU' }, destination: { city: 'Mumbai', code: 'BOM' }, daysOffset: 2, depHour: 7, duration: 160, basePrice: 5500 },
    { flightNumber: 'FW501', airline: 'FlyWise Air', airlineCode: 'FW', source: { city: 'Goa', code: 'GOI' }, destination: { city: 'Delhi', code: 'DEL' }, daysOffset: 3, depHour: 9, duration: 140, basePrice: 6200 },
    { flightNumber: 'FW601', airline: 'SkyJet', airlineCode: 'SJ', source: { city: 'Mumbai', code: 'BOM' }, destination: { city: 'Goa', code: 'GOI' }, daysOffset: 1, depHour: 11, duration: 75, basePrice: 2500 },
  ];

  for (const f of flightsData) {
    const dep = new Date(now);
    dep.setDate(dep.getDate() + f.daysOffset);
    dep.setHours(f.depHour, 0, 0, 0);
    const arr = new Date(dep.getTime() + f.duration * 60000);

    const flight = await Flight.create({
      flightNumber: f.flightNumber,
      airline: f.airline,
      airlineCode: f.airlineCode,
      source: f.source,
      destination: f.destination,
      departureTime: dep,
      arrivalTime: arr,
      duration: f.duration,
      basePrice: f.basePrice,
      totalSeats: 60,
      availableSeats: 60,
      aircraft: 'Airbus A320',
    });
    await createSeats(flight._id, 60);
    console.log(`✅ Created flight ${f.flightNumber}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('Admin: admin@flywise.com / admin123');
  console.log('User:  user@flywise.com / user1234');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
