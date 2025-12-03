import Link from "next/link";
import type { Post } from "@/lib/posts";

interface ArticleCardProps {
  post: Post;
  orientation?: "vertical" | "horizontal";
}

export function ArticleCard({ post, orientation = "vertical" }: ArticleCardProps) {
  const Container = orientation === "vertical" ? "div" : "article";

  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <Container className="group flex w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-[2.25rem] cursor-pointer">
        {post.coverImage ? (
          <div className="relative h-44 w-full overflow-hidden sm:h-56">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {post.category}
            </span>
            <span aria-hidden className="hidden sm:inline">•</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {post.summary}
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </Link>
  );
}
