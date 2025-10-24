'use client';

import { isMockMode } from '@/lib/api-factory';
import { AlertCircle } from 'lucide-react';

export function ModeIndicator() {
  if (!isMockMode) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-amber-300 font-medium">Mock 数据模式</span>
      </div>
    </div>
  );
}
