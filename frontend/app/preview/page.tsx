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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">视频预览</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg mb-8">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 flex items-center justify-center">
              {context.final_video ? (
                <div className="text-center">
                  <p className="text-lg mb-4">🎬 视频播放器</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {context.final_video}
                  </p>
                </div>
              ) : (
                <p>视频尚未生成</p>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push("/")}>返回首页</Button>
              <Button variant="outline" onClick={loadContext}>
                刷新
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">项目信息</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">项目 ID:</dt>
                <dd className="font-mono">{context.meta.project_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">版本:</dt>
                <dd>{context.meta.version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">状态:</dt>
                <dd>{context.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">场景数:</dt>
                <dd>{context.scenes.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">角色数:</dt>
                <dd>{Object.keys(context.characters).length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
