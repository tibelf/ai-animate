"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlayIcon, 
  DownloadIcon, 
  ShareIcon, 
  ArrowLeftIcon, 
  SparklesIcon, 
  RefreshCwIcon, 
  XIcon, 
  CameraIcon, 
  UsersIcon, 
  PauseIcon, 
  EditIcon,
  WandIcon 
} from "lucide-react";
import { TaskProgress } from "@/components/task-progress";
import { api, type ProjectContext } from "@/lib/api";
import { StepIndicator } from "@/components/step-indicator";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [context, setContext] = useState<ProjectContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [regeneratingScene, setRegeneratingScene] = useState<string | null>(null);
  const [hoveredScene, setHoveredScene] = useState<string | null>(null);

  // Scene editing state
  const [promptValues, setPromptValues] = useState<Record<string, string>>({});
  const [cameraValues, setCameraValues] = useState<Record<string, string>>({});
  const [characterValues, setCharacterValues] = useState<Record<string, string[]>>({});

  const cameraOptions = ['推进镜头', '跟随镜头', '固定镜头', '环绕镜头', '俯视镜头', '仰视镜头'];
  const availableCharacters = context ? Object.keys(context.characters) : [];

  // Calculate total duration from scenes
  const totalDuration = context ? context.scenes.reduce((acc, scene) => acc + ((scene as any).camera?.duration_s || 3), 0) : 0;

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
      
      // Initialize editing values
      const prompts: Record<string, string> = {};
      const cameras: Record<string, string> = {};
      const characters: Record<string, string[]> = {};
      
      ctx.scenes.forEach(scene => {
        prompts[scene.id] = scene.setting || '';
        cameras[scene.id] = scene.camera?.type || '固定镜头';
        characters[scene.id] = scene.characters || [];
      });
      
      setPromptValues(prompts);
      setCameraValues(cameras);
      setCharacterValues(characters);
      
      // Check if still generating
      if (ctx.status !== 'completed' && ctx.status !== 'error') {
        setIsGenerating(true);
        setProgress(ctx.status === 'generating_videos' ? 80 : ctx.status === 'concatenating_video' ? 90 : 65);
      }
    } catch (error) {
      console.error("Failed to load context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate video completion
  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        setIsGenerating(false);
        setProgress(100);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  // Simulate video playback
  useEffect(() => {
    if (isPlaying && !isGenerating && totalDuration > 0) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isGenerating, totalDuration]);

  const handleRegenerateScene = async (sceneId: string) => {
    setRegeneratingScene(sceneId);
    console.log('Regenerating scene:', {
      sceneId,
      prompt: promptValues[sceneId],
      camera: cameraValues[sceneId],
      characters: characterValues[sceneId]
    });
    
    // Simulate regeneration delay
    setTimeout(() => {
      setRegeneratingScene(null);
    }, 2000);
  };

  const handleQuickRegenerate = (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleRegenerateScene(sceneId);
  };

  const handleEditScene = (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScene(sceneId);
  };

  const toggleCharacter = (sceneId: string, character: string) => {
    setCharacterValues({
      ...characterValues,
      [sceneId]: characterValues[sceneId]?.includes(character)
        ? characterValues[sceneId].filter(c => c !== character)
        : [...(characterValues[sceneId] || []), character]
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    setCurrentTime(percentage * totalDuration);
  };

  const selectedSceneData = context?.scenes.find((s: any) => s.id === selectedScene);

  // Create scene blocks with thumbnails
  const createSceneBlocks = () => {
    if (!context) return [];
    
    let currentTime = 0;
    return context.scenes.map((scene: any, index: number) => {
      const duration = scene.camera?.duration_s || 3;
      const sceneBlock = {
        id: scene.id,
        title: `场景 ${index + 1}`,
        startTime: currentTime,
        endTime: currentTime + duration,
        duration,
        thumbnail: scene.keyframe || `https://picsum.photos/400/300?random=${index + 10}`,
        setting: scene.setting || '',
        camera: scene.camera?.type || '固定镜头',
        characters: scene.characters || []
      };
      currentTime += duration;
      return sceneBlock;
    });
  };

  const sceneBlocks = createSceneBlocks();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
          <p className="text-slate-200">加载中...</p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-200 text-lg mb-4">未找到项目</p>
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
              <h1 className="text-xl font-bold text-slate-100">漫飞</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="py-2">
            <StepIndicator 
              steps={steps} 
              currentStep={3} 
              onStepClick={(step) => {
                console.log('Step clicked:', step);
              }}
            />
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TaskProgress 
                stage={`场景 ${context.scenes.length}/${context.scenes.length}：视频合成`}
                progress={progress}
                message="正在生成动画过渡帧、合成特效、应用色彩校正..."
              />
            </motion.div>
          )}

          {/* Video Player */}
          {!isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30"
            >
              {/* Video Display */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative group mb-4">
                {(context as any).final_video ? (
                  <video 
                    src={(context as any).final_video}
                    className="w-full h-full object-cover"
                    controls
                    poster={sceneBlocks[0]?.thumbnail}
                  >
                    您的浏览器不支持视频播放
                  </video>
                ) : (
                  <>
                    <img 
                      src={sceneBlocks[0]?.thumbnail || "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200"}
                      alt="视频预览" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 bg-slate-100/90 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all shadow-2xl"
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-8 h-8 text-slate-800" />
                        ) : (
                          <PlayIcon className="w-8 h-8 text-slate-800 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Timeline Controls */}
              <div className="space-y-3">
                {/* Time Display */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Progress Bar Background */}
                  <div
                    onClick={handleTimelineClick}
                    className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden cursor-pointer"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500 transition-all"
                      style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    />
                  </div>

                  {/* Scene Blocks */}
                  <div className="relative h-16 mt-2 flex gap-1">
                    {sceneBlocks.map((scene) => {
                      const widthPercentage = (scene.duration / totalDuration) * 100;
                      const isActive = currentTime >= scene.startTime && currentTime < scene.endTime;
                      const isHovered = hoveredScene === scene.id;
                      const isRegenerating = regeneratingScene === scene.id;

                      return (
                        <div
                          key={scene.id}
                          onMouseEnter={() => setHoveredScene(scene.id)}
                          onMouseLeave={() => setHoveredScene(null)}
                          style={{ width: `${widthPercentage}%` }}
                          className={`relative h-full rounded-lg overflow-hidden border-2 transition-all ${
                            isActive
                              ? 'border-lime-400/50'
                              : 'border-slate-600/30 hover:border-slate-500/50'
                          }`}
                        >
                          <img
                            src={scene.thumbnail}
                            alt={scene.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute bottom-1.5 left-1.5 right-1.5">
                            <div className="text-xs font-medium text-white mb-0.5">
                              {scene.title}
                            </div>
                            <div className="text-xs text-slate-300">
                              {scene.duration}s
                            </div>
                          </div>

                          {/* Hover Actions */}
                          <AnimatePresence>
                            {isHovered && !isRegenerating && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1.5"
                              >
                                <button
                                  onClick={(e) => handleQuickRegenerate(scene.id, e)}
                                  className="px-2 py-1.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-500/30 rounded-md text-lime-400 text-xs flex items-center gap-1 transition-all shadow-lg"
                                >
                                  <RefreshCwIcon className="w-3 h-3" />
                                  重新生成
                                </button>
                                <button
                                  onClick={(e) => handleEditScene(scene.id, e)}
                                  className="px-2 py-1.5 bg-slate-700/80 hover:bg-slate-600/80 border border-slate-500/30 rounded-md text-slate-200 text-xs flex items-center gap-1 transition-all shadow-lg"
                                >
                                  <EditIcon className="w-3 h-3" />
                                  编辑
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Regenerating Indicator */}
                          {isRegenerating && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <div className="flex items-center gap-1.5 text-lime-400">
                                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                                <span className="text-xs">生成中...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <button className="flex-1 px-5 py-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 rounded-lg text-lime-400 text-sm font-medium transition-all shadow-lg shadow-slate-900/50 flex items-center justify-center gap-2">
                  <DownloadIcon className="w-4 h-4" />
                  下载视频
                </button>
                <button className="px-5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 text-sm transition-all flex items-center gap-2">
                  <ShareIcon className="w-4 h-4" />
                  分享
                </button>
              </div>
            </motion.div>
          )}

          {/* Scene Edit Modal */}
          <AnimatePresence>
            {selectedScene && selectedSceneData && !isGenerating && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedScene(null)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6"
                >
                  <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-100">
                        编辑场景 {context.scenes.findIndex((s: any) => s.id === selectedScene) + 1}
                      </h3>
                      <button
                        onClick={() => setSelectedScene(null)}
                        className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-500/30 rounded-lg flex items-center justify-center transition-all"
                      >
                        <XIcon className="w-4 h-4 text-slate-300" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Prompt Editor */}
                      <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                          <SparklesIcon className="w-4 h-4 text-lime-400" />
                          场景提示词
                        </label>
                        <textarea
                          value={promptValues[selectedScene] || ''}
                          onChange={(e) => setPromptValues({
                            ...promptValues,
                            [selectedScene]: e.target.value
                          })}
                          className="w-full h-24 bg-slate-950/60 border border-slate-600/30 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                          placeholder="输入场景生成提示词..."
                        />
                      </div>

                      {/* Camera Selection */}
                      <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
                          <CameraIcon className="w-4 h-4 text-lime-400" />
                          镜头类型
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {cameraOptions.map((camera) => (
                            <button
                              key={camera}
                              onClick={() => setCameraValues({
                                ...cameraValues,
                                [selectedScene]: camera
                              })}
                              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                cameraValues[selectedScene] === camera
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
                              onClick={() => toggleCharacter(selectedScene, character)}
                              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                characterValues[selectedScene]?.includes(character)
                                  ? 'bg-lime-500/20 border border-lime-500/50 text-lime-400'
                                  : 'bg-slate-800/50 border border-slate-600/30 text-slate-400 hover:bg-slate-700/50'
                              }`}
                            >
                              {character}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setSelectedScene(null)}
                          className="flex-1 px-5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 text-sm font-medium transition-all"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => {
                            handleRegenerateScene(selectedScene);
                            setSelectedScene(null);
                          }}
                          disabled={regeneratingScene === selectedScene}
                          className="flex-1 px-5 py-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-lime-400 text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/50"
                        >
                          <RefreshCwIcon className="w-4 h-4" />
                          应用并重新生成
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-start"
          >
            <button
              onClick={() => router.back()}
              className="px-5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 text-sm transition-all flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              返回上一步
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
