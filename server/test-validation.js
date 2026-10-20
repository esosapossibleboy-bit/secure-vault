require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Vault = require('./models/Vault');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Testing validation...\n');

  // Test 1: Invalid email regex
  try {
    await User.create({ email: 'not-an-email', password: 'Password123!' });
    console.log('❌ FAIL: Invalid email accepted');
  } catch(e) { console.log('✅ PASS: Regex blocked invalid email ->', e.message.split(':').pop()); }

  // Test 2: NoSQL injection attempt
  try {
    await User.create({ email: { $gt: "" }, password: 'Password123!' });
    console.log('❌ FAIL: Injection accepted');
  } catch(e) { console.log('✅ PASS: NoSQL injection blocked -> Strict/Validation'); }

  // Test 3: Oversized payload
  try {
    const bigBlob = 'A'.repeat(200000);
    await Vault.create({ userId: new mongoose.Types.ObjectId(), blob: bigBlob });
    console.log('❌ FAIL: Huge blob accepted - could crash DB');
  } catch(e) { console.log('✅ PASS: Maxlength blocked oversized blob ->', e.errors?.blob?.message); }

  // Test 4: Empty blob
  try {
    await Vault.create({ userId: new mongoose.Types.ObjectId(), blob: '' });
    console.log('❌ FAIL: Empty blob accepted');
  } catch(e) { console.log('✅ PASS: Required/minlength blocked empty'); }

  await mongoose.disconnect();
})();