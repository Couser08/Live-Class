import React from 'react';
import { Plus, X } from 'lucide-react';
import { useCodeStore, CodeFile } from '../../stores/codeStore';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export const EditorFileTabs: React.FC = () => {
  const { files, activeFileId, setActiveFile, closeFile, addNewFile } = useCodeStore();
  const { addToast } = useUIStore();

  const handleAddFile = () => {
    const fileName = prompt('Enter new file name (e.g., utils.js, styles.css):');
    if (!fileName) return;

    let lang: any = 'javascript';
    if (fileName.endsWith('.html')) lang = 'html';
    else if (fileName.endsWith('.c')) lang = 'c';
    else if (fileName.endsWith('.css')) lang = 'css';
    else if (fileName.endsWith('.md')) lang = 'markdown';

    addNewFile(fileName, lang);
    addToast({
      type: 'success',
      title: 'File Created',
      description: `Added ${fileName} to workspace.`,
    });
  };

  const getFileIcon = (file: CodeFile) => {
    if (file.language === 'html') return '🌐';
    if (file.language === 'c') return '⚙️';
    if (file.language === 'javascript') return '⚡';
    if (file.language === 'css') return '🎨';
    return '📄';
  };

  return (
    <div className="bg-[#0B0D1B] px-2 pt-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto select-none">
      {/* File Tabs List */}
      <div className="flex items-center gap-1 min-w-0">
        {files.map((file) => {
          const isActive = file.id === activeFileId;

          return (
            <div
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={cn(
                'group relative flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-mono font-medium transition-colors cursor-pointer border-t border-x',
                isActive
                  ? 'bg-[#131628] text-slate-100 border-slate-700/80 shadow-xs'
                  : 'bg-[#0E1122] text-slate-400 border-transparent hover:bg-[#131628]/60 hover:text-slate-300'
              )}
            >
              <span className="text-xs">{getFileIcon(file)}</span>
              <span className="truncate max-w-[110px]">{file.name}</span>

              {/* Dirty indicator dot */}
              {file.isModified && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}

              {/* Close Button */}
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.id);
                  }}
                  className="w-4 h-4 rounded-md text-slate-500 hover:text-white hover:bg-slate-700/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Close file"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add File Button */}
        <button
          type="button"
          onClick={handleAddFile}
          className="w-6 h-6 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer ml-1"
          title="New file"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
