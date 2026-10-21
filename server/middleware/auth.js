const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  // Triple fallback pipeline - Week 3
  if (req.cookies?.token) token = req.cookies.token;
  else if (req.headers.authorization?.startsWith("Bearer")) token = req.headers.authorization.split(" ")[1];
  else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return res.status(401).json({ message: "You are not logged in - BOLA blocked (401)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid - BOLA blocked" });
  }
};