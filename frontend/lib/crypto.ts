const KEY_STORAGE_KEY = 'innerledger:aes-key';

const toBase64 = (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const getOrCreateKey = async () => {
  if (typeof window === 'undefined') {
    throw new Error('crypto requires a browser context');
  }
  // crypto.subtle 在非 HTTPS 环境下可能不可用
  if (!crypto.subtle) {
    throw new Error(
      'crypto.subtle is not available. Please use HTTPS or localhost.',
    );
  }
  const envKey = process.env.NEXT_PUBLIC_DEMO_ENCRYPTION_KEY;
  if (envKey) {
    const hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(envKey),
    );
    return crypto.subtle.importKey('raw', hash, 'AES-GCM', true, [
      'encrypt',
      'decrypt',
    ]);
  }
  const stored = localStorage.getItem(KEY_STORAGE_KEY);
  if (stored) {
    const raw = fromBase64(stored);
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', true, [
      'encrypt',
      'decrypt',
    ]);
  }
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  localStorage.setItem(KEY_STORAGE_KEY, toBase64(raw));
  return key;
};

export const encryptText = async (plaintext: string) => {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded),
  );
  return { ciphertext, iv };
};

export const encodeBase64 = toBase64;
export const decodeBase64 = fromBase64;

export const decryptText = async (
  ciphertext: Uint8Array<ArrayBuffer>,
  iv: Uint8Array<ArrayBuffer>,
) => {
  const key = await getOrCreateKey();
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
};
