'use client';

import { motion } from 'framer-motion';
import { Loader2Icon } from 'lucide-react';

interface TaskProgressProps {
  stage: string;
  progress: number;
  message: string;
}

export function TaskProgress({ stage, progress, message }: TaskProgressProps) {
  return (
    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-600/30">
      <div className="flex items-center gap-3 mb-3">
        <Loader2Icon className="w-5 h-5 text-lime-400 animate-spin" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-200">{stage}</span>
            <span className="text-sm text-lime-400 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}
