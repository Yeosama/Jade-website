import React, { useState, useEffect } from 'react';
import { PageView, CartItem } from '../types';
import api from '../api';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface Props {
  setPageView: (view: PageView) => void;
}

const CheckoutPage: React.FC<Props> = ({ setPageView }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const feeRate = 0.05; // 与后端一致

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCart();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fee = Math.round(subtotal * feeRate * 100) / 100;
  const total = subtotal + fee;

  const handleSubmit = async () => {
    if (!address.trim()) return alert('请填写收货地址');
    if (!confirm(`确认下单？总金额 ¥${total.toFixed(2)}（含手续费 ¥${fee.toFixed(2)}）`)) return;
    setSubmitting(true);
    try {
      const order = await api.checkout(address);
      alert('下单成功！订单号：' + order.id);
      // 跳转到订单支付或详情
      setPageView('orders');
    } catch (err: any) {
      alert(err.message || '下单失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="pt-20 text-center">加载中...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="pt-20 text-center">
        <p>购物车为空，无法结算</p>
        <button onClick={() => setPageView('shop')}>返回商城</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-20 pb-10 mt-12">
      <button onClick={() => setPageView('cart')} className="flex items-center text-gray-600 hover:text-[#112A23] mb-6">
        <ArrowLeft size={20} className="mr-1" /> 返回购物车
      </button>

      <h2 className="text-2xl font-bold text-[#112A23] mb-6">确认订单</h2>

      {/* 收货地址 */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border">
        <label className="block text-sm font-medium text-gray-700 mb-2">收货地址</label>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"
          rows={3}
          placeholder="请输入详细地址"
        />
      </div>

      {/* 商品清单 */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border">
        <h3 className="font-semibold mb-4">商品清单</h3>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.cart_item_id} className="flex justify-between text-sm">
              <span>{item.title} x {item.quantity}</span>
              <span className="font-medium">¥{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span>商品小计</span>
            <span>¥{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>平台手续费 (5%)</span>
            <span>¥{fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>应付总额</span>
            <span className="text-[#d4af37]">¥{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-400">
          <ShieldCheck size={16} className="mr-1" />
          安全交易保障
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#d4af37] text-white px-10 py-3 rounded-full hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {submitting ? '提交中...' : '提交订单'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;