const express = require('express');
const router = express.Router();

const {
  createExam,
  getMyExams,
  deleteExam,
  getAllExams,
  getAvailableExams,
  getExamById,
  updateExam,
  getInstructorStats,
} = require('../controllers/examController');

const { protect, instructorOnly } = require('../middleware/authMiddleware');
const { validate, createExamValidation, updateExamValidation } = require('../middleware/validators');

/* =========================
   CREATE EXAM
========================= */
router.post('/create', protect, instructorOnly, createExamValidation, validate, createExam);

/* =========================
   GET INSTRUCTOR EXAMS
========================= */
router.get('/my-exams', protect, instructorOnly, getMyExams);

/* =========================
   GET INSTRUCTOR DASHBOARD STATS
   ⚠️ Must be registered BEFORE '/:id' so it isn't swallowed as an id param
========================= */
router.get('/instructor/stats', protect, instructorOnly, getInstructorStats);

/* =========================
   GET AVAILABLE EXAMS (Student)
   ⚠️ Must be registered BEFORE '/:id' so it isn't swallowed as an id param
========================= */
router.get('/available', protect, getAvailableExams);

/* =========================
   GET EXAM BY ID
   ⚠️ Must come after '/my-exams', '/instructor/stats' and '/available'
========================= */
router.get('/:id', protect, getExamById);

/* =========================
   UPDATE EXAM (Instructor — Edit Exam flow)
========================= */
router.put('/:id', protect, instructorOnly, updateExamValidation, validate, updateExam);

/* =========================
   DELETE EXAM
   Ownership/admin check is done inside the controller itself, so both
   the creating instructor AND any admin can delete — a route-level
   instructorOnly gate here would incorrectly block admins.
========================= */
router.delete('/:id', protect, deleteExam);

/* =========================
   GET ALL EXAMS (Student)
========================= */
router.get('/', protect, getAllExams);

module.exports = router;
