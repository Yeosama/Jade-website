// src/pages/TryOnPage.tsx
import React, { useState, useRef } from "react";
import { Upload, Sparkles, Info, Download } from "lucide-react";
import api from "../api";
import ReactMarkdown from "react-markdown";
import Footer from "../components/Footer";

interface TryOnPageProps {
  onBack: () => void;
}

const TryOnPage: React.FC<TryOnPageProps> = ({ onBack }) => {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [jadeImage, setJadeImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const jadeInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        setter(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // 校验：未上传图片时，设置错误并返回，按钮不会变灰
    if (!personImage || !jadeImage) {
      setError("请同时上传人物照片和需要佩戴的玉石照片");
      return;
    }
    setError(null); // 清除旧错误
    setLoading(true);
    setGeneratedImage(null);
    setDescription(null);

    try {
      const result = await api.tryOn(
        personImage,
        jadeImage,
        prompt || undefined
      );
      if (result.image) {
        setGeneratedImage(`data:image/jpeg;base64,${result.image}`);
        if (result.description) setDescription(result.description);
      } else if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
      } else {
        setError("生成失败，请重试");
      }
    } catch (err: any) {
      setError(err.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setPersonImage(null);
    setJadeImage(null);
    setPrompt("");
    setGeneratedImage(null);
    setDescription(null);
    setError(null);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "ai-tryon.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-gray-900 relative pt-16">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16 relative z-10">
        {/* 顶部导航 - 居中显示 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold serif text-[#112A23]">
            AI 试戴 · 虚拟搭配
          </h1>
          <p className="text-gray-600 mt-2">
            上传人物照片和玉石照片，AI 将生成佩戴效果图
          </p>
        </div>

        {/* 双图上传区 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* 人物照片 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-[#d4af37]">👤</span> 人物照片
            </h2>
            <div
              className="w-full h-80 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative"
              onClick={() => personInputRef.current?.click()}
            >
              {personImage ? (
                <>
                  <img
                    src={`data:image/jpeg;base64,${personImage}`}
                    alt="人物"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                    点击更换
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <Upload className="mx-auto mb-2 w-10 h-10" />
                  <span className="text-sm">点击上传人物照片</span>
                </div>
              )}
            </div>
            <input
              ref={personInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e, setPersonImage)}
            />
          </div>

          {/* 玉石照片 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-[#d4af37]">💎</span> 玉石照片
            </h2>
            <div
              className="w-full h-80 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative"
              onClick={() => jadeInputRef.current?.click()}
            >
              {jadeImage ? (
                <>
                  <img
                    src={`data:image/jpeg;base64,${jadeImage}`}
                    alt="玉石"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                    点击更换
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <Upload className="mx-auto mb-2 w-10 h-10" />
                  <span className="text-sm">点击上传玉石照片</span>
                </div>
              )}
            </div>
            <input
              ref={jadeInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e, setJadeImage)}
            />
          </div>
        </div>

        {/* 提示词输入框 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            自定义提示词（可选）
          </label>
          <textarea
            id="prompt"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：把图2的项链佩戴在图1人物的脖子上，保持自然光线和皮肤质感"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#d4af37] focus:outline-none"
          />
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Info size={12} />
            <span>
              不填则使用默认提示词：把图2中的玉石佩戴在图1的人物身上，保持自然真实的效果
            </span>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`
              px-12 py-4 rounded-full text-lg font-bold shadow-2xl transition-all flex items-center gap-3
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#112A23] to-[#1a4d3f] text-white hover:scale-105 hover:shadow-[#112A23]/40"
              }
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                AI 生成中...
              </>
            ) : (
              <>
                <Sparkles className="text-[#d4af37]" />
                开始试戴
              </>
            )}
          </button>
        </div>

        {/* 错误提示 - 带弹跳动画 */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 bg-red-50 text-red-800 rounded-lg mb-8 border border-red-100 flex items-center gap-2 animate-bounce">
            <Info size={18} />
            {error}
          </div>
        )}

        {/* 结果展示 */}
        {generatedImage && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-[#d4af37]">
            <div className="bg-[#fcfbf9] px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#112A23]" />
                <h3 className="text-2xl font-bold text-[#112A23] serif">
                  AI 试戴效果
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadImage}
                  className="px-3 py-1 bg-[#d4af37] text-white text-xs rounded-full flex items-center gap-1 hover:bg-[#c29f30] transition"
                >
                  <Download size={14} /> 下载图片
                </button>
                <span className="px-3 py-1 bg-[#d4af37] text-white text-xs rounded-full">
                  即梦4.0
                </span>
              </div>
            </div>
            <div className="p-8">
              {/* 图片居中显示 */}
              <div className="flex justify-center mb-6">
                <img
                  src={generatedImage}
                  alt="AI生成试戴效果"
                  className="max-w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: "70vh" }}
                />
              </div>
              {description && (
                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-[#112A23]">
                  <ReactMarkdown>{description}</ReactMarkdown>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
              <button
                onClick={reset}
                className="text-sm font-medium text-[#112A23] hover:text-[#d4af37] transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Upload size={16} /> 重新上传图片
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TryOnPage;
