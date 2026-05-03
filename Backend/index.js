const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// const exampleRoutes = require("./routes/exampleRoutes");
// app.use("/api", exampleRoutes);

app.get("/healthcheck", (req, res) => {
  res.send("API is running successfully");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
