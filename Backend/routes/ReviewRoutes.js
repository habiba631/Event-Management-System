const express = require("express");
const {
  createReview,
  getEventReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} = require("../controllers/ReviewController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createReview);
router.get("/my", getMyReviews);
router.get("/event/:eventId", getEventReviews);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

module.exports = router;
