
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { USERS } from '../constants';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Username dan password wajib diisi.');
      setLoading(false);
      return;
    }

    const email = `${username.toLowerCase()}@example.com`;
    const theme = username.toLowerCase() === 'nauval' ? USERS.nauval.theme : USERS.mufel.theme;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (signInError: any) {
      // Logic untuk menangani berbagai jenis error login
      switch (signInError.code) {
        case 'auth/user-not-found':
          // Jika pengguna tidak ditemukan, buat akun baru (fitur daftar otomatis)
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              username: username,
              theme: theme,
            });
            // onAuthStateChanged akan menangani login setelah ini
          } catch (signUpError: any) {
            setError('Gagal membuat akun baru. Silakan coba lagi.');
            console.error("Sign Up Error:", signUpError);
          }
          break;
        
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Username atau password salah.');
          break;

        case 'auth/operation-not-allowed':
          setError('Metode login Email/Password belum diaktifkan di Firebase.');
          console.error("Firebase Auth Error: Pastikan metode sign-in Email/Password sudah diaktifkan di Firebase Console.", signInError);
          break;

        default:
          setError('Terjadi error yang tidak diketahui. Silakan coba lagi.');
          console.error("Login Error:", signInError);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Selamat Datang</h1>
        <p className="text-center text-gray-500 mb-8">Manajemen Keuangan Mahasiswa</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="nauval / mufel"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors" disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
         <div className="text-xs text-gray-400 mt-6 text-center">
            <p>Hint Password: 061106 / 060703</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
