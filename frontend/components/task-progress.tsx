import React from 'react';
import { motion } from 'framer-motion';
import { LoaderIcon } from 'lucide-react';

interface TaskProgressProps {
  stage: string;
  progress: number;
  message?: string;
}

export function TaskProgress({
  stage,
  progress,
  message
}: TaskProgressProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <LoaderIcon className="w-5 h-5 text-lime-400" />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-100">{stage}</span>
            <span className="text-sm text-lime-400">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
      {message && <p className="text-sm text-slate-400">{message}</p>}
    </div>
  );
}
