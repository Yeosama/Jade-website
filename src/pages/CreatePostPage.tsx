// src/pages/CreatePostPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import api, { IMAGE_BASE } from '../api';

interface CreatePostPageProps {
  onBack: () => void;
  onPostSuccess: () => void;
  onOpenLogin: () => void;  // 新增
}

const CreatePostPage: React.FC<CreatePostPageProps> = ({ onBack, onPostSuccess, onOpenLogin }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

   // 获取当前登录用户信息
   useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then(setCurrentUser)
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容');
      return;
    }
    // 未登录时直接跳转登录页
    const token = localStorage.getItem('token');
    if (!token) {
      onOpenLogin();
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    images.forEach(img => formData.append('images', img));

    setUploading(true);
    try {
      await api.createPost(formData);
      onPostSuccess();
    } catch (err: any) {
      alert(err.message || '发布失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-[#d4af37]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-2xl font-bold serif text-[#112A23]">发布新帖</h1>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="px-6 py-2 bg-[#d4af37] text-[#112A23] rounded-lg font-bold hover:bg-[#c29f30] disabled:opacity-50"
          >
            {uploading ? '发布中...' : '发布'}
          </button>
        </div>

        {/* 左右两栏等高布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：编辑区 */}
          <div className="flex flex-col space-y-6">
            {/* 标题/内容编辑 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <input
                type="text"
                placeholder="填写标题会有更多赞哦"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-bold border-none outline-none placeholder-gray-300 mb-4"
              />
              <textarea
                placeholder="分享你的玉石见闻..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full border-none outline-none resize-none placeholder-gray-300 text-gray-700"
              />
              <div className="text-right text-sm text-gray-400 border-t pt-2">
                {content.length}/1000
              </div>
            </div>

            {/* 图片上传区 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">图片上传（最多9张）</h2>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#d4af37] transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">点击或拖拽上传图片</p>
              </div>

              {/* 图片预览缩略图列表 */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img src={src} alt="preview" className="w-full h-16 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：帖子效果预览 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-[#112A23]">预览效果</h2>
            <div className="flex-1 overflow-y-auto">
              <div className="border rounded-xl p-6 bg-gray-50">
                {/* 作者信息 - 动态显示当前用户 */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={
                      currentUser?.avatar
                        ? (currentUser.avatar.startsWith('http') ? currentUser.avatar : `${IMAGE_BASE}${currentUser.avatar}`)
                        : 'https://api.dicebear.com/9.x/initials/svg?seed=default&backgroundType=gradientLinear&size=64'
                    }
                    alt="头像"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold">{currentUser?.username || '未登录'}</p>
                    <p className="text-xs text-gray-400">刚刚</p>
                  </div>
                </div>

                {/* 标题 */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title || '标题预览'}</h3>

                {/* 内容 */}
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{content || '内容预览...'}</p>

                {/* 图片区域 */}
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {imagePreviews.map((src, idx) => (
                      <img key={idx} src={src} alt="" className="w-full h-48 object-cover rounded-lg" />
                    ))}
                    {imagePreviews.length % 2 === 1 && <div className="w-full h-48"></div>}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 mb-2 border-2 border-dashed border-gray-300">
                    <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">图片会在这里显示</span>
                  </div>
                )}

                {/* 互动统计 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4 pt-4 border-t">
                  <span>❤️ 0</span>
                  <span>💬 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;