require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.collection('refreshtokens').dropIndexes();
  await mongoose.connection.collection('refreshtokens').deleteMany({});
  console.log('Fixed - indexes dropped and tokens cleared');
  process.exit();
});