const Exam = require("../models/Exam");
const ProctorSession = require("../models/ProctorSession");
const ProctorLog = require("../models/ProctorLog");
const asyncHandler = require("../utils/asyncHandler");

/* =========================
   START PROCTOR SESSION
   POST /api/proctor/start
   Body: { examId, cameraStatus, microphoneStatus, browserInfo, browserSupported }
========================= */
exports.startSession = asyncHandler(async (req, res) => {
  const { examId, cameraStatus, microphoneStatus, browserInfo, browserSupported } = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) {
    const error = new Error("Exam not found");
    error.statusCode = 404;
    throw error;
  }

  const session = await ProctorSession.create({
    exam: exam._id,
    student: req.user._id,
    cameraStatus: cameraStatus || "pending",
    microphoneStatus: microphoneStatus || "pending",
    browserInfo: browserInfo || "",
    browserSupported: browserSupported !== undefined ? browserSupported : true,
  });

  await ProctorLog.create({
    session: session._id,
    eventType: "session_started",
    details: `Camera: ${session.cameraStatus}, Microphone: ${session.microphoneStatus}`,
  });

  res.status(201).json({
    sessionId: session._id,
    status: session.status,
    cameraStatus: session.cameraStatus,
    microphoneStatus: session.microphoneStatus,
  });
});

/* =========================
   END PROCTOR SESSION
   POST /api/proctor/:sessionId/end
========================= */
exports.endSession = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findById(req.params.sessionId);

  if (!session) {
    const error = new Error("Proctor session not found");
    error.statusCode = 404;
    throw error;
  }

  if (session.student.toString() !== req.user._id.toString()) {
    const error = new Error("Not authorized to end this session");
    error.statusCode = 403;
    throw error;
  }

  if (session.status === "ended") {
    return res.json({ message: "Session already ended", sessionId: session._id });
  }

  session.status = "ended";
  session.endedAt = new Date();
  await session.save();

  await ProctorLog.create({
    session: session._id,
    eventType: "session_ended",
  });

  res.json({ message: "Proctor session ended", sessionId: session._id });
});

/* =========================
   SAVE PROCTOR EVENT
   POST /api/proctor/:sessionId/log
   Body: { eventType, details }
========================= */
exports.logEvent = asyncHandler(async (req, res) => {
  const { eventType, details } = req.body;

  const session = await ProctorSession.findById(req.params.sessionId);

  if (!session) {
    const error = new Error("Proctor session not found");
    error.statusCode = 404;
    throw error;
  }

  if (session.student.toString() !== req.user._id.toString()) {
    const error = new Error("Not authorized to log events for this session");
    error.statusCode = 403;
    throw error;
  }

  const log = await ProctorLog.create({
    session: session._id,
    eventType,
    details: details || "",
  });

  // Keep the session's own status fields in sync with key device events,
  // so other endpoints can answer "is this session camera-ready?" without
  // having to re-scan the whole log.
  if (eventType === "camera_granted") session.cameraStatus = "granted";
  if (eventType === "camera_denied") session.cameraStatus = "denied";
  if (eventType === "microphone_granted") session.microphoneStatus = "granted";
  if (eventType === "microphone_denied") session.microphoneStatus = "denied";
  if (eventType === "device_unavailable") {
    // Doesn't specify which device — leave camera/mic status untouched,
    // the frontend logs a more specific event type per device when known.
  }
  await session.save();

  res.status(201).json({ message: "Event logged", logId: log._id });
});
