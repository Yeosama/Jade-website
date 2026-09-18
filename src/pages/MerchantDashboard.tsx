import React, { useEffect, useState } from 'react';
import { PageView, Product } from '../types';
import api from '../api';
import { PlusCircle, Edit3, Trash2, Package, AlertCircle } from 'lucide-react';
import MerchantProductForm from '../components/MerchantProductForm';
import { IMAGE_BASE,getImageUrl } from '../api';   // 添加在顶部

interface Props {
  setPageView: (view: PageView) => void;
}

const MerchantDashboard: React.FC<Props> = ({ setPageView }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [merchant, setMerchant] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      const info = await api.getMerchantInfo();
      setMerchant(info);
      const prods = await api.getMerchantProducts();
      setProducts(prods);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('过期') || err.message?.includes('未开通')) {
        alert('商户权限异常，请检查入驻状态');
        setPageView('merchantApply');
      }
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('确定下架该商品？')) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFormSubmit = async (formData: FormData, productId?: number) => {
    if (productId) {
      await api.updateProduct(productId, formData);
    } else {
      await api.createProduct(formData);
    }
    setShowForm(false);
    setEditProduct(null);
    loadData();
  };

  if (!merchant) {
    return (
      <div className="pt-20 text-center">
        <AlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
        <p>您尚未开通商户</p>
        <button onClick={() => setPageView('merchantApply')} className="mt-4 bg-[#d4af37] text-white px-6 py-2 rounded-full">
          立即入驻
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-10 mt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#112A23]">{merchant.shop_name}</h2>
          <p className="text-sm text-gray-500">到期时间：{new Date(merchant.expire_date).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditProduct(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#112A23] text-white px-5 py-2 rounded-full hover:opacity-90"
          >
            <PlusCircle size={20} /> 发布商品
          </button>
          <button
            onClick={() => setPageView('orders')}
            className="flex items-center gap-2 border border-[#112A23] text-[#112A23] px-5 py-2 rounded-full hover:bg-gray-50"
          >
            <Package size={20} /> 订单管理
          </button>
        </div>
      </div>

      {/* 发布/编辑表单 Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <MerchantProductForm
              initialProduct={editProduct || undefined}
              onCancel={() => { setShowForm(false); setEditProduct(null); }}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <img
src={getImageUrl(product.cover_image)}
              className="w-full h-48 object-cover"
              alt={product.title}
            />
            <div className="p-4">
              <h3 className="font-bold text-lg">{product.title}</h3>
              <p className="text-[#d4af37] font-bold mt-1">¥{product.price}</p>
              <p className="text-sm text-gray-500">库存 {product.stock} | {product.status === 'active' ? '在售' : '已下架'}</p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => { setEditProduct(product); setShowForm(true); }}
                  className="flex items-center gap-1 text-blue-600 text-sm"
                >
                  <Edit3 size={16} /> 编辑
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center gap-1 text-red-500 text-sm"
                >
                  <Trash2 size={16} /> 下架
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MerchantDashboard;