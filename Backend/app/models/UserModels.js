const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "CLINIC_ADMIN", "DOCTOR", "PATIENT"],
      default: "PATIENT",
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { 
        type: String 
    },
    verificationTokenExpires: { 
        type: Date 
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
