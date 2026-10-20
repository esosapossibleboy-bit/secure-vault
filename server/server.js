const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authRoutes = require('./routes/auth');
const vaultRoutes = require('./routes/vault');

const app = express();

// --- Days 3-4: Protection layers ---
app.set('trust proxy', 1); // needed for rateLimit + Secure cookies behind proxy

app.use(helmet({
  crossOriginEmbedderPolicy: false, // allow frontend to load
}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true 
}));

// Throttle ONLY login/register, NOT refresh/logout
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many attempts, try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.includes('/refresh') || req.path.includes('/logout')
});

// General limiter for vault API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/vault', apiLimiter);
app.use('/api/vault', vaultRoutes);

app.get('/api/health', (req, res) => res.json({ 
  ok: true, 
  cookiesEnabled: true,
  doubleToken: 'access 15m + refresh httpOnly Strict' 
}));

const PORT = process.env.PORT || 5002;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    console.log('✅ Double-token: Access in header, Refresh in httpOnly cookie');
    app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
  })
  .catch(err => console.error(err));