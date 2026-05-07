const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/UserRoutes");
const authRoutes = require("./routes/AuthRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

function healthcheck(req, res) {
  let email = req.body.email;
  res.send("API is running successfully for user with email : " + email);
}
app.get("/healthcheck", healthcheck);

// Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
