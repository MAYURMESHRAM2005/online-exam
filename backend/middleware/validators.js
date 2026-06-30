const { body, validationResult } = require("express-validator");

/* =========================
   SHARED VALIDATION CHECKER
   Run after the rule arrays below; returns the first error message
========================= */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

/* =========================
   AUTH VALIDATION
========================= */
exports.registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  // NOTE: "admin" is intentionally not in this list.
  // Public registration may only create student or instructor accounts.
  // NOTE: For this academic/demo project, all three roles (including admin)
  // are allowed via public registration so the project can be demonstrated
  // end-to-end. This is NOT safe for a real production deployment — see the
  // comment in authController.js's register() function for details.
  body("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Role must be 'student', 'instructor', or 'admin'"),
];

exports.loginValidation = [
  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.changePasswordValidation = [
  body("oldPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

/* =========================
   EXAM VALIDATION
========================= */
exports.createExamValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("courseCode").trim().notEmpty().withMessage("Course code is required"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number of minutes"),
  body("totalMarks")
    .isInt({ min: 1 })
    .withMessage("Total marks must be a positive number"),
  body("passingMarks")
    .isInt({ min: 0 })
    .withMessage("Passing marks must be zero or a positive number")
    .custom((value, { req }) => {
      if (Number(value) > Number(req.body.totalMarks)) {
        throw new Error("Passing marks cannot be greater than total marks");
      }
      return true;
    }),
  body("date").notEmpty().withMessage("Date is required"),
  body("time").notEmpty().withMessage("Time is required"),
];

exports.updateExamValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("courseCode").optional().trim().notEmpty().withMessage("Course code cannot be empty"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number of minutes"),
  body("totalMarks")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total marks must be a positive number"),
  body("passingMarks")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Passing marks must be zero or a positive number")
    .custom((value, { req }) => {
      if (req.body.totalMarks !== undefined && Number(value) > Number(req.body.totalMarks)) {
        throw new Error("Passing marks cannot be greater than total marks");
      }
      return true;
    }),
];

/* =========================
   RESULT / EXAM-TAKING VALIDATION
========================= */
exports.saveAnswerValidation = [
  body("questionId").notEmpty().withMessage("questionId is required"),
  body("selectedAnswer")
    .optional({ checkFalsy: false })
    .isString()
    .withMessage("selectedAnswer must be a string"),
  body("sessionToken").notEmpty().withMessage("sessionToken is required"),
];

exports.submitExamValidation = [
  body("sessionToken").notEmpty().withMessage("sessionToken is required"),
  body("answers")
    .optional()
    .isArray()
    .withMessage("answers must be an array"),
];

/* =========================
   PROCTORING VALIDATION (Phase 1 — Foundation)
========================= */
exports.startProctorSessionValidation = [
  body("examId").notEmpty().withMessage("examId is required"),
  body("cameraStatus")
    .optional()
    .isIn(["pending", "granted", "denied", "unavailable"])
    .withMessage("Invalid cameraStatus"),
  body("microphoneStatus")
    .optional()
    .isIn(["pending", "granted", "denied", "unavailable"])
    .withMessage("Invalid microphoneStatus"),
];

exports.logProctorEventValidation = [
  body("eventType")
    .notEmpty()
    .withMessage("eventType is required")
    .isIn([
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
    ])
    .withMessage("Invalid eventType"),
];
