const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentId: {
      type: String,
    },
    appointmentDate: {
      type: Date,
      default: Date.now,
    },
    // --- Prescription & Consultation Data ---
    diagnosis: {
      type: String,
      default: "",
    },
    doctorAdvice: {
      type: String,
      default: "",
    },
    medicines: {
      type: mongoose.Schema.Types.Mixed, // Allows Strings or Arrays of medicines
      default: [],
    },
    
    timeSlot: {
      type: String,
      required: true,
    },
    slotTime: {
      type: String,
    },
    type: {
      type: String,
      default: "General Checkup",
    },
    notes: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "WAITING",
        "IN_PROGRESS",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "PENDING",
        "BOOKED",
      ],
      default: "WAITING",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "PAID", "PENDING"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
