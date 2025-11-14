import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8k_BbFsFH96GISBhU4pp8m1hQh_9Ujq0",
  authDomain: "ayoberhemat-9820d.firebaseapp.com",
  projectId: "ayoberhemat-9820d",
  storageBucket: "ayoberhemat-9820d.firebasestorage.app",
  messagingSenderId: "117563124024",
  appId: "1:117563124024:web:15154e8f81898ae13979cd",
  measurementId: "G-KCE7GZTXXM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
