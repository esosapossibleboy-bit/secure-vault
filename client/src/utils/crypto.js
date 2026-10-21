import CryptoJS from "crypto-js";

// Client-side cryptography parameters - managed inside client engine only
// Key is derived from logged-in user + secret. Never sent to server.

const getMasterKey = () => {
  // Derive key from user token + local secret - this stays in browser
  const token = localStorage.getItem("token");
  const userEmail = JSON.parse(localStorage.getItem("user_email") || '"esosa"');
  // In production, this would be a user master password. For assignment we derive from token
  const rawKey = `secure-vault-2026-${token?.slice(-10)}-${userEmail}`;
  return CryptoJS.SHA256(rawKey).toString();
};

// Encrypt in browser BEFORE sending to server
export const encryptData = (plainText) => {
  if (!plainText) return "";
  const masterKey = getMasterKey();
  const encrypted = CryptoJS.AES.encrypt(plainText, masterKey).toString();
  return encrypted;
};

// Decrypt in browser AFTER fetching from server
export const decryptData = (cipherText) => {
  if (!cipherText) return "";
  try {
    const masterKey = getMasterKey();
    const bytes = CryptoJS.AES.decrypt(cipherText, masterKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails (old plaintext data), return original
    return decrypted || cipherText;
  } catch {
    // For old records created before crypto (like your "My Good" record)
    return cipherText;
  }
};

// Test helper for console
export const testCrypto = () => {
  const plain = "myPassword123";
  const enc = encryptData(plain);
  const dec = decryptData(enc);
  console.log(`Plain: ${plain} -> Encrypted: ${enc.slice(0,20)}... -> Decrypted: ${dec}`);
  return dec === plain;
};