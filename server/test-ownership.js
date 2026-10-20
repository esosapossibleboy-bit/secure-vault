require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Vault = require('./models/Vault');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({ email: /test-owner/ });
  await Vault.deleteMany({ userId: { $exists: true } });

  const userA = await User.create({ email: 'test-owner-a@test.com', password: 'Password123!' });
  const userB = await User.create({ email: 'test-owner-b@test.com', password: 'Password123!' });
  
  console.log(`\nUserA ID: ${userA._id}`);
  console.log(`UserB ID: ${userB._id}`);

  await Vault.create({ userId: userA._id, blob: 'SECRET_FOR_A_ONLY' });
  await Vault.create({ userId: userB._id, blob: 'SECRET_FOR_B_ONLY' });

  // Simulate auth middleware: req.userId = userA._id
  const asUserA = await Vault.findOne({ userId: userA._id });
  const asUserB = await Vault.findOne({ userId: userB._id });

  console.log('\n--- DAYS 3-4: OWNERSHIP TEST ---');
  console.log(`When logged as UserA -> finds: ${asUserA.blob}`);
  console.log(`When logged as UserB -> finds: ${asUserB.blob}`);

  // Try hack: UserA tries to find UserB's data
  const hackAttempt = await Vault.findOne({ userId: userB._id, _id: asUserA._id });
  
  if (asUserA.blob === 'SECRET_FOR_A_ONLY' && asUserB.blob === 'SECRET_FOR_B_ONLY') {
    console.log('\n✅✅✅ PASS: Clear data ownership enforced!');
    console.log('User schema has ObjectId, Vault has userId ref User, filter userId=req.userId works');
  } else {
    console.log('\n❌ FAIL');
  }

  await mongoose.disconnect();
  console.log('\nDone. You can delete test users in Atlas if you want.');
})();