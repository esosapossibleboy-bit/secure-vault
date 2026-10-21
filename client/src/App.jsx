import { useState, useEffect } from 'react';
import api from './api/axios.js';

function App() {
  const [vaults, setVaults] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('esosa2026@test.com');
  const [password, setPassword] = useState('123456');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchVaults = async () => {
    try {
      const res = await api.get('/vault');
      setVaults(res.data);
    } catch (err) {
      console.log('Not logged in yet', err.response?.data);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => { fetchVaults(); }, []);

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token) localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      fetchVaults();
      alert('Login successful - like your PowerShell eyJhbGci... token!');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const saveVault = async () => {
    await api.post('/vault', { title, content });
    setTitle(''); setContent('');
    fetchVaults();
  };

  const deleteVault = async (id) => {
    await api.delete(`/vault/${id}`);
    fetchVaults();
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      <h1>Your Vaults - BOLA Protected 🔒</h1>
      
      {!isLoggedIn ? (
        <div style={{ background: '#fff3cd', padding: '20px', width: '400px', margin: '20px auto', border: '1px solid orange' }}>
          <h3>You are not logged in - BOLA blocked (401)</h3>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
          <br/><button onClick={handleLogin} style={{ padding: '8px 16px', background: 'green', color: 'white' }}>Login</button>
        </div>
      ) : (
        <>
          <button onClick={async () => { await api.post('/auth/logout'); localStorage.clear(); setIsLoggedIn(false); setVaults([]); }}>Logout</button>
          <div style={{ background: '#eee', padding: '20px', width: '400px', margin: '20px auto' }}>
            <h2>Create New Vault</h2>
            <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
            <textarea placeholder="Secret content" value={content} onChange={e=>setContent(e.target.value)} style={{ width: '100%' }} />
            <br/><button onClick={saveVault}>Save to Vault</button>
          </div>
          <h2>Vaults ({vaults.length}) — Only yours, BOLA blocks others</h2>
          {vaults.map(v => (
            <div key={v._id} style={{ border: '1px solid #ccc', width: '400px', margin: '10px auto', padding: '10px' }}>
              <b>{v.title}</b><br/>{v.content}<br/>
              <button onClick={()=>deleteVault(v._id)}>Delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
export default App;