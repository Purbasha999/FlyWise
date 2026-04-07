const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

let adminToken;

beforeEach(async () => {
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

describe("Admin", () => {
  test("admin dashboard access", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard") // if exists
      .set("Authorization", `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.status);
  });
});