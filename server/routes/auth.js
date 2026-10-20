const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { registerRules, loginRules, validate } = require('../middleware/validate');
const router = express.Router();

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES_DAYS = 7;

function signAccessToken(userId){
  return jwt.sign({ id: userId }, process.env.ACCESS_SECRET || process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}
function generateRefreshToken(){
  return crypto.randomBytes(64).toString('hex');
}
function hashToken(token){
  return crypto.createHash('sha256').update(token).digest('hex');
}

router.post('/register', registerRules, validate, async (req,res)=>{
  const { email, password } = req.body;
  if(await User.findOne({ email })) return res.status(400).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash: hash });
  res.json({ success: true, user: user.email });
});

router.post('/login', loginRules, validate, async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({ error: 'Invalid credentials' });

  if(user.lockUntil && user.lockUntil > Date.now()){
    const mins = Math.ceil((user.lockUntil - Date.now())/60000);
    return res.status(423).json({ error: `Locked ${mins} min`, locked: true });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if(!valid){
    user.loginAttempts += 1;
    if(user.loginAttempts >= 5) user.lockUntil = new Date(Date.now()+15*60*1000);
    await user.save();
    return res.status(400).json({ error: 'Invalid credentials', attempts: `${user.loginAttempts}/5` });
  }

  user.loginAttempts = 0; user.lockUntil = null; await user.save();

  const accessToken = signAccessToken(user._id);
  const refreshToken = generateRefreshToken();
  
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS*24*60*60*1000)
  });

  // FIXED: path '/' so browser sends cookie everywhere
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: REFRESH_EXPIRES_DAYS*24*60*60*1000,
    path: '/'
  });

  res.json({ success: true, accessToken, expiresIn: ACCESS_EXPIRES });
});

router.post('/refresh', async (req,res)=>{
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if(!token) return res.status(401).json({ error: 'No refresh token' });

  const hashed = hashToken(token);
  const stored = await RefreshToken.findOne({ tokenHash: hashed, revoked: false });
  if(!stored || stored.expiresAt < new Date()) return res.status(401).json({ error: 'Refresh expired' });

  // ROTATE
  await RefreshToken.deleteOne({ _id: stored._id });
  const newRefresh = generateRefreshToken();
  await RefreshToken.create({
    userId: stored.userId,
    tokenHash: hashToken(newRefresh),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS*24*60*60*1000)
  });

  // FIXED: path '/' + sameSite lax
  res.cookie('refreshToken', newRefresh, {
    httpOnly: true, 
    secure: false, 
    sameSite: 'lax',
    maxAge: REFRESH_EXPIRES_DAYS*24*60*60*1000,
    path: '/'
  });

  const newAccess = signAccessToken(stored.userId);
  res.json({ accessToken: newAccess });
});

router.post('/logout', async (req,res)=>{
  const token = req.cookies?.refreshToken;
  if(token) await RefreshToken.deleteOne({ tokenHash: hashToken(token) });
  // FIXED: clear with same path '/'
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ success: true });
});

module.exports = router;