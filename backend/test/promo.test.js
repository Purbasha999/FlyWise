const request = require("supertest");
const app = require("../server");

test("invalid promo code", async () => {
  const res = await request(app)
    .post("/api/promo/apply")
    .send({ code: "INVALID", totalPrice: 1000 });

  expect(res.status).toBe(400);
});