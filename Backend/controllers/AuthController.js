const User = require("../models/User");

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

    const user = await User.create({
      username,
      firstName,
      lastName,
      birthDate,
      email,
      password,
      gender,
      city,
      country,
      role,
      preferences,
      organizerProfile,
    });

    return res.status(201).json({
      message: "Signup successful",
      user: user,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: user, 
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  signup,
  login,
};