require('dotenv').config();
module.exports = {
  isProd: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 5002,
  mongoUri: process.env.MONGO_URI,
  accessSecret: process.env.ACCESS_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
  clientUrls: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app.vercel.app'] 
    : ['http://localhost:5173']
}