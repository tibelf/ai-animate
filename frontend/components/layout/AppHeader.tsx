"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Wand2 } from "lucide-react";

interface AppHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export function AppHeader({ showBackButton = false, onBack }: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/");
    }
  };

  return (
    <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="w-9 h-9 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg flex items-center justify-center transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-slate-300" />
              </button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/50 border border-slate-600/30">
              <Wand2 className="w-5 h-5 text-lime-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">漫飞</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
