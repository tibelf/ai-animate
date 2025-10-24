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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI 动漫生成系统
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              将您的小说文本转换为精美的 2D 动漫短片
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="novel-text"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  输入小说文本
                </label>
                <textarea
                  id="novel-text"
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="在这里粘贴您的小说文本...&#10;&#10;示例：&#10;夕阳西下，校园操场上，少女独自站立。她黑色的长发随风飘扬，蓝色的眼眸凝视着远方。身穿整洁的校服，表情坚定而温柔..."
                  value={novelText}
                  onChange={(e) => setNovelText(e.target.value)}
                  disabled={isLoading}
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  提示：文本将被解析为场景和角色，建议 200-1000 字
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="px-8 py-3 text-lg"
                >
                  {isLoading ? "解析中..." : "开始生成"}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-semibold mb-2">文本解析</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI 自动分析小说，提取角色和场景
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold mb-2">角色生成</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                生成角色图像，确保视觉一致性
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-3xl mb-2">🎬</div>
              <h3 className="font-semibold mb-2">视频合成</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                自动生成带运镜效果的动漫短片
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
