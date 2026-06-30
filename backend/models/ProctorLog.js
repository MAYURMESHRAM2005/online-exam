const mongoose = require("mongoose");

/* =========================
   PROCTOR LOG
   Individual proctoring events tied to a session. Phase 1 only logs
   foundational events (permission/device events, browser compatibility).
   Face/tab/copy-paste detection events will reuse this same model in
   later phases — eventType is a free string specifically so this model
   doesn't need to change when those phases are added.
========================= */
const proctorLogSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProctorSession",
      required: true,
    },

    eventType: {
      type: String,
      required: true,
      // Phase 1 event types. Later phases (face detection, tab-switching,
      // copy/paste, etc.) will add their own values here without requiring
      // a schema migration, since this field is a plain string.
      enum: [
        "camera_requested",
        "camera_granted",
        "camera_denied",
        "microphone_requested",
        "microphone_granted",
        "microphone_denied",
        "device_unavailable",
        "browser_unsupported",
        "session_started",
        "session_ended",
      ],
    },

    details: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

proctorLogSchema.index({ session: 1, timestamp: 1 });

module.exports = mongoose.model("ProctorLog", proctorLogSchema);
