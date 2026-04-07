const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

let adminToken;

beforeEach(async () => {
  await User.deleteMany({});
  const admin = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "123456",
    role: "ADMIN"
  });

  adminToken = jwt.sign(
  { id: admin._id.toString() },
  process.env.JWT_SECRET
);
});

describe("Flights", () => {

  test("search flights missing params", async () => {
    const res = await request(app).get("/api/flights/search");
    expect(res.status).toBe(400);
  });

  test("create flight (admin)", async () => {
    const res = await request(app)
      .post("/api/flights")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        flightNumber: "AI101",
        airline: "Air India",
        airlineCode: "AI",
        sourceCity: "A",
        sourceCode: "A",
        destinationCity: "B",
        destinationCode: "B",
        departureTime: new Date(),
        arrivalTime: new Date(Date.now() + 100000),
        basePrice: 5000,
        rows: 2,
        columns: 2,
        businessRows: 1,
        totalSeats: 4
      });

    expect(res.status).toBe(201);
  });

  test("get all flights without admin → fail", async () => {
    const res = await request(app).get("/api/flights");
    expect(res.status).toBe(401);
  });

});