import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ChatFloatingButton } from "@/components/chat/ChatFloatingButton";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
});

const fira = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// const siteUrl = "https://Money.dev";

export const metadata: Metadata = {
  // metadataBase: new URL(siteUrl),
  title: {
    default: "Money · AI Engineer Blog",
    template: "%s · Money",
  },
  description:
    "记录一名前端工程师在 AI 产品落地过程中的观察与实践，聚焦设计系统、Prompt Ops 与工程化经验。",
  authors: [{ name: "Money", url: '' }],
  icons: [
    { rel: "icon", url: "/logo.png", sizes: "32x32" }, // 基础图标（必填）
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${inter.variable} ${fira.variable} bg-slate-100 text-slate-900 antialiased`}
      >
        <SiteHeader />
        <main className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-6xl px-6 py-16">
          {children}
        </main>
        <SiteFooter />
        <ChatFloatingButton />
      </body>
    </html>
  );
}
