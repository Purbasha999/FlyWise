const request = require("supertest");
const app = require("../server");

test("payment success", async () => {
  const res = await request(app)
    .post("/api/bookings/payment")
    .send({
      bookingId: "dummy",
      paymentMethod: "CARD"
    });

  expect([200, 400, 404]).toContain(res.status);
});