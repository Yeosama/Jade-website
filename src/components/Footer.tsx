import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#112A23] text-white py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center text-[#d4af37] font-bold serif text-2xl mb-6 ring-1 ring-white/10">
          翠
        </div>
        <p className="text-[#d4af37] text-sm tracking-[0.3em] uppercase mb-4">
          Jade Soul Sihui
        </p>
        <h2 className="text-3xl font-bold serif mb-8">翠魂·四会</h2>

        <div className="flex justify-center gap-8 mb-10 text-sm text-gray-400">
          <span className="hover:text-white cursor-pointer">关于我们</span>
          <span className="hover:text-white cursor-pointer">天光墟指南</span>
          <span className="hover:text-white cursor-pointer">免责声明</span>
        </div>

        <p className="text-gray-500 text-xs">
          © 2024 Powered by Tongyi & Jimeng AI
          本站内容仅供娱乐与文化参考，不作为实际交易依据。
          <br />
          翡翠有风险，入手需谨慎。
        </p>
      </div>
    </footer>
  );
};

export default Footer;