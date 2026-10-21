import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

axios.defaults.withCredentials = true;

function Dashboard() {
  const { user, logout } = useAuth();
  const [vaults, setVaults] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchVaults = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/vault');
      setVaults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5002/api/vault', { title, content });
      setTitle('');
      setContent('');
      fetchVaults();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/api/vault/${id}`);
      fetchVaults();
    } catch (err) {
      alert(err.response?.data?.msg || 'BOLA blocked');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Your Vaults - BOLA Protected 🔒</h2>
      <button onClick={logout}>Logout ({user?.email})</button>

      <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px' }}>
        <h3>Create New Vault</h3>
        <form onSubmit={handleCreate}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <textarea
            placeholder="Secret content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
          <button type="submit" style={{ marginTop: '10px' }}>Save to Vault</button>
        </form>
      </div>

      <h3>Vaults ({vaults.length}) — Only yours, BOLA blocks others</h3>
      {vaults.map(v => (
        <div key={v._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <b>{v.title}</b>
          <p>{v.content}</p>
          <button onClick={() => handleDelete(v._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;