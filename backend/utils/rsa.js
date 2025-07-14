import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { config } from '../config.js';

const privateKeyPath = path.resolve(config.rsa.privateKeyPath);

//Node.js RSA decrypt
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

//Fallback: OpenSSL decrypt
export function decryptOpenSSL(encryptedData) {
  try {
    const tempFile = './temp_encrypted.bin';
    const decryptedOutput = './temp_decrypted.txt';

    // Write encrypted data to a temp file (base64 decoded)
    fs.writeFileSync(tempFile, Buffer.from(encryptedData, 'base64'));

    // Run OpenSSL to decrypt it
    execSync(`openssl rsautl -decrypt -inkey ${privateKeyPath} -in ${tempFile} -out ${decryptedOutput}`);

    // Read decrypted output
    const decrypted = fs.readFileSync(decryptedOutput, 'utf8');

    // Clean up temp files
    fs.unlinkSync(tempFile);
    fs.unlinkSync(decryptedOutput);

    return decrypted;
  } catch (err) {
    console.error("OpenSSL decryption failed:", err.message);
    throw err;
  }
}
