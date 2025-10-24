"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api, type Character, type ProjectContext } from "@/lib/api";

export default function CharactersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [context, setContext] = useState<ProjectContext | null>(null);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);

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

      const initialSelections: Record<string, number> = {};
      Object.keys(ctx.characters).forEach((name) => {
        initialSelections[name] = 0;
      });
      setSelections(initialSelections);
    } catch (error) {
      console.error("Failed to load context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!projectId || !context) return;

    setIsContinuing(true);

    try {
      for (const [characterName, selectedIndex] of Object.entries(selections)) {
        await api.confirmCharacter(projectId, characterName, selectedIndex);
      }

      await api.continueGeneration(projectId);

      router.push(`/scenes?project_id=${projectId}`);
    } catch (error) {
      console.error("Failed to continue:", error);
      alert("继续失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsContinuing(false);
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
        <h1 className="text-3xl font-bold mb-8 text-center">角色确认</h1>

        <div className="max-w-6xl mx-auto space-y-8">
          {Object.entries(context.characters).map(([name, character]) => (
            <div
              key={name}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4">{name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {character.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {character.candidates?.map((candidate, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selections[name] === index
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                    }`}
                    onClick={() =>
                      setSelections({ ...selections, [name]: index })
                    }
                  >
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                      <span className="text-4xl">🎨</span>
                      <div className="text-xs text-gray-500 mt-2">
                        候选 {index + 1}
                      </div>
                    </div>
                    {selections[name] === index && (
                      <div className="text-center text-sm font-medium text-purple-600 dark:text-purple-400 mt-2">
                        ✓ 已选择
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={isContinuing}
            className="px-8"
          >
            {isContinuing ? "处理中..." : "确认并继续生成"}
          </Button>
        </div>
      </div>
    </main>
  );
}
