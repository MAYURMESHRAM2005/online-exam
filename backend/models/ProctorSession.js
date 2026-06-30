const mongoose = require("mongoose");

/* =========================
   PROCTOR SESSION
   One document per exam attempt's proctoring session. Tracks device
   readiness and the overall session lifecycle. Face-detection-specific
   fields are intentionally NOT included yet — this is Phase 1
   (foundation) only.
========================= */
const proctorSessionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Optional link to the exam attempt this session belongs to.
    result: { type: mongoose.Schema.Types.ObjectId, ref: "Result", default: null },

    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },

    cameraStatus: {
      type: String,
      enum: ["pending", "granted", "denied", "unavailable"],
      default: "pending",
    },
    microphoneStatus: {
      type: String,
      enum: ["pending", "granted", "denied", "unavailable"],
      default: "pending",
    },

    browserInfo: { type: String, default: "" },
    browserSupported: { type: Boolean, default: true },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProctorSession", proctorSessionSchema);
