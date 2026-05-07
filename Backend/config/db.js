const mongoose = require("mongoose");

const DEFAULT_MONGO_URI =
  "mongodb+srv://habibaj07_db_user:4C2y6tkUmLoUPmv6@cluster0.bcb615o.mongodb.net/?appName=Cluster0";

async function connectDB() {
  const mongoURI = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  try {
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
