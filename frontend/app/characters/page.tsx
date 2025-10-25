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
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-100">角色确认</h2>

        <div className="max-w-6xl mx-auto space-y-8">
          {Object.entries(context.characters).map(([name, character]) => {
            const mockImages: Record<string, string[]> = {
              "梨音": [
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
                'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
              ],
              "海斗": [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
              ]
            };
            const images = mockImages[name] || character.candidates || [];
            
            return (
              <div
                key={name}
                className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30"
              >
                <h2 className="text-2xl font-bold mb-4 text-slate-100">{name}</h2>
                <p className="text-slate-400 mb-6">
                  {character.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {images.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setSelections({ ...selections, [name]: index })
                      }
                      className="relative group"
                    >
                      <div className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                        selections[name] === index
                          ? "border-lime-500 shadow-lg shadow-lime-500/30"
                          : "border-slate-600/30 hover:border-slate-500/50"
                      }`}>
                        <img
                          src={imageUrl}
                          alt={`${name} 候选 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {selections[name] === index && (
                          <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-xs text-slate-400">
                          候选 {index + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto mt-8 flex justify-center">
          <button
            onClick={handleContinue}
            disabled={isContinuing}
            className="px-8 py-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lime-400 font-medium transition-all shadow-lg shadow-slate-900/50 flex items-center gap-2"
          >
            {isContinuing ? "处理中..." : "确认角色"}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
