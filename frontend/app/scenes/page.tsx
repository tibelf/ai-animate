"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api, type TaskStatus, type ProjectContext } from "@/lib/api";

export default function ScenesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [context, setContext] = useState<ProjectContext | null>(null);

  useEffect(() => {
    if (!projectId) {
      router.push("/");
      return;
    }

    const ws = api.createWebSocket(projectId);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data);

      if (data.stage === "completed") {
        loadContext();
      }
    };

    ws.onerror = () => {
      pollStatus();
    };

    const pollStatus = async () => {
      try {
        const statusData = await api.getTaskStatus(projectId);
        setStatus(statusData);

        if (statusData.stage === "completed") {
          loadContext();
        }
      } catch (error) {
        console.error("Failed to poll status:", error);
      }
    };

    const interval = setInterval(pollStatus, 3000);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, [projectId]);

  const loadContext = async () => {
    if (!projectId) return;

    try {
      const { context: ctx } = await api.getContext(projectId);
      setContext(ctx);
    } catch (error) {
      console.error("Failed to load context:", error);
    }
  };

  const handleViewPreview = () => {
    if (projectId) {
      router.push(`/preview?project_id=${projectId}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">生成进度</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            {status && (
              <>
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      当前阶段：{getStageLabel(status.stage)}
                    </span>
                    <span className="text-sm font-medium">
                      {status.progress}%
                    </span>
                  </div>
                  <Progress value={status.progress} className="h-3" />
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    {status.task || "处理中..."}
                  </p>
                </div>

                {status.error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      错误：{status.error}
                    </p>
                  </div>
                )}

                {status.stage === "completed" && (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold mb-4">生成完成！</h2>
                    <Button size="lg" onClick={handleViewPreview}>
                      查看视频
                    </Button>
                  </div>
                )}

                {status.stage !== "completed" && status.stage !== "failed" && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">
                      请耐心等待，这可能需要几分钟...
                    </p>
                  </div>
                )}
              </>
            )}

            {!status && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>连接中...</p>
              </div>
            )}
          </div>

          {context && context.scenes && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">场景列表</h2>
              <div className="space-y-4">
                {context.scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        场景 {index + 1}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          scene.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {scene.status || "pending"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scene.setting}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      镜头：{scene.camera.type} | 时长：
                      {scene.camera.duration_s}秒
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    parsing: "解析文本",
    generating_characters: "生成角色",
    training_loras: "训练 LoRA",
    generating_keyframes: "生成关键帧",
    generating_videos: "生成视频",
    concatenating: "拼接视频",
    completed: "已完成",
    failed: "失败",
  };
  return labels[stage] || stage;
}
