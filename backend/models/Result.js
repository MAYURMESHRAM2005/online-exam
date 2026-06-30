const mongoose = require("mongoose");

/* =========================
   ANSWER SUBDOCUMENT
   `question` stores the _id of the matching question subdocument
   inside the parent Exam document.
========================= */
const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedAnswer: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

/* =========================
   RESULT (also doubles as the exam-attempt record)
   One document per (exam, student) pair — created as "in-progress"
   when the student starts the exam, and finalized to "submitted"
   once they submit. The unique index below is what actually
   prevents duplicate attempts/submissions at the database level.
========================= */
const resultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    answers: [answerSchema],

    status: {
      type: String,
      enum: ["in-progress", "submitted"],
      default: "in-progress",
    },

    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeTakenSeconds: { type: Number, default: 0 },

    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    unattemptedCount: { type: Number, default: 0 },

    passed: { type: Boolean, default: false },

    // 🔒 Single-active-session enforcement (prevents the same exam being
    // taken in two tabs/windows/devices at once). Whichever tab most
    // recently called "start" owns this token; any other tab's
    // save/submit calls will be rejected once their token goes stale.
    activeSessionToken: { type: String, default: null },
    lastHeartbeatAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🔒 A student can only ever have ONE result/attempt per exam.
resultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);
