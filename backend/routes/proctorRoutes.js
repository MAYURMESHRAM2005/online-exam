const express = require("express");
const router = express.Router();

const { startSession, endSession, logEvent } = require("../controllers/proctorController");
const { protect } = require("../middleware/authMiddleware");
const {
  validate,
  startProctorSessionValidation,
  logProctorEventValidation,
} = require("../middleware/validators");

/* =========================
   START PROCTOR SESSION
========================= */
router.post("/start", protect, startProctorSessionValidation, validate, startSession);

/* =========================
   END PROCTOR SESSION
========================= */
router.post("/:sessionId/end", protect, endSession);

/* =========================
   SAVE PROCTOR EVENT
========================= */
router.post("/:sessionId/log", protect, logProctorEventValidation, validate, logEvent);

module.exports = router;
