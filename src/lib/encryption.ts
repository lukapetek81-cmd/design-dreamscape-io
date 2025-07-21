// Simple encryption utilities for IBKR credentials
// Note: This is basic encryption for demo purposes. In production, use proper encryption libraries.

const ENCRYPTION_KEY = 'ibkr-creds-key-2024'; // In production, this should be derived from user session

export const encryptCredential = (text: string): string => {
  try {
    // Simple base64 encoding with key mixing for basic protection
    const combined = ENCRYPTION_KEY + text + ENCRYPTION_KEY;
    return btoa(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

export const decryptCredential = (encryptedText: string): string => {
  try {
    const decoded = atob(encryptedText);
    const keyLength = ENCRYPTION_KEY.length;
    // Remove the encryption key from both ends
    return decoded.slice(keyLength, -keyLength);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
};