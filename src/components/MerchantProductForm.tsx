import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { X, Upload } from 'lucide-react';
import { IMAGE_BASE,getImageUrl } from '../api';   // 添加在顶部

interface Props {
  initialProduct?: Product;
  onCancel: () => void;
  onSubmit: (formData: FormData, productId?: number) => Promise<void>;
}

const MerchantProductForm: React.FC<Props> = ({ initialProduct, onCancel, onSubmit }) => {
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || '1');
  const [category, setCategory] = useState(initialProduct?.category || '挂件');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialProduct?.images || []);
  const [deleteImages, setDeleteImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleRemoveExisting = (url: string) => {
    setExistingImages(prev => prev.filter(i => i !== url));
    setDeleteImages(prev => [...prev, url]);
  };

  const handleSubmit = async () => {
    if (!title || !price) return alert('请填写标题和价格');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', category);
    // 需要删除的图片
    formData.append('delete_images', JSON.stringify(deleteImages));
    // 新图片
    images.forEach(img => formData.append('newImages', img));

    setLoading(true);
    try {
      await onSubmit(formData, initialProduct?.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#112A23]">
          {initialProduct ? '编辑商品' : '发布商品'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">商品标题 *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">价格 (¥) *</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">库存</label>
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-lg">
            <option>挂件</option>
            <option>摆件</option>
            <option>手镯</option>
            <option>原石</option>
            <option>其他</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">描述</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-lg" rows={4} />
      </div>

      {/* 现有图片 */}
      {existingImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">当前图片（点击移除）</label>
          <div className="flex gap-2 flex-wrap">
            {existingImages.map(url => (
              <div key={url} className="relative w-20 h-20">
                <img src={getImageUrl(url)} className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => handleRemoveExisting(url)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 上传新图片 */}
      <div>
        <label className="block text-sm font-medium mb-1">上传新图片</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#d4af37] transition"
        >
          <Upload className="mx-auto text-gray-400" size={24} />
          <p className="text-sm text-gray-500 mt-1">点击上传（最多9张）</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => {
            if (e.target.files) {
              setImages(prev => [...prev, ...Array.from(e.target.files!)]);
            }
          }}
        />
        {images.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {images.map((file, idx) => (
              <div key={idx} className="relative w-16 h-16">
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" />
                <button
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={onCancel} className="px-6 py-2 border rounded-full">取消</button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-[#d4af37] text-white rounded-full hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '保存中...' : initialProduct ? '更新商品' : '发布商品'}
        </button>
      </div>
    </div>
  );
};

export default MerchantProductForm;