const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    organizerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "open", "full", "completed", "cancelled"],
      default: "draft",
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    registrations: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
      min: 0, // price per ticket in cents (e.g. 2000 = $20.00)
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.virtual("seatsLeft").get(function seatsLeftGetter() {
  return Math.max(0, this.capacity - this.registrations);
});


module.exports = mongoose.model("Event", eventSchema);
