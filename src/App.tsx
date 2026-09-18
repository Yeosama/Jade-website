import React, { useState, useEffect } from "react";
import { useScroll, useTransform } from "framer-motion";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import HistorySection from "./components/HistorySection";
import MarketSection from "./components/MarketSection";
import GallerySection from "./components/GallerySection";
import KnowledgeSection from "./components/KnowledgeSection";
import CraftSection from "./components/CraftSection";
import { ShoppingCart } from "lucide-react";
import JadeAnalyzer from "./components/JadeAnalyzer";
import JadeChat from "./components/JadeChat";
import Footer from "./components/Footer";
import ScrollProgressBar from "./components/ScrollProgressBar";
import MuseumPage from "./pages/MuseumPage";
import ForumPage from "./pages/ForumPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreatePostPage from "./pages/CreatePostPage";
import { MoveUp } from "lucide-react";
import { PageView } from "./types";
import TryOnPage from "./pages/TryOnPage";
import UserProfile from "./pages/UserProfile";
import AITryonSection from "./components/AITryonSection";
import ForumSection from "./components/ForumSection";
import EditPostPage from "./pages/EditPostPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderListPage from "./pages/OrderListPage";
import MerchantApplyPage from "./pages/MerchantApplyPage";
import MerchantDashboard from "./pages/MerchantDashboard";
import ShopSection from "./components/ShopSection";
import api from "./api";
import { IMAGE_BASE } from './api';


const App = () => {
  const [pageView, setPageView] = useState<PageView>("home");
  const [activeSection, setActiveSection] = useState("hero");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [forumRefresh, setForumRefresh] = useState(0);
  const [userRefreshKey, setUserRefreshKey] = useState(0);
  const [productDetailId, setProductDetailId] = useState<number | null>(null);
  const handleOpenLogin = () => setPageView("login");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [openPostId, setOpenPostId] = useState<number | null>(null);
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);
  const [viewingPostId, setViewingPostId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  // 👇 新增的获取用户信息副作用（加在这里）
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [pageView]); // 当页面切换时（如登录/登出），刷新用户状态

  const handleViewPostDetail = (postId: number) => {
    setViewingPostId(postId);
    setPageView("home"); // 确保回到主页（隐藏编辑页）
  };

  // 清除详情视图，返回论坛列表
  const handleClosePostDetail = () => {
    setViewingPostId(null);
  };
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  // 定义编辑回调
  const handleEditPost = (postId: number) => {
    setEditingPostId(postId);
    setPageView("edit");
  };

  const scrollToForum = () => {
    requestAnimationFrame(() => {
      const forumElement = document.getElementById("forum");
      if (forumElement) {
        const rect = forumElement.getBoundingClientRect();
        const offsetTop = window.scrollY + rect.top - 80; // 80px 偏移量
        window.scrollTo({ top: offsetTop, behavior: "auto" });
      }
    });
  };

  // 滚动监听（仅主页需要更新 activeSection）
  useEffect(() => {
    const handleScroll = () => {
      if (pageView !== "home") return; // 只在主页时更新 activeSection

      const sections = [
        "hero",
        "history",
        "markets",
        "gallery",
        "knowledge",
        "craft",
        "analyzer",
        "ai-tryon",
        "forum", // 添加这两个
      ];

      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 300 && rect.bottom >= 300) {
            current = section;
          }
        }
      }
      if (current) setActiveSection(current);

      // 回到顶部按钮显隐
      if (window.scrollY > 600) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pageView]);

  return (
    <>
      <ScrollProgressBar />
      <Navbar
        activeSection={activeSection}
        scrollTo={scrollTo}
        setPageView={setPageView}
        currentPage={pageView}
      />

      {(pageView === "shop" ||
        pageView === "productDetail" ||
        pageView === "cart" ||
        pageView === "checkout" ||
        pageView === "orders" ||
        pageView === "merchantDashboard" ||
        pageView === "merchantApply") && (
        <div className="fixed top-20 right-4 z-40 flex items-center gap-3">
          {/* 购物车按钮 */}
          <button
            onClick={() => setPageView("cart")}
            className="relative p-2 bg-white/90 backdrop-blur rounded-full shadow-md hover:shadow-lg transition"
          >
            <ShoppingCart size={20} className="text-[#112A23]" />
          </button>

          {/* 用户头像 / 登录按钮 */}
          {user ? (
            <img
              src={
                user.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `${IMAGE_BASE}${user.avatar}`
                  : "https://api.dicebear.com/9.x/initials/svg?seed=default&backgroundType=gradientLinear&size=32"
              }
              alt={user.username}
              className="w-8 h-8 rounded-full cursor-pointer ring-2 ring-white shadow"
              onClick={() => setPageView("profile")}
            />
          ) : (
            <button
              onClick={() => setPageView("login")}
              className="bg-white/90 px-3 py-1.5 rounded-full text-sm font-medium shadow hover:bg-white"
            >
              登录
            </button>
          )}
        </div>
      )}

      {pageView === "shop" ? (
        <ShopPage
          setPageView={setPageView}
          onViewProduct={(id: number) => {
            setProductDetailId(id);
            setPageView("productDetail");
          }}
        />
      ) : pageView === "productDetail" && productDetailId ? (
        <ProductDetailPage
          productId={productDetailId}
          setPageView={setPageView}
          onBack={() => {
            setPageView("home");
            setTimeout(() => {
              const el = document.getElementById("shop");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
        />
      ) : pageView === "cart" ? (
        <CartPage setPageView={setPageView} />
      ) : pageView === "checkout" ? (
        <CheckoutPage setPageView={setPageView} />
      ) : pageView === "orders" ? (
        <OrderListPage setPageView={setPageView} />
      ) : pageView === "merchantDashboard" ? (
        <MerchantDashboard setPageView={setPageView} />
      ) : pageView === "merchantApply" ? (
        <MerchantApplyPage setPageView={setPageView} />
      ) : pageView === "profile" ? (
        <UserProfile
          onBack={() => {
            setPageView("home");
            scrollToForum();
          }}
          onLogout={() => {
            setPageView("home");
            localStorage.removeItem("token");
            setForumRefresh((prev) => prev + 1);
            scrollToForum();
          }}
          onUpdateSuccess={(user, newToken) => {
            if (newToken) localStorage.setItem("token", newToken);
            setPageView("home");
            setForumRefresh((prev) => prev + 1);
            setUserRefreshKey((prev) => prev + 1);
            scrollToForum();
          }}
        />
      ) : pageView === "museum" ? (
        <MuseumPage
          onBack={() => {
            setActiveSection("hero");
            setPageView("home");
            scrollTo("hero");
          }}
        />
      ) : pageView === "edit" && editingPostId ? (
        <EditPostPage
          postId={editingPostId}
          onBack={() => {
            setPendingPostId(editingPostId); // 记录要打开的帖子
            setPageView("home");
            // 直接滚动到论坛区块，无需额外延迟，由 ForumSection 的 useEffect 自动打开详情
            scrollToForum();
          }}
          onPostUpdated={() => {
            setPageView("home");
            setForumRefresh((prev) => prev + 1);
            scrollToForum();
          }}
          setPageView={setPageView}
        />
      ) : pageView === "forum" ? (
        <ForumPage
          onBack={() => {
            setActiveSection("hero");
            setPageView("home");
            scrollTo("hero");
          }}
          onOpenLogin={() => setPageView("login")}
          setPageView={setPageView}
          refreshKey={forumRefresh}
          userRefreshKey={userRefreshKey}
        />
      ) : pageView === "login" ? (
        <LoginPage
          onLoginSuccess={(user) => {
            setPageView("home");
            setForumRefresh((prev) => prev + 1);
            setUserRefreshKey((prev) => prev + 1);
            scrollToForum();
          }}
          onSwitchToRegister={() => setPageView("register")}
          onBack={() => {
            setPageView("home");
            scrollToForum();
          }}
        />
      ) : pageView === "register" ? (
        <RegisterPage
          onRegisterSuccess={() => {
            setPageView("login");
          }}
          onSwitchToLogin={() => setPageView("login")}
          onBack={() => {
            setPageView("home");
            scrollToForum();
          }}
        />
      ) : pageView === "create" ? (
        <CreatePostPage
          onBack={() => {
            setPageView("home");
            scrollToForum();
          }}
          onPostSuccess={() => {
            setPageView("home");
            setForumRefresh((prev) => prev + 1);
            scrollToForum();
          }}
          onOpenLogin={() => setPageView("login")}
        />
      ) : pageView === "tryon" ? (
        <TryOnPage
          onBack={() => {
            setActiveSection("hero");
            setPageView("home");
            scrollTo("hero");
          }}
        />
      ) : (
        <div
          className="min-h-screen relative"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        >
          <HeroSection scrollTo={scrollTo} setPageView={setPageView} />
          <HistorySection />
          <MarketSection />
          <GallerySection onOpenMuseum={() => setPageView("museum")} />
          <KnowledgeSection />
          <CraftSection />
          <JadeAnalyzer />
          <AITryonSection />
          <ForumSection
            onOpenLogin={handleOpenLogin}
            setPageView={setPageView}
            refreshKey={forumRefresh}
            userRefreshKey={userRefreshKey}
            onEditPost={(postId) => {
              setEditingPostId(postId);
              setPageView("edit");
            }}
            openPostId={pendingPostId}
            onClearOpenPostId={() => setPendingPostId(null)}
          />
          <ShopSection
            setPageView={setPageView}
            onViewProduct={(id) => {
              setProductDetailId(id);
              setPageView("productDetail");
            }}
          />
          <Footer />
        </div>
      )}

      <JadeChat />
      {showBackToTop && pageView === "home" && (
        <button
          onClick={() => scrollTo("hero")}
          className="fixed bottom-24 right-6 z-40 p-3 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-[#112A23] hover:bg-[#112A23] hover:text-[#d4af37] transition-colors"
          aria-label="回到顶部"
        >
          <MoveUp size={20} />
        </button>
      )}
    </>
  );
};

export default App;
