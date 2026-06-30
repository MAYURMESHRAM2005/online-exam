const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

/* -------------------- Security & Logging Middlewares -------------------- */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json());

// Rate limit auth endpoints to slow down brute-force login/register attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* -------------------- Routes -------------------- */
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/exams", require("./routes/examRoutes")); // ✅ Exam Routes
app.use("/api/results", require("./routes/resultRoutes")); // ✅ Result/Exam-taking Routes
app.use("/api/proctor", require("./routes/proctorRoutes")); // ✅ AI Proctoring Routes (Phase 1)

/* -------------------- Error Handling -------------------- */
app.use(notFound);
app.use(errorHandler);

/* -------------------- Server -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
