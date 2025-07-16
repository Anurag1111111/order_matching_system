import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { config } from '../config.js';

const base64 = process.env.PRIVATE_KEY_BASE64;
const privateKeyPath = path.resolve(config.rsa.privateKeyPath);

if (base64 && !fs.existsSync(privateKeyPath)) {
  const pemBuffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(privateKeyPath, pemBuffer);
  console.log("private.pem file restored from base64");
}

// Node.js RSA decrypt
export function decryptRSA(encryptedData) {
  try {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const buffer = Buffer.from(encryptedData, 'base64');

    return crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    ).toString('utf8');
  } catch (err) {
    console.error("Node RSA decryption failed:", err.message);
    throw err;
  }
}

// Fallback: OpenSSL decrypt
export function decryptOpenSSL(encryptedData) {
  try {
    const tempFile = './temp_encrypted.bin';
    const decryptedOutput = './temp_decrypted.txt';

    // Write encrypted data to temp file
    fs.writeFileSync(tempFile, Buffer.from(encryptedData, 'base64'));

    // OpenSSL fallback
    execSync(`openssl rsautl -decrypt -inkey ${privateKeyPath} -in ${tempFile} -out ${decryptedOutput}`);

    const decrypted = fs.readFileSync(decryptedOutput, 'utf8');

    // Clean up
    fs.unlinkSync(tempFile);
    fs.unlinkSync(decryptedOutput);

    return decrypted;
  } catch (err) {
    console.error("OpenSSL decryption failed:", err.message);
    throw err;
  }
}
