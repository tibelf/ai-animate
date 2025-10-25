import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ModeIndicator } from "@/components/mode-indicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "漫飞 - AI 动漫生成系统",
  description: "将您的小说文本转换为精美的 2D 动漫短片",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <ModeIndicator />
      </body>
    </html>
  );
}
