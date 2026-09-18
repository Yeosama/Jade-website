import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Hammer,
  Gem,
  Zap,
  MoveHorizontal,
} from 'lucide-react';

const HistorySection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const events = [
    {
      time: "03:00",
      title: "天光未亮 · 鬼市",
      desc: "四会最传奇的时刻。天还没亮，天光墟已人声鼎沸。行家们戴着头灯，在黑暗中凭借微光看货。这是一场眼力与胆识的博弈，好料子往往在这个时间点悄然易手。",
      icon: <Moon size={24} />,
      bg: "/events/微信图片_20251214162734_309_3722.jpg",
    },
    {
      time: "06:00",
      title: "天光大亮 · 早市",
      desc: "随着第一缕阳光洒下，市场全貌显现。数以万计的翡翠毛货铺满地面，场面壮观。来自全国各地的进货商开始大规模扫货，讨价还价声此起彼伏。",
      icon: <Sun size={24} />,
      bg: "/events/微信图片_20251214162549_307_3722.jpg",
    },
    {
      time: "10:00",
      title: "精工细作 · 雕刻",
      desc: "市场散去，原石被带回工作室。四会拥有数万名玉雕师，他们开始了一天的创作。从“切料”到“设计”再到“雕刻”，顽石在他们手中逐渐显现出灵性。",
      icon: <Hammer size={24} />,
      bg: "/events/微信图片_20251214161830_304_3722.jpg",
    },
    {
      time: "14:00",
      title: "成品展示 · 玉城",
      desc: "各大玉器城开门迎客。万兴隆、玉器博览城里流光溢彩。这里展示的是经过抛光后的成品，玻璃种、冰种、糯种，各种成色的翡翠争奇斗艳。",
      icon: <Gem size={24} />,
      bg: "/events/微信图片_20251214163816_322_3722.jpg",
    },
    {
      time: "20:00",
      title: "云端交易 · 直播",
      desc: "夜幕降临，实体店打烊，但线上的狂欢才刚刚开始。四会是各种直播平台的翡翠产业带基地，数千个直播间的灯光将夜晚照得如同白昼。",
      icon: <Zap size={24} />,
      bg: "/events/微信图片_20251214165424_331_3722.jpg",
    },
  ];

  return (
    <section id="history" className="py-24 bg-[#fdfcf8]">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#112A23] mb-4 serif">
            四会十二时辰
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            四会没有睡眠。从凌晨的神秘鬼市到深夜的激情直播，玉石流转的链条从未停歇。
          </p>
          <p className="text-[#d4af37] text-sm mt-4 flex items-center justify-center gap-2 animate-pulse">
            <MoveHorizontal size={16} /> 横向滑动查看完整时间轴
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-6 px-4 md:px-20 pb-12 no-scrollbar snap-x snap-mandatory"
      >
        {events.map((event, index) => (
          <motion.div
            key={index}
            className="
            group relative flex-shrink-0 w-80 md:w-[450px]
            h-[460px] md:h-[520px]
            snap-center overflow-hidden rounded-3xl
            shadow-2xl border border-[#112A23]/10
            hover:-translate-y-2 transition-transform duration-300
            bg-[#0a1813]
          "
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* ① 背景图 */}
            <div className="absolute inset-0">
              <img
                src={event.bg || "/微信图片_20251214161830_304_3722.jpg"}
                alt={event.title}
                className="w-full h-full object-cover scale-[1.02] group-hover:scale-[1.06] transition-transform duration-700"
                loading="lazy"
              />
              {/* 轻微暗角，让质感更稳 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_40%,rgba(0,0,0,0.45)_100%)]" />
            </div>

            {/* ② 从底部 1/3 开始向上墨绿色渐变（文字承载层） */}
            <div
              className="
              absolute inset-0
              bg-gradient-to-t
              from-[#06110e]/95 via-[#0b2a20]/70 to-transparent
            "
              style={{
                background:
                  "linear-gradient(to top, rgba(6,17,14,0.95) 0%, rgba(11,42,32,0.72) 35%, rgba(0,0,0,0) 70%)",
              }}
            />

            {/* ③ 内容：整体用 flex，把文字压到底 */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
              {/* 顶部信息块：时间+icon 做成徽章，放在文字区上方也不突兀 */}
              <div className="mb-5 flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#112A23]/80 text-[#d4af37] shadow-lg ring-1 ring-white/10 backdrop-blur">
                  {event.icon}
                </div>
                <span className="text-4xl font-bold text-white serif tracking-tighter drop-shadow">
                  {event.time}
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-white serif drop-shadow-sm">
                {event.title}
              </h3>

              <p className="text-white/85 leading-relaxed text-justify">
                {event.desc}
              </p>

              {/* ④ 额外美化：底部金线点缀（可删） */}
              <div className="mt-6 h-[2px] w-20 bg-[#d4af37]/80 rounded-full" />
            </div>
          </motion.div>
        ))}
        {/* Padding for scroll end */}
        <div className="w-10 flex-shrink-0"></div>
      </div>
    </section>
  );
};

export default HistorySection;