const Booking = require("../models/Booking");
const Event = require("../models/Event");

function isConfirmed(status) {
  return status === "confirmed";
}

async function adjustEventRegistrations(eventId, delta) {
  if (!delta) return;
  await Event.findByIdAndUpdate(eventId, {
    $inc: { registrations: delta },
  });
}

async function createBooking(req, res) {
  try {
    const { event: eventId, ticketCount = 1, status = "confirmed", notes = "" } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "event is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userId = req.user._id;

    const existing = await Booking.findOne({ user: userId, event: eventId });
    if (existing) {
      return res.status(409).json({
        message: "A booking already exists for this user and event; update or cancel it instead",
      });
    }

    const count = Number(ticketCount);
    if (!Number.isFinite(count) || count < 1) {
      return res.status(400).json({ message: "ticketCount must be a positive number" });
    }

    if (isConfirmed(status)) {
      const seatsLeft = Math.max(0, event.capacity - event.registrations);
      if (count > seatsLeft) {
        return res.status(400).json({ message: "Not enough seats available for this event" });
      }
    }

    const booking = await Booking.create({
      user: userId,
      event: eventId,
      ticketCount: count,
      status,
      notes,
    });

    if (isConfirmed(status)) {
      await adjustEventRegistrations(eventId, count);
    }

    const populated = await Booking.findById(booking._id)
      .populate("user", "-password")
      .populate("event");

    return res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate booking for this user and event" });
    }
    return res.status(400).json({ message: error.message });
  }
}

async function getAllBookings(req, res) {
  try {
    const { user: userId, event: eventId, status } = req.query;
    const filter = {};

    if (req.user.role !== "Admin") {
      filter.user = req.user._id;
    } else {
      if (userId) filter.user = userId;
    }

    if (eventId) filter.event = eventId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("user", "-password")
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("user", "-password").populate("event");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role !== "Admin" && String(booking.user._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not have permission to view this booking" });
    }

    return res.status(200).json(booking);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role !== "Admin" && String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update your own bookings" });
    }

    const { status, notes } = req.body;
    const updates = {};
    if (typeof notes === "string") {
      updates.notes = notes;
    }

    const prevConfirmed = isConfirmed(booking.status);
    const nextStatus = status !== undefined ? status : booking.status;

    if (status !== undefined) {
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      updates.status = status;
    }

    const nextConfirmed = isConfirmed(nextStatus);

    if (prevConfirmed !== nextConfirmed) {
      const event = await Event.findById(booking.event);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!prevConfirmed && nextConfirmed) {
        const seatsLeft = Math.max(0, event.capacity - event.registrations);
        if (booking.ticketCount > seatsLeft) {
          return res.status(400).json({ message: "Not enough seats available for this event" });
        }
        await adjustEventRegistrations(booking.event, booking.ticketCount);
      } else if (prevConfirmed && !nextConfirmed) {
        await adjustEventRegistrations(booking.event, -booking.ticketCount);
      }
    }

    const updated = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("user", "-password")
      .populate("event");

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role !== "Admin" && String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own bookings" });
    }

    if (isConfirmed(booking.status)) {
      await adjustEventRegistrations(booking.event, -booking.ticketCount);
    }

    await Booking.findByIdAndDelete(id);

    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
