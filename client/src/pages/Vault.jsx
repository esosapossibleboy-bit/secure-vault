import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { encryptVault, decryptVault } from '../utils/vaultCrypto';

export default function Vault() {
  const [master, setMaster] = useState(''); // Master password for crypto
  const [items, setItems] = useState([]);
  const [site, setSite] = useState('');

  const loadVault = async () => {
    const { data } = await api.get('/vault');
    if(data.blob && master) {
      const decrypted = await decryptVault(data.blob, master);
      if(decrypted) setItems(decrypted);
    }
  };

  const saveVault = async (newItems) => {
    const blob = await encryptVault(newItems, master);
    await api.post('/vault', { blob });
    setItems(newItems);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Zero-Knowledge Vault</h1>
      <input placeholder="Master Password for Encryption" type="password" value={master} onChange={e=>setMaster(e.target.value)} className="border p-2 w-full mt-4" />
      <button onClick={loadVault} className="bg-black text-white p-2 mt-2">Unlock Vault</button>
      
      <div className="mt-6">
        <input placeholder="Add site (e.g. gmail.com)" value={site} onChange={e=>setSite(e.target.value)} className="border p-2" />
        <button onClick={()=>{ const n=[...items,{site}]; saveVault(n); setSite(''); }} className="bg-green-600 text-white p-2 ml-2">Save Encrypted</button>
      </div>

      <ul className="mt-4">{items.map((it,i)=><li key={i} className="border p-2 mt-1">{it.site}</li>)}</ul>
      <p className="text-xs mt-4 text-gray-500">Server stores only blob: check MongoDB - you will see U2Fsd... not passwords!</p>
    </div>
  );
}