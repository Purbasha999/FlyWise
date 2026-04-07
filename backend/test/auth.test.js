const request = require("supertest");
const app = require("../server");
const User = require("../models/User");

describe("Auth", () => {

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("register success", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test",
        email: "test@test.com",
        password: "123456"
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  }, 10000);

  test("register duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "test@test.com",
      password: "123456"
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "test@test.com",
      password: "123456"
    });

    expect(res.status).toBe(400);
  });

  test("login success", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "test@test.com",
      password: "123456"
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "123456"
    });

    expect(res.status).toBe(200);
  });

  test("getMe unauthorized", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

});