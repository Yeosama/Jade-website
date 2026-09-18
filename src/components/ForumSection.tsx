// src/pages/ForumPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle } from "lucide-react";
import CreatePostModal from "../components/forum/CreatePostModal";
import api, { IMAGE_BASE } from "../api";
import { PageView } from "../types";
import ImagePreviewModal from "../components/forum/ImagePreviewModal";

// 类型定义
interface PostItem {
  id: number;
  title: string;
  username: string;
  avatar?: string;
  content: string;
  first_image?: string;
  created_at: string;
  comment_count: number;
  likes?: number;
  has_liked?: boolean; // 新增
}

interface PostDetail extends PostItem {
  images: string[];
  replies: Reply[];
}

interface Reply {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  created_at: string;
}

interface ForumPageProps {
  onOpenLogin: () => void;
  setPageView: (view: PageView) => void;
  refreshKey: number;
  userRefreshKey: number;
  onEditPost: (postId: number) => void; // 新增
  openPostId?: number | null;
  onClearOpenPostId?: () => void;
}

const ForumPage: React.FC<ForumPageProps> = ({
  onOpenLogin,
  setPageView,
  refreshKey,
  userRefreshKey,
  onEditPost,
  openPostId,
  onClearOpenPostId,
}) => {
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [deleteImageUrls, setDeleteImageUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const currentPageRef = useRef(1);
  const loadingMoreRef = useRef(false);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const PostCard = React.memo(
    ({ post, onClick }: { post: PostItem; onClick: () => void }) => (
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
        onClick={onClick}
      >
        {post.first_image && (
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={
                post.first_image?.startsWith("http")
                  ? post.first_image
                  : `${IMAGE_BASE}${post.first_image}`
              }
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-4 flex flex-col">
          <h2
            className="text-lg font-bold text-gray-900 mb-1"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.title}
          </h2>
          <p
            className="text-sm text-gray-600 mb-3"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.content}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <img
                src={
                  post.avatar
                    ? post.avatar.startsWith("http")
                      ? post.avatar
                      : `${IMAGE_BASE}${post.avatar}`
                    : "https://api.dicebear.com/9.x/initials/svg?seed=default&backgroundType=gradientLinear&size=64"
                }
                alt={post.username}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs text-gray-500 max-w-[4.5rem] md:max-w-none truncate">
                {post.username}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart
                  size={14}
                  className={
                    post.has_liked
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                  }
                />
                {post.likes ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} className="text-gray-400" />
                {post.comment_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // handleSubmitReply 函数修改
  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      alert("请输入内容");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      onOpenLogin();
      return;
    }
    setSubmitting(true);
    try {
      await api.addComment(selectedPost!.id, replyContent);
      setReplyContent("");
      // 重新获取帖子详情以刷新评论列表
      const updatedDetail = await api.getPost(selectedPost!.id);
      setSelectedPost(updatedDetail);
      // 同时更新帖子列表中的评论数
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPost!.id
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post
        )
      );
    } catch (err: any) {
      alert(err.message || "评论失败");
    } finally {
      setSubmitting(false);
    }
  };
  // 获取帖子列表

  const INITIAL_LIMIT = 8; // 初始加载数量（两排）
  const LOAD_MORE_LIMIT = 4; // 每次滚动加载数量（一排）

  // 修改 fetchPosts 函数
  const fetchPosts = async (pageNum: number, append = false) => {
    const limit = append ? LOAD_MORE_LIMIT : INITIAL_LIMIT;
    if (append && loadingMoreRef.current) return;
    if (append) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await api.getPosts(pageNum, limit);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        if (append) {
          setPosts((prev: PostItem[]) => {
            const newPosts = data.filter((newPost: PostItem) => !prev.some((p: PostItem) => p.id === newPost.id));
            if (newPosts.length > 0) {
              return [...prev, ...newPosts];
            }
            return prev;
          });
          currentPageRef.current = pageNum;
        } else {
          setPosts(data);
          currentPageRef.current = 1;
        }
      }
    } catch (err) {
      console.error("加载帖子失败", err);
    } finally {
      if (append) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const refreshPostList = async () => {
    setPage(1);
    setHasMore(true);
    await fetchPosts(1, false);
  };
  // 1. 处理外部传入的 openPostId，打开对应的帖子详情
  useEffect(() => {
    if (openPostId && posts.length > 0) {
      const post = posts.find((p) => p.id === openPostId);
      if (post) {
        handlePostClick(post);
        onClearOpenPostId?.();
      }
    }
  }, [openPostId, posts]);

  // 2. 获取当前登录用户（依赖刷新键）
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem("token"));
    } else {
      setUser(null);
    }
  }, [refreshKey, userRefreshKey]);

  // 3. 初始加载帖子（依赖 refreshKey，如发帖成功或切换页面时重置）
  useEffect(() => {
    currentPageRef.current = 1;
    setHasMore(true);
    fetchPosts(1, false);
  }, [refreshKey]);

  // 4. 滚动加载更多（监听列表容器的滚动事件）
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (loadingMoreRef.current || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight + 200 >= scrollHeight) {
        const nextPage = currentPageRef.current + 1;
        fetchPosts(nextPage, true);
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore]);
  // 点击帖子，获取详情
  const handlePostClick = async (post: PostItem) => {
    try {
      const detail = await api.getPost(post.id);
      setSelectedPost(detail);
    } catch (err) {
      console.error("获取帖子详情失败", err);
    }
  };

  // 点赞处理
  const handleLike = async (postId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      onOpenLogin();
      return;
    }

    try {
      const result = await api.likePost(postId);
      const { liked, likes } = result;

      // 更新列表中的点赞状态
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes, has_liked: liked } : p
        )
      );
      // 更新详情页中的点赞状态
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost((prev) =>
          prev ? { ...prev, likes, has_liked: liked } : null
        );
      }
    } catch (err) {
      console.error("点赞失败", err);
    }
  };

  const handleBackToList = () => setSelectedPost(null);

  const handleEditClick = () => {
    if (!selectedPost) return;
    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content);
    setExistingImages([...selectedPost.images]); // 复制现有图片 URL 数组
    setDeleteImageUrls([]);
    setEditImages([]);
    setEditImagePreviews([]);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPost) return; // 添加这行
    if (!editTitle.trim() || !editContent.trim()) {
      alert("标题和内容不能为空");
      return;
    }
    setEditing(true);
    try {
      await api.updatePostWithImages(
        selectedPost.id,
        editTitle,
        editContent,
        deleteImageUrls,
        editImages
      );
      // 刷新帖子详情
      const updatedDetail = await api.getPost(selectedPost.id);
      setSelectedPost(updatedDetail);
      // 刷新帖子列表
      setPage(1);
      setHasMore(true);
      // 刷新帖子列表
      await refreshPostList();
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || "更新失败");
    } finally {
      setEditing(false);
    }
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((url) => url !== imageUrl));
    setDeleteImageUrls((prev) => [...prev, imageUrl]);
  };

  const handleAddNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setEditImages((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleOpenCreateModal = () => {
    const token = localStorage.getItem("token");
    if (!token) onOpenLogin();
    else setIsCreateModalOpen(true);
  };
  const handlePostCreated = () => setIsCreateModalOpen(false);
  const openPreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  return (
    <div
      id="forum"
      className="min-h-screen bg-[#fdfcf8] text-gray-900 mt-16 md:mt-24"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-8 pb-16 relative z-10">
        {/* 顶部导航 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 md:p-4 bg-[#112A23] text-[#d4af37] rounded-full mb-2 shadow-lg">
            <MessageCircle size={24} className="md:w-8 md:h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold serif text-[#112A23]">
            玉石论坛 · 以玉会友
          </h1>
          <p className="text-gray-600 mt-2">分享收藏、请教鉴定、交流行情。</p>
        </div>
        <div className="flex justify-end mb-8">
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setPageView("create")}
              className="px-4 py-2 rounded-full bg-[#d4af37] text-[#112A23] text-sm hover:bg-[#c29f30] transition"
            >
              发帖
            </button>
            {user ? (
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setPageView("profile")}
              >
                <img
                  src={
                    user.avatar
                      ? user.avatar.startsWith("http")
                        ? user.avatar
                        : `${IMAGE_BASE}${user.avatar}`
                      : "https://api.dicebear.com/9.x/initials/svg?seed=default&backgroundType=gradientLinear&size=32"
                  }
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700">{user.username}</span>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-full border border-[#d4af37] text-[#d4af37] text-sm hover:bg-[#d4af37] hover:text-[#112A23] transition"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>

        {!selectedPost ? (
          /* 修改点：移除独立滚动容器，让页面整体滚动 */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 原有内容 */}
            <div className="min-w-[280px]">
              {" "}
              {/* 可选：限制最小宽度 */}
              <div
                ref={listContainerRef}
                className="bg-[#FAF7F2] rounded-xl p-5 shadow-sm border border-gray-200/80 max-h-[80vh] overflow-y-auto"
                style={{
                  overscrollBehavior: "contain",
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE/Edge
                }}
              >
                {/* 使用 Grid 布局代替 Columns，确保新帖子追加到末尾，骨架屏位于最后 */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => handlePostClick(post)}
                    />
                  ))}

                  {/* 骨架屏占位符 - 加载更多时显示，位于列表末尾 */}
                  {loadingMore &&
                    [...Array(LOAD_MORE_LIMIT)].map((_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg animate-pulse"
                      >
                        <div className="aspect-[4/3] bg-gray-200" />
                        <div className="p-4">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-full mb-3" />
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full" />
                              <div className="h-3 bg-gray-200 rounded w-12" />
                            </div>
                            <div className="flex gap-3">
                              <div className="h-3 bg-gray-200 rounded w-8" />
                              <div className="h-3 bg-gray-200 rounded w-8" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* 加载更多指示器（文字） */}
                {loadingMore && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#d4af37]" />
                    <span className="ml-2 text-gray-500">加载中...</span>
                  </div>
                )}
                {!hasMore && (
                  <div className="text-center py-4 text-gray-400">
                    已经到底啦~
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={handleBackToList}
              className="mb-4 md:mb-6 flex items-center gap-2 text-[#d4af37] hover:underline text-sm md:text-base"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              返回列表
            </button>

            <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl">
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-xl md:text-3xl font-bold serif text-[#112A23]">
                  {selectedPost.title}
                </h1>
                {user && user.username === selectedPost.username && (
                  <button
                    onClick={() => onEditPost(selectedPost.id)}
                    className="text-xs md:text-sm text-[#d4af37] hover:text-[#c29f30] border border-[#d4af37] px-2 py-1 md:px-3 md:py-1 rounded-full"
                  >
                    编辑
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                <span className="flex items-center gap-1">
                  <img
                    src={
                      selectedPost.avatar
                        ? selectedPost.avatar.startsWith("http")
                          ? selectedPost.avatar
                          : `${IMAGE_BASE}${selectedPost.avatar}`
                        : "https://api.dicebear.com/9.x/initials/svg?seed=default&backgroundType=gradientLinear&size=64"
                    }
                    className="w-5 h-5 rounded-full"
                  />
                  {selectedPost.username}
                </span>
                <span>📅 {formatDate(selectedPost.created_at)}</span>
              </div>
              <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-4 md:mb-6 whitespace-pre-wrap">
                {selectedPost.content}
              </p>
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
                  {selectedPost.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.startsWith("http") ? img : `${IMAGE_BASE}${img}`}
                      alt=""
                      className="w-full h-40 md:h-80 object-cover rounded-lg border border-gray-200 cursor-pointer"
                      onClick={() => openPreview(idx)}
                    />
                  ))}
                </div>
              )}
              <div className="border-t border-gray-200 pt-6 md:pt-8">
                <h2 className="text-lg md:text-xl font-bold serif text-[#112A23] mb-4 md:mb-6">
                  全部回复 · {selectedPost.replies.length}
                </h2>
                <div className="space-y-4 md:space-y-6">
                  {selectedPost.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex gap-3 md:gap-4 group relative"
                    >
                      <img
                        src={
                          reply.avatar
                            ? reply.avatar.startsWith("http")
                              ? reply.avatar
                              : `${IMAGE_BASE}${reply.avatar}`
                            : "https://api.dicebear.com/9.x/initials/svg?seed=default&backgroundType=gradientLinear&size=64"
                        }
                        alt={reply.author}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                          <span className="font-bold text-[#d4af37] text-sm md:text-base">
                            {reply.author}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base">
                          {reply.content}
                        </p>
                      </div>
                      {user && user.username === reply.author && (
                        <button
                          onClick={async () => {
                            if (confirm("确定要删除这条评论吗？")) {
                              try {
                                await api.deleteComment(reply.id);
                                const updatedDetail = await api.getPost(
                                  selectedPost.id
                                );
                                setSelectedPost(updatedDetail);
                                refreshPostList();
                              } catch (err: any) {
                                alert(err.message || "删除失败");
                              }
                            }
                          }}
                          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-xs md:text-sm bg-white px-2 py-1 rounded shadow"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    placeholder="写下你的评论..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 md:py-3 text-gray-900 placeholder-gray-400 focus:border-[#d4af37] outline-none text-sm md:text-base"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLike(selectedPost.id)}
                      className="px-4 py-2 md:px-4 md:py-3 rounded-lg font-bold flex items-center gap-2 transition bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm md:text-base"
                    >
                      <Heart
                        size={18}
                        className={
                          selectedPost.has_liked
                            ? "fill-red-500 text-red-500"
                            : "text-gray-500"
                        }
                      />
                      <span>{selectedPost.likes ?? 0}</span>
                    </button>
                    <button
                      onClick={handleSubmitReply}
                      disabled={submitting}
                      className="px-4 py-2 md:px-6 md:py-3 bg-[#d4af37] text-[#112A23] rounded-lg font-bold hover:bg-[#c29f30] transition disabled:opacity-50 text-sm md:text-base"
                    >
                      {submitting ? "发送中..." : "回复"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 编辑帖子模态框 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold serif text-[#112A23] mb-4">
              编辑帖子
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#d4af37] focus:outline-none"
                placeholder="标题"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#d4af37] focus:outline-none"
                placeholder="内容"
              />
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    现有图片
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={
                            url.startsWith("http") ? url : `${IMAGE_BASE}${url}`
                          }
                          alt=""
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setExistingImages((prev) =>
                              prev.filter((u) => u !== url)
                            );
                            setDeleteImageUrls((prev) => [...prev, url]);
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  添加新图片
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddNewImages}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37] file:text-[#112A23] hover:file:bg-[#c29f30]"
                />
                {editImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {editImagePreviews.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt="预览"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editing}
                  className="px-4 py-2 bg-[#d4af37] text-[#112A23] rounded-lg font-bold hover:bg-[#c29f30] disabled:opacity-50"
                >
                  {editing ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 发帖模态框 */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={() => {
          setIsCreateModalOpen(false);
          refreshPostList();
        }}
      />

      {/* 图片预览模态框 */}
      {previewOpen && selectedPost && (
        <ImagePreviewModal
          images={selectedPost.images}
          initialIndex={previewIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
};

export default ForumPage;
