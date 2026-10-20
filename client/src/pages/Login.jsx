import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('enterprise@test.com');
  const [password, setPassword] = useState('Strong123!');
  const { login } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{maxWidth:400, margin:'50px auto', padding:20}}>
      <h1>Secure Vault Login</h1>
      <form onSubmit={handle}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" style={{width:'100%', padding:8, marginTop:10}} />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="password" style={{width:'100%', padding:8, marginTop:10}} />
        <button type="submit" style={{width:'100%', padding:10, marginTop:10, background:'black', color:'white'}}>Login</button>
      </form>
      {err && <p style={{color:'red'}}>{err}</p>}
    </div>
  );
}