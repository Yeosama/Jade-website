// src/api.js

// 辅助函数：获取 token
const getToken = () => localStorage.getItem("token");
// 命名导出（必须存在）
const API_BASE = '/api';
export const IMAGE_BASE = '';   // 空字符串表示使用当前域名

// 带文件上传的请求（用于发帖）
async function uploadPost(formData) {
  const url = `${API_BASE}/posts`;
  const token = getToken();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // 注意：不要设置 Content-Type，让浏览器自动加上 boundary
    },
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "发帖失败");
  }
  return response.json();
}

// 通用请求函数
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const config = {
    ...options,
    headers,
  };
  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "请求失败");
  }
  return response.json();
}

// 默认导出对象
export default {
  updatePostWithImages: (postId, title, content, deleteImages, newImages) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('delete_images', JSON.stringify(deleteImages));
    newImages.forEach(img => formData.append('newImages', img));
    
    const token = getToken();
    return fetch(`${API_BASE}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(async res => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '更新失败');
      }
      return res.json();
    });
  },
  deletePost: (postId) => request(`/posts/${postId}`, { method: 'DELETE' }),
  updatePost: (postId, title, content) => 
    request(`/posts/${postId}`, { method: 'PUT', body: JSON.stringify({ title, content }) }),
  deleteComment: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),
  register: (data) =>
    request("/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    request("/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => request("/me"),
  likePost: (postId) => request(`/posts/${postId}/like`, { method: "POST" }),
  getPosts: (page = 1, limit = 10) => request(`/posts?page=${page}&limit=${limit}`),
  createPost: (formData) => uploadPost(formData),
  tryOn: (personImageBase64, jadeImageBase64, prompt) =>
    request("/tryon", {
      method: "POST",
      body: JSON.stringify({
        personImage: personImageBase64,
        jadeImage: jadeImageBase64,
        prompt,
      }),
    }),
  getPost: (id) => request(`/posts/${id}`),
  getUserProfile: () => request('/user/profile'),
  updateUserProfile: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(async res => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '更新失败');
      }
      return res.json();
    });
  },
  generateImage: (data) =>
    request("/generate-image", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    addComment: (postId, content) => 
      request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  payTask: (taskId) => request(`/tasks/${taskId}/pay`, { method: 'POST' }),
  getTaskResult: (taskId) => request(`/tasks/${taskId}`),  
  // src/api/index.js
  tryOnAutomation: async (personImageFile, jadeImageFile, prompt) => {
    const formData = new FormData();
    formData.append("personImage", personImageFile);
    formData.append("jadeImage", jadeImageFile);
    formData.append("prompt", prompt);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/tryon-automation`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "请求失败");
    }
    return response.json();
  },
  unlockAnalysis: () => request('/unlock-analysis', { method: 'POST' }),
    // --- 交易相关 ---
  // 商户申请/续费
  applyMerchant: (data) => request('/merchant/apply', { method: 'POST', body: JSON.stringify(data) }),
  getMerchantInfo: () => request('/merchant/info'),

  // 商品发布（图片用 FormData）
  createProduct: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(res => res.json());
  },
  // 商户自己的商品列表
  getMerchantProducts: (page = 1) => request(`/merchant/products?page=${page}`),
  // 编辑商品
  updateProduct: (productId, formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(res => res.json());
  },
  // 下架商品
  deleteProduct: (productId) => request(`/products/${productId}`, { method: 'DELETE' }),

  // 公用商品列表
  getProducts: (page = 1, limit = 12, category = '') => {
    let url = `/products?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    return request(url);
  },
  getProductDetail: (id) => request(`/products/${id}`),

  // 购物车
  addToCart: (productId, quantity) => request('/cart', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
  getCart: () => request('/cart'),
  updateCartItem: (cartId, quantity) => request(`/cart/${cartId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (cartId) => request(`/cart/${cartId}`, { method: 'DELETE' }),

  // 订单
  checkout: (address) => request('/orders', { method: 'POST', body: JSON.stringify({ address }) }),
  payOrder: (orderId) => request(`/orders/${orderId}/pay`, { method: 'PUT' }),
  getOrders: () => request('/orders'),
  getOrderDetail: (orderId) => request(`/orders/${orderId}`),
};

export const getImageUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : IMAGE_BASE + url;
};