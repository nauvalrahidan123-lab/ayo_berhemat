
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
  apiKey: "PASTIKAN-INI-DIGANTI-DENGAN-API-KEY-BARU-ANDA",
  authDomain: "GANTI-DENGAN-AUTH-DOMAIN-BARU-ANDA.firebaseapp.com",
  projectId: "GANTI-DENGAN-PROJECT-ID-BARU-ANDA",
  storageBucket: "GANTI-DENGAN-STORAGE-BUCKET-BARU-ANDA.appspot.com",
  messagingSenderId: "GANTI-DENGAN-MESSAGING-SENDER-ID-BARU-ANDA",
  appId: "GANTI-DENGAN-APP-ID-BARU-ANDA",
  measurementId: "GANTI-DENGAN-MEASUREMENT-ID-BARU-ANDA"
};


// Jangan ubah kode di bawah ini
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);