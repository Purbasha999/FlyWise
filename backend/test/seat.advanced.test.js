const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const Flight = require("../models/Flight");
const Seat = require("../models/Seat");
const jwt = require("jsonwebtoken");

let token, user, flight;

beforeEach(async () => {
  user = await User.create({
    name: "Test",
    email: "test@test.com",
    password: "123456"
  });

  token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET);

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
    availableSeats: 4
  });

  await Seat.create({
    flightId: flight._id,
    seatNumber: "1A",
    row: 1,
    column: "A",
    seatType: "WINDOW"
  });
});

describe("Seat Advanced", () => {

  test("lock seat success", async () => {
    const res = await request(app)
      .post("/api/seats/lock")
      .set("Authorization", `Bearer ${token}`)
      .send({
        flightId: flight._id,
        seatNumbers: ["1A"]
      });

    expect(res.status).toBe(200);
  });

  test("lock already locked seat", async () => {
    await Seat.updateOne({ seatNumber: "1A" }, { status: "LOCKED" });

    const res = await request(app)
      .post("/api/seats/lock")
      .set("Authorization", `Bearer ${token}`)
      .send({
        flightId: flight._id,
        seatNumbers: ["1A"]
      });

    expect(res.status).toBe(409);
  });

});