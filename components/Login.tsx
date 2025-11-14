
import React, { useState } from 'react';
import { User } from '../types';
import { USERS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const nauval = USERS.nauval;
    const mufel = USERS.mufel;

    if (username === nauval.username && password === nauval.password) {
      onLogin({ username: nauval.username, theme: nauval.theme });
    } else if (username === mufel.username && password === mufel.password) {
      onLogin({ username: mufel.username, theme: mufel.theme });
    } else {
      setError('Username atau password salah.');
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
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Login
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