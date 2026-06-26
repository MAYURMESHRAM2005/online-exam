const express = require('express');
const router = express.Router();

const {
  createExam,
  getMyExams,
  deleteExam,
  getAllExams
} = require('../controllers/examController');

const { protect, instructorOnly } = require('../middleware/authMiddleware');

/* =========================
   CREATE EXAM
========================= */
router.post('/create', protect, instructorOnly, createExam);

/* =========================
   GET INSTRUCTOR EXAMS
========================= */
router.get('/my-exams', protect, instructorOnly, getMyExams);

/* =========================
   DELETE EXAM
========================= */
router.delete('/:id', protect, instructorOnly, deleteExam);

/* =========================
   GET ALL EXAMS (Student)
========================= */
router.get('/', protect, getAllExams);

module.exports = router;
