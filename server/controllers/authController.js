const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

function generateTokens(userId) {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email exists' });
  
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password: hashed });
  const { accessToken, refreshToken } = generateTokens(user._id);
  
  await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now()+7*24*60*60*1000) });
  setRefreshCookie(res, refreshToken);
  
  res.status(201).json({ accessToken, user: { id: user._id, email } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const { accessToken, refreshToken } = generateTokens(user._id);
  await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now()+7*24*60*60*1000) });
  setRefreshCookie(res, refreshToken);
  
  res.json({ accessToken, user: { id: user._id, email } });
};

exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  
  try {
    const stored = await RefreshToken.findOne({ token });
    if (!stored) return res.status(403).json({ message: 'Revoked' });
    
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.id);
    
    await RefreshToken.deleteOne({ token });
    await RefreshToken.create({ user: decoded.id, token: newRefresh, expiresAt: new Date(Date.now()+7*24*60*60*1000) });
    setRefreshCookie(res, newRefresh);
    
    res.json({ accessToken });
  } catch { res.status(403).json({ message: 'Invalid refresh' }); }
};

exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) await RefreshToken.deleteOne({ token });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV==='production', path:'/' });
  res.json({ message: 'Logged out' });
};

// === NEW CODE ADDED BELOW ===

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user._id, email: user.email } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    await RefreshToken.deleteMany({ user: req.user.id });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV==='production', path:'/' });
    res.json({ message: 'Logged out from all devices' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};