import Link from "next/link";

import type { Post } from "@/lib/posts";
import { ArticleCard } from "@/components/article-card";

interface FeaturedArticlesProps {
  posts: Post[];
}

export function FeaturedArticles({ posts }: FeaturedArticlesProps) {
  if (posts.length === 0) return null;

  const featuredPosts = posts.slice(0, 2);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">精选文章</h2>
          <p className="text-sm text-slate-500">沉淀近期讨论最热的 AI x Frontend 话题</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {featuredPosts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
