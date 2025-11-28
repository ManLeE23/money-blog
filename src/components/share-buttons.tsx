"use client";

import { usePathname } from "next/navigation";

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const pathname = usePathname();
  const origin = typeof window !== "undefined" ? window.location.origin : "https://Money.dev";
  const shareUrl = `${origin}${pathname}`;
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex flex-wrap gap-3 text-sm font-semibold">
      <a
        href={tweet}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-white px-4 py-2 text-slate-900 transition hover:bg-slate-100"
      >
        Twitter
      </a>
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-white px-4 py-2 text-slate-900 transition hover:bg-slate-100"
      >
        LinkedIn
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
            alert("链接已复制");
          } catch (error) {
            console.error("Failed to copy", error);
          }
        }}
        className="rounded-full bg-white px-4 py-2 text-slate-900 transition hover:bg-slate-100"
      >
        复制链接
      </button>
    </div>
  );
}
