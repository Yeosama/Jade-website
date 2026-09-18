import React, { useMemo } from "react";
import { Product } from "../types";
import { getImageUrl } from "../api";
import { Truck, MapPin } from "lucide-react";

interface Props {
  product: Product;
  onClick: () => void;
}

// 生成固定随机购买人数（基于商品ID，保证同一商品不跳动）
const usePseudoRandom = (seed: number) => {
  return useMemo(() => {
    // 简单伪随机：取 seed 的 hash 并对 200 取模
    const hash = Math.abs(Math.sin(seed) * 10000) % 200;
    return Math.floor(hash) + 5; // 5~205 人
  }, [seed]);
};

const CITIES = ["四会", "广州", "深圳", "佛山", "揭阳", "平洲"];

const ProductCard: React.FC<Props> = React.memo(({ product, onClick }) => {
  const purchaseCount = usePseudoRandom(product.id);
  const city = CITIES[product.id % CITIES.length];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl text-[#112A23] shadow hover:shadow-lg transition cursor-pointer overflow-hidden group border border-transparent hover:border-[#d4af37]/30"
    >
      <div className="relative">
        <img
          src={getImageUrl(product.cover_image)}
          alt={product.title}
          loading="lazy"
          className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-base lg:text-lg truncate">
          {product.title}
        </h3>
        {/* 商家 + 发货地、包邮、购买人数合并为一行 */}
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[120px]">{product.shop_name}</span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-gray-400" />
              {city}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Truck size={12} /> 包邮
            </span>
          </div>
          <span>{purchaseCount}人购买</span>
        </div>
        <div className="flex justify-between items-end mt-3">
          <div>
            <span className="text-xl font-bold text-[#d4af37]">
              ¥{product.price}
            </span>
            <span className="text-xs text-gray-400 ml-2 line-through">
              ¥{(product.price * 1.3).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
