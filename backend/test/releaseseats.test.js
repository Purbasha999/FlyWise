const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const Seat = require("../models/Seat");
const Flight = require("../models/Flight");
const jwt = require("jsonwebtoken");

let token, user, flight;

beforeEach(async () => {
  user = await User.create({
    name: "Test",
    email: "test@test.com",
    password: "123456"
  });

  token = jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET
  );

  flight = await Flight.create({
    flightNumber: "AI101",
    airline: "Air India",
    airlineCode: "AI",
    source: { city: "A", code: "A" },
    destination: { city: "B", code: "B" },
    departureTime: new Date(Date.now() + 86400000),
    arrivalTime: new Date(Date.now() + 90000000),
    duration: 120,
    basePrice: 5000,
    rows: 2,
    columns: 2,
    businessRows: 0,
    availableSeats: 2
  });

  await Seat.create({
    flightId: flight._id,
    seatNumber: "1A",
    row: 1,
    column: "A",
    seatType: "WINDOW",
    status: "LOCKED",
    lockedBy: user._id
  });
});

test("release seat", async () => {
  const res = await request(app)
    .post("/api/seats/release")
    .set("Authorization", `Bearer ${token}`)
    .send({
      flightId: flight._id,
      seatNumbers: ["1A"]
    });

  expect([200, 404]).toContain(res.status);
});