import React from 'react';
import { Info } from 'lucide-react';

const levels = [
  {
    title: '豆种 (Bean)',
    color: 'bg-emerald-900/40',
    text: '晶体粗松，像豆子排列，透明度差。',
    price: '$',
    img: '/texture-laonong-sihui.jpg',
  },
  {
    title: '糯种 (Sticky Rice)',
    color: 'bg-emerald-600/50',
    text: '如熬过的糯米汤，半透明，温润。',
    price: '$$',
    img: '/texture-nuozhong-sihui.jpg',
  },
  {
    title: '冰种 (Ice)',
    color: 'bg-emerald-400/60',
    text: '清凉似冰，七分透明，有起莹光感。',
    price: '$$$',
    img: '/texture-binzhong-sihui.jpg',
  },
  {
    title: '玻璃种 (Glass)',
    color: 'bg-emerald-200/80',
    text: '完全透明如玻璃，结晶极细，收藏级。',
    price: '$$$$',
    img: '/texture-boli-sihui.jpg',
  },
];

const KnowledgeSection: React.FC = () => {
  return (
    <section id="knowledge" className="py-12 md:py-24 bg-[#fcfbf9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#112A23] mb-3 md:mb-4 serif">
            种水阶梯
          </h2>
          <p className="text-gray-600 text-sm md:text-base px-4">
            外行看色，内行看种。种水是决定翡翠价值的核心。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {levels.map((level, idx) => (
            <div
              key={idx}
              className="group relative h-80 sm:h-96 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <img
                src={level.img}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={level.title}
              />
              <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-[#112A23] via-[#112A23]/80 to-transparent pt-16 md:pt-24 translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="text-[#d4af37] font-bold text-lg md:text-xl mb-1 serif">
                  {level.title}
                </div>
                <p className="text-white text-xs md:text-sm leading-relaxed opacity-90 mt-1">
                  {level.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-12 bg-white p-4 md:p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 md:gap-6 items-center shadow-sm">
          <div className="p-3 md:p-4 bg-orange-50 rounded-full text-orange-800">
            <Info size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="font-bold text-[#112A23] mb-1 text-base md:text-lg">
              ABC货的区别
            </h4>
            <p className="text-xs md:text-sm text-gray-600">
              <span className="font-bold text-green-700">A货：</span>
              纯天然无处理，具有收藏价值。
              <br />
              <span className="font-bold text-yellow-700">B货：</span>
              酸洗注胶，结构被破坏，时间久了会泛黄。
              <br />
              <span className="font-bold text-red-700">C货：</span>
              人工染色，颜色夸张呆板，无任何价值。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeSection;