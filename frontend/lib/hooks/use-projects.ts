'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  status: 'draft' | 'processing' | 'completed';
  currentStep: number;
  progress: number;
  createdAt: string;
  description?: string;
  data: {
    projectId: string;
    novel: string;
    characters: any[];
    scenes: any[];
    videoUrl: string;
  };
}

interface ProjectStore {
  projects: Project[];
  currentProjectId: string | null;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  getCurrentProject: () => Project | undefined;
}

export const useProjects = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === id ? { ...p, ...updates } : p
          )
        })),
      
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId
        })),
      
      setCurrentProject: (id) =>
        set({ currentProjectId: id }),
      
      getCurrentProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.currentProjectId);
      }
    }),
    {
      name: 'ai-animate-projects',
    }
  )
);
