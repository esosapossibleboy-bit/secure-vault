const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss'); // Phase 5: patched lib
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

// === PHASE 5: VARIABLES ISOLATION ===
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URLS = isProd 
  ? (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [])
  : ['http://localhost:5173'];

if(!MONGO_URI) throw new Error('❌ MONGO_URI missing in .env');
if(isProd && CLIENT_URLS.length===0) console.warn('⚠️ CLIENT_URL not set in production');

app.set('trust proxy', 1);

// 1. SECURITY HEADERS - PHASE 5 HARDENED
app.use(helmet({
  contentSecurityPolicy: false, // allow Vite dev
  crossOriginEmbedderPolicy: false
}));
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));

// 2. EXCLUSIVE CORS - PHASE 5
app.use(cors({ 
  origin: (origin, cb) => {
    if(!origin) return cb(null, true); // Postman / mobile
    if(CLIENT_URLS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 3. BODY + SANITIZATION - PHASE 5 PATCHED
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // NoSQL injection
app.use(hpp()); // Param pollution

// XSS patched - replaces xss-clean
app.use((req,res,next)=>{
  if(req.body){
    for(const k in req.body){
      if(typeof req.body[k]==='string'){
        req.body[k]=xss(req.body[k]);
      }
    }
  }
  next();
});

// 4. RATE LIMITERS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 200 : 100,
  message: { error: 'Too many requests' },
  standardHeaders: true,
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, blocked 15 min', locked: true },
  skipSuccessfulRequests: true,
});
app.use('/api/auth', authLimiter);

// 5. DB
mongoose.connect(MONGO_URI)
  .then(()=> console.log('✅ MongoDB Connected'))
  .catch(e=> { console.error('❌ DB', e); process.exit(1); });

// 6. ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vault', require('./routes/vault'));

// 7. HEALTH
app.get('/', (req,res)=> res.json({ 
  status: 'Secure Vault API',
  phase: 'PHASE 5 PRODUCTION HARDENED',
  env: process.env.NODE_ENV,
  security: ['helmet+hsts','xss-patched','hpp','mongoSanitize','rateLimit x2','HttpOnly secure','CORS whitelist'],
  allowedOrigins: CLIENT_URLS
}));

// 8. 404 + Error Handler
app.use((req,res)=> res.status(404).json({error:'Route not found'}));
app.use((err, req, res, next)=>{
  console.error(err.message);
  if(err.message.includes('CORS blocked')){
    return res.status(403).json({error: err.message});
  }
  res.status(500).json({error: isProd ? 'Server error' : err.message});
});

app.listen(PORT, ()=> console.log(`✅ Server on ${PORT} - PHASE 5 PRODUCTION HARDENED | Prod=${isProd}`));