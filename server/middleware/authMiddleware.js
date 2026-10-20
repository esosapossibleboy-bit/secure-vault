const jwt = require('jsonwebtoken');

exports.authenticate = (req,res,next) => {
  const header = req.headers.authorization;
  const token = header?.split(' ')[1];
  if(!token) return res.status(401).json({ error: 'No access token' });
  try {
    req.user = jwt.verify(token, process.env.ACCESS_SECRET || process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Access token expired', expired: true });
  }
};