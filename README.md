#  Order Matching System

A secure, full-stack Order Matching System built with:

-  **React** (Frontend – Vercel)
-  **Node.js + MySQL** (Backend – Railway)
-  **RSA encryption** with fallback to **OpenSSL**
-  **Transaction locking** to avoid duplicate updates
-  **Mobile App** – Flutter WebView wrapper (APK provided)

---

## 🔗 Live Demo

🌐 Frontend (React):  
https://order-matching-system-psi.vercel.app

📱 APK (Flutter App) Link:  
https://drive.google.com/file/d/1mMIITzAsRiHTCHz4py9eyLXfxxbQPjnA/view?usp=sharing

---

## 📦 Features

### 🧠 Security

- RSA (PKCS#1 v1.5) encryption
- Fallback to OpenSSL CLI if native decryption fails
- Secure communication between frontend and backend

### 🗃️ Backend (Node.js + MySQL)

- APIs to place **buyer** and **seller** orders
- Fetch **pending** and **completed** orders
- MySQL transactions with row-level **locking** to ensure accuracy

### 💻 Frontend (React)

- Buyer/Seller Order form
- Completed & Pending order tables
- Responsive and deployed on Vercel

### 📱 Mobile (Flutter WebView)

- Splash screen with branding
- Loads frontend in secure WebView
- Compatible with Android

---
