import dotenv from 'dotenv';
dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: process.env.DB_PORT
  },
  rsa: {
    privateKeyPath: process.env.PRIVATE_KEY_PATH,
  },
  server: {
    port: process.env.PORT || 3000,
  }
};
