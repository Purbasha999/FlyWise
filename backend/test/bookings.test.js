const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const Flight = require("../models/Flight");
const Seat = require("../models/Seat");
const jwt = require("jsonwebtoken");

let token, user, flight;

beforeEach(async () => {
  await User.deleteMany({});
  await Flight.deleteMany({});
  await Seat.deleteMany({});
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
await new Promise(r => setTimeout(r, 200));
  await Seat.insertMany([
    {
      flightId: flight._id,
      seatNumber: "1A",
      row: 1,
      column: "A",
      seatType: "WINDOW",
      status: "LOCKED",
      lockedBy: user._id
    },
    {
      flightId: flight._id,
      seatNumber: "1B",
      row: 1,
      column: "B",
      seatType: "AISLE",
      status: "LOCKED",
      lockedBy: user._id
    }
  ]);
});


describe("Booking", () => {

  test("create booking success", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        flightId: flight._id,
        seatNumbers: ["1A", "1B"],
        passengers: [
          { name: "A", age: 20 },
          { name: "B", age: 25 }
        ]
      });

    expect(res.status).toBe(201);
  });

  test("fail if seats not locked", async () => {
    await Seat.updateMany({}, { status: "AVAILABLE" });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        flightId: flight._id,
        seatNumbers: ["1A"],
        passengers: [{ name: "A", age: 20 }]
      });

    expect(res.status).toBe(409);
  });

});