// src/components/HeroSection.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sun, Moon, Scan } from "lucide-react";
import { PageView } from "../types";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  scrollTo: (id: string) => void;
  setPageView: (view: PageView) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollTo, setPageView }) => {
  const [time, setTime] = useState(9); // 9 to 21
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [autoPlay, setAutoPlay] = useState(true);

  // Background images for different times
  const backgrounds = {
    night: "/hero-sihui-night.jpg",
    dawn: "/hero-sihui-dawn.jpg",
    day: "/hero-sihui-day.jpg",
  };

  // Determine which background to show
  let activeBgUrl = backgrounds.day;
  let timeLabel = "";

  if (time < 12) {
    activeBgUrl = backgrounds.dawn;
    timeLabel = "早市 · 鬼市收灯";
  } else if (time < 18) {
    activeBgUrl = backgrounds.day;
    timeLabel = "日间 · 大盘正忙";
  } else {
    activeBgUrl = backgrounds.night;
    timeLabel = "夜市 · 直播开场";
  }

  const darkness = time < 12 ? 0.15 : time < 18 ? 0 : 0.45;

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setTime((prev) => {
        const next = prev + 0.5;
        return next > 21 ? 9 : next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background Image Layer */}
      <div className="absolute inset-0 z-0 bg-[#112A23]">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={activeBgUrl}
            src={activeBgUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Background"
          />
        </AnimatePresence>
      </div>

      {/* Darkness Overlay */}
      <div
        className="absolute inset-0 z-10 bg-[#05110e] transition-opacity duration-1000 pointer-events-none"
        style={{ opacity: darkness }}
      ></div>

      {/* Flashlight Effect (at night) */}
      {time >= 18 && (
        <div
          className="absolute inset-0 z-10 pointer-events-none mix-blend-soft-light"
          style={{
            background: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.4), transparent 70%)`,
          }}
        ></div>
      )}

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="text-[#d4af37] tracking-[0.5em] mb-4 text-sm md:text-base font-bold drop-shadow-md uppercase bg-black/30 backdrop-blur-sm inline-block px-4 py-1 rounded-full border border-[#d4af37]/30">
            {timeLabel}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 serif drop-shadow-2xl">
            他山之石 <br className="md:hidden" />{" "}
            <span className="text-[#d4af37]">四会成器</span>
          </h1>
          <p className="text-gray-100 text-lg md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed font-light drop-shadow-lg serif">
            “世界翡翠看中国，中国翡翠看四会。”
            <br />
            这里不产一块玉，却占据了全球70%的翡翠摆件市场。
          </p>

          {/* Time Slider */}
          <div className="mb-12 max-w-md mx-auto bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl">
            <div className="flex justify-between text-xs text-gray-300 mb-2 font-mono">
              <span className={time < 12 ? "text-[#d4af37] font-bold" : ""}>
                09:00
                <br />
                早市
              </span>
              <span
                className={
                  time >= 12 && time < 18 ? "text-[#d4af37] font-bold" : ""
                }
              >
                15:00
                <br />
                日间
              </span>
              <span className={time >= 18 ? "text-[#d4af37] font-bold" : ""}>
                20:00
                <br />
                夜市
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Sun size={18} className="text-[#d4af37]" />
              <input
                type="range"
                min={9}
                max={21}
                step={0.5}
                value={time}
                onChange={(e) => {
                  setTime(parseFloat(e.target.value));
                  setAutoPlay(false);
                }}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
              <Moon size={18} className="text-gray-300" />
            </div>
            <p className="text-xs text-center text-gray-300 mt-3 flex items-center justify-center gap-2">
              <Clock size={12} /> 拖动时间轴，看看四会从早市到夜市的变化
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollTo("analyzer")}
              className="px-8 py-3 bg-[#d4af37] text-[#112A23] font-bold rounded-full hover:bg-[#c29f30] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Scan size={20} />
              AI 鉴玉
            </button>
            <button
              onClick={() => scrollTo("ai-tryon")}
              className="px-8 py-3 bg-[#112A23] text-white rounded-full hover:bg-[#1a4d3f] transition-all shadow-lg flex items-center justify-center gap-2 min-w-[140px]"
            >
              <Sparkles size={20} className="text-[#d4af37]" />
              AI 试戴
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#fdfcf8] to-transparent z-20"></div>
    </section>
  );
};

export default HeroSection;
