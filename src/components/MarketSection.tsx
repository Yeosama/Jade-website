import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  X,
  Clock,
  Store,
  Info,
} from 'lucide-react';

const MarketSection = () => {
  
  const [activeMarket, setActiveMarket] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const markets = [
    {
      name: "天光墟 (Tianguang Market)",
      tag: "历史最悠久 · 凌晨交易",
      desc: "四会的灵魂所在。这里是全国最早开市的玉器市场，主营毛货（未抛光产品）。成千上万的摊位在夜色中铺开，是行家淘宝的必争之地。",
      img: "/market-ghost-sihui.jpg",
      card_img: "/detail_view/微信图片_20251214161531_299_3722.jpg",
      details: {
        hours: "凌晨 03:00 - 上午 10:00",
        products: "毛货挂件、手把件、未抛光半成品",
        tips: "一定要带手电筒！看货要趁早，好货在天亮前就会被收走。新手建议只看不买，多听行家如何讨价还价。这里是考验眼力的地方，‘不保真’是默认规则，全凭本事。",
      },
    },
    {
      name: "万兴隆 (Wan Xinlong)",
      tag: "综合体 · 挂件之王",
      desc: "四会现代化的代表，主打中高端翡翠挂件。环境舒适，管理规范，是“四会工”成品最集中的展示中心，也是电商拿货的主要源头。",
      img: "/market-raw-night-sihui.jpg",
      card_img: "/detail_view/微信图片_20251214161631_302_3722.jpg",
      bgPos: "center 15%",
      details: {
        hours: "上午 09:00 - 下午 18:00",
        products: "中高端成品挂件、镶嵌翡翠、精美礼品",
        tips: "适合普通游客和精品采购商。所有商品基本都有鉴定证书，售后更有保障。价格相对天光墟透明，但仍有砍价空间。二楼有很多大师工作室，值得一看。",
      },
    },
    {
      name: "日丰玉石场 (Rifeng)",
      tag: "原石毛料 · 源头",
      desc: "在这里，你能看到刚从缅甸运回的翡翠原石。切割机轰鸣声中，上演着“一刀穷，一刀富”的惊险故事。是四会玉器加工链条的源头。",
      img: "/market-wholesale-sihui.jpg",
      card_img: "/detail_view/微信图片_20251214162549_307_3722.jpg",
      details: {
        hours: "上午 08:00 - 下午 17:00",
        products: "翡翠原石、明料、片料",
        tips: "原石交易风险极高，‘神仙难断寸玉’。非专业人士切勿轻易尝试大额原石交易。可以花几十元买块小料子体验一下切割的乐趣，感受心跳加速的感觉。",
      },
    },
    {
      name: "玉器博览城 (Exhibition City)",
      tag: "高端摆件 · 艺术馆",
      desc: "主打大型翡翠摆件。这里的大师工作室云集，展出的不仅是商品，更是艺术品。体量巨大、雕工精湛的摆件让人叹为观止。",
      img: "/market-finished-sihui.jpg",
      card_img: "/detail_view/微信图片_20251216095318_418_3722.jpg",
      bgPos: "center 80%",
      details: {
        hours: "上午 09:30 - 下午 17:30",
        products: "大型摆件、山水插屏、收藏级孤品",
        tips: "这里是欣赏‘四会工’巅峰技艺的最佳场所。很多摆件动辄几十万上百万。即使不买，把它当做博物馆来参观也是极好的。拍照前记得征得店主同意。",
      },
    },
  ];

  return (
    <section
      id="markets"
      className="py-12 md:py-24 bg-[#112A23] text-white relative overflow-hidden transition-all duration-700"
    >
      {/* Background Image Transition */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeMarket}
            src={markets[activeMarket].img}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.2, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full h-full object-cover grayscale"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#112A23] via-[#112A23]/90 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col md:flex-row gap-6 md:gap-12">
        {/* Left: Content - 移动端横向滚动 */}
        <div className="md:w-1/3 space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2 text-[#d4af37] border border-[#d4af37]/30 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm mb-2 md:mb-4">
            <MapPin size={14} className="md:w-4 md:h-4" /> 四大核心地标
          </div>
          <h2 className="text-2xl md:text-4xl font-bold serif mb-4 md:mb-8">寻宝地图</h2>
          {/* 移动端横向滑动按钮列表 */}
          <div className="relative">
            <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600">
              {markets.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMarket(idx)}
                  className={`flex-shrink-0 w-40 md:w-auto text-left p-2 md:p-4 rounded-xl transition-all duration-300 border-l-4 ${
                    activeMarket === idx
                      ? "bg-white/10 border-[#d4af37] pl-3 md:pl-6"
                      : "border-transparent hover:bg-white/5 pl-3 md:pl-4 text-gray-400"
                  }`}
                >
                  <h3
                    className={`font-bold text-sm md:text-lg ${
                      activeMarket === idx ? "text-white" : ""
                    }`}
                  >
                    {m.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{m.tag}</p>
                </button>
              ))}
            </div>
            {/* 右侧渐变提示（移动端） */}
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#112A23] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Right: Detail View - 移动端全宽 */}
        <div className="md:w-2/3 flex items-center">
          <motion.div
            key={activeMarket}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl"
          >
            {/* 背景图（同原逻辑） */}
            <div className="absolute inset-0">
              <img
                src={markets[activeMarket].card_img}
                alt={markets[activeMarket].name}
                style={{
                  background: `
                    linear-gradient(
                      to right,
                      rgba(6,17,14,0.92) 0%,
                      rgba(11,42,32,0.70) 28%,
                      rgba(11,42,32,0.35) 55%,
                      rgba(0,0,0,0) 78%
                    )
                  `,
                  objectPosition: markets[activeMarket].bgPos ?? "center 50%",
                }}
                className="w-full h-full object-cover scale-[1.02] group-hover:scale-[1.06] transition-transform duration-700 opacity-75"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_35%,rgba(0,0,0,0.5)_100%)]" />
            </div>

            {/* 渐变叠加层 */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    to right,
                    rgba(6,17,14,0.96) 0%,
                    rgba(11,42,32,0.78) 33%,
                    rgba(11,42,32,0.45) 55%,
                    rgba(0,0,0,0) 80%
                  )
                `,
              }}
            />

            {/* 内容层 */}
            <div className="relative z-10 p-5 md:p-12 w-full">
              <h3 className="text-xl md:text-3xl font-bold text-[#d4af37] serif mb-1 md:mb-2 drop-shadow">
                {markets[activeMarket].name}
              </h3>
              <p className="text-[10px] md:text-sm text-gray-300 mb-3 md:mb-6 font-mono uppercase tracking-wider md:tracking-widest">
                {markets[activeMarket].tag}
              </p>
              <p className="text-sm md:text-lg leading-relaxed md:leading-loose text-gray-100 font-light">
                {markets[activeMarket].desc}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 md:mt-8 px-4 md:px-6 py-1.5 md:py-2 border border-white/30 rounded-full text-xs md:text-sm hover:bg-white hover:text-[#112A23] transition-colors flex items-center gap-2 group/button backdrop-blur-sm"
              >
                查看详细导览
                <Navigation size={12} className="md:w-3.5 md:h-3.5 group-hover/button:translate-x-1 transition-transform" />
              </button>
              <div className="mt-4 md:mt-6 h-[2px] w-16 md:w-24 bg-[#d4af37]/80 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Detail Modal - 移动端适配 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-[#112A23] rounded-xl md:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-24 md:h-32 bg-[#112A23] relative">
                <img
                  src={markets[activeMarket].img}
                  className="w-full h-full object-cover opacity-40"
                />
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 md:top-4 md:right-4 text-white hover:bg-white/20 p-1.5 md:p-2 rounded-full"
                >
                  <X size={18} className="md:w-6 md:h-6" />
                </button>
                <div className="absolute bottom-2 left-4 md:bottom-4 md:left-6">
                  <h3 className="text-lg md:text-2xl font-bold text-white serif">
                    {markets[activeMarket].name}
                  </h3>
                </div>
              </div>

              <div className="p-5 md:p-8 space-y-4 md:space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-base md:text-lg mb-2 text-[#d4af37]">
                    <Clock size={16} className="md:w-5 md:h-5" /> 营业时间
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-2 md:p-3 rounded-lg text-sm md:text-base">
                    {markets[activeMarket].details.hours}
                  </p>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 font-bold text-base md:text-lg mb-2 text-[#d4af37]">
                    <Store size={16} className="md:w-5 md:h-5" /> 主营产品
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-2 md:p-3 rounded-lg text-sm md:text-base">
                    {markets[activeMarket].details.products}
                  </p>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 font-bold text-base md:text-lg mb-2 text-[#d4af37]">
                    <Info size={16} className="md:w-5 md:h-5" /> 避坑与攻略
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-2 md:p-3 rounded-lg border-l-4 border-[#d4af37] text-sm md:text-base">
                    {markets[activeMarket].details.tips}
                  </p>
                </div>

                <div className="pt-3 md:pt-4 text-center">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 md:px-8 py-2 md:py-3 bg-[#112A23] text-white rounded-full hover:bg-[#1a4d3f] font-bold text-sm md:text-base"
                  >
                    我了解了
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MarketSection;