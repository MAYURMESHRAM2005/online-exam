// const Exam = require('../models/Exam');

// exports.createExam = async (req, res) => {
//   try {
//     const {
//       title,
//       courseCode,
//       duration,
//       totalMarks,
//       passingMarks,
//       instructions,
//       proctoring,
//       schedule,
//       questions
//     } = req.body;

//     const exam = await Exam.create({
//       title,
//       courseCode,
//       duration,
//       totalMarks,
//       passingMarks,
//       instructions,
//       proctoring,
//       schedule,
//       questions,
//       createdBy: req.user._id
//     });

//     res.status(201).json({
//       message: 'Exam created successfully',
//       exam
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const Exam = require('../models/Exam');

/* =========================
   CREATE EXAM
========================= */
exports.createExam = async (req, res) => {
  try {
    const {
      title,
      courseCode,
      duration,
      totalMarks,
      passingMarks,
      instructions,
      proctoring,
      date,
      time,
      questions
    } = req.body;
    // ✅ VALIDATION
    if (!date || !time) {
      return res.status(400).json({
        message: "Date and Time are required"
      });
    }

    // ✅ DEBUG (IMPORTANT)
    // console.log("Incoming:", req.body);

    const exam = await Exam.create({
      title,
      courseCode,
      duration,
      totalMarks,
      passingMarks,
      instructions,
      proctoring,
      date,
      time,
      questions,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Exam created successfully',
      exam
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET MY EXAMS (Instructor)
========================= */
exports.getMyExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(exams);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE EXAM
========================= */
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Only creator can delete
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await exam.deleteOne();

    res.json({ message: "Exam deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ALL EXAMS (Student)
========================= */
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
