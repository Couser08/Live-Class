import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { ShikiHighlighter } from './ShikiHighlighter';
import { useCodeStore } from '../../stores/codeStore';
import { useDelayedTypewriter } from '../../hooks/useDelayedTypewriter';

export const MockEditorPreview: React.FC = () => {
  const { mentorCode, activeLanguage } = useCodeStore();

  const { isTyping } = useDelayedTypewriter({
    targetText: mentorCode,
    delayMs: 500,
    typingSpeedMs: 10,
  });

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Mentor & Friend Status Indicators */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 bg-[#1C2038] border border-slate-700/60 rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-slate-300">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400"></span>
          <span>You (Mentor)</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1C2038] border border-slate-700/60 rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-slate-300">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-400"></span>
          <span>Friend (Live)</span>
        </div>
      </div>

      {/* Dual Windows: Code Editor & Live Preview with Sync Button */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {/* Editor Box */}
        <div className="bg-[#16192E] rounded-2xl border border-slate-700/60 p-3 sm:p-3.5 shadow-xl flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
              {activeLanguage === 'html' ? 'index.html' : activeLanguage === 'c' ? 'main.c' : 'script.js'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Synced</span>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto max-h-[190px] sm:max-h-[220px]">
            <ShikiHighlighter
              code={mentorCode}
              language={activeLanguage}
              showLineNumbers={true}
              className="text-[10px] sm:text-[11px]"
            />
          </div>
        </div>

        {/* Sync Center Action */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1F2445] border border-indigo-400/30 text-indigo-300 flex items-center justify-center shadow-lg shadow-black/40 backdrop-blur-md pointer-events-auto"
          >
            <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </motion.div>
        </div>

        {/* Live Preview Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-slate-50/90 px-3 py-1.5 sm:py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500">
              • Live Preview
            </span>
          </div>

          {/* Render Area */}
          <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-center items-start min-h-[140px] sm:min-h-[170px] bg-white">
            {activeLanguage === 'html' ? (
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Hello, World!
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Learning HTML is fun 🚀
                </p>
              </div>
            ) : activeLanguage === 'c' ? (
              <div className="space-y-1 font-mono text-xs text-slate-800">
                <div className="text-slate-400 text-[10px]">// Output Terminal</div>
                <div className="text-emerald-600 font-semibold">Hello, World!</div>
                <div>Welcome to C Programming 🚀</div>
              </div>
            ) : (
              <div className="space-y-1 font-sans">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Hello, Amit!</h2>
                <p className="text-xs text-slate-600">Let's code together 🚀</p>
              </div>
            )}

            {isTyping && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] sm:text-[10px] text-indigo-600 font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                <span>Typing stream active (500ms delay)...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
