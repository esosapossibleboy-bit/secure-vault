const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Manual cookie parser - Triple fallback pipeline (Week 3)
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

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/vault", require("./routes/vault"));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected - secure-vault DB"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT} / Week 4: AuthContext + ProtectedRoute + Axios Interceptors`));