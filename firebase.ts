
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// !! PENTING !!
// HAPUS SEMUA DI BAWAH INI DAN GANTI DENGAN FIREBASE CONFIG DARI PROYEK BARU ANDA.
// 1. Buka Proyek Firebase BARU Anda
// 2. Klik Project Settings (ikon gerigi ⚙️)
// 3. Gulir ke bawah ke "Your apps" -> Pilih Web App Anda (</>) -> Pilih "Config"
// 4. Salin (copy) seluruh objek `const firebaseConfig = { ... };` dan tempel (paste) di sini.

const firebaseConfig = {
  apiKey: "AIzaSyD8k_BbFsFH96GISBhU4pp8m1hQh_9Ujq0",
  authDomain: "ayoberhemat-9820d.firebaseapp.com",
  projectId: "ayoberhemat-9820d",
  storageBucket: "ayoberhemat-9820d.firebasestorage.app",
  messagingSenderId: "117563124024",
  appId: "1:117563124024:web:15154e8f81898ae13979cd",
  measurementId: "G-KCE7GZTXXM"
};

// Jangan ubah kode di bawah ini
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
