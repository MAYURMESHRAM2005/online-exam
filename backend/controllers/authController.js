const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");

/* =========================
   HELPER: GENERATE TOKEN
========================= */
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

/* =========================
   REGISTER USER
========================= */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // ⚠️ DEMO-PROJECT ONLY: public registration is allowed to create
  // student, instructor, AND admin accounts so all three role dashboards
  // can be demonstrated end-to-end without a separate admin-provisioning
  // flow. In a real production system, admin accounts should never be
  // creatable through a public-facing endpoint like this — they should be
  // seeded directly in the database or created by an existing admin
  // through a protected, admin-only route.
  const allowedPublicRoles = ["student", "instructor", "admin"];
  const finalRole = allowedPublicRoles.includes(role) ? role : "student";

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: finalRole,
  });

  // Generate token
  const token = generateToken(user);

  res.status(201).json({
    token,
    role: user.role,
    name: user.name,
  });
});

/* =========================
   LOGIN USER
========================= */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check user
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  // Generate JWT
  const token = generateToken(user);

  res.json({
    token,
    role: user.role,
    name: user.name,
  });
});

/* =========================
   CHANGE PASSWORD
   (req.user is set by the `protect` middleware)
========================= */
exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  if (oldPassword === newPassword) {
    const error = new Error(
      "New password must be different from the current password"
    );
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password updated successfully" });
});

/* =========================
   PROFILE COMPLETION HELPER
   Calculated from real fields instead of a hardcoded number.
   Counts: name, email, phone, bio (4 fields, 25% each).
========================= */
const calculateProfileCompletion = (user) => {
  const fields = [user.name, user.email, user.phone, user.bio];
  const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
};

/* =========================
   GET CURRENT USER PROFILE
========================= */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  res.json({
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    bio: user.bio || "",
    profileCompletionPercent: calculateProfileCompletion(user),
  });
});

/* =========================
   UPDATE PROFILE
========================= */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { phone, bio } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  res.json({
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    bio: user.bio || "",
    profileCompletionPercent: calculateProfileCompletion(user),
  });
});
