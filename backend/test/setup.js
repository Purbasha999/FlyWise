process.env.JWT_SECRET = "testsecret";

//overriding db string for tests onyl
process.env.MONGO_URI =
  "mongodb+srv://u2:flywise@cluster0.aqrawdu.mongodb.net/flywise_tests?retryWrites=true&w=majority";

const mongoose = require("mongoose");

afterEach(async () => {
  if (!mongoose.connection.db) return;

  const collections = await mongoose.connection.db.collections();
  for (let col of collections) {
    await col.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});