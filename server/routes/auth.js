const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    // === WEEK 6: BLOCK PUBLIC REGISTRATION ===
    // Set DISABLE_PUBLIC_SIGNUP=true on Render to lock site after grading
    if (process.env.DISABLE_PUBLIC_SIGNUP === 'true') {
      return res.status(403).json({ 
        message: "Public registration closed - Academic Demo Only. Contact admin." 
      });
    }

    const { email, password } = req.body;
    
    // Optional: Only allow your test emails (extra lock)
    const allowedEmails = [
      "esosa2026@test.com",
      process.env.ADMIN_EMAIL
    ].filter(Boolean);
    
    // If ADMIN lock enabled, only allow listed emails
    if (process.env.LOCK_TO_ADMIN_ONLY === 'true' && !allowedEmails.includes(email)) {
      return res.status(403).json({ message: "Registration restricted to admin only" });
    }

    const user = await User.create({ email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
    res.json({ token, user: { _id: user._id, email: user.email } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
    res.json({ token, user: { _id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// Day 5-7: Refresh endpoint for Axios interceptor
router.post("/refresh", async (req, res) => {
  try {
    let token = req.cookies?.token || req.body.token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ message: "No token to refresh" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", newToken, { httpOnly: true, sameSite: "lax" });
    res.json({ token: newToken, user });
  } catch (err) {
    return res.status(401).json({ message: "Refresh failed" });
  }
});

module.exports = router;