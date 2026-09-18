import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 origin-left bg-gradient-to-r from-[#d4af37] via-emerald-400 to-[#112A23] z-[60] pointer-events-none"
    />
  );
};

export default ScrollProgressBar;