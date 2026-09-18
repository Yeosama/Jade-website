import React, { useState, useRef } from 'react';
import api from '../api'; // 假设我们通过后端代理请求

const ImageGenerator: React.FC = () => {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!inputImage || !prompt.trim()) {
      alert('请上传图片并输入提示词');
      return;
    }

    setLoading(true);
    try {
      // 调用后端代理接口，将图片 base64 和 prompt 发送
      const response = await api.generateImage({
        imageBase64: inputImage.split(',')[1], // 去除 data:image/...;base64,
        prompt,
      });
      setGeneratedImage(response.imageUrl); // 后端返回生成的图片 URL 或 base64
    } catch (err) {
      console.error(err);
      alert('生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">图生图 · AI 创作</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：上传区和输入 */}
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#d4af37]"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            {inputImage ? (
              <img src={inputImage} alt="原图" className="max-h-48 mx-auto object-contain" />
            ) : (
              <div className="py-12 text-gray-500">点击上传参考图片</div>
            )}
          </div>

          <textarea
            placeholder="描述你想要的生成效果，例如：将翡翠变成冰种玻璃质感，加金色流苏..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-[#d4af37] text-[#112A23] font-bold rounded-lg hover:bg-[#c29f30] disabled:opacity-50"
          >
            {loading ? '生成中...' : '开始生成'}
          </button>
        </div>

        {/* 右侧：生成结果 */}
        <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-center bg-gray-50">
          {generatedImage ? (
            <img src={generatedImage} alt="生成结果" className="max-h-64 object-contain" />
          ) : (
            <p className="text-gray-400">生成的新图片将显示在这里</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;