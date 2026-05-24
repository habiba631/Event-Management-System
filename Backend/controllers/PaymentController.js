const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Payment = require("../models/Payment");

async function createCheckoutSession(req, res) {
  try {
    const { eventId, ticketCount = 1 } = req.body;
    const userId = req.user._id;

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const count = Number(ticketCount);
    if (!Number.isFinite(count) || count < 1) {
      return res.status(400).json({ message: "ticketCount must be a positive number" });
    }

    // Only block on non-cancelled existing bookings so expired sessions can be retried
    const existing = await Booking.findOne({ user: userId, event: eventId, status: { $ne: "cancelled" } });
    if (existing) {
      return res.status(409).json({ message: "An active booking already exists for this event" });
    }

    const seatsLeft = Math.max(0, event.capacity - event.registrations);
    if (count > seatsLeft) {
      return res.status(400).json({ message: "Not enough seats available for this event" });
    }

    // Create booking in pending state — confirmed only after payment succeeds
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      ticketCount: count,
      status: "pending",
    });

    const totalAmount = event.price * count; // in cents

    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      event: eventId,
      amount: totalAmount,
      currency: "egp",
      status: "pending",
    });

    // Free event — confirm immediately without Stripe
    if (totalAmount === 0) {
      await Booking.findByIdAndUpdate(booking._id, { status: "confirmed" });
      await Event.findByIdAndUpdate(eventId, { $inc: { registrations: count } });
      await Payment.findByIdAndUpdate(payment._id, { status: "succeeded" });
      return res.status(200).json({ free: true, bookingId: booking._id, paymentId: payment._id });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: event.title,
              ...(event.description && { description: event.description }),
              ...(event.imageUrl && { images: [event.imageUrl] }),
            },
            unit_amount: event.price,
          },
          quantity: count,
        },
      ],
      mode: "payment",
      customer_email: req.user.email,
      submit_type: "book",
      success_url: `${frontendUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/booking/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        bookingId: String(booking._id),
        paymentId: String(payment._id),
      },
    });

    await Payment.findByIdAndUpdate(payment._id, { stripeSessionId: session.id });

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
      bookingId: booking._id,
      paymentId: payment._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Called by the frontend success page — retrieves from Stripe and confirms/cancels the booking
async function getSessionStatus(req, res) {
  try {
    const { sessionId } = req.params;

    const payment = await Payment.findOne({ stripeSessionId: sessionId })
      .populate({ path: "booking", select: "ticketCount status" })
      .populate("event", "title startsAt location imageUrl");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (req.user.role !== "Admin" && String(payment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Already resolved — return immediately (idempotent)
    if (payment.status !== "pending") {
      return res.status(200).json(payment);
    }

    // Ask Stripe for the current session state
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      await Payment.findByIdAndUpdate(payment._id, {
        status: "succeeded",
        stripePaymentIntentId: session.payment_intent,
      });

      const booking = await Booking.findById(payment.booking);
      if (booking && booking.status === "pending") {
        await Booking.findByIdAndUpdate(payment.booking, { status: "confirmed" });
        await Event.findByIdAndUpdate(payment.event, { $inc: { registrations: booking.ticketCount } });
      }
    } else if (session.status === "expired") {
      await Payment.findByIdAndUpdate(payment._id, { status: "cancelled" });
      await Booking.findByIdAndUpdate(payment.booking, { status: "cancelled" });
    }

    const updated = await Payment.findById(payment._id)
      .populate({ path: "booking", select: "ticketCount status" })
      .populate("event", "title startsAt location imageUrl");

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Called by the frontend cancel page — expires the Stripe session and frees the booking immediately
async function cancelSession(req, res) {
  try {
    const { sessionId } = req.params;

    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (req.user.role !== "Admin" && String(payment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (payment.status !== "pending") {
      return res.status(200).json({ message: "Already resolved" });
    }

    // Expire the session so it cannot be completed later
    try {
      await stripe.checkout.sessions.expire(sessionId);
    } catch {
      // Session may already be expired — safe to ignore
    }

    await Payment.findByIdAndUpdate(payment._id, { status: "cancelled" });
    await Booking.findByIdAndUpdate(payment.booking, { status: "cancelled" });

    return res.status(200).json({ message: "Session cancelled" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getPaymentByBooking(req, res) {
  try {
    const { bookingId } = req.params;

    const payment = await Payment.findOne({ booking: bookingId })
      .populate("event", "title startsAt location imageUrl");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (req.user.role !== "Admin" && String(payment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createCheckoutSession,
  getSessionStatus,
  cancelSession,
  getPaymentByBooking,
};
