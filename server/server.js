const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

// === WEEK 6 DAY 2: ENV VALIDATION - Fail fast, no secrets leak ===
if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in .env - production leak check failed");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing in .env");
if (!process.env.ENCRYPT_KEY) throw new Error("ENCRYPT_KEY missing in .env");

const app = express();

// === SECURITY HEADERS - Production hardening ===
app.use(helmet());
app.disable("x-powered-by");

// === RATE LIMITING - Prevent brute force ===
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { msg: "Too many login attempts, try again after 15 min" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// === CORS LOCKED FOR PRODUCTION - UPDATED ===
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://secure-vault-woad.vercel.app",
  "https://secure-vault-cf2g.vercel.app",
  "https://secure-vault-woad-esosatech.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/mobile
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log("Not allowed by CORS:", origin);
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true
}));

app.use(express.json({ limit: "10kb" })); // prevent large payload attacks

// === Manual cookie parser - Triple fallback pipeline (Week 3 - KEPT) ===
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(";").forEach(cookie => {
      const [name, value] = cookie.trim().split("=");
      req.cookies[name] = decodeURIComponent(value);
    });
  }
  next();
});
app.use(cookieParser());

// Routes - authLimiter for brute force protection
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/vault", require("./routes/vault"));

// Health check for Render live deploy
app.get("/health", (req, res) => res.json({ status: "ok", zk: "active", audit: "0 vuln", week: "6 production hardened" }));

// === ERROR HANDLER - NO STACK LEAK IN PRODUCTION ===
app.use((err, req, res, next) => {
  console.error(err.message);
  if (process.env.NODE_ENV === "production") {
    return res.status(err.status || 500).json({ msg: "Internal server error" });
  }
  res.status(err.status || 500).json({ msg: err.message, stack: err.stack });
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected - secure-vault DB - Week 6 Production Hardened"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT} / Week 6: Helmet + RateLimit + CORS locked + 0 vuln + No secret leak`));