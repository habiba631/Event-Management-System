const express = require("express");
const { signup, login, logout } = require("../controllers/AuthController");
const { protect } = require("../middleware/auth");
const { uploadTaxRegistry } = require("../middleware/upload");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  if (req.is("multipart/form-data")) {
    return uploadTaxRegistry(req, res, next);
  }
  next();
}, signup);
router.post("/login", login);
router.post("/logout", protect, logout);

module.exports = router;