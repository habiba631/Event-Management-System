const Event = require("../models/Event");

function isOwnerOrAdmin(event, userId, role) {
  return role === "Admin" || String(event.organizerUser) === String(userId);
}

async function createEvent(req, res) {
  try {
    const event = await Event.create({
      ...req.body,
      organizerUser: req.user._id,
    });
    return res.status(201).json(event);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getAllEvents(req, res) {
  try {
    const { category, status, q, organizerUser } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }
    if (organizerUser) {
      filter.organizerUser = organizerUser;
    }
    if (q && String(q).trim()) {
      const term = String(q).trim();
      filter.$or = [
        { title: new RegExp(term, "i") },
        { location: new RegExp(term, "i") },
        { organizer: new RegExp(term, "i") },
        { description: new RegExp(term, "i") },
      ];
    }

    const events = await Event.find(filter).sort({ startsAt: 1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json(event);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!isOwnerOrAdmin(event, req.user._id, req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to update this event" });
    }

    const updated = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!isOwnerOrAdmin(event, req.user._id, req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to delete this event" });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
