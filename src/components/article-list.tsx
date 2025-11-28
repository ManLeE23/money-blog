import type { Post } from "@/lib/posts";
import { ArticleCard } from "@/components/article-card";

interface ArticleListProps {
  posts: Post[];
  emptyMessage?: string;
}

export function ArticleList({ posts, emptyMessage = "暂无文章" }: ArticleListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <ArticleCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
