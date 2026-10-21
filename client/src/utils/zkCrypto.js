const encoder = new TextEncoder();
const decoder = new TextDecoder();
let inMemoryKey = null;

const getSalt = () => {
  let salt = localStorage.getItem("zk_salt");
  if (!salt) {
    const arr = crypto.getRandomValues(new Uint8Array(16));
    salt = Array.from(arr).join(",");
    localStorage.setItem("zk_salt", salt);
  }
  return salt;
};

export const deriveKeyFromMasterPassword = async (masterPassword) => {
  const salt = encoder.encode(getSalt());
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(masterPassword), { name: "PBKDF2" }, false, ["deriveKey"]);
  inMemoryKey = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  return true;
};

export const isMasterKeySet = () => !!inMemoryKey;
export const clearMasterKey = () => { inMemoryKey = null; };

export const zkEncrypt = async (plainText) => {
  if (!plainText) return "";
  if (!inMemoryKey) throw new Error("Enter Master Password first - ZK key not set");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, inMemoryKey, encoder.encode(plainText));
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv); combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
};

export const zkDecrypt = async (cipherText) => {
  if (!cipherText) return "";
  if (!inMemoryKey) return "🔒 Enter Master Password";
  try {
    if (cipherText.startsWith("U2Fsd")) return cipherText; // old crypto-js fallback
    const combined = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12); const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, inMemoryKey, data);
    return decoder.decode(decrypted);
  } catch { return cipherText; }
};