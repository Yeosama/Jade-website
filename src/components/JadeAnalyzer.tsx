import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Sparkles, Sun, Zap, Info, Scan, Search, Tag, BookOpen,
  X, CreditCard, Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { analyzeJadeImages, identifyJadeCategory, getTaskFullReport } from "../utils/gemini";
import api from "../api";

// ---------- 工具函数：生成随机二维码（Canvas绘制，看起来像真的二维码）----------
const drawRandomQRCode = (canvas: HTMLCanvasElement, method: "wechat" | "alipay") => {
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);
  
  const seed = Date.now() + Math.random() * 100000;
  const rand = (max: number) => Math.floor((Math.sin(seed * (Math.random() + 0.5)) * 0.5 + 0.5) * max);
  
  const drawPositionPattern = (x: number, y: number) => {
    const blockSize = 7;
    const moduleSize = size / 37;
    const posSize = blockSize * moduleSize;
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, posSize, posSize);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x + moduleSize, y + moduleSize, posSize - 2 * moduleSize, posSize - 2 * moduleSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, posSize - 4 * moduleSize, posSize - 4 * moduleSize);
  };
  
  const moduleSize = size / 37;
  drawPositionPattern(0, 0);
  drawPositionPattern(size - 7 * moduleSize, 0);
  drawPositionPattern(0, size - 7 * moduleSize);
  
  for (let row = 0; row < 37; row++) {
    for (let col = 0; col < 37; col++) {
      const isTopLeft = row < 7 && col < 7;
      const isTopRight = row < 7 && col > 29;
      const isBottomLeft = row > 29 && col < 7;
      if (isTopLeft || isTopRight || isBottomLeft) continue;
      if (row === 6 || col === 6) continue;
      if (rand(100) < 45) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 0.5, moduleSize - 0.5);
      }
    }
  }
  
  ctx.fillStyle = "#000000";
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillRect(x, y, 1, 1);
  }
};

// ---------- 支付弹窗组件（相对于父容器绝对定位，向下偏移）----------
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: "wechat" | "alipay") => Promise<void>;
}

// ---------- 支付进度条遮罩（全屏变暗，内容位于 top:65% 中心）----------
const PayingOverlay: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="absolute left-1/2 top-[69%] -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <Loader2 size={48} className="animate-spin text-[#d4af37] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#112A23] mb-2">正在解锁报告</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
            <div className="bg-[#d4af37] h-2.5 rounded-full w-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
          <p className="text-gray-500 text-sm">AI 正在为您生成深度报告，请稍候...</p>
        </div>
      </div>
    </div>
  );
};

// ---------- 支付弹窗（全屏变暗，内容位于 top:65% 中心）----------
const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [method, setMethod] = useState<"wechat" | "alipay">("wechat");
  const [isConfirming, setIsConfirming] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      drawRandomQRCode(canvasRef.current, method);
    }
  }, [isOpen, method]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm(method);
    setIsConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute left-1/2 top-[69%] -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="text-lg font-bold text-[#112A23] flex items-center gap-2">
              <CreditCard size={20} /> 支付 9.9 元
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* 支付方式选项卡 */}
          <div className="flex border-b">
            <button
              onClick={() => setMethod("wechat")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                method === "wechat"
                  ? "text-[#07C160] border-b-2 border-[#07C160] bg-[#07C160]/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              微信支付
            </button>
            <button
              onClick={() => setMethod("alipay")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                method === "alipay"
                  ? "text-[#1677FF] border-b-2 border-[#1677FF] bg-[#1677FF]/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              支付宝
            </button>
          </div>

          {/* 随机二维码区域 */}
          <div className="p-6 flex flex-col items-center">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-inner">
              <canvas
                ref={canvasRef}
                width="200"
                height="200"
                className="w-48 h-48"
                style={{ width: "192px", height: "192px" }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              请使用{method === "wechat" ? "微信" : "支付宝"}扫描上方二维码支付<br />
              支付完成后点击下方按钮
            </p>
          </div>

          {/* 已支付按钮 + 加载状态 */}
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`w-full py-3 rounded-full font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isConfirming
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#112A23] to-[#1a4d3f] hover:scale-[1.02]"
              }`}
            >
              {isConfirming ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  处理中...
                </>
              ) : (
                "我已完成支付"
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              * 当前网络环境安全，请放心支付
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
// ---------- 主组件 ----------
const JadeAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"appraisal" | "classification">("appraisal");

  const [normalImage, setNormalImage] = useState<string | null>(null);
  const [lightImage, setLightImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [currentTask, setCurrentTask] = useState<{
    taskId: number;
    category: string;
    fullReport?: string;
    paid: boolean;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const normalInputRef = useRef<HTMLInputElement>(null);
  const lightInputRef = useRef<HTMLInputElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "normal" | "light" | "single"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        if (type === "normal") setNormalImage(base64String);
        else if (type === "light") setLightImage(base64String);
        else if (type === "single") setSingleImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAppraisal = async () => {
    if (!normalImage || !lightImage) {
      setError("请同时上传自然光照片和透光照片，以便AI更准确地鉴别。");
      return;
    }
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const text = await analyzeJadeImages(normalImage, lightImage);
      setResult(text);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleIdentification = async () => {
    if (!singleImage) {
      setError("请上传一张玉石照片。");
      return;
    }
    setIdentifying(true);
    setError(null);
    setCurrentTask(null);
    try {
      const { taskId, category } = await identifyJadeCategory(singleImage);
      setCurrentTask({ taskId, category, paid: false });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIdentifying(false);
    }
  };

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (method: "wechat" | "alipay") => {
    if (!currentTask) return;
    
    setShowPaymentModal(false);
    setIsPaying(true);
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("请先登录后再解锁完整报告");
        setIsPaying(false);
        return;
      }
      await api.payTask(currentTask.taskId);
      const fullReport = await getTaskFullReport(currentTask.taskId);
      setCurrentTask({ ...currentTask, fullReport, paid: true });
    } catch (err) {
      alert((err as Error).message || "解锁失败，请稍后重试");
    } finally {
      setIsPaying(false);
    }
  };

  const reset = () => {
    setNormalImage(null);
    setLightImage(null);
    setSingleImage(null);
    setResult(null);
    setCurrentTask(null);
    setError(null);
    setShowPaymentModal(false);
    setIsPaying(false);
  };

  return (
    <section id="analyzer" className="py-12 md:py-24 bg-[#fdfcf8] relative min-h-screen">
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#112A23]/5 to-transparent"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 md:mb-10 space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center p-3 md:p-4 bg-[#112A23] text-[#d4af37] rounded-full mb-2 shadow-lg">
            <Scan size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#112A23] mb-2 serif px-2">
            AI 智能鉴赏中心 · 四会行家视角
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4">
            依托通义千问多模态能力，从种水、工艺细节到潜在瑕疵风险，为你生成结构化的翡翠鉴赏报告，帮助看懂每一块四会好料。
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px] sm:text-xs md:text-sm">
            <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              多模态图像分析
            </span>
            <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              专业 Markdown 鉴赏报告
            </span>
            <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
              四会行家 Prompt 定制
            </span>
          </div>
        </div>

        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-gray-100 p-1 rounded-full flex flex-wrap justify-center gap-1 md:gap-0">
            <button
              onClick={() => { setActiveTab("appraisal"); reset(); }}
              className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === "appraisal" ? "bg-[#112A23] text-white shadow-md" : "text-gray-500 hover:text-[#112A23]"}`}
            >
              <div className="flex items-center gap-1 md:gap-2">
                <Sparkles size={14} className="md:w-4 md:h-4" /> 种水色工鉴定
              </div>
            </button>
            <button
              onClick={() => { setActiveTab("classification"); reset(); }}
              className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === "classification" ? "bg-[#112A23] text-white shadow-md" : "text-gray-500 hover:text-[#112A23]"}`}
            >
              <div className="flex items-center gap-1 md:gap-2">
                <Tag size={14} className="md:w-4 md:h-4" /> 玉石品种识别
              </div>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-8 md:mb-10 grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="bg-white/90 rounded-xl md:rounded-2xl border border-gray-100 px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm text-gray-600 shadow-md">
            <div className="flex items-center gap-2 mb-2 text-[#112A23] font-semibold">
              <Info size={14} /> 如何使用
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] md:text-xs">
              <li>“鉴定”模式：上传一张自然光照 + 一张打光/手电照，建议为同一块料的不同角度。</li>
              <li>“识别”模式：上传单张照片，由 AI 帮你判断大致品种、色根、裂纹风险等信息。</li>
              <li>所有结果仅供学习交流参考，不构成投资或买卖定价建议。</li>
            </ul>
          </div>
          <div className="hidden md:flex flex-col justify-center gap-2 text-xs text-gray-500">
            <p>· 建议使用清晰无遮挡的 JPG/PNG，避免过度美颜和强滤镜。</p>
            <p>· 可以多次上传不同光线、不同角度的照片，对比观察 AI 的判断。</p>
            <p>· 若上传的是玻璃、塑料等仿品，报告中会给出相应风险提示。</p>
          </div>
        </div>

        {activeTab === "appraisal" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <p className="text-center text-gray-500 mb-6 md:mb-8 text-xs md:text-sm">
              深度鉴定模式：需要上传【自然光】与【透光】两张照片，从五个维度深度评测。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
              <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center group hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-base md:text-lg font-bold text-[#112A23] mb-2 flex items-center gap-2">
                  <Sun size={18} className="text-orange-500 md:w-5 md:h-5" /> 自然光照片
                </h3>
                <p className="text-xs text-gray-500 mb-3 md:mb-4 text-center">用于观察玉石的整体器型、颜色饱和度及表面光泽。</p>
                <div
                  className="w-full h-48 sm:h-56 md:h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative"
                  onClick={() => normalInputRef.current?.click()}
                >
                  {normalImage ? (
                    <>
                      <img src={`data:image/jpeg;base64,${normalImage}`} alt="Normal Light" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">点击更换</div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Upload className="mx-auto mb-2 w-8 h-8 md:w-10 md:h-10" />
                      <span className="text-xs md:text-sm">点击或拖拽上传</span>
                    </div>
                  )}
                </div>
                <input ref={normalInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "normal")} />
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center group hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-base md:text-lg font-bold text-[#112A23] mb-2 flex items-center gap-2">
                  <Zap size={18} className="text-[#d4af37] md:w-5 md:h-5" /> 透光/手电光照片
                </h3>
                <p className="text-xs text-gray-500 mb-3 md:mb-4 text-center">请从背面打灯。用于观察内部结构、棉絮、裂纹及种水。</p>
                <div
                  className="w-full h-48 sm:h-56 md:h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative"
                  onClick={() => lightInputRef.current?.click()}
                >
                  {lightImage ? (
                    <>
                      <img src={`data:image/jpeg;base64,${lightImage}`} alt="Flashlight" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">点击更换</div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Upload className="mx-auto mb-2 w-8 h-8 md:w-10 md:h-10" />
                      <span className="text-xs md:text-sm">点击或拖拽上传</span>
                    </div>
                  )}
                </div>
                <input ref={lightInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "light")} />
              </div>
            </div>

            <div className="flex justify-center mb-10 md:mb-12">
              <button
                onClick={handleAppraisal}
                disabled={analyzing}
                className={`px-8 md:px-12 py-3 md:py-4 rounded-full text-base md:text-lg font-bold shadow-2xl transition-all flex items-center gap-2 md:gap-3 ${analyzing ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#112A23] to-[#1a4d3f] text-white hover:scale-105 hover:shadow-[#112A23]/40"}`}
              >
                {analyzing ? (
                  <><div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>深度分析中...</>
                ) : (
                  <><Scan className="text-[#d4af37] w-4 h-4 md:w-5 md:h-5" />生成种水色工报告</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "classification" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <p className="text-center text-gray-500 mb-6 md:mb-8 text-xs md:text-sm">
              快速识别模式：上传一张照片，AI 自动识别玉石品种、雕刻题材及寓意。
            </p>

            <div className="max-w-md mx-auto bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center mb-8 md:mb-10">
              <h3 className="text-base md:text-lg font-bold text-[#112A23] mb-2 flex items-center gap-2">
                <Camera size={18} className="text-[#112A23] md:w-5 md:h-5" /> 玉石照片
              </h3>
              <div
                className="w-full h-48 sm:h-56 md:h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative"
                onClick={() => singleInputRef.current?.click()}
              >
                {singleImage ? (
                  <>
                    <img src={`data:image/jpeg;base64,${singleImage}`} alt="Single Jade" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">点击更换</div>
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    <Upload className="mx-auto mb-2 w-8 h-8 md:w-10 md:h-10" />
                    <span className="text-xs md:text-sm">点击或拖拽上传</span>
                  </div>
                )}
              </div>
              <input ref={singleInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "single")} />
            </div>

            <div className="flex justify-center mb-10 md:mb-12">
              <button
                onClick={handleIdentification}
                disabled={identifying}
                className={`px-8 md:px-12 py-3 md:py-4 rounded-full text-base md:text-lg font-bold shadow-2xl transition-all flex items-center gap-2 md:gap-3 ${identifying ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#112A23] to-[#1a4d3f] text-white hover:scale-105 hover:shadow-[#112A23]/40"}`}
              >
                {identifying ? (
                  <><div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>AI 识别中...</>
                ) : (
                  <><Search className="text-[#d4af37] w-4 h-4 md:w-5 md:h-5" />识别玉石类别</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto p-3 md:p-4 bg-red-50 text-red-800 rounded-lg mb-6 md:mb-8 border border-red-100 flex items-center gap-2 animate-bounce text-sm md:text-base">
            <Info size={16} className="md:w-5 md:h-5" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence>
          {(result || currentTask) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden border-t-4 border-[#d4af37]"
            >
              <div className="bg-[#fcfbf9] px-4 py-4 md:px-8 md:py-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2 md:gap-3">
                  <BookOpen className="text-[#112A23] w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="text-xl md:text-2xl font-bold text-[#112A23] serif">
                    {activeTab === "appraisal" ? "专业鉴定报告" : "智能识别结果"}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[#112A23] text-white text-[10px] md:text-xs rounded-full">AI 智能分析</span>
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[#d4af37] text-white text-[10px] md:text-xs rounded-full">千问视觉</span>
                </div>
              </div>
              <div className="p-4 md:p-12 prose prose-sm md:prose-stone max-w-none prose-headings:font-serif prose-headings:text-[#112A23] prose-p:text-gray-700 prose-li:text-gray-700">
                {activeTab === "appraisal" ? (
                  result && <ReactMarkdown>{result}</ReactMarkdown>
                ) : currentTask ? (
                  currentTask.paid ? (
                    <ReactMarkdown>{currentTask.fullReport || ""}</ReactMarkdown>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="text-2xl font-bold text-[#112A23] py-8">
                        🔍 {currentTask.category}
                      </div>
                      <button
                        onClick={handleOpenPaymentModal}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold shadow-2xl hover:scale-105 transition-transform text-lg"
                      >
                        <Sparkles className="w-5 h-5" />
                        解锁完整报告 (9.9元)
                      </button>
                      <p className="text-xs text-gray-400">
                        解锁后可查看品种、器型、雕刻题材、材质特征及寓意解读
                      </p>
                    </div>
                  )
                ) : null}
              </div>
              <div className="bg-gray-50 px-4 py-4 md:px-8 md:py-6 text-center border-t border-gray-100">
                <button
                  onClick={reset}
                  className="text-xs md:text-sm font-medium text-[#112A23] hover:text-[#d4af37] transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <Camera size={14} className="md:w-4 md:h-4" /> 鉴别下一块玉石
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
      />

      <PayingOverlay isActive={isPaying} />
    </section>
  );
};

export default JadeAnalyzer;