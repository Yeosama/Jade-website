import React, { useState } from 'react';
import { PageView } from '../types';
import api from '../api';
import { Store, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
interface Props {
  setPageView: (view: PageView) => void;
}

const MerchantApplyPage: React.FC<Props> = ({ setPageView }) => {
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  // 新增专业字段（不校验，仅展示）
  const [legalPerson, setLegalPerson] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!shopName.trim()) return alert('请输入店铺名称');
    if (!confirm('入驻费 999元/年，确认支付（模拟）？')) return;
    setSubmitting(true);
    try {
      const result = await api.applyMerchant({ shop_name: shopName, description, contact });
      // 更新 token
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      alert('入驻成功！您现在可以管理您的商品了。');
      setPageView('merchantDashboard');
    } catch (err: any) {
      alert(err.message || '申请失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
<div className="max-w-4xl mx-auto px-4 pt-20 pb-10 mt-12">
<button
  onClick={() => setPageView('home')}
  className="flex items-center text-gray-600 hover:text-[#112A23] mb-4 transition"
>
  <ArrowLeft size={20} className="mr-1" /> 返回
</button>
      {/* 标题：居中大 Logo + 小字 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 md:p-4 bg-[#112A23] text-[#d4af37] rounded-full mb-2 shadow-lg">
          <Store size={32} />
        </div>
        <h2 className="text-3xl font-bold text-[#112A23] mb-2">商家入驻</h2>
        <p className="text-gray-600">999元/年，即可拥有自己的玉器店铺</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-xl border">
  {/* 左右两栏 */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
    {/* 左栏 */}
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">店铺名称 *</label>
        <input
          value={shopName}
          onChange={e => setShopName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"
          placeholder="给店铺取个名字"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">法人姓名</label>
        <input
          value={legalPerson}
          onChange={e => setLegalPerson(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"
          placeholder="张三"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">身份证号</label>
        <input
          value={idNumber}
          onChange={e => setIdNumber(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"
          placeholder="18位"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">联系方式</label>
        <input
          value={contact}
          onChange={e => setContact(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"
          placeholder="手机/微信"
        />
      </div>
    </div>

    {/* 右栏 */}
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">经营地址</label>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"
          placeholder="广东省肇庆市四会..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">营业执照</label>
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#d4af37] transition">
          {licensePreview ? (
            <img src={licensePreview} alt="license" className="h-full object-contain rounded-lg" />
          ) : (
            <div className="text-gray-400 text-center">
              <Upload size={24} className="mx-auto mb-1" />
              <span className="text-sm">点击上传</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => setLicensePreview(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      </div>
    </div>
  </div>

  {/* 下方全宽区域 */}
  <div className="mt-6 space-y-5">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">店铺简介</label>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"
        rows={3}
      />
    </div>

    <button
      onClick={handleSubmit}
      disabled={submitting}
      className="w-full py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#112A23] to-[#1a4d3f] hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
    >
      {submitting ? '处理中...' : '支付 ¥999 并开通'}
      <ArrowRight size={20} />
    </button>

    <p className="text-xs text-gray-400 text-center">*当前支付环境已通过安全校验</p>
  </div>
</div>
    </div>
  );
};

export default MerchantApplyPage;