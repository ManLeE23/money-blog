'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFormProps {
  targetPath?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function SearchForm({
  targetPath = '/posts',
  placeholder = '搜索文章…',
  className,
  inputClassName,
  buttonClassName,
}: SearchFormProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const [isComposing, setIsComposing] = useState(false);

  const formClassName = useMemo(
    () =>
      [
        'flex w-full items-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [className]
  );

  const inputClasses = useMemo(
    () =>
      [
        'flex-1 bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none',
        inputClassName,
      ]
        .filter(Boolean)
        .join(' '),
    [inputClassName]
  );

  const buttonClasses = useMemo(
    () =>
      [
        'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50',
        buttonClassName,
      ]
        .filter(Boolean)
        .join(' '),
    [buttonClassName]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      startTransition(() => {
        const next =
          query.trim().length > 0
            ? `${targetPath}?q=${encodeURIComponent(query.trim())}`
            : targetPath;
        router.push(next);
      });
    },
    [query, router, targetPath]
  );

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        // 按下回车键时，触发表单提交（增强兼容性，覆盖原生行为）
        if (e.key === 'Enter' && !isComposing) {
          e.preventDefault(); // 阻止默认刷新
          handleSubmit(e); // 手动触发提交逻辑
        }
      }}
      className={formClassName}
      role="search"
    >
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        // 开始输入法候选（比如输入拼音）：标记为正在输入
        onCompositionStart={() => setIsComposing(true)}
        // 结束输入法候选（确认选字/锁定输入）：标记为结束输入
        onCompositionEnd={() => setIsComposing(false)}
        className={inputClasses}
        aria-label="搜索文章"
      />
    </form>
  );
}
