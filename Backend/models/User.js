const mongoose = require("mongoose");

const organizerProfileSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      trim: true,
      required: function requiredCompanyName() {
        return this.ownerDocument().role === "EventOrganizer";
      },
    },
    companyAddress: {
      type: String,
      trim: true,
      required: function requiredCompanyAddress() {
        return this.ownerDocument().role === "EventOrganizer";
      },
    },
    eventTags: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    taxId: {
      type: String,
      trim: true,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    birthDate: {
      type: Date,
    },
    age: {
      type: Number,
      min: 0,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "PreferNotToSay"],
      default: "PreferNotToSay",
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
    role: {
      type: String,
      enum: ["Admin", "EventOrganizer", "Customer"],
      default: "Customer",
      required: true,
    },
    preferences: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    organizerProfile: {
      type: organizerProfileSchema,
      default: {},
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function setAgeFromBirthDate(next) {
  if (this.birthDate) {
    const today = new Date();
    let calculatedAge = today.getFullYear() - this.birthDate.getFullYear();
    const hasNotHadBirthdayThisYear =
      today.getMonth() < this.birthDate.getMonth() ||
      (today.getMonth() === this.birthDate.getMonth() &&
        today.getDate() < this.birthDate.getDate());

    if (hasNotHadBirthdayThisYear) {
      calculatedAge -= 1;
    }

    this.age = Math.max(calculatedAge, 0);
  }
});

module.exports = mongoose.model("User", userSchema);
