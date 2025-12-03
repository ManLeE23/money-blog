"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { profile } from "@/data/profile";

export function ProfileHero() {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // 只在首次加载时显示动画
    setShowAnimation(true);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/40 via-white/30 to-purple-50/20 p-8 backdrop-blur-md sm:p-10 lg:p-12">
      {/* 背景装饰 */}
      <div className="absolute -left-20 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-purple-200/30 to-blue-200/20 blur-3xl" aria-hidden />
      <div className="absolute -right-16 top-1/3 h-56 w-56 rounded-full bg-gradient-to-br from-amber-200/20 to-purple-100/20 blur-3xl" aria-hidden />

      {/* 主要内容：左右布局 */}
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start lg:gap-12">
        {/* 左侧：头像 */}
        <div className="shrink-0 relative">
          {/* Hi 文字动画 */}
          {showAnimation && (
            <div className="absolute -left-4 -top-4 z-10 -rotate-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-clip-text bg-gradient-to-r from-[#3b91ff] to-[#7E22CE] text-md font-bold text-transparent animate-bounce">
                Hi
              </span>
            </div>
          )}
          
          <div className={`relative h-32 w-32 overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/50 sm:h-40 sm:w-40 lg:h-48 lg:w-48`}>
            <Image
              src="/static/images/image.png"
              alt={profile.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* 右侧：个人信息 */}
        <div className="flex-1 space-y-6 text-center sm:text-left">
          {/* <span className="inline-flex items-center gap-2 rounded-full bg-purple-100/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-purple-700 backdrop-blur-sm">
            AI Engineer
          </span> */}
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-purple-100/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-purple-700 backdrop-blur-sm">{profile.role}</p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl lg:text-5xl">
              {profile.name}
            </h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{profile.bio}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
