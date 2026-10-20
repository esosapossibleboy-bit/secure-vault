const jwt = require('jsonwebtoken');
module.exports = (req,res,next) => {
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({error:'No token'});
  try {
    const token = h.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET || process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch(e){ return res.status(401).json({error:'Token expired', expired:true}); }
}