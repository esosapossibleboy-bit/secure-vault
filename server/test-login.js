fetch('http://localhost:5002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test2@test.com', password: '123456' })
}).then(async r => {
  console.log('Status:', r.status);
  console.log('Body:', await r.json());
  console.log('Cookies:', r.headers.getSetCookie());
});