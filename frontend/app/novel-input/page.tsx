'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowRightIcon, ArrowLeftIcon, WandIcon } from 'lucide-react';
import { TaskProgress } from '@/components/task-progress';
import { apiClient } from '@/lib/api-factory';
import { useProjects } from '@/lib/hooks/use-projects';
import { StepIndicator } from '@/components/step-indicator';

export default function NovelInputPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project_id');
  const { updateProject } = useProjects();
  
  const [novel, setNovel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = [
    { id: 0, title: '小说输入' },
    { id: 1, title: '角色确认' },
    { id: 2, title: '关键帧确认' },
    { id: 3, title: '视频预览' },
  ];

  const handleSubmit = async () => {
    if (!novel.trim()) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 300);
    
    try {
      const result = await apiClient.parseText(novel);
      clearInterval(progressInterval);
      setProgress(100);
      
      if (projectId) {
        updateProject(projectId, {
          currentStep: 1,
          progress: 25,
          status: 'processing',
          data: {
            projectId: result.project_id,
            novel,
            characters: [],
            scenes: [],
            videoUrl: ''
          }
        });
      }
      
      setTimeout(() => {
        router.push(`/characters?project_id=${result.project_id}`);
      }, 500);
    } catch (error) {
      console.error('Failed to parse text:', error);
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/50 border border-slate-600/30">
              <WandIcon className="w-5 h-5 text-lime-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">漫飞</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={0} />
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                小说内容
              </label>
              <textarea
                value={novel}
                onChange={(e) => setNovel(e.target.value)}
                placeholder="在这里输入您的小说内容...

例如：
夕阳西下，校园操场上，梨音独自站在跑道边缘。她的黑色长发在微风中轻轻飘动，蓝色的眼睛凝视着远方的天空。

「今天也要加油啊」。她轻声自语道，嘴角扬起一抹温柔的微笑..."
                className="w-full h-48 bg-slate-900/60 border border-slate-600/30 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                disabled={isProcessing}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">{novel.length} 字符</span>
                <span className="text-xs text-slate-500">建议 500-2000 字</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {['校园青春故事', '奇幻冒险', '科幻未来'].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setNovel(`这是一个关于${example}的故事...`)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 border border-slate-600/30 rounded-lg text-xs text-slate-400 hover:text-slate-300 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4"
              >
                <TaskProgress
                  stage="正在解析小说内容"
                  progress={progress}
                  message="AI 正在分析场景结构、识别角色和提取对白..."
                />
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/')}
                disabled={isProcessing}
                className="px-5 py-2 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/30 rounded-lg text-slate-300 text-sm transition-all flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                返回
              </button>
              <button
                onClick={handleSubmit}
                disabled={!novel.trim() || isProcessing}
                className="px-6 py-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-lime-400 text-sm font-medium transition-all shadow-lg shadow-slate-900/50 flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                开始解析
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20"
          >
            <h3 className="text-sm font-semibold text-blue-300 mb-2">
              💡 创作提示
            </h3>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• 清晰描述场景环境（时间、地点、氛围）</li>
              <li>• 详细刻画角色外貌（发型、眼睛、服装）</li>
              <li>• 包含人物对白和动作描写</li>
              <li>• 建议分段落书写，每个场景独立成段</li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
