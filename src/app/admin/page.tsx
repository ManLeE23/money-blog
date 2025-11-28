import Link from "next/link";

import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "内容管理",
  description: "查看文章状态与精华标记，未来可接入 CMS 或后台服务。",
};

export default async function AdminPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Admin
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">内容管理面板</h1>
        <p className="text-sm text-slate-500">
          当前为静态原型，用于演示文章管理视图。可接入 CMS（如 Sanity、Contentful） 或 Next.js API Routes 实现真实写入。
        </p>
      </header>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">标题</th>
              <th className="px-6 py-4">分类</th>
              <th className="px-6 py-4">标签</th>
              <th className="px-6 py-4">发布日期</th>
              <th className="px-6 py-4">精华文章</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug} className="border-t border-slate-100">
                <td className="px-6 py-4 text-slate-900">
                  <Link href={`/posts/${post.slug}`} className="font-medium hover:text-blue-600">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4">{post.category}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(post.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      post.featured ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {post.featured ? "已标记" : "未标记"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        下一步：接入 CMS 或数据库，实现草稿管理、发布流程、精华文章批量调整等功能。
      </div>
    </div>
  );
}
