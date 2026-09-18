// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import api from '../api';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onSwitchToRegister: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToRegister, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ username, password });
      localStorage.setItem('token', data.token);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-gray-900 relative pt-16">
      {/* 可选：浅色光晕层，如果不想要可以删除 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(212,175,55,0.1),transparent_30%)]" />
      <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
        <button onClick={onBack} className="text-[#d4af37] mb-4 hover:underline">
          ← 返回
        </button>
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold serif text-center text-[#112A23] mb-6">登录</h1>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-200">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-[#d4af37] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-[#d4af37] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#d4af37] text-[#112A23] font-bold rounded-lg hover:bg-[#c29f30] transition disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <p className="text-center text-gray-500 mt-4">
            还没有账号？{' '}
            <button onClick={onSwitchToRegister} className="text-[#d4af37] hover:underline">
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;