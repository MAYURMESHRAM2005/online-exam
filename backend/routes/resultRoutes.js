const express = require("express");
const router = express.Router();

const {
  startExam,
  autoSaveAnswer,
  submitExam,
  getResultById,
  getMyResults,
  getExamResults,
} = require("../controllers/resultController");

const { protect, instructorOnly } = require("../middleware/authMiddleware");
const {
  validate,
  saveAnswerValidation,
  submitExamValidation,
} = require("../middleware/validators");

/* =========================
   START / RESUME EXAM
========================= */
router.post("/start/:examId", protect, startExam);

/* =========================
   AUTO-SAVE ANSWER (also the session heartbeat)
========================= */
router.put("/:id/save", protect, saveAnswerValidation, validate, autoSaveAnswer);

/* =========================
   SUBMIT EXAM
========================= */
router.post("/:id/submit", protect, submitExamValidation, validate, submitExam);

/* =========================
   GET MY RESULTS (Student)
   ⚠️ Must be registered BEFORE '/:id' so it isn't swallowed as an id param
========================= */
router.get("/mine", protect, getMyResults);

/* =========================
   GET EXAM RESULTS (Instructor — View Results flow)
========================= */
router.get("/exam/:examId", protect, instructorOnly, getExamResults);

/* =========================
   GET RESULT BY ID
========================= */
router.get("/:id", protect, getResultById);

module.exports = router;
