import { Suspense } from "react";

import { ArticleList } from "@/components/article-list";
import { SearchForm } from "@/components/search-form";
import { getAllPosts, searchPosts } from "@/lib/posts";

interface PostsPageProps {
  searchParams?: { q?: string };
}

export const metadata = {
  title: "所有文章",
  description: "浏览与搜索关于 AI 与前端工程的文章。",
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q ?? "";
  const posts = query ? await searchPosts(query) : await getAllPosts();

  return (
    <div className="space-y-8 sm:space-y-12">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">
          All Posts
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">所有文章</h1>
        <p className="max-w-2xl text-base text-slate-600">
          汇总最新的 AI × Frontend 文章，涵盖设计系统、Prompt Ops、指标追踪等主题。使用搜索快速定位你想了解的内容。
        </p>
      </header>
      <Suspense fallback={<div className="h-12 max-w-2xl rounded-full bg-white/70" />}>
        <SearchForm
          placeholder="搜索文章、主题或标签…"
          className="max-w-2xl border border-transparent bg-white/90 px-5 py-3"
          inputClassName="text-base"
          buttonClassName="hidden"
        />
      </Suspense>
      {query ? (
        <p className="text-sm text-slate-500">
          共找到 {posts.length} 篇文章，关键词 “{query}”。
        </p>
      ) : null}
      <ArticleList posts={posts} emptyMessage="暂未匹配到文章，换个关键词试试。" />
    </div>
  );
}
