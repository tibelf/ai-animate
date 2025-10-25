"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, RefreshCwIcon, ArrowRightIcon, ArrowLeftIcon, EditIcon, SparklesIcon, XIcon, ZoomInIcon, WandIcon } from "lucide-react";
import { api, type Character, type ProjectContext } from "@/lib/api";
import { StepIndicator } from "@/components/step-indicator";

export default function CharactersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [context, setContext] = useState<ProjectContext | null>(null);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [promptValues, setPromptValues] = useState<Record<string, string>>({});
  const [enlargedImage, setEnlargedImage] = useState<{
    url: string;
    characterName: string;
    index: number;
  } | null>(null);

  // Define the steps
  const steps = [
    { id: 0, title: '小说输入' },
    { id: 1, title: '角色确认' },
    { id: 2, title: '关键帧确认' },
    { id: 3, title: '视频预览' },
  ];

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
      const response = await api.getContext(projectId) as any;
      const ctx = response.context;
      setContext(ctx);

      const initialSelections: Record<string, number> = {};
      const initialPrompts: Record<string, string> = {};
      Object.keys(ctx.characters).forEach((name) => {
        initialSelections[name] = 0;
        initialPrompts[name] = ctx.characters[name].image_prompt || '';
      });
      setSelections(initialSelections);
      setPromptValues(initialPrompts);
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
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
          <p className="text-slate-300">加载中...</p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
        <p className="text-slate-300">未找到项目</p>
      </div>
    );
  }

  const characterEntries = Object.entries(context.characters);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600/30 transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/50 border border-slate-600/30">
                <WandIcon className="w-5 h-5 text-lime-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-100">角色确认</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <StepIndicator 
          steps={steps} 
          currentStep={1} 
          onStepClick={(step) => {
            // Handle step navigation if needed
            console.log('Step clicked:', step);
          }}
        />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {/* Characters Grid */}
          <div className="space-y-4">
            {characterEntries.map(([name, character], index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (index + 1) }}
                className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-5 border border-slate-600/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-100">{name}</h3>
                  <button
                    onClick={() => console.log('Regenerate', name)}
                    className="px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-500/30 rounded-lg text-lime-400 text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-slate-900/50"
                  >
                    <RefreshCwIcon className="w-3.5 h-3.5" />
                    重新生成
                  </button>
                </div>

                {/* Left-Right Layout: Prompt Editor (Left) + Images (Right) */}
                <div className="grid grid-cols-[1fr,2fr] gap-4">
                  {/* Left: Prompt Editor */}
                  <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-600/30 h-fit">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <SparklesIcon className="w-3.5 h-3.5 text-lime-400" />
                        角色生成提示词
                      </label>
                      <button
                        onClick={() => setEditingPrompt(editingPrompt === name ? null : name)}
                        className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1"
                      >
                        <EditIcon className="w-3 h-3" />
                        {editingPrompt === name ? '完成' : '编辑'}
                      </button>
                    </div>
                    {editingPrompt === name ? (
                      <textarea
                        value={promptValues[name] || ''}
                        onChange={(e) =>
                          setPromptValues({
                            ...promptValues,
                            [name]: e.target.value,
                          })
                        }
                        className="w-full h-32 bg-slate-950/60 border border-slate-600/30 rounded-lg px-3 py-2 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                        placeholder="输入角色生成提示词..."
                      />
                    ) : (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {promptValues[name] || character.description}
                      </p>
                    )}
                  </div>

                  {/* Right: Image Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {(character as any).candidates?.map((candidate: string, imageIndex: number) => (
                      <button
                        key={imageIndex}
                        onClick={() =>
                          setSelections({ ...selections, [name]: imageIndex })
                        }
                        className="relative group"
                      >
                        <div
                          className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                            selections[name] === imageIndex
                              ? 'border-lime-500 shadow-lg shadow-lime-500/30'
                              : 'border-slate-600/30 hover:border-slate-500/50'
                          }`}
                        >
                          {/* Placeholder for image - replace with actual image URL when available */}
                          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                            <span className="text-4xl">🎨</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Zoom Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnlargedImage({
                                url: candidate || '',
                                characterName: name,
                                index: imageIndex,
                              });
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/80 hover:bg-slate-800 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ZoomInIcon className="w-3.5 h-3.5 text-slate-200" />
                          </button>

                          {selections[name] === imageIndex && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1.5 left-1.5 w-6 h-6 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full flex items-center justify-center shadow-lg"
                            >
                              <CheckIcon className="w-3.5 h-3.5 text-slate-900" />
                            </motion.div>
                          )}
                        </div>
                        <div className="mt-1 text-center">
                          <span className="text-xs text-slate-400">
                            候选 {imageIndex + 1}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Image Enlargement Modal */}
          <AnimatePresence>
            {enlargedImage && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEnlargedImage(null)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-zoom-out"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
                >
                  <div className="relative max-w-4xl max-h-[90vh] pointer-events-auto">
                    <button
                      onClick={() => setEnlargedImage(null)}
                      className="absolute -top-12 right-0 w-10 h-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600/30 rounded-lg flex items-center justify-center transition-all"
                    >
                      <XIcon className="w-5 h-5 text-slate-300" />
                    </button>
                    <div className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center p-20">
                      <span className="text-6xl">🎨</span>
                    </div>
                    <div className="absolute -bottom-12 left-0 right-0 text-center">
                      <span className="text-sm text-slate-300">
                        {enlargedImage.characterName} - 候选 {enlargedImage.index + 1}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <button
              onClick={() => router.push("/")}
              className="px-5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 text-sm transition-all flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              返回
            </button>
            <button
              onClick={handleContinue}
              disabled={isContinuing}
              className="px-6 py-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-lime-400 text-sm font-medium transition-all shadow-lg shadow-slate-900/50 flex items-center gap-2"
            >
              {isContinuing ? '处理中...' : '确认角色'}
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
