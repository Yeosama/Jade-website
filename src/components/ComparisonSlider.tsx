import React, { useState, useRef } from 'react';
import { MoveHorizontal } from 'lucide-react';

const ComparisonSlider: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden cursor-col-resize select-none shadow-2xl border border-white/20"
      onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
      onTouchMove={handleDrag}
      onClick={handleDrag}
    >
      {/* 成品图（抛光后的玉雕） */}
      <div className="absolute inset-0">
        <img
          src="/craft-polish-sihui.jpg"
          alt="Polished Jade Carving"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur">
          四会工 (After)
        </div>
      </div>

      {/* 原石图（毛料） - 通过裁剪显示 */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src="/craft-rough-sihui.jpg"
          alt="Rough Stone"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur">
          原石毛料 (Before)
        </div>
      </div>

      {/* 滑块手柄 */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-[#112A23]">
          <MoveHorizontal size={16} />
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;