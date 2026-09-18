import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { IMAGE_BASE } from '../api';

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onUpdateSuccess: (user: any, newToken?: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack, onLogout, onUpdateSuccess }) => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await api.getUserProfile();
      setUser(data);
      setUsername(data.username);
      if (data.avatar) {
        setAvatarPreview(data.avatar.startsWith('http') ? data.avatar : `${IMAGE_BASE}${data.avatar}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    const formData = new FormData();
    if (username !== user.username) formData.append('username', username);
    if (password) formData.append('password', password);
    if (avatarFile) formData.append('avatar', avatarFile);

    if (formData.entries().next().done) {
      setError('没有做任何修改');
      return;
    }

    setLoading(true);
    try {
      const result = await api.updateUserProfile(formData);
      if (result.token) {
        localStorage.setItem('token', result.token);
        onUpdateSuccess(result.user, result.token);
      } else {
        onUpdateSuccess(result.user);
      }
      setSuccess('资料更新成功');
      // 重新加载用户信息
      await fetchUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  if (!user) return <div className="flex justify-center items-center h-screen">加载中...</div>;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-gray-900 relative pt-16">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-[#d4af37]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回论坛
          </button>
          <h1 className="text-2xl font-bold serif text-[#112A23]">个人资料</h1>
          <button onClick={handleLogout} className="px-4 py-2 rounded-full border border-red-300 text-red-600 text-sm hover:bg-red-50 transition">
            退出登录
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 头像 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={avatarPreview || 'https://api.dicebear.com/9.x/initials/svg?seed=default&backgroundType=gradientLinear&size=96'}
                  alt="头像"
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#d4af37]"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#d4af37] text-white rounded-full p-1 hover:bg-[#c29f30]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <p className="text-xs text-gray-500 mt-2">点击头像更换图片</p>
            </div>

            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            {/* 密码修改 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码（不修改请留空）</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                取消
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-[#d4af37] text-[#112A23] rounded-lg font-bold hover:bg-[#c29f30] disabled:opacity-50">
                {loading ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;