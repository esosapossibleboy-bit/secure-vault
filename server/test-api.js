const axios = require('axios');
const BASE = 'http://localhost:5002';

async function test() {
  const email = `test${Date.now()}@test.com`;
  const password = 'Password123!';

  console.log('1. REGISTER', email);
  let res = await axios.post(`${BASE}/api/auth/register`, { email, password });
  console.log('✅', res.data);

  console.log('\n2. LOGIN');
  res = await axios.post(`${BASE}/api/auth/login`, { email, password });
  console.log('✅', res.data);
  const token = res.data.accessToken;
  const cookies = res.headers['set-cookie'];
  console.log('Token:', token.slice(0,20)+'...');

  console.log('\n3. GET VAULT (empty)');
  res = await axios.get(`${BASE}/api/vault`, { headers: { Authorization: `Bearer ${token}` } });
  console.log('✅', res.data);

  console.log('\n4. SAVE VAULT (Create)');
  res = await axios.post(`${BASE}/api/vault`, { blob: 'my-secret-data-encrypted' }, 
    { headers: { Authorization: `Bearer ${token}` } });
  console.log('✅', res.data);

  console.log('\n5. GET VAULT (should have data)');
  res = await axios.get(`${BASE}/api/vault`, { headers: { Authorization: `Bearer ${token}` } });
  console.log('✅', res.data);

  console.log('\n6. DELETE VAULT');
  res = await axios.delete(`${BASE}/api/vault`, { headers: { Authorization: `Bearer ${token}` } });
  console.log('✅', res.data);

  console.log('\n🎉 ALL CRUD WORKS - Week 2 Days 1-2 PASS!');
}

test().catch(e => console.log('❌ FAILED', e.response?.data || e.message));