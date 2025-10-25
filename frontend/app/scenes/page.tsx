"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, ArrowLeftIcon, RefreshCwIcon, EditIcon, SparklesIcon, CameraIcon, UsersIcon, XIcon, ZoomInIcon, ClockIcon, WandIcon } from "lucide-react";
import { api, type ProjectContext } from "@/lib/api";
import { StepIndicator } from "@/components/step-indicator";

export default function ScenesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [context, setContext] = useState<ProjectContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<string | null>(null);
  const [promptValues, setPromptValues] = useState<Record<string, string>>({});
  const [cameraValues, setCameraValues] = useState<Record<string, string>>({});
  const [characterValues, setCharacterValues] = useState<Record<string, string[]>>({});
  const [enlargedFrame, setEnlargedFrame] = useState<{
    url: string;
    sceneTitle: string;
    frameType: 'start' | 'end';
  } | null>(null);

  // Define the steps
  const steps = [
    { id: 0, title: '小说输入' },
    { id: 1, title: '角色确认' },
    { id: 2, title: '关键帧确认' },
    { id: 3, title: '视频预览' },
  ];

  const cameraOptions = ['推进镜头', '跟随镜头', '固定镜头', '环绕镜头', '俯视镜头', '仰视镜头'];
  const availableCharacters = context ? Object.keys(context.characters) : [];

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

      // Initialize editing values
      const prompts: Record<string, string> = {};
      const cameras: Record<string, string> = {};
      const characters: Record<string, string[]> = {};

      ctx.scenes.forEach((scene: any) => {
        prompts[scene.id] = scene.prompt || '';
        cameras[scene.id] = scene.camera || '推进镜头';
        characters[scene.id] = scene.characters || [];
      });

      setPromptValues(prompts);
      setCameraValues(cameras);
      setCharacterValues(characters);
    } catch (error) {
      console.error("Failed to load context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateFrame = (sceneId: string, frameType: 'start' | 'end') => {
    console.log('Regenerate frame:', {
      sceneId,
      frameType,
      prompt: promptValues[sceneId],
      camera: cameraValues[sceneId],
      characters: characterValues[sceneId]
    });
  };

  const handleConfirm = () => {
    if (!projectId) return;
    router.push(`/preview?project_id=${projectId}`);
  };

  const toggleCharacter = (sceneId: string, character: string) => {
    setCharacterValues({
      ...characterValues,
      [sceneId]: characterValues[sceneId].includes(character)
        ? characterValues[sceneId].filter(c => c !== character)
        : [...characterValues[sceneId], character]
    });
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

  if (!context || !context.scenes || context.scenes.length === 0) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 text-lg mb-4">未找到场景数据</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-slate-100">关键帧确认</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <StepIndicator 
          steps={steps} 
          currentStep={2} 
          onStepClick={(step) => {
            console.log('Step clicked:', step);
          }}
        />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Scenes Grid */}
          <div className="space-y-6">
            {context.scenes.map((scene: any, index: number) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30"
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-1">
                      {scene.title || `场景 ${index + 1}`}
                    </h3>
                    <p className="text-sm text-slate-400">{scene.setting}</p>
                  </div>
                  <button
                    onClick={() => setEditingScene(editingScene === scene.id ? null : scene.id)}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-500/30 rounded-lg text-slate-300 text-sm flex items-center gap-2 transition-all"
                  >
                    <EditIcon className="w-4 h-4" />
                    {editingScene === scene.id ? '完成编辑' : '编辑场景'}
                  </button>
                </div>

                {/* Scene Info */}
                <div className="flex items-center gap-6 mb-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>时长: {scene.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CameraIcon className="w-4 h-4" />
                    <span>镜头: {cameraValues[scene.id]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    <span>角色: {characterValues[scene.id].join(', ')}</span>
                  </div>
                </div>

                {/* Prompt Editor */}
                <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-lime-400" />
                    场景生成提示词
                  </label>
                  {editingScene === scene.id ? (
                    <textarea
                      value={promptValues[scene.id]}
                      onChange={(e) => setPromptValues({
                        ...promptValues,
                        [scene.id]: e.target.value
                      })}
                      className="w-full h-24 bg-slate-950/60 border border-slate-600/30 rounded-lg px-4 py-3 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                      placeholder="输入场景生成提示词..."
                    />
                  ) : (
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {promptValues[scene.id]}
                    </p>
                  )}
                </div>

                {/* Keyframes - Side by Side */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Start Frame */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-300">
                        开始帧
                      </span>
                      <button
                        onClick={() => handleRegenerateFrame(scene.id, 'start')}
                        className="px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-500/30 rounded-lg text-lime-400 text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-slate-900/50"
                      >
                        <RefreshCwIcon className="w-3.5 h-3.5" />
                        重新生成
                      </button>
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-600/30 group cursor-pointer">
                      <img
                        src={scene.startFrame}
                        alt="开始帧"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => setEnlargedFrame({
                          url: scene.startFrame,
                          sceneTitle: scene.title || `场景 ${index + 1}`,
                          frameType: 'start'
                        })}
                        className="absolute top-3 right-3 w-8 h-8 bg-slate-900/80 hover:bg-slate-800 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ZoomInIcon className="w-4 h-4 text-slate-200" />
                      </button>
                    </div>
                  </div>

                  {/* End Frame */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-300">
                        结束帧
                      </span>
                      <button
                        onClick={() => handleRegenerateFrame(scene.id, 'end')}
                        className="px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-500/30 rounded-lg text-lime-400 text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-slate-900/50"
                      >
                        <RefreshCwIcon className="w-3.5 h-3.5" />
                        重新生成
                      </button>
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-600/30 group cursor-pointer">
                      <img
                        src={scene.endFrame}
                        alt="结束帧"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => setEnlargedFrame({
                          url: scene.endFrame,
                          sceneTitle: scene.title || `场景 ${index + 1}`,
                          frameType: 'end'
                        })}
                        className="absolute top-3 right-3 w-8 h-8 bg-slate-900/80 hover:bg-slate-800 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ZoomInIcon className="w-4 h-4 text-slate-200" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Camera and Character Selection (Only shown when editing) */}
                {editingScene === scene.id && (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Camera Selection */}
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                        <CameraIcon className="w-4 h-4 text-lime-400" />
                        镜头类型
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {cameraOptions.map((camera) => (
                          <button
                            key={camera}
                            onClick={() => setCameraValues({
                              ...cameraValues,
                              [scene.id]: camera
                            })}
                            className={`px-3 py-2 rounded-lg text-sm transition-all ${
                              cameraValues[scene.id] === camera
                                ? 'bg-lime-500/20 border border-lime-500/50 text-lime-400'
                                : 'bg-slate-800/50 border border-slate-600/30 text-slate-400 hover:bg-slate-700/50'
                            }`}
                          >
                            {camera}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Character Selection */}
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                        <UsersIcon className="w-4 h-4 text-lime-400" />
                        出场角色
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableCharacters.map((character) => (
                          <button
                            key={character}
                            onClick={() => toggleCharacter(scene.id, character)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${
                              characterValues[scene.id].includes(character)
                                ? 'bg-lime-500/20 border border-lime-500/50 text-lime-400'
                                : 'bg-slate-800/50 border border-slate-600/30 text-slate-400 hover:bg-slate-700/50'
                            }`}
                          >
                            {character}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Frame Enlargement Modal */}
          <AnimatePresence>
            {enlargedFrame && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEnlargedFrame(null)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-zoom-out"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
                >
                  <div className="relative max-w-6xl max-h-[90vh] pointer-events-auto">
                    <button
                      onClick={() => setEnlargedFrame(null)}
                      className="absolute -top-12 right-0 w-10 h-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600/30 rounded-lg flex items-center justify-center transition-all"
                    >
                      <XIcon className="w-5 h-5 text-slate-300" />
                    </button>
                    <img
                      src={enlargedFrame.url}
                      alt={`${enlargedFrame.sceneTitle} ${enlargedFrame.frameType === 'start' ? '开始帧' : '结束帧'}`}
                      className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
                    />
                    <div className="absolute -bottom-12 left-0 right-0 text-center">
                      <span className="text-sm text-slate-300">
                        {enlargedFrame.sceneTitle} -{' '}
                        {enlargedFrame.frameType === 'start' ? '开始帧' : '结束帧'}
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
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <button
              onClick={() => router.push(`/characters?project_id=${projectId}`)}
              className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-slate-300 transition-all flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              返回
            </button>
            <button
              onClick={handleConfirm}
              className="px-8 py-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 rounded-xl text-lime-400 font-medium transition-all shadow-lg shadow-slate-900/50 flex items-center gap-2"
            >
              开始生成视频
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}