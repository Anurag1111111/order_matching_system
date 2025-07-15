import JSEncrypt from "jsencrypt";
import publicKey from "../config/publicKey";

export const encryptData = (data) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);

  const encrypted = encryptor.encrypt(JSON.stringify(data));
  if (!encrypted) {
    throw new Error("Encryption failed");
  }

  return encrypted;
};
