const Review = require("../models/Review");
const Booking = require("../models/Booking");

async function createReview(req, res) {
  try {
    const { event: eventId, rating, comment = "" } = req.body;
    const userId = req.user._id;

    if (!eventId) return res.status(400).json({ message: "event is required" });

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const booking = await Booking.findOne({ user: userId, event: eventId, status: "confirmed" });
    if (!booking) {
      return res.status(403).json({ message: "You can only review events you have a confirmed booking for" });
    }

    const review = await Review.create({
      user: userId,
      event: eventId,
      booking: booking._id,
      rating: parsedRating,
      comment,
    });

    const populated = await Review.findById(review._id)
      .populate("user", "firstName lastName username profileImage")
      .populate("event", "title startsAt");

    return res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already reviewed this event" });
    }
    return res.status(400).json({ message: error.message });
  }
}

async function getEventReviews(req, res) {
  try {
    const { eventId } = req.params;
    const reviews = await Review.find({ event: eventId })
      .populate("user", "firstName lastName username profileImage")
      .sort({ createdAt: -1 });

    const avg =
      reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return res.status(200).json({
      reviews,
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getMyReviews(req, res) {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("event", "title startsAt imageUrl category location")
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) return res.status(404).json({ message: "Review not found" });
    if (String(review.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update your own reviews" });
    }

    const updates = {};
    if (req.body.rating !== undefined) {
      const r = Number(req.body.rating);
      if (r < 1 || r > 5) return res.status(400).json({ message: "rating must be between 1 and 5" });
      updates.rating = r;
    }
    if (typeof req.body.comment === "string") updates.comment = req.body.comment;

    const updated = await Review.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate("user", "firstName lastName username profileImage")
      .populate("event", "title startsAt imageUrl category location");

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) return res.status(404).json({ message: "Review not found" });
    if (String(review.user) !== String(req.user._id) && req.user.role !== "Admin") {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    await Review.findByIdAndDelete(id);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = { createReview, getEventReviews, getMyReviews, updateReview, deleteReview };
