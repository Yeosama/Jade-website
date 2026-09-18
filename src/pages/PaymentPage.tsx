import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, QrCode, Loader2, ArrowLeft } from "lucide-react";
import api from "../api";
import { getTaskFullReport } from "../utils/gemini";

interface PaymentPageProps {
  onBack: () => void;       // 返回首页
  onPaymentSuccess: (taskId: number, fullReport: string) => void; // 成功回调
}

// 生成随机二维码图案（纯 Canvas 绘制，无文字）
const RandomQRCanvas: React.FC<{ method: "wechat" | "alipay" }> = ({ method }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 随机种子：基于 method + 时间戳生成不同的格子布局
    const seed = `${method}-${Date.now()}-${Math.random()}`;
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    };
    const rng = (max: number) => hash(seed + Math.random()) % max;

    const size = 200;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000000";
    const blockSize = size / 25; // 25x25 网格
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // 模拟二维码的定位图案（角落留出大方块）
        const isCorner =
          (i < 7 && j < 7) || (i < 7 && j > 17) || (i > 17 && j < 7);
        let fill = false;
        if (isCorner) {
          fill = (i < 3 && j < 3) || (i > 4 && i < 7 && j > 4 && j < 7) ||
                 (i < 3 && j > 4 && j < 7) || (i > 4 && i < 7 && j < 3);
          fill = !fill; // 取反，让定位框明显
        } else {
          fill = (rng(100) < 45); // 随机填充 45% 的黑块
        }
        if (fill) {
          ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize);
        }
      }
    }
    // 再叠加随机噪点
    for (let k = 0; k < 300; k++) {
      const x = rng(size);
      const y = rng(size);
      ctx.fillStyle = Math.random() > 0.5 ? "#000000" : "#ffffff";
      ctx.fillRect(x, y, 2, 2);
    }
  }, [method]);

  return (
    <canvas
      ref={canvasRef}
      className="w-48 h-48 border-2 border-gray-200 rounded-xl shadow-inner bg-white"
    />
  );
};

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack, onPaymentSuccess }) => {
  const [method, setMethod] = useState<"wechat" | "alipay">("wechat");
  const [isPaying, setIsPaying] = useState(false);
  const [taskId, setTaskId] = useState<number | null>(null);

  useEffect(() => {
    // 从 localStorage 读取待支付的任务 ID
    const pending = localStorage.getItem("pending_pay_task");
    if (pending) {
      setTaskId(parseInt(pending, 10));
    } else {
      alert("支付会话已过期，请重新识别");
      onBack();
    }
  }, [onBack]);

  const handleConfirmPayment = async () => {
    if (!taskId) return;
    setIsPaying(true);
    // 模拟支付等待 4 秒
    await new Promise((resolve) => setTimeout(resolve, 4000));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("请先登录");
        setIsPaying(false);
        onBack();
        return;
      }
      // 调用真实支付接口（后端更新 is_paid = 1）
      await api.payTask(taskId);
      // 获取完整报告
      const fullReport = await getTaskFullReport(taskId);
      // 存储到 localStorage，供首页鉴定模块读取
      localStorage.setItem(
        "paid_report",
        JSON.stringify({ taskId, fullReport, category: "" })
      );
      // 清除待支付标记
      localStorage.removeItem("pending_pay_task");
      onPaymentSuccess(taskId, fullReport);
    } catch (err) {
      alert((err as Error).message || "解锁失败，请稍后重试");
      setIsPaying(false);
    }
  };

  if (isPaying) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#d4af37] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#112A23] mb-2">正在解锁报告</h3>
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
            <div className="bg-[#d4af37] h-2.5 rounded-full w-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
          <p className="text-gray-500">AI 正在为您生成深度报告，请稍候...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-500 hover:text-[#112A23] mb-4"
        >
          <ArrowLeft size={20} /> 返回
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b bg-[#fdfcf8]">
            <h2 className="text-2xl font-bold text-[#112A23] flex items-center gap-2">
              <CreditCard className="text-[#d4af37]" /> 支付 9.9 元
            </h2>
            <p className="text-gray-500 text-sm mt-1">解锁完整鉴定报告</p>
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

          {/* 随机二维码区域（无文字） */}
          <div className="p-6 flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl">
              <RandomQRCanvas method={method} />
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              请使用{method === "wechat" ? "微信" : "支付宝"}扫描上方二维码
            </p>
          </div>

          {/* 已支付按钮 */}
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={handleConfirmPayment}
              className="w-full py-3 bg-gradient-to-r from-[#112A23] to-[#1a4d3f] text-white rounded-full font-bold hover:scale-[1.02] transition-transform"
            >
              我已完成支付
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">
              * 此为模拟支付环境，仅供功能演示
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;