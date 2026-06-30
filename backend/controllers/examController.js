const Exam = require("../models/Exam");
const Result = require("../models/Result");
const asyncHandler = require("../utils/asyncHandler");
const computeExamStatus = require("../utils/examStatus");

const isPrivilegedRole = (role) => role === "instructor" || role === "admin";

/* =========================
   CREATE EXAM
========================= */
exports.createExam = asyncHandler(async (req, res) => {
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
    questions,
  } = req.body;

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
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Exam created successfully",
    exam,
  });
});

/* =========================
   GET MY EXAMS (Instructor)
   Each exam is enriched with real aggregated data from Results:
   - students: distinct students who have started/submitted this exam
     (there is no separate enrollment system in this project, so "assigned"
     is defined as "has engaged with this exam attempt")
   - submitted: count of fully submitted attempts
   - avgScore: average percentage across submitted attempts (null if none)
   - violations: 0 — no AI proctoring module yet; this field is structured
     so it can be wired to real data the moment that module exists.
========================= */
exports.getMyExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });

  const examIds = exams.map((e) => e._id);

  const stats = await Result.aggregate([
    { $match: { exam: { $in: examIds } } },
    {
      $group: {
        _id: "$exam",
        totalAttempts: { $sum: 1 },
        submittedCount: {
          $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
        },
        avgPercentage: {
          $avg: {
            $cond: [{ $eq: ["$status", "submitted"] }, "$percentage", null],
          },
        },
      },
    },
  ]);

  const statsMap = {};
  stats.forEach((s) => {
    statsMap[s._id.toString()] = s;
  });

  const enriched = exams.map((exam) => {
    const s = statsMap[exam._id.toString()];
    return {
      ...exam.toObject(),
      computedStatus: computeExamStatus(exam),
      students: s ? s.totalAttempts : 0,
      submitted: s ? s.submittedCount : 0,
      violations: 0,
      avgScore: s && s.avgPercentage != null ? Math.round(s.avgPercentage) : null,
    };
  });

  res.json(enriched);
});

/* =========================
   UPDATE EXAM (Instructor — Edit Exam flow)
========================= */
exports.updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    const error = new Error("Exam not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = exam.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("Not authorized to edit this exam");
    error.statusCode = 403;
    throw error;
  }

  const editableFields = [
    "title",
    "courseCode",
    "duration",
    "date",
    "time",
    "totalMarks",
    "passingMarks",
    "instructions",
    "proctoring",
    "questions",
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      exam[field] = req.body[field];
    }
  });

  await exam.save();

  res.json({ message: "Exam updated successfully", exam });
});

/* =========================
   GET INSTRUCTOR DASHBOARD STATS
   GET /api/exams/instructor/stats
   Aggregates everything the Instructor Dashboard cards need in one call.
========================= */
exports.getInstructorStats = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ createdBy: req.user._id });
  const examIds = exams.map((e) => e._id);

  const totalExams = exams.length;

  // Active Students: distinct students who have started or submitted
  // ANY of this instructor's exams.
  const distinctStudents = await Result.distinct("student", {
    exam: { $in: examIds },
  });
  const activeStudents = distinctStudents.length;

  // Average Score: across all submitted results for this instructor's exams.
  const avgAgg = await Result.aggregate([
    { $match: { exam: { $in: examIds }, status: "submitted" } },
    { $group: { _id: null, avgPercentage: { $avg: "$percentage" } } },
  ]);
  const avgScore = avgAgg.length > 0 ? Math.round(avgAgg[0].avgPercentage) : null;

  // Violations: no AI proctoring module yet.
  const violations = 0;

  // Next Exam: nearest upcoming (scheduled or live) exam by start time.
  const safeStart = (exam) => {
    try {
      const datePart = new Date(exam.date).toISOString().split("T")[0];
      const t = new Date(`${datePart}T${exam.time}`).getTime();
      return isNaN(t) ? null : t;
    } catch {
      return null;
    }
  };

  const upcoming = exams
    .map((exam) => ({ exam, status: computeExamStatus(exam), start: safeStart(exam) }))
    .filter((e) => e.status !== "completed")
    .sort((a, b) => {
      if (a.start === null && b.start === null) return 0;
      if (a.start === null) return 1;
      if (b.start === null) return -1;
      return a.start - b.start;
    });

  let nextExam = null;
  if (upcoming.length > 0) {
    const ne = upcoming[0].exam;
    const registeredStudents = await Result.countDocuments({ exam: ne._id });
    nextExam = {
      examId: ne._id,
      title: ne.title,
      courseCode: ne.courseCode,
      date: ne.date,
      time: ne.time,
      registeredStudents,
    };
  }

  res.json({ totalExams, activeStudents, avgScore, violations, nextExam });
});
/* =========================
   DELETE EXAM
========================= */
exports.deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    const error = new Error("Exam not found");
    error.statusCode = 404;
    throw error;
  }

  // Creator or an admin can delete
  const isOwner = exam.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("Not authorized to delete this exam");
    error.statusCode = 403;
    throw error;
  }

  // 🔒 DATABASE CONSISTENCY: cascade-delete every Result tied to this exam
  // (Result already doubles as the exam-attempt record from Module 3 — there
  // is no separate ExamAttempt or Notification collection in this project;
  // notifications are computed on the fly and never persisted, so there is
  // nothing else to clean up).
  const { deletedCount: deletedResultsCount } = await Result.deleteMany({
    exam: exam._id,
  });

  await exam.deleteOne();

  res.json({
    message: "Exam deleted successfully",
    deletedResultsCount,
  });
});

/* =========================
   GET ALL EXAMS (Student)
   🔒 SECURITY: correctAnswer is stripped out for any non-instructor,
   non-admin caller so students can never read MCQ answers
   straight from the network response.
   Each exam is also annotated with a real-time `computedStatus`.
========================= */
exports.getAllExams = asyncHandler(async (req, res) => {
  const privileged = isPrivilegedRole(req.user.role);

  const query = Exam.find().sort({ createdAt: -1 });

  if (!privileged) {
    query.select("-questions.correctAnswer");
  }

  const exams = await query;

  const withStatus = exams.map((exam) => ({
    ...exam.toObject(),
    computedStatus: computeExamStatus(exam),
  }));

  res.json(withStatus);
});

/* =========================
   GET AVAILABLE EXAMS (Student)
   Returns only exams that are still relevant to take —
   i.e. not yet completed — sorted by the soonest first.
   This powers the Student Dashboard's "Available / Upcoming Exams" list.
========================= */
exports.getAvailableExams = asyncHandler(async (req, res) => {
  const privileged = isPrivilegedRole(req.user.role);

  const query = Exam.find();

  if (!privileged) {
    query.select("-questions.correctAnswer");
  }

  const exams = await query;

  // Safe start-time getter — returns null instead of throwing if an exam's
  // date/time turns out to be missing or malformed (e.g. a legacy record).
  const safeStartTime = (examPlain) => {
    try {
      const datePart = new Date(examPlain.date).toISOString().split("T")[0];
      const start = new Date(`${datePart}T${examPlain.time}`);
      return isNaN(start.getTime()) ? null : start.getTime();
    } catch {
      return null;
    }
  };

  const available = exams
    .map((exam) => ({
      ...exam.toObject(),
      computedStatus: computeExamStatus(exam),
    }))
    .filter((exam) => exam.computedStatus !== "completed")
    .sort((a, b) => {
      const aTime = safeStartTime(a);
      const bTime = safeStartTime(b);

      // Exams with an unparseable schedule sort to the end instead of
      // crashing the whole request.
      if (aTime === null && bTime === null) return 0;
      if (aTime === null) return 1;
      if (bTime === null) return -1;

      return aTime - bTime;
    });

  res.json(available);
});

/* =========================
   GET EXAM BY ID
   Used by the Exam Instructions screen to show real exam details,
   and to validate whether the student is actually allowed to start it.
   🔒 SECURITY: correctAnswer is stripped for non-privileged roles.
========================= */
exports.getExamById = asyncHandler(async (req, res) => {
  const privileged = isPrivilegedRole(req.user.role);

  const query = Exam.findById(req.params.id);

  if (!privileged) {
    query.select("-questions.correctAnswer");
  }

  const exam = await query;

  if (!exam) {
    const error = new Error("Exam not found");
    error.statusCode = 404;
    throw error;
  }

  const computedStatus = computeExamStatus(exam);

  // 🔒 A student who already submitted this exam may never re-enter it.
  let alreadySubmitted = false;
  if (!privileged) {
    const existingResult = await Result.findOne({
      exam: exam._id,
      student: req.user._id,
      status: "submitted",
    });
    alreadySubmitted = !!existingResult;
  }

  // Students may only start an exam while it is actually "live", and only
  // if they haven't already submitted it.
  const canStart = privileged || (computedStatus === "live" && !alreadySubmitted);

  let accessMessage = null;
  if (!privileged) {
    if (alreadySubmitted) {
      accessMessage = "You have already completed this exam.";
    } else if (computedStatus === "scheduled") {
      accessMessage = "This exam has not started yet. Please come back at the scheduled time.";
    } else if (computedStatus === "completed") {
      accessMessage = "This exam window has ended and can no longer be started.";
    }
  }

  res.json({
    ...exam.toObject(),
    computedStatus,
    canStart,
    accessMessage,
    alreadySubmitted,
  });
});
