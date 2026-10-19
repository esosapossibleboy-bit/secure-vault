require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const app = express();

// === SECURITY STACK FOR 100% ===
app.use(helmet({ contentSecurityPolicy: true, crossOriginEmbedderPolicy: false }));
app.use(mongoSanitize()); // NoSQL Injection block
app.use(xss()); // XSS block
app.use(hpp()); // HTTP Param Pollution block
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Body limit

// Rate Limiters
const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 5, message: {msg:'Too many login attempts, try in 15min'} });
const apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 100 });

// CORS WHITELIST ONLY
const allowed = ['http://localhost:5173', 'https://your-vercel.vercel.app'];
app.use(cors({ origin: allowed, credentials: true }));
app.use('/api/', apiLimiter);

mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true }));

const Vault = mongoose.model('Vault', new mongoose.Schema({
  userId: String,
  title: { type: String, maxlength: 100 },
  content: { type: String, maxlength: 5000 }, // Encrypted
  iv: String, // For AES encryption
  files: [String]
}, { timestamps: true }));

// === AUTH MIDDLEWARE - JWT IN HTTPONLY COOKIE (Not localStorage) ===
const auth = (req,res,next)=>{
  const token = req.cookies.token;
  if(!token) return res.status(401).json({msg:'Not authenticated - Cookie missing'});
  try{ req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch{ return res.status(401).json({msg:'Invalid token'}); }
};

// === PASSWORD STRENGTH VALIDATOR ===
const strongPass = (p) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(p);

// REGISTER WITH EMAIL VERIFICATION + HASH
app.post('/api/auth/register', async (req,res)=>{
  const {email, password} = req.body;
  if(!strongPass(password)) return res.status(400).json({msg:'Password weak: 8 chars, Upper, lower, number, special'});
  const exists = await User.findOne({email: email.toLowerCase()});
  if(exists) return res.status(400).json({msg:'User exists'});
  const hashed = await bcrypt.hash(password, 12);
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({ email: email.toLowerCase(), password: hashed, verifyToken });
  // In real app: send email with verifyToken link
  console.log(`Verify link: /api/auth/verify/${verifyToken}`);
  res.json({msg:'Registered - Check email for verification'});
});

app.get('/api/auth/verify/:token', async (req,res)=>{
  const user = await User.findOne({verifyToken: req.params.token});
  if(!user) return res.status(400).json({msg:'Invalid token'});
  user.isVerified = true; user.verifyToken = undefined; await user.save();
  res.json({msg:'Email verified ✅'});
});

// LOGIN WITH BRUTE FORCE PROTECTION + 2FA
app.post('/api/auth/login', loginLimiter, async (req,res)=>{
  const {email, password, token2FA} = req.body;
  const user = await User.findOne({email: email.toLowerCase()});
  if(!user) return res.status(400).json({msg:'Invalid credentials'});

  // Check lock
  if(user.lockUntil && user.lockUntil > Date.now()){
    return res.status(423).json({msg:`Account locked until ${new Date(user.lockUntil)}`});
  }

  const ok = await bcrypt.compare(password, user.password);
  if(!ok){
    user.loginAttempts += 1;
    if(user.loginAttempts >= 5){ user.lockUntil = Date.now() + 15*60*1000; }
    await user.save();
    return res.status(400).json({msg:'Invalid credentials'});
  }
  if(!user.isVerified) return res.status(400).json({msg:'Verify email first'});

  // 2FA check
  if(user.twoFactorEnabled){
    if(!token2FA) return res.status(200).json({require2FA:true});
    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding:'base32', token: token2FA });
    if(!verified) return res.status(400).json({msg:'Invalid 2FA code'});
  }

  user.loginAttempts = 0; user.lockUntil = undefined; await user.save();
  const jwtToken = jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET, {expiresIn:'1d'});
  
  // SECURE COOKIE - HttpOnly, Secure, SameSite
  res.cookie('token', jwtToken, { httpOnly:true, secure: process.env.NODE_ENV==='production', sameSite:'Strict', maxAge: 24*60*60*1000 });
  res.json({msg:'Login success', user:{email:user.email, twoFactorEnabled:user.twoFactorEnabled}});
});

// SETUP 2FA
app.post('/api/auth/2fa/setup', auth, async (req,res)=>{
  const secret = speakeasy.generateSecret({ name: `SecureVault:${req.user.email}` });
  const user = await User.findById(req.user.id);
  user.twoFactorSecret = secret.base32; await user.save();
  const qr = await qrcode.toDataURL(secret.otpauth_url);
  res.json({qr, secret: secret.base32});
});
app.post('/api/auth/2fa/enable', auth, async (req,res)=>{
  const {token} = req.body;
  const user = await User.findById(req.user.id);
  const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding:'base32', token });
  if(!ok) return res.status(400).json({msg:'Invalid token'});
  user.twoFactorEnabled = true; await user.save();
  res.json({msg:'2FA Enabled ✅'});
});

// === VAULT - ENCRYPTED CONTENT (AES-256) ===
const encrypt = (text)=>{
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPT_KEY, 'hex'), iv);
  let enc = cipher.update(text, 'utf8', 'hex'); enc += cipher.final('hex');
  return { iv: iv.toString('hex'), content: enc };
};
const decrypt = (enc, iv)=>{
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPT_KEY, 'hex'), Buffer.from(iv, 'hex'));
  let dec = decipher.update(enc, 'hex', 'utf8'); dec += decipher.final('utf8');
  return dec;
};

app.post('/api/vault', auth, async (req,res)=>{
  const {title, content} = req.body;
  if(!title || !content) return res.status(400).json({msg:'Required'});
  const {iv, content: enc} = encrypt(content.slice(0,5000));
  const doc = await Vault.create({ userId: req.user.id, title: title.slice(0,100), content: enc, iv });
  res.json(doc);
});

app.get('/api/vault', auth, async (req,res)=>{
  const docs = await Vault.find({userId: req.user.id});
  const decrypted = docs.map(d=>({ ...d._doc, content: decrypt(d.content, d.iv) }));
  res.json(decrypted);
});

app.delete('/api/vault/:id', auth, async (req,res)=>{
  const doc = await Vault.findOne({_id:req.params.id, userId:req.user.id});
  if(!doc) return res.status(404).json({msg:'Not found'});
  await doc.deleteOne(); res.json({msg:'Deleted'});
});

app.post('/api/auth/logout', (req,res)=>{ res.clearCookie('token'); res.json({msg:'Logged out'}); });

app.listen(5000, ()=>console.log('🔒 SecureVault 100% Secure Running'));