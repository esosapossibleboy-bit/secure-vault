import CryptoJS from "crypto-js";
const getMasterKey = () => {
  const token = localStorage.getItem("token");
  const userEmail = JSON.parse(localStorage.getItem("user_email") || '"esosa"');
  const rawKey = `secure-vault-2026-${token?.slice(-10)}-${userEmail}`;
  return CryptoJS.SHA256(rawKey).toString();
};
export const encryptData = (plainText) => {
  if (!plainText) return "";
  return CryptoJS.AES.encrypt(plainText, getMasterKey()).toString();
};
export const decryptData = (cipherText) => {
  if (!cipherText) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, getMasterKey());
    return bytes.toString(CryptoJS.enc.Utf8) || cipherText;
  } catch { return cipherText; }
};