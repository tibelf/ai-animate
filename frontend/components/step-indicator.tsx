'use client';

import React from 'react';
import { CheckIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick
}: StepIndicatorProps) {
  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div
              key={step.id}
              className="flex items-start"
              style={{ width: `${100 / steps.length}%` }}
            >
              <div className="flex flex-col items-center w-full">
                <button
                  onClick={() => onStepClick?.(index)}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-lime-400 to-emerald-500 shadow-lg shadow-lime-500/50'
                      : isCurrent
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-500/50 border-2 border-lime-400'
                      : 'bg-slate-800/50 backdrop-blur-sm border border-slate-600/30'
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-6 h-6 text-slate-900" />
                  ) : (
                    <span
                      className={`text-lg font-semibold ${
                        isCurrent ? 'text-lime-400' : 'text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                  
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-lime-400"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </button>
                
                <span
                  className={`mt-3 text-sm font-medium text-center ${
                    isCurrent
                      ? 'text-lime-400'
                      : isCompleted
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className="flex-1 flex items-center"
                  style={{
                    marginTop: '24px',
                    marginLeft: '-50%',
                    marginRight: '-50%',
                  }}
                >
                  <div className="w-full h-0.5 relative">
                    <div className="absolute inset-0 bg-slate-700/50" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-lime-400 to-emerald-500"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isCompleted ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
