import React, { useEffect, useState } from "react";
import { PageView, Product } from "../types";
import api, { IMAGE_BASE, getImageUrl } from "../api";
import { ShoppingBag, Loader2 } from "lucide-react";
import ProductCard from '../components/ProductCard';
interface Props {
  setPageView: (view: PageView) => void;
  onViewProduct: (id: number) => void; // 点击商品跳转详情
}

const CATEGORIES = ["全部", "挂件", "摆件", "手镯", "原石", "其他"];

const ShopPage: React.FC<Props> = ({ setPageView, onViewProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadProducts = async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const data = await api.getProducts(pageNum, 12, category);
      if (!append) {
        setProducts(data);
      } else {
        setProducts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 12);
    } catch (err) {
      console.error("加载商品失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadProducts(1, false);
  }, [category]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-10 mt-12">
      <div className="flex items-center mb-8">
        <ShoppingBag className="text-[#d4af37] mr-3" size={32} />
        <h2 className="text-3xl font-bold text-[#112A23]">玉器商城</h2>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === "全部" ? "" : cat)}
            className={`px-5 py-2 rounded-full border transition text-sm font-medium ${
              category === (cat === "全部" ? "" : cat)
                ? "bg-[#112A23] text-white border-[#112A23]"
                : "bg-white text-[#112A23] border-gray-300 hover:border-[#d4af37]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 商品网格 */}
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl h-72 animate-pulse"
            />
          ))}
        </div>
      ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard
      key={product.id}
      product={product}
      onClick={() => onViewProduct(product.id)}
    />
  ))}
</div>
      )}

      {/* 加载更多 */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 border border-[#112A23] text-[#112A23] rounded-full hover:bg-[#112A23] hover:text-white transition"
          >
            加载更多
          </button>
        </div>
      )}
      {loading && products.length > 0 && (
        <div className="flex justify-center mt-10">
          <Loader2 className="animate-spin text-[#112A23]" size={24} />
        </div>
      )}
    </div>
  );
};

export default ShopPage;
