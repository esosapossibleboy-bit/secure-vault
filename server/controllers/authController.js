const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev_refresh_secret';

function generateTokens(userId) {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// Days 1-2: Registration with hash + salt
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // operational validation: check existing
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    // HASH + SALT with bcrypt (12 rounds)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashedPassword });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({ 
      message: 'User registered',
      accessToken, 
      refreshToken,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login with validation routine
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Compare plain vs hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const { accessToken } = generateTokens(decoded.id);
    // return new access token, keep same refresh
    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};