const express = require("express");
const router = express.Router();

const { register, login, changePassword, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  validate,
  registerValidation,
  loginValidation,
  changePasswordValidation,
} = require("../middleware/validators");

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

// ✅ NEW: Change Password (was called by the frontend but didn't exist before)
router.post(
  "/change-password",
  protect,
  changePasswordValidation,
  validate,
  changePassword
);

// ✅ NEW: Profile (used to compute real "profile completion" on the dashboard)
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;
