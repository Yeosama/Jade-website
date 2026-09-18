// src/pages/EditPostPage.tsx
import React, { useState, useEffect } from 'react';
import api, { IMAGE_BASE } from '../api';
import { PageView } from '../types';

interface EditPostPageProps {
  postId: number;
  onBack: () => void;
  onPostUpdated: () => void;
  setPageView: (view: PageView) => void;
}

const EditPostPage: React.FC<EditPostPageProps> = ({ postId, onBack, setPageView, onPostUpdated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [deleteImageUrls, setDeleteImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.getPost(postId).then(post => {
      setTitle(post.title);
      setContent(post.content);
      setExistingImages(post.images || []);
    }).catch(err => {
      setError('加载帖子失败');
      console.error(err);
    });
  }, [postId]);

  const handleRemoveExisting = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url));
    setDeleteImageUrls(prev => [...prev, url]);
  };

  const handleAddNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.updatePostWithImages(postId, title, content, deleteImageUrls, newImages);
      if (onPostUpdated) onPostUpdated();
      setPageView("home");
      requestAnimationFrame(() => {
        const forumElement = document.getElementById("forum");
        if (forumElement) {
          forumElement.scrollIntoView({ behavior: "auto", block: "start" });
        }
      });
    } catch (err: any) {
      setError(err.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇帖子吗？删除后无法恢复。')) return;
    setDeleting(true);
    try {
      // 注意：需要后端实现 DELETE /api/posts/:id 路由，前端 api.deletePost 方法
      await api.deletePost(postId);
      if (onPostUpdated) onPostUpdated();
      setPageView("home");
      requestAnimationFrame(() => {
        const forumElement = document.getElementById("forum");
        if (forumElement) {
          forumElement.scrollIntoView({ behavior: "auto", block: "start" });
        }
      });
    } catch (err: any) {
      setError(err.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold serif text-[#112A23] mb-6">编辑帖子</h1>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
          <div className="space-y-4">
            {/* 表单内容不变 */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#d4af37] outline-none"
              placeholder="标题"
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#d4af37] outline-none"
              placeholder="内容"
            />
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">现有图片</label>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url.startsWith('http') ? url : `${IMAGE_BASE}${url}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExisting(url)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">添加新图片</label>
              <input type="file" multiple accept="image/*" onChange={handleAddNewImages} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37] file:text-[#112A23] hover:file:bg-[#c29f30]" />
              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {newImagePreviews.map((src, idx) => <img key={idx} src={src} className="w-full h-24 object-cover rounded-lg" />)}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              {/* 删除按钮 */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? '删除中...' : '删除帖子'}
              </button>
              <button onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-[#d4af37] text-[#112A23] rounded-lg font-bold hover:bg-[#c29f30] disabled:opacity-50">
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage;