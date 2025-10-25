"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api, type ProjectContext } from "@/lib/api";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [context, setContext] = useState<ProjectContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      router.push("/");
      return;
    }

    loadContext();
  }, [projectId]);

  const loadContext = async () => {
    if (!projectId) return;

    try {
      const { context: ctx } = await api.getContext(projectId);
      setContext(ctx);
    } catch (error) {
      console.error("Failed to load context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>未找到项目</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="w-9 h-9 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg flex items-center justify-center transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
              </button>
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-100">视频预览</h2>

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30 mb-8">
            <div className="aspect-video bg-slate-900/60 rounded-xl mb-6 flex items-center justify-center border border-slate-600/30">
              {context.final_video ? (
                <div className="text-center">
                  <p className="text-lg mb-4 text-slate-200">🎬 视频播放器</p>
                  <p className="text-sm text-slate-400">
                    {context.final_video}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400">视频尚未生成</p>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 text-sm transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                返回首页
              </button>
              <button
                onClick={loadContext}
                className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-500/30 rounded-lg text-lime-400 text-sm transition-all shadow-lg shadow-slate-900/50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-2.5-6.2"/>
                  <path d="M21 3v6h-6"/>
                </svg>
                刷新
              </button>
            </div>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
            <h2 className="text-xl font-bold mb-4 text-slate-100">项目信息</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">项目 ID:</dt>
                <dd className="font-mono text-slate-200">{context.meta.project_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">版本:</dt>
                <dd className="text-slate-200">{context.meta.version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">状态:</dt>
                <dd className="text-slate-200">{context.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">场景数:</dt>
                <dd className="text-slate-200">{context.scenes.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">角色数:</dt>
                <dd className="text-slate-200">{Object.keys(context.characters).length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
