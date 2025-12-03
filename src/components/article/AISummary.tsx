'use client';

import { useState, useEffect } from 'react';

interface AISummaryProps {
  slug: string;
}

export function AISummary({ slug }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/posts/${slug}/summary`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI summary');
        }
        
        const data = await response.json();
        setSummary(data.summary);
        setCached(data.cached);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [slug]);

  if (loading) {
    return (
      <div className="rounded-lg relative bg-gradient-to-r from-purple-50 to-pink-50 p-6">
        <div className='absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl' />
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          AI 生成摘要
        </h3>
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
          <span className="ml-2 text-sm text-slate-500">正在生成摘要...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg relative bg-gradient-to-r from-purple-50 to-pink-50 p-6">
        <div className='absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl' />
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          AI 生成摘要
        </h3>
        <div className="text-sm text-red-600">
          无法生成摘要: {error}
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="rounded-lg relative bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className='absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl' />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          AI 生成摘要
        </h3>
        {/* {cached && (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            已缓存
          </span>
        )} */}
      </div>
      <div className="prose prose-sm max-w-none text-slate-700">
        <p>{summary}</p>
      </div>
    </div>
  );
}
