import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { PageView } from '../types';

interface NavbarProps {
  activeSection: string;
  scrollTo: (id: string) => void;
  setPageView: (view: PageView) => void;
  currentPage: PageView;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, scrollTo, setPageView, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const token = localStorage.getItem('token');
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const links = [
    { id: "hero", label: "首页", type: "scroll" },
    { id: "history", label: "十二时辰", type: "scroll" },
    { id: "markets", label: "四大市场", type: "scroll" },
    { id: "gallery", label: "名玉赏析", type: "scroll" },
    { id: "knowledge", label: "种水百科", type: "scroll" },
    { id: "craft", label: "玉雕工艺", type: "scroll" },
    { id: "analyzer", label: "AI鉴赏", type: "scroll" },
    { id: "ai-tryon", label: "AI试戴", type: "scroll" },
    { id: "forum", label: "玉石论坛", type: "scroll" },
    { id: "shop", label: "玉器商城", type: "scroll" },
    ...(user?.role === 'merchant' ? [{ id: "merchantDashboard", label: "商户中心", type: "page" }] : []),
  ];

  const handleLinkClick = (linkId: string, type: string) => {
    if (type === "page") {
      setPageView(linkId as PageView);
    } else {
      if (currentPage !== "home") {
        setPageView("home");
        setTimeout(() => scrollTo(linkId), 50);
      } else {
        scrollTo(linkId);
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#fdfcf8]/90 backdrop-blur-md border-b border-[#112A23]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleLinkClick("hero", "scroll")}
          >
            <div className="w-8 h-8 bg-[#112A23] rounded-full flex items-center justify-center text-[#d4af37] font-bold serif">
              翠
            </div>
            <span className="ml-3 text-xl font-bold text-[#112A23] serif tracking-widest">
              翠魂·四会
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.type)} // ✅ 传两个参数
                className={`text-sm font-medium transition-colors duration-300 ${
                  activeSection === link.id && currentPage === "home"
                    ? "text-[#112A23] font-bold border-b-2 border-[#d4af37]"
                    : "text-gray-500 hover:text-[#112A23]"
                }`}
              >
                {link.label}
              </button>
            ))}
            {/* 购物车图标 */}
            <div className="relative cursor-pointer ml-2" onClick={() => setPageView("cart")}>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#112A23]"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#fdfcf8] border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.type)} // ✅ 传两个参数
                className="block w-full text-left px-3 py-2 text-base font-medium text-[#112A23] hover:bg-gray-100 rounded-md"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;