// src/components/article/ArticleSummary.tsx
interface ArticleSummaryProps {
  summary: string;
}

export function ArticleSummary({ summary }: ArticleSummaryProps) {
  return (
    <div className="mb-8 rounded-2xl bg-slate-50 p-4 border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold uppercase text-purple-600">AI 总结</span>
      </div>
      <p className="text-slate-700">{summary}</p>
    </div>
  );
}