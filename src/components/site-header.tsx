"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchForm } from "@/components/search-form";
import { profile } from "@/data/profile";
import { EmailIcon } from "@/components/icons/EmailIcon";
import { AiFillGithub } from "react-icons/ai";
import { AiFillWechat } from "react-icons/ai";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "所有文章" },
];

const contactLinks = profile.contacts;

const contactIconComponents = {
  Email: EmailIcon,
  WeChat: AiFillWechat,
  GitHub: AiFillGithub,
};

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Money
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-slate-900${isActive ? " text-slate-900" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden w-full max-w-sm md:block">
          <Suspense fallback={<div className="h-9 rounded-full border border-slate-200 bg-white/40" />}> 
            <SearchForm
              placeholder="搜索文章…"
              className="border border-slate-300 bg-white/90 px-4 py-2 shadow-none"
              inputClassName="text-sm"
              buttonClassName="hidden"
            />
          </Suspense>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {contactLinks.map((contact) => {
            const IconComponent = contactIconComponents[contact.label as keyof typeof contactIconComponents];
            
            if (!IconComponent) return null;

            // if (contact.type === 'popup') {
            //   return <WeChatPopup key={contact.href} />;
            // }
            
            return (
              <Link
                key={contact.href}
                href={contact.href}
                className="text-slate-500 transition hover:text-slate-900"
                target={contact.href.startsWith("http") ? "_blank" : undefined}
                rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={contact.label}
                title={contact.label}
              >
                <IconComponent className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:text-slate-900 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
            <Suspense fallback={<div className="h-11 rounded-2xl border border-slate-200 bg-white/60" />}> 
              <SearchForm
                placeholder="搜索文章…"
                className="border border-slate-300 bg-white px-4 py-2"
                buttonClassName="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              />
            </Suspense>
            <nav className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-3 py-2 transition hover:bg-slate-100${isActive ? " text-slate-900" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          {contactLinks.map((contact) => {
            const IconComponent = contactIconComponents[contact.label as keyof typeof contactIconComponents];

            if (!IconComponent) return null;
            
            if (contact.type === 'popup') {
              return (
                <button
                  key={contact.href}
                  onClick={() => {
                    setOpen(false);
                    // We'll need to handle WeChat popup in mobile view
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-slate-300 hover:text-slate-900"
                  aria-label={contact.label}
                  title={contact.label}
                >
                  <IconComponent className="w-4 h-4" />
                </button>
              );
            }
            
            return (
              <Link
                key={contact.href}
                href={contact.href}
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-slate-300 hover:text-slate-900"
                target={contact.href.startsWith("http") ? "_blank" : undefined}
                rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={contact.label}
                title={contact.label}
              >
                <IconComponent className="w-4 h-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  ) : null}
    </header>
  );
}
