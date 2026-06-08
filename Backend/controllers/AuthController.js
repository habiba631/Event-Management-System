const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getGridFSBucket, writeToGridFS } = require("./FileController");

const JWT_SECRET = process.env.JWT_SECRET || "eventify-jwt-secret-change-in-production";

function signToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
}

function parseSignupBody(body) {
  const parsed = { ...body };

  if (typeof parsed.organizerProfile === "string") {
    try {
      parsed.organizerProfile = JSON.parse(parsed.organizerProfile);
    } catch {
      throw new Error("Invalid organizer profile data");
    }
  }
  if (typeof parsed.preferences === "string") {
    try {
      parsed.preferences = JSON.parse(parsed.preferences);
    } catch {
      parsed.preferences = [];
    }
  }

  return parsed;
}

async function signup(req, res) {
  let createdUserId = null;

  try {
    const {
      username, firstName = "", lastName = "", birthDate, email, password, gender,
      city,
      country,
      role = "Customer",
      preferences = [],
      organizerProfile,
    } = parseSignupBody(req.body);

    if (/^\d/.test(username?.trim())) {
      return res.status(400).json({ message: "Username cannot start with a digit" });
    }

    if (role === "EventOrganizer") {
      if (!req.file) {
        return res.status(400).json({ message: "Tax registry PDF is required for organizers" });
      }
      if (!organizerProfile?.companyName || !organizerProfile?.companyAddress) {
        return res.status(400).json({ message: "Company name and address are required for organizers" });
      }
    }

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
      birthDate: birthDate || undefined,
      email,
      password: hashedPassword,
      gender,
      city,
      country,
      role,
      preferences,
      organizerProfile,
    });
    createdUserId = user._id;

    let savedUser = user;

    if (role === "EventOrganizer" && req.file) {
      const bucket = getGridFSBucket("taxRegistries");
      const fileId = await writeToGridFS(
        bucket,
        req.file.buffer,
        `${user._id}-${Date.now()}-${req.file.originalname}`,
        "application/pdf"
      );

      savedUser = await User.findByIdAndUpdate(
        user._id,
        { "organizerProfile.taxRegistry": fileId.toString() },
        { new: true }
      );
    }

    const token = signToken(savedUser._id);

    req.session.userId = savedUser._id.toString();

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: { ...savedUser.toObject(), password: undefined },
    });
  } catch (error) {
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId).catch(() => {});
    }
    return res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { password } = req.body;
    const loginId = (req.body.identifier || req.body.email || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: "Email/username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: loginId.toLowerCase() }, { username: loginId }],
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email/username or password" });
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