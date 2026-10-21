const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

exports.register = async (req,res)=>{
  try{
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({message:'User exists'});
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || 'user' });
    res.status(201).json({message:'Registered', user: {id:user._id, email:user.email}});
  }catch(e){ res.status(500).json({message:e.message}); }
};

exports.login = async (req,res)=>{
  try{
    const { email, password } = req.body;
    // IMPORTANT: +password to get hashed password
    const user = await User.findOne({ email }).select('+password');
    if(!user) return res.status(401).json({message:'Invalid credentials'});
    
    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(401).json({message:'Invalid credentials'});

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({ 
  token: refreshToken, 
  user: user._id,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
})

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'strict', maxAge: 7*24*60*60*1000 });

    res.json({ accessToken, user: { id: user._id, email: user.email, role: user.role } });
  }catch(e){ 
    console.log(e);
    res.status(500).json({message:e.message}); 
  }
};

exports.refresh = async (req,res)=>{
  const token = req.cookies.refreshToken;
  if(!token) return res.status(401).json({message:'No refresh token'});
  try{
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const stored = await RefreshToken.findOne({ token });
    if(!stored) return res.status(403).json({message:'Refresh token revoked'});
    const user = await User.findById(decoded.id);
    const newAccess = generateAccessToken(user);
    res.json({ accessToken: newAccess });
  }catch(e){ return res.status(403).json({message:'Invalid refresh token'}); }
};

exports.logout = async (req,res)=>{
  const token = req.cookies.refreshToken;
  if(token) await RefreshToken.deleteOne({ token });
  res.clearCookie('refreshToken');
  res.json({message:'Logged out'});
};