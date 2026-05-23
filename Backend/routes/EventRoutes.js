const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/EventController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", protect, restrictTo("EventOrganizer", "Admin"), createEvent);
router.put("/:id", protect, restrictTo("EventOrganizer", "Admin"), updateEvent);
router.delete("/:id", protect, restrictTo("EventOrganizer", "Admin"), deleteEvent);

module.exports = router;
