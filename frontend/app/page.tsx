"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PlusIcon, WandIcon, ClockIcon, CheckCircleIcon, TrashIcon, Edit3Icon } from 'lucide-react';
import { useProjects } from '@/lib/hooks/use-projects';
import { mockProjects } from '@/lib/mock-data/projects';

export default function Home() {
  const router = useRouter();
  const { projects, addProject, setCurrentProject, deleteProject } = useProjects();

  useEffect(() => {
    if (projects.length === 0) {
      mockProjects.forEach(project => addProject(project));
    }
  }, []);

  const handleCreateProject = () => {
    const newProjectId = `project_${Date.now()}`;
    const newProject = {
      id: newProjectId,
      name: `新项目 ${projects.length + 1}`,
      status: 'draft' as const,
      currentStep: 0,
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      data: {
        projectId: '',
        novel: '',
        characters: [],
        scenes: [],
        videoUrl: ''
      }
    };
    addProject(newProject);
    setCurrentProject(newProjectId);
    router.push('/characters');
  };

  const handleSelectProject = (projectId: string) => {
    setCurrentProject(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      switch (project.currentStep) {
        case 0:
          router.push('/characters');
          break;
        case 1:
          router.push('/characters');
          break;
        case 2:
          router.push('/scenes');
          break;
        case 3:
          router.push('/preview');
          break;
        default:
          router.push('/characters');
      }
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      deleteProject(projectId);
    }
  };

  const getStatusBadge = (status: 'draft' | 'processing' | 'completed') => {
    switch (status) {
      case 'draft':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
            <Edit3Icon className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">草稿</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
            <ClockIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm text-cyan-300">生成中</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">已完成</span>
          </div>
        );
    }
  };

  const stepNames = ['小说输入', '角色确认', '关键帧确认', '视频预览'];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/50 border border-slate-600/30">
                <WandIcon className="w-5 h-5 text-lime-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-100">漫飞</h1>
            </div>
            <button
              onClick={handleCreateProject}
              className="px-5 py-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 rounded-xl text-lime-400 font-medium transition-all shadow-lg shadow-slate-900/50 flex items-center gap-2 border border-slate-600/30 text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              创建新项目
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30"
          >
            <div className="text-2xl font-bold text-slate-100 mb-1">
              {projects.length}
            </div>
            <div className="text-sm text-slate-400">总项目数</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30"
          >
            <div className="text-2xl font-bold text-slate-100 mb-1">
              {projects.filter(p => p.status === 'processing').length}
            </div>
            <div className="text-sm text-slate-400">生成中</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30"
          >
            <div className="text-2xl font-bold text-slate-100 mb-1">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-slate-400">已完成</div>
          </motion.div>
        </div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-slate-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-600/30">
              <WandIcon className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              开始创作您的第一个项目
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              输入您的故事，AI将自动生成精美的动漫短片
            </p>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 rounded-xl text-lime-400 font-medium transition-all shadow-lg shadow-slate-900/50 flex items-center gap-2 mx-auto border border-slate-600/30"
            >
              <WandIcon className="w-5 h-5" />
              创建第一个项目
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-600/30 overflow-hidden hover:border-slate-500/50 transition-all group"
              >
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 overflow-hidden">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <WandIcon className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(project.status)}
                  </div>

                  {project.status !== 'completed' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm px-3 py-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-300">
                          {stepNames[project.currentStep]}
                        </span>
                        <span className="text-lime-400 font-medium">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-100 mb-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>{project.createdAt}</span>
                    <span>
                      {project.currentStep + 1}/{stepNames.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelectProject(project.id)}
                      className="flex-1 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 rounded-lg text-lime-400 font-medium transition-all border border-slate-600/30 text-sm"
                    >
                      {project.status === 'completed' ? '查看详情' : '继续编辑'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="px-3 py-1.5 bg-slate-800/50 hover:bg-red-500/20 border border-slate-600/30 hover:border-red-500/30 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
