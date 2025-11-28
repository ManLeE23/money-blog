import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleList } from '@/components/article-list';
import { ShareButtons } from '@/components/share-buttons';
import { Comments } from '@/components/comments';
import {
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
  getPostsByTag,
} from '@/lib/posts';
import { renderMarkdown } from '@/lib/markdown';

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  console.log('post', post);

  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  console.log('params', slug);

  if (!post) {
    notFound();
  }

  const [html, relatedByCategory, relatedByTag] = await Promise.all([
    renderMarkdown(post.content),
    getPostsByCategory(post.category),
    post.tags.length > 0 ? getPostsByTag(post.tags[0]) : Promise.resolve([]),
  ]);

  const relatedMap = new Map<string, (typeof relatedByCategory)[0]>();
  [...relatedByCategory, ...relatedByTag].forEach((item) => {
    if (item.slug !== post.slug) {
      relatedMap.set(item.slug, item);
    }
  });
  const related = Array.from(relatedMap.values()).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl space-y-12 px-4 sm:px-0">
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>{new Date(post.date).toLocaleDateString()}</span>
          <span aria-hidden>•</span>
          <span>{post.readingTime.text}</span>
          <span aria-hidden>•</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {post.category}
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        <p className="text-base text-slate-600 sm:text-lg">{post.summary}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>
      {post.coverImage ? (
        <div className="overflow-hidden rounded-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}
      <div className="prose prose-slate max-w-none text-slate-700 prose-headings:text-slate-900">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <footer className="space-y-8">
        <div className="rounded-3xl bg-slate-900 px-6 py-8 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            分享
          </p>
          <div className="mt-4">
            <ShareButtons title={post.title} />
          </div>
        </div>
        
        {/* 评论组件 */}
        <Comments />
        
        {related.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">相关文章</h2>
            <ArticleList posts={related} />
          </div>
        ) : null}
      </footer>
    </article>
  );
}
