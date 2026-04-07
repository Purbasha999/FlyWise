const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("Seats", () => {

  test("get seats (empty)", async () => {
    const id = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/seats/${id}`);
    expect(res.status).toBe(200);
  }, 10000); 

  test("lock seats without token", async () => {
    const res = await request(app)
      .post("/api/seats/lock")
      .send({});

    expect(res.status).toBe(401);
  });

});