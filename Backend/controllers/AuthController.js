const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function signup(req, res) {
  try {
    const {
      username, firstName = "", lastName = "", birthDate, email, password, gender,
      city,
      country,
      role = "Customer",
      preferences = [],
      organizerProfile,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      firstName,
      lastName,
      birthDate,
      email,
      password: hashedPassword,
      gender,
      city,
      country,
      role,
      preferences,
      organizerProfile,
    });

    const token = signToken(user._id);

    req.session.userId = user._id.toString();

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    req.session.userId = user._id.toString();

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
}

module.exports = {
  signup,
  login,
  logout,
};