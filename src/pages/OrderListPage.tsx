import React, { useEffect, useState } from 'react';
import { PageView, Order } from '../types';
import api from '../api';
import { Package, ChevronRight, CreditCard } from 'lucide-react';

interface Props {
  setPageView: (view: PageView) => void;
}

const OrderListPage: React.FC<Props> = ({ setPageView }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handlePay = async (orderId: number) => {
    try {
      await api.payOrder(orderId);
      alert('支付成功（模拟）');
      loadOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const statusMap: Record<string, string> = {
    pending_payment: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  };

  if (loading) {
    return <div className="pt-20 text-center">加载中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-10 mt-12">
      <div className="flex items-center mb-6">
        <Package className="text-[#d4af37] mr-3" size={28} />
        <h2 className="text-2xl font-bold text-[#112A23]">我的订单</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">暂无订单</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500">订单号：{order.id}</p>
                  <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {statusMap[order.status] || order.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">共 {order.item_count} 件商品</span>
                  <span className="ml-4 font-bold text-[#112A23]">¥{order.total_amount}</span>
                  <span className="text-xs text-gray-400 ml-2">含手续费 ¥{order.fee}</span>
                </div>
                <div className="flex gap-2">
                  {order.status === 'pending_payment' && (
                    <button
                      onClick={() => handlePay(order.id)}
                      className="flex items-center gap-1 bg-[#d4af37] text-white px-4 py-2 rounded-full text-sm hover:opacity-90"
                    >
                      <CreditCard size={16} /> 立即支付
                    </button>
                  )}
                  <button className="text-[#112A23] border px-4 py-2 rounded-full text-sm hover:bg-gray-50">
                    查看详情 <ChevronRight size={16} className="inline" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderListPage;