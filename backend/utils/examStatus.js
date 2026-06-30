/**
 * Computes the real-time status of an exam based on its scheduled
 * date, time, and duration — independent of the `status` field stored
 * on the document (which is not kept in sync automatically).
 *
 * Returns one of: "scheduled" | "live" | "completed"
 */
function computeExamStatus(exam) {
  if (!exam.date || !exam.time || !exam.duration) {
    return "scheduled";
  }

  try {
    const datePart = new Date(exam.date).toISOString().split("T")[0];
    const start = new Date(`${datePart}T${exam.time}`);

    // Defensive check in case date/time combination is invalid
    if (isNaN(start.getTime())) {
      return "scheduled";
    }

    const end = new Date(start.getTime() + exam.duration * 60000);
    const now = new Date();

    if (now < start) return "scheduled";
    if (now >= start && now <= end) return "live";
    return "completed";
  } catch {
    // Any malformed date/time value (e.g. a legacy record) falls back to
    // "scheduled" instead of crashing the caller.
    return "scheduled";
  }
}

module.exports = computeExamStatus;
