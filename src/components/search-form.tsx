"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFormProps {
  targetPath?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function SearchForm({
  targetPath = "/posts",
  placeholder = "搜索文章…",
  className,
  inputClassName,
  buttonClassName,
}: SearchFormProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const formClassName = useMemo(
    () =>
      [
        "flex w-full items-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className],
  );

  const inputClasses = useMemo(
    () =>
      [
        "flex-1 bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none",
        inputClassName,
      ]
        .filter(Boolean)
        .join(" "),
    [inputClassName],
  );

  const buttonClasses = useMemo(
    () =>
      [
        "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50",
        buttonClassName,
      ]
        .filter(Boolean)
        .join(" "),
    [buttonClassName],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      startTransition(() => {
        const next = query.trim().length > 0 ? `${targetPath}?q=${encodeURIComponent(query.trim())}` : targetPath;
        router.push(next);
      });
    },
    [query, router, targetPath],
  );

  return (
    <form onSubmit={handleSubmit} className={formClassName} role="search">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className={inputClasses}
        aria-label="搜索文章"
      />
      <button type="submit" className={buttonClasses} disabled={isPending}>
        {isPending ? "搜索中…" : "搜索"}
      </button>
    </form>
  );
}
