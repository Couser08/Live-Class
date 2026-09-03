import React from 'react';
import { ChevronRight, GitBranch, Users, FileCode2 } from 'lucide-react';
import { useCodeStore } from '../../stores/codeStore';

export const EditorBreadcrumbs: React.FC = () => {
  const { files, activeFileId, activeLanguage } = useCodeStore();
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const getBreadcrumbNodes = () => {
    if (activeLanguage === 'html') {
      return ['workspace', 'src', activeFile.name, '<body>', '<h1>'];
    }
    if (activeLanguage === 'c') {
      return ['workspace', 'src', activeFile.name, 'main()'];
    }
    return ['workspace', 'src', activeFile.name, 'initClassroom()'];
  };

  const nodes = getBreadcrumbNodes();

  return (
    <div className="bg-[#0E1122] px-3.5 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none overflow-x-auto">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-1.5 min-w-0">
        <FileCode2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <span
              className={
                i === nodes.length - 1
                  ? 'text-indigo-300 font-semibold truncate'
                  : 'text-slate-400 hover:text-slate-200 transition-colors cursor-pointer truncate'
              }
            >
              {node}
            </span>
            {i < nodes.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Git & Collaborator Status */}
      <div className="hidden sm:flex items-center gap-3 shrink-0 ml-3">
        <div className="flex items-center gap-1 text-slate-400 hover:text-slate-200">
          <GitBranch className="w-3 h-3 text-emerald-400" />
          <span>main</span>
        </div>

        <div className="flex items-center gap-1.5 text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/40">
          <Users className="w-3 h-3 text-indigo-400" />
          <span>Rahul (Mentor) + Amit</span>
        </div>
      </div>
    </div>
  );
};
