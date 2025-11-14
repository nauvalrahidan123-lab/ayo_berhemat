
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Add validation to prevent empty submissions, fixing 'auth/missing-password'
    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi.');
      return;
    }
    
    setLoading(true);

    // Map username to a dummy email for Firebase Auth
    const email = `${username.toLowerCase().trim()}@app.com`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.tsx will handle the rest
    } catch (err: any) {
      console.error("Firebase login error:", err);
      // Add specific error handling for different auth errors
      switch (err.code) {
        case 'auth/configuration-not-found':
          setError('Konfigurasi Firebase bermasalah. Pastikan Auth diaktifkan.');
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Username atau password salah.');
          break;
        default:
          setError('Terjadi kesalahan saat login. Coba lagi nanti.');
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
         <div className="text-xs text-gray-400 mt-6 text-center">
            <p>Hint: 061106 / 060703</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
