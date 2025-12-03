'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  postId: string;
}

interface CommentFormData {
  name: string;
  email: string;
  content: string;
}

export function Comments() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [formData, setFormData] = useState<CommentFormData>({
    name: '',
    email: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 获取评论
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?postId=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error('获取评论失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchComments();
    }
  }, [slug]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.content) {
      alert('请填写所有必填字段');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          postId: slug
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [newComment, ...prev]);
        setFormData({ name: '', email: '', content: '' });
        alert('评论发表成功！');
      } else {
        alert('评论发表失败，请重试');
      }
    } catch (error) {
      console.error('提交评论失败:', error);
      alert('评论发表失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-slate-900">评论</h2>
        <div className="text-center py-8 text-slate-500">加载评论中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-slate-900">评论</h2>
      
      {/* 评论表单 */}
      <div className="rounded-3xl pb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">发表评论</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                大名 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                placeholder="请输入您的名字"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                邮箱 *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                placeholder="请输入您的邮箱"
              />
            </div>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
              意见 *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              placeholder="请输入您的评论..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-black text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '发表中...' : '发表评论'}
          </button>
        </form>
      </div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-white rounded-3xl">
            暂无评论，快来发表第一条评论吧！
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900">{comment.name}</h4>
                <time className="text-sm text-slate-500">
                  {new Date(comment.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
