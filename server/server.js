const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// MANUAL cookie parser - no package needed (your code - Week 3 token pipeline)
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(c => {
      const [k, ...v] = c.trim().split('=');
      req.cookies[k] = decodeURIComponent(v.join('='));
    });
  }
  next();
});

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// MongoDB - E11000 fixed forever (no more drop on every restart)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure-vault')
  .then(() => {
    console.log('✅ MongoDB connected - secure-vault DB');
    console.log('✅ Week 3: bcrypt + token pipeline + BOLA protected');
  })
  .catch(err => console.log('Mongo Error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vault', require('./routes/vault'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Secure Vault API - BOLA Protected 🔒' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Client running on http://localhost:5173`);
});