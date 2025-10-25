"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [novelText, setNovelText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novelText.trim()) {
      setError("请输入小说文本");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await api.parseText(novelText);
      
      localStorage.setItem("currentProjectId", result.project_id);
      
      router.push(`/characters?project_id=${result.project_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/50 border border-slate-600/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lime-400">
                  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/>
                  <path d="m14 7 3 3"/>
                  <path d="M5 6v4"/>
                  <path d="M19 14v4"/>
                  <path d="M10 2v2"/>
                  <path d="M7 8H3"/>
                  <path d="M21 16h-4"/>
                  <path d="M11 3H9"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-100">漫飞</h1>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 text-slate-100">
              AI 动漫生成系统
            </h2>
            <p className="text-xl text-slate-300">
              将您的小说文本转换为精美的 2D 动漫短片
            </p>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="novel-text"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  小说内容
                </label>
                <textarea
                  id="novel-text"
                  rows={12}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/30 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                  placeholder="在这里输入您的小说内容...&#10;&#10;例如：&#10;夕阳西下，校园操场上，梨音独自站在跑道边缘。她的黑色长发在微风中轻轻飘动，蓝色的眼睛凝视着远方的天空。&#10;&#10;「今天也要加油啊」。她轻声自语道，嘴角扬起一抹温柔的微笑..."
                  value={novelText}
                  onChange={(e) => setNovelText(e.target.value)}
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">{novelText.length} 字符</span>
                  <span className="text-xs text-slate-500">建议 500-2000 字</span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !novelText.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-lime-400 text-sm font-medium transition-all shadow-lg shadow-slate-900/50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                  </svg>
                  {isLoading ? "解析中..." : "开始解析"}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-semibold mb-2 text-slate-100">文本解析</h3>
              <p className="text-sm text-slate-400">
                AI 自动分析小说，提取角色和场景
              </p>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold mb-2 text-slate-100">角色生成</h3>
              <p className="text-sm text-slate-400">
                生成角色图像，确保视觉一致性
              </p>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
              <div className="text-3xl mb-2">🎬</div>
              <h3 className="font-semibold mb-2 text-slate-100">视频合成</h3>
              <p className="text-sm text-slate-400">
                自动生成带运镜效果的动漫短片
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
