import { FeaturedArticles } from "@/components/featured-articles";
import { ProfileHero } from "@/components/profile-hero";
import { ArticleList } from "@/components/article-list";
import { getAllPosts, getFeaturedPosts } from "@/lib/posts";

export default async function Home() {
  const [featured, allPosts] = await Promise.all([
    getFeaturedPosts(),
    getAllPosts(),
  ]);

  const latest = allPosts.filter((post) => !post.featured).slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16">
      <ProfileHero />
      <FeaturedArticles posts={featured} />
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-slate-900">最新文章</h2>
          <p className="text-sm text-slate-500">聚焦 AI 产品落地中的前端工程思考</p>
        </div>
        <ArticleList posts={latest} emptyMessage="敬请期待更多文章" />
      </section>
    </div>
  );
}
