require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const userRoutes = require("./routes/UserRoutes");
const authRoutes = require("./routes/AuthRoutes");
const eventRoutes = require("./routes/EventRoutes");
const bookingRoutes = require("./routes/BookingRoutes");

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGO_URI ||
        "mongodb+srv://habibaj07_db_user:4C2y6tkUmLoUPmv6@cluster0.bcb615o.mongodb.net/?appName=Cluster0",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

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
