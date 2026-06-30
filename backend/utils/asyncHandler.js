// Wraps async controller functions so any thrown error or rejected promise
// is automatically forwarded to Express's error-handling middleware,
// instead of needing a try/catch in every single controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
