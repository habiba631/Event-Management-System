const express = require("express");
const {
  createCheckoutSession,
  getSessionStatus,
  cancelSession,
  getPaymentByBooking,
} = require("../controllers/PaymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/checkout", protect, createCheckoutSession);
router.get("/session/:sessionId", protect, getSessionStatus);
router.post("/session/:sessionId/cancel", protect, cancelSession);
router.get("/booking/:bookingId", protect, getPaymentByBooking);

module.exports = router;
