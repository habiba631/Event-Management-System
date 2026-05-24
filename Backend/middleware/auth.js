const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  // Session-based auth
  if (req.session && req.session.userId) {
    req.user = await User.findById(req.session.userId);
    if (req.user) return next();
  }

  // JWT-based auth
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "eventify-jwt-secret-change-in-production");
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function restrictTo(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
}

module.exports = { protect, restrictTo };
