export const mockProjects = [
  {
    id: 'project_001',
    name: '校园青春物语',
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
    status: 'processing' as const,
    currentStep: 1,
    progress: 45,
    createdAt: '2025-01-15',
    description: '一个关于高中生活的温馨故事，讲述友情与成长...',
    data: {
      projectId: 'novel_2025_001',
      novel: '夕阳西下，校园操场上...',
      characters: [],
      scenes: [],
      videoUrl: ''
    }
  },
  {
    id: 'project_002',
    name: '魔法学院冒险记',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    status: 'completed' as const,
    currentStep: 3,
    progress: 100,
    createdAt: '2025-01-14',
    description: '在神秘的魔法学院中，少年踏上了寻找真相的旅程...',
    data: {
      projectId: 'novel_2025_002',
      novel: '',
      characters: [],
      scenes: [],
      videoUrl: ''
    }
  },
  {
    id: 'project_003',
    name: '未来都市传说',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    status: 'draft' as const,
    currentStep: 0,
    progress: 10,
    createdAt: '2025-01-16',
    description: '2077年的霓虹都市，一个黑客揭开了惊天秘密...',
    data: {
      projectId: 'novel_2025_003',
      novel: '',
      characters: [],
      scenes: [],
      videoUrl: ''
    }
  }
];
