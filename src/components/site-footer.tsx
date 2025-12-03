import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="border-t border-transparent bg-transparent">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 sm:px-6">
        <p className="text-xs text-slate-500 text-center">
          专注于 AI 应用工程与用户体验的融合，探索将智能能力融入产品体验的最佳实践。
        </p>
        <p className="text-xs text-slate-400 text-center">© {new Date().getFullYear()} 保留所有权利。</p>
      </div>
    </footer>
  );
}
