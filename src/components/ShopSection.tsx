import React, { useEffect, useState } from "react";
import { Product, PageView } from "../types";
import api, { IMAGE_BASE, getImageUrl } from "../api";
import { ShoppingBag, Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";

interface Props {
  setPageView: (view: PageView) => void;
  onViewProduct: (id: number) => void;
}

const CATEGORIES = ["全部", "挂件", "摆件", "手镯", "原石", "其他"];

const ShopSection: React.FC<Props> = ({ setPageView, onViewProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts(1, 12, category); // 改为 12
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category]);

  return (
    <section id="shop" className="py-20 px-4 bg-[#112A23] text-white">
      <div className="max-w-7xl mx-auto">
        {/* 替换原来的标题区域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 md:p-4 bg-white/10 rounded-full text-[#d4af37] mb-2">
            <ShoppingBag size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold serif mb-4 text-[#d4af37]">
            玉器商城
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            源头好玉，匠心精选，从四会到您手中
          </p>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === "全部" ? "" : cat)}
              className={`px-5 py-2 rounded-full border transition text-sm font-medium ${
                category === (cat === "全部" ? "" : cat)
                  ? "bg-[#d4af37] text-[#112A23] border-[#d4af37]"
                  : "border-white/30 text-white hover:border-[#d4af37]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 商品网格 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/10 rounded-xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onViewProduct(product.id)}
              />
            ))}
          </div>
        )}

        {/* 查看更多按钮 */}
        <div className="flex justify-center mt-10 space-x-4">
          <button
            onClick={() => setPageView("shop")}
            className="px-8 py-3 border border-white/50 text-white rounded-full hover:bg-white hover:text-[#112A23] transition"
          >
            进入商城
          </button>
          <button
            onClick={() => setPageView("merchantApply")}
            className="px-8 py-3 bg-[#d4af37] text-[#112A23] rounded-full hover:bg-opacity-90 transition"
          >
            商家入驻
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
