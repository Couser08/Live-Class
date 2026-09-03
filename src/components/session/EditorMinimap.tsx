import React from 'react';
import { useCodeStore } from '../../stores/codeStore';

interface EditorMinimapProps {
  cursorLine: number;
}

export const EditorMinimap: React.FC<EditorMinimapProps> = ({ cursorLine }) => {
  const mentorCode = useCodeStore((state) => state.mentorCode);
  const lines = mentorCode.split('\n');

  return (
    <div className="w-14 bg-[#0A0D18] border-l border-slate-800/80 p-1.5 overflow-hidden select-none hidden md:flex flex-col relative shrink-0">
      {/* Viewport Scrubber Highlight Box */}
      <div
        className="absolute left-1 right-1 bg-indigo-500/15 border border-indigo-500/40 rounded-sm pointer-events-none transition-all duration-150"
        style={{
          top: `${Math.max(4, Math.min(lines.length * 4, cursorLine * 4 - 8))}px`,
          height: '28px',
        }}
      />

      {/* Miniature Code Lines Preview */}
      <div className="space-y-[3px] opacity-60">
        {lines.slice(0, 45).map((line, i) => {
          const trimmed = line.trim();
          const widthPercent = Math.min(100, Math.max(15, trimmed.length * 4));
          const isHighlighted = i + 1 === cursorLine;

          return (
            <div
              key={i}
              className={`h-[2px] rounded-xs transition-colors ${
                isHighlighted
                  ? 'bg-indigo-400 opacity-100'
                  : trimmed.startsWith('<') || trimmed.startsWith('#')
                  ? 'bg-sky-400/80'
                  : trimmed.startsWith('function') || trimmed.startsWith('int')
                  ? 'bg-emerald-400/80'
                  : 'bg-slate-500/60'
              }`}
              style={{
                width: `${widthPercent}%`,
                marginLeft: `${line.search(/\S|$/) * 1.5}px`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
