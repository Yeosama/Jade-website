import React from 'react';
import { Hammer, Sparkles, Zap } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider'; // 假设 ComparisonSlider 也单独拆分了

const CraftSection: React.FC = () => {
  return (
    <section
      id="craft"
      className="py-24 bg-[#112A23] text-white overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37] rounded-full filter blur-[150px] opacity-10"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[#d4af37] text-sm mb-4">
            <Hammer size={14} /> 核心工艺
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 serif leading-tight">
            四会工：
            <br />
            <span className="text-[#d4af37]">化瑕为瑜，巧夺天工</span>
          </h2>
          <p className="text-gray-300 mb-6 text-lg font-light leading-relaxed">
            不同于揭阳工的“精”（主攻高档料）、平洲工的“稳”（主攻手镯），四会工最核心的灵魂在于
            <strong>“巧”</strong>与<strong>“快”</strong>。
          </p>
          <p className="text-gray-400 mb-8 leading-relaxed">
            面对带有裂纹、脏色、杂质的“废料”，四会匠人不舍弃，而是顺势而为。
            裂纹化作梅枝，黑点化作蝌蚪，杂色化作夕阳。这种“三分料，七分工”的极致创意，造就了四会摆件的天下无双。
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 backdrop-blur rounded-lg border border-white/5 hover:bg-white/20 transition-colors">
              <Sparkles className="text-[#d4af37] mb-2" />
              <h4 className="font-bold text-[#d4af37]">俏色巧雕</h4>
              <p className="text-xs text-gray-400 mt-1">
                保留玉石天然的红黄皮色，将其设计成仿古龙凤、花鸟鱼虫。
              </p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur rounded-lg border border-white/5 hover:bg-white/20 transition-colors">
              <Zap className="text-[#d4af37] mb-2" />
              <h4 className="font-bold text-[#d4af37]">避裂造型</h4>
              <p className="text-xs text-gray-400 mt-1">
                通过镂空、透雕等技法，挖去杂质，掩盖裂纹，使作品浑然天成。
              </p>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 w-full">
          <ComparisonSlider />
          <p className="text-center text-xs text-gray-400 mt-4 italic">
            “他山之石，四会成器” —— 拖动滑块见证顽石的蜕变
          </p>
        </div>
      </div>
    </section>
  );
};

export default CraftSection;