const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

async function getStats(req, res) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      usersByRole,
      eventsByStatus,
      totalBookings,
      confirmedBookings,
      revenueAgg,
      usersPerDay,
      revenuePerDay,
      bookingsPerDay,
      topEvents,
    ] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),

      Event.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

      Booking.countDocuments(),

      Booking.countDocuments({ status: "confirmed" }),

      Payment.aggregate([
        { $match: { status: "succeeded" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Payment.aggregate([
        { $match: { status: "succeeded", createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            amount: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Booking.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top 5 events by registration count
      Event.find()
        .sort({ registrations: -1 })
        .limit(5)
        .select("title category registrations capacity status"),
    ]);

    const roleMap = Object.fromEntries(usersByRole.map((r) => [r._id, r.count]));
    const statusMap = Object.fromEntries(eventsByStatus.map((e) => [e._id, e.count]));

    return res.status(200).json({
      totalUsers: usersByRole.reduce((s, r) => s + r.count, 0),
      totalCustomers: roleMap.Customer || 0,
      totalOrganizers: roleMap.EventOrganizer || 0,
      totalAdmins: roleMap.Admin || 0,

      totalEvents: eventsByStatus.reduce((s, e) => s + e.count, 0),
      openEvents: statusMap.open || 0,
      completedEvents: statusMap.completed || 0,
      cancelledEvents: statusMap.cancelled || 0,
      draftEvents: statusMap.draft || 0,
      fullEvents: statusMap.full || 0,

      totalBookings,
      confirmedBookings,

      totalRevenue: revenueAgg[0]?.total || 0,

      usersPerDay: usersPerDay.map((d) => ({ date: d._id, count: d.count })),
      revenuePerDay: revenuePerDay.map((d) => ({ date: d._id, amount: d.amount })),
      bookingsPerDay: bookingsPerDay.map((d) => ({ date: d._id, count: d.count })),

      topEvents,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { getStats };
