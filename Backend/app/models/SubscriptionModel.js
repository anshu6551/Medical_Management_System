const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      required: true, // e.g. "per Month / Clinic", "14 Days Trial"
    },
    features: [
      {
        type: String,
      },
    ],
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);