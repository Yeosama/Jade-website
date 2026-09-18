import React, { useEffect, useState } from "react";
import { PageView, CartItem } from "../types";
import api from "../api";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { IMAGE_BASE,getImageUrl } from "../api"; // 添加在顶部

interface Props {
  setPageView: (view: PageView) => void;
}

const CartPage: React.FC<Props> = ({ setPageView }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [updating, setUpdating] = useState(false);

  const loadCart = async () => {
    try {
      const data: CartItem[] = await api.getCart();
      setItems(data);
      // 默认全选
      setSelectedIds(data.map((item) => item.cart_item_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const getTotal = () => {
    return items
      .filter((item) => selectedIds.includes(item.cart_item_id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleQuantityChange = async (cartId: number, newQty: number) => {
    if (newQty < 1) return;
    setUpdating(true);
    try {
      await api.updateCartItem(cartId, newQty);
      setItems((prev) =>
        prev.map((i) =>
          i.cart_item_id === cartId ? { ...i, quantity: newQty } : i
        )
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (cartId: number) => {
    if (!confirm("确定移除该商品？")) return;
    try {
      await api.removeCartItem(cartId);
      setItems((prev) => prev.filter((i) => i.cart_item_id !== cartId));
      setSelectedIds((prev) => prev.filter((id) => id !== cartId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) return alert("请选择要结算的商品");
    // 只结算选中的商品：可以传递选中项ids，此处简化直接跳转
    setPageView("checkout");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-20 mt-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-10 mt-12">
      <div className="flex items-center mb-6">
        <ShoppingBag className="text-[#d4af37] mr-3" size={28} />
        <h2 className="text-2xl font-bold text-[#112A23]">购物车</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">购物车还是空的</p>
          <button
            onClick={() => setPageView("shop")}
            className="bg-[#112A23] text-white px-6 py-2 rounded-full hover:opacity-90"
          >
            去逛逛
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div
                key={item.cart_item_id}
                className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.cart_item_id)}
                  onChange={() =>
                    setSelectedIds((prev) =>
                      prev.includes(item.cart_item_id)
                        ? prev.filter((id) => id !== item.cart_item_id)
                        : [...prev, item.cart_item_id]
                    )
                  }
                  className="w-5 h-5 accent-[#112A23]"
                />
                <img
                  src={getImageUrl(item.cover_image)}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-[#112A23]">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.shop_name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-[#d4af37]">
                      ¥{item.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-full">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.cart_item_id,
                              item.quantity - 1
                            )
                          }
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 rounded-l-full"
                          disabled={updating}
                        >
                          -
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.cart_item_id,
                              item.quantity + 1
                            )
                          }
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 rounded-r-full"
                          disabled={updating}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.cart_item_id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center max-w-4xl mx-auto rounded-t-xl shadow-lg">
            <div>
              <span className="text-sm text-gray-500">合计（含手续费）</span>
              <span className="text-2xl font-bold text-[#d4af37] ml-2">
                ¥{getTotal().toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="flex items-center gap-2 bg-[#d4af37] text-white px-8 py-3 rounded-full hover:opacity-90 transition"
            >
              去结算
              <ArrowRight size={18} />
            </button>
          </div>

          {/* 占位，防止内容被底部栏遮挡 */}
          <div className="h-20" />
        </>
      )}
    </div>
  );
};

export default CartPage;
