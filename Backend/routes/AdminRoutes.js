const express = require("express");
const { getStats } = require("../controllers/AdminController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.use(protect, restrictTo("Admin"));

router.get("/stats", getStats);

module.exports = router;
