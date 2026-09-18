// src/utils/gemini.ts
// 注意：此文件已不再直接调用 Gemini，而是通过后端代理

const API_BASE = '/api';

export const analyzeJadeImages = async (
  normalImageBase64: string,
  lightImageBase64: string
): Promise<string> => {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      normalImage: normalImageBase64,
      lightImage: lightImageBase64
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '分析失败');
  }
  const data = await response.json();
  return data.result;
};

// 修改返回值为对象，包含报告内容和是否完整标记
const getToken = () => localStorage.getItem("token");

export const identifyJadeCategory = async (
  imageBase64: string
): Promise<{ taskId: number; category: string; isFull: boolean }> => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/identify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '识别失败');
  }
  const data = await response.json();
  return { taskId: data.taskId, category: data.category, isFull: false };
};

// 新增获取任务完整报告
export const getTaskFullReport = async (taskId: number): Promise<string> => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/tasks/${taskId}`, { headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '获取报告失败');
  }
  const data = await response.json();
  return data.fullReport;
};