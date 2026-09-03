import { create } from 'zustand';
import { SupportedLanguage } from '../types/session.types';

export interface CodeFile {
  id: string;
  name: string;
  language: SupportedLanguage | 'css' | 'markdown';
  content: string;
  isModified?: boolean;
}

export const WORKSPACE_TEMPLATES: Record<SupportedLanguage, CodeFile[]> = {
  html: [
    {
      id: 'file_html',
      name: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Live Class Demo</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <h1>Hello, CodeBuddy! 👋</h1>
    <p>Welcome to our live coding session.</p>
    <button id="actionBtn" onclick="handleClick()">Click Me 🚀</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    },
    {
      id: 'file_css',
      name: 'style.css',
      language: 'css',
      content: `body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 30px;
  background: #f8fafc;
  color: #0f172a;
}

.card {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  max-width: 420px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  color: #4f46e5;
  font-size: 22px;
  margin-top: 0;
}

button {
  background: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: transform 0.1s;
}

button:hover {
  background: #4338ca;
}`,
    },
    {
      id: 'file_js',
      name: 'script.js',
      language: 'javascript',
      content: `function handleClick() {
  alert("Interactive JavaScript linked successfully! 🚀");
  console.log("Button clicked inside live preview iframe");
}`,
    },
  ],

  c: [
    {
      id: 'file_c_main',
      name: 'main.c',
      language: 'c',
      content: `#include <stdio.h>
#include "helper.h"

int main() {
    int total_sessions = 19;
    printf("================================\\n");
    printf("  C Programming Live Session 🚀\\n");
    printf("================================\\n");
    printf("Total sessions taught: %d\\n", total_sessions);
    
    for (int i = 1; i <= 3; i++) {
        printf("Milestone step %d ready\\n", i);
    }
    
    print_greeting();
    return 0;
}`,
    },
    {
      id: 'file_c_helper',
      name: 'helper.h',
      language: 'c',
      content: `// Helper functions for C Classroom
void print_greeting() {
    printf("Happy coding with your mentor! 👋\\n");
}`,
    },
    {
      id: 'file_c_readme',
      name: 'README.md',
      language: 'markdown',
      content: `# C Programming Live Classroom
- Language: C (GCC 13.2)
- Focus: Pointers, Loops & Memory Structure`,
    },
  ],

  javascript: [
    {
      id: 'file_js_index',
      name: 'index.js',
      language: 'javascript',
      content: `// JavaScript 1-on-1 Mentoring Room
function calculateScore(completed, total) {
  return Math.round((completed / total) * 100);
}

const score = calculateScore(14, 20);
console.log(\`Student Progress Score: \${score}%\`);

document.body.innerHTML = \`
  <div style="font-family: system-ui; padding: 24px; text-align: center;">
    <h2 style="color: #4f46e5;">JavaScript Live Demo ⚡</h2>
    <p>Student Progress Score: <strong>\${score}%</strong></p>
  </div>
\`;`,
    },
    {
      id: 'file_js_utils',
      name: 'utils.js',
      language: 'javascript',
      content: `export function formatDate(d) {
  return new Date(d).toLocaleDateString();
}`,
    },
  ],
};

interface CodeState {
  files: CodeFile[];
  activeFileId: string;
  activeLanguage: SupportedLanguage;
  mentorCode: string;
  friendCode: string;
  executedFiles: Record<string, string>; // Complete snapshot of all workspace files for linking
  autoRun: boolean;
  historySnapshots: string[];
  historyIndex: number;
  isTimelineOpen: boolean;

  setLanguage: (lang: SupportedLanguage) => void;
  setMentorCode: (code: string) => void;
  setFriendCode: (code: string) => void;
  setActiveFile: (fileId: string) => void;
  addNewFile: (name: string, language: SupportedLanguage | 'css' | 'markdown') => void;
  closeFile: (fileId: string) => void;
  runCode: () => void;
  formatCurrentCode: () => void;
  toggleAutoRun: () => void;
  toggleTimeline: () => void;
  setHistoryIndex: (index: number) => void;
}

export const useCodeStore = create<CodeState>((set, get) => {
  const initialLang: SupportedLanguage = 'html';
  const initialFiles = WORKSPACE_TEMPLATES[initialLang];

  const initialExecuted: Record<string, string> = {};
  initialFiles.forEach((f) => {
    initialExecuted[f.name] = f.content;
  });

  return {
    files: initialFiles,
    activeFileId: initialFiles[0].id,
    activeLanguage: initialLang,
    mentorCode: initialFiles[0].content,
    friendCode: initialFiles[0].content,
    executedFiles: initialExecuted,
    autoRun: false,
    historySnapshots: [initialFiles[0].content],
    historyIndex: 0,
    isTimelineOpen: false,

    setLanguage: (lang: SupportedLanguage) => {
      const templateFiles = WORKSPACE_TEMPLATES[lang] || WORKSPACE_TEMPLATES.html;
      const snapshot: Record<string, string> = {};
      templateFiles.forEach((f) => {
        snapshot[f.name] = f.content;
      });

      set({
        activeLanguage: lang,
        files: templateFiles,
        activeFileId: templateFiles[0].id,
        mentorCode: templateFiles[0].content,
        friendCode: templateFiles[0].content,
        executedFiles: snapshot,
        historySnapshots: [templateFiles[0].content],
        historyIndex: 0,
      });
    },

    setMentorCode: (code: string) => {
      const { activeFileId, files, autoRun, historySnapshots } = get();
      const updatedFiles = files.map((f) =>
        f.id === activeFileId ? { ...f, content: code, isModified: true } : f
      );

      const activeFile = files.find((f) => f.id === activeFileId);
      const nextExecuted = { ...get().executedFiles };
      if (activeFile) {
        nextExecuted[activeFile.name] = code;
      }

      const nextSnapshots = historySnapshots.length > 50
        ? [...historySnapshots.slice(1), code]
        : [...historySnapshots, code];

      set({
        mentorCode: code,
        files: updatedFiles,
        historySnapshots: nextSnapshots,
        historyIndex: nextSnapshots.length - 1,
        ...(autoRun ? { executedFiles: nextExecuted } : {}),
      });
    },

    setFriendCode: (code: string) => {
      set({ friendCode: code });
    },

    setActiveFile: (fileId: string) => {
      const targetFile = get().files.find((f) => f.id === fileId);
      if (targetFile) {
        set({
          activeFileId: fileId,
          mentorCode: targetFile.content,
        });
      }
    },

    addNewFile: (name: string, language: SupportedLanguage | 'css' | 'markdown') => {
      const newFile: CodeFile = {
        id: `file_${Date.now()}`,
        name,
        language,
        content: `/* ${name} */\n`,
        isModified: false,
      };
      set((state) => ({
        files: [...state.files, newFile],
        activeFileId: newFile.id,
        mentorCode: newFile.content,
      }));
    },

    closeFile: (fileId: string) => {
      const { files, activeFileId } = get();
      if (files.length <= 1) return;
      const nextFiles = files.filter((f) => f.id !== fileId);
      set({
        files: nextFiles,
        ...(activeFileId === fileId ? { activeFileId: nextFiles[0].id, mentorCode: nextFiles[0].content } : {}),
      });
    },

    runCode: () => {
      const { files } = get();
      const snapshot: Record<string, string> = {};
      files.forEach((f) => {
        snapshot[f.name] = f.content;
      });
      set({ executedFiles: snapshot });
    },

    formatCurrentCode: () => {
      const { mentorCode } = get();
      const lines = mentorCode.split('\n');
      let indentLevel = 0;
      const formatted = lines
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('</') || trimmed.startsWith('}')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          const indented = '  '.repeat(indentLevel) + trimmed;
          if (
            (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) ||
            trimmed.endsWith('{')
          ) {
            indentLevel++;
          }
          return indented;
        })
        .join('\n');

      get().setMentorCode(formatted);
    },

    toggleAutoRun: () => {
      set((state) => {
        const nextAuto = !state.autoRun;
        const snapshot: Record<string, string> = {};
        state.files.forEach((f) => {
          snapshot[f.name] = f.content;
        });
        return {
          autoRun: nextAuto,
          ...(nextAuto ? { executedFiles: snapshot } : {}),
        };
      });
    },

    toggleTimeline: () => {
      set((state) => ({ isTimelineOpen: !state.isTimelineOpen }));
    },

    setHistoryIndex: (index: number) => {
      const { historySnapshots } = get();
      if (historySnapshots[index]) {
        set({
          historyIndex: index,
          mentorCode: historySnapshots[index],
        });
      }
    },
  };
});
