const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/* =========================
   PROTECT
   Verifies the JWT and attaches the logged-in user to req.user
========================= */
exports.protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const error = new Error(
      err.name === 'TokenExpiredError'
        ? 'Session expired, please log in again'
        : 'Invalid token'
    );
    error.statusCode = 401;
    return next(error);
  }

  // Make sure the user still exists (e.g. wasn't deleted after the token was issued)
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    const error = new Error('User no longer exists');
    error.statusCode = 401;
    return next(error);
  }

  req.user = user;
  next();
});

/* =========================
   INSTRUCTOR ONLY
========================= */
exports.instructorOnly = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    const error = new Error('Access denied. Instructor only.');
    error.statusCode = 403;
    return next(error);
  }
  next();
};

/* =========================
   ADMIN ONLY
========================= */
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    const error = new Error('Access denied. Admin only.');
    error.statusCode = 403;
    return next(error);
  }
  next();
};
