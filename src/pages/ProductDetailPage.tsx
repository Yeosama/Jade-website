import React, { useEffect, useState } from 'react';
import { PageView, Product } from '../types';
import api from '../api';
import { getImageUrl } from '../api';
import { ArrowLeft, ShoppingCart, CreditCard, ZoomIn } from 'lucide-react';

interface Props {
  productId: number;
  setPageView: (view: PageView) => void;
  onBack: () => void; // 返回商城列表
}

const ProductDetailPage: React.FC<Props> = ({ productId, setPageView, onBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProductDetail(productId);
        setProduct(data);
        if (data.images?.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (err) {
        console.error(err);
        alert('商品不存在或已下架');
        onBack();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setPageView('login');
      return;
    }
    setAddingToCart(true);
    try {
      await api.addToCart(product.id, quantity);
      alert('已加入购物车');
    } catch (err: any) {
      alert(err.message || '加入购物车失败');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setPageView('login');
      return;
    }
    // 快速购买：先加入购物车，再跳转结算
    try {
      await api.addToCart(product.id, quantity);
      setPageView('checkout');
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-20 mt-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 w-1/3 rounded" />
          <div className="flex gap-6">
            <div className="w-1/2 h-96 bg-gray-200 rounded-xl" />
            <div className="w-1/2 space-y-4">
              <div className="h-6 bg-gray-200 w-2/3 rounded" />
              <div className="h-4 bg-gray-200 w-1/2 rounded" />
              <div className="h-10 bg-gray-200 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-10 mt-12">
      {/* 返回按钮 */}
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-[#112A23] mb-6 transition">
        <ArrowLeft size={20} className="mr-1" />
        返回商城
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 图片区域 */}
        <div>
          <div className="bg-gray-50 rounded-xl overflow-hidden mb-4">
            <img
src={getImageUrl(selectedImage || product.cover_image)}
              alt={product.title}
              className="w-full h-96 object-contain"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img)}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition ${
                    selectedImage === img ? 'border-[#d4af37]' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <div>
          <h1 className="text-3xl font-bold text-[#112A23] mb-2">{product.title}</h1>
          <p className="text-sm text-gray-500 mb-4">店铺：{product.shop_name}</p>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-bold text-[#d4af37]">¥{product.price}</span>
            <span className="text-sm text-gray-400">库存 {product.stock} 件</span>
          </div>

          <div className="bg-[#fdfcf8] p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-[#112A23] mb-2">商品描述</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description || '暂无描述'}</p>
          </div>

          {/* 数量选择与按钮 */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">数量</span>
            <div className="flex items-center border rounded-full">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-xl text-gray-600 hover:bg-gray-100 rounded-l-full"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={e => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(product.stock, Math.max(1, val)));
                }}
                className="w-16 text-center border-x py-1 outline-none"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-1 text-xl text-gray-600 hover:bg-gray-100 rounded-r-full"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-[#112A23] text-white py-3 rounded-full hover:bg-opacity-90 transition disabled:opacity-50"
            >
              <ShoppingCart size={20} />
              {addingToCart ? '添加中...' : '加入购物车'}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 bg-[#d4af37] text-white py-3 rounded-full hover:bg-opacity-90 transition"
            >
              <CreditCard size={20} />
              立即购买
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;