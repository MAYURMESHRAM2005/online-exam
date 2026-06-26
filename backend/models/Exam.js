
// const mongoose = require("mongoose");

// const examSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   courseCode: { type: String, required: true },
//   duration: { type: Number, required: true },
//   date:{type:String},
//   totalMarks: { type: Number, required: true },
//   passingMarks: { type: Number, required: true },
//   instructions: { type: String },

//   proctoring: {
//     enableAI: Boolean,
//     enableCamera: Boolean,
//     enableMicrophone: Boolean,
//     enableScreenShare: Boolean,
//     faceDetection: Boolean,
//     tabSwitchLimit: Number
//   },

//   questions: [
//     {
//       questionText: { type: String, required: true },
//       type: { type: String, default: "mcq" },
//       options: [String],
//       correctAnswer: String,
//       marks: { type: Number, default: 1 }
//     }
//   ],

//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   }

// }, { timestamps: true });

// module.exports = mongoose.model("Exam", examSchema);
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    courseCode: { type: String, required: true },

    duration: { type: Number, required: true }, // in minutes

    // ✅ FIXED DATE + TIME
    date: { type: Date, required: true },
    time: { type: String, required: true }, // "HH:MM"

    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },

    instructions: { type: String, default: "" },

    // ✅ FIXED PROCTORING (match frontend)
    proctoring: {
      enableProctoring: { type: Boolean, default: true },
      enableCamera: { type: Boolean, default: true },
      enableMicrophone: { type: Boolean, default: true },
      enableScreenShare: { type: Boolean, default: false },
      faceDetection: { type: Boolean, default: true },
      tabSwitchLimit: { type: Number, default: 3 },
    },

    // ✅ QUESTIONS
    questions: [
      {
        questionText: { type: String, required: true },
        type: { type: String, default: "mcq" },
        options: { type: [String], default: [] },
        correctAnswer: { type: String },
        marks: { type: Number, default: 1 },
      },
    ],

    // ✅ OPTIONAL: store stats (for dashboard)
    students: { type: Number, default: 0 },
    submitted: { type: Number, default: 0 },
    violations: { type: Number, default: 0 },

    // ✅ OPTIONAL STATUS (can also compute dynamically)
    status: {
      type: String,
      enum: ["scheduled", "live", "completed"],
      default: "scheduled",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);