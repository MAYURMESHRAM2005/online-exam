/**
 * Returns the real start and end Date objects for an exam,
 * computed from its date + time + duration fields.
 */
function getExamWindow(exam) {
  const datePart = new Date(exam.date).toISOString().split("T")[0];
  const start = new Date(`${datePart}T${exam.time}`);
  const end = new Date(start.getTime() + exam.duration * 60000);
  return { start, end };
}

module.exports = getExamWindow;
