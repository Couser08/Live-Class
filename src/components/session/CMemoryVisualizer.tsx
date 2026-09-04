import React, { useMemo, useState } from 'react';
import {
  Layers,
  ArrowRight,
  Binary,
  Database,
  Sparkles,
} from 'lucide-react';

interface CMemoryVisualizerProps {
  code: string;
}

interface ParsedVariable {
  name: string;
  type: string;
  value: string;
  sizeBytes: number;
  address: string;
  isPointer: boolean;
  pointsToAddress?: string;
  pointsToVarName?: string;
  isArray?: boolean;
  arrayElements?: Array<{ index: number; value: string; address: string }>;
}

export const CMemoryVisualizer: React.FC<CMemoryVisualizerProps> = ({ code }) => {
  const [hoveredVar, setHoveredVar] = useState<string | null>(null);

  // Parse variables from C code
  const memorySnapshot = useMemo(() => {
    const vars: ParsedVariable[] = [];
    if (!code) return { vars, totalBytes: 0 };

    let baseAddr = 0x7ffd5a10;

    // 1. Match Arrays: int data[3] = {10, 20, 30}; or int data[] = {1, 2};
    const arrayRegex = /\b(int|float|double|char|bool)\s+([a-zA-Z_]\w*)\s*\[\s*(\d*)\s*\]\s*=\s*\{([^}]*)\}\s*;/g;
    let match: RegExpExecArray | null;
    const matchedNames = new Set<string>();

    while ((match = arrayRegex.exec(code)) !== null) {
      const type = match[1];
      const name = match[2];
      const items = match[4].split(',').map((x) => x.trim()).filter(Boolean);
      const elemSize = type === 'double' ? 8 : type === 'char' || type === 'bool' ? 1 : 4;
      const totalSize = Math.max(items.length, 1) * elemSize;

      const elements = items.map((val, idx) => ({
        index: idx,
        value: val,
        address: '0x' + (baseAddr + idx * elemSize).toString(16),
      }));

      vars.push({
        name,
        type: `${type}[${items.length}]`,
        value: `{ ${items.join(', ')} }`,
        sizeBytes: totalSize,
        address: '0x' + baseAddr.toString(16),
        isPointer: false,
        isArray: true,
        arrayElements: elements,
      });

      matchedNames.add(name);
      baseAddr += totalSize;
    }

    // 2. Match Pointers: int *ptr = &score; or int* p = &x; or int *p = NULL;
    const pointerRegex = /\b(int|float|double|char|void)\s*\*+\s*([a-zA-Z_]\w*)\s*(?:=\s*&?([a-zA-Z_]\w*|\d+|NULL))?\s*;/g;
    while ((match = pointerRegex.exec(code)) !== null) {
      const baseType = match[1];
      const name = match[2];
      const target = match[3] || 'NULL';

      if (matchedNames.has(name)) continue;

      const ptrAddr = '0x' + baseAddr.toString(16);
      baseAddr += 8; // 64-bit pointers are 8 bytes

      vars.push({
        name,
        type: `${baseType}*`,
        value: target.startsWith('0x') ? target : target === 'NULL' ? '0x00000000' : target,
        sizeBytes: 8,
        address: ptrAddr,
        isPointer: true,
        pointsToVarName: target !== 'NULL' && !target.startsWith('0x') ? target : undefined,
      });

      matchedNames.add(name);
    }

    // 3. Match Scalar variables: int a = 10; float pi = 3.14; char ch = 'A';
    const scalarRegex = /\b(int|float|double|char|bool)\s+([a-zA-Z_]\w*)\s*(?:=\s*([^;]+))?\s*;/g;
    while ((match = scalarRegex.exec(code)) !== null) {
      const type = match[1];
      const name = match[2];
      const rawVal = match[3] ? match[3].trim() : '0';

      if (matchedNames.has(name)) continue;

      const size = type === 'double' ? 8 : type === 'char' || type === 'bool' ? 1 : 4;
      const addr = '0x' + baseAddr.toString(16);
      baseAddr += size;

      vars.push({
        name,
        type,
        value: rawVal,
        sizeBytes: size,
        address: addr,
        isPointer: false,
      });

      matchedNames.add(name);
    }

    // Link pointers to target memory addresses
    for (const v of vars) {
      if (v.isPointer && v.pointsToVarName) {
        const targetVar = vars.find((tv) => tv.name === v.pointsToVarName);
        if (targetVar) {
          v.pointsToAddress = targetVar.address;
          v.value = targetVar.address;
        }
      }
    }

    const totalBytes = vars.reduce((acc, curr) => acc + curr.sizeBytes, 0);
    return { vars, totalBytes };
  }, [code]);

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-50/50 dark:bg-[#0d121f] text-slate-900 dark:text-white overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>C Memory & Pointer Visualizer</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                Stack Frame
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Interactive 64-bit memory representation of local variables & pointers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs">
            <Database className="w-3 h-3 text-indigo-500" />
            <span>{memorySnapshot.totalBytes} Bytes on Stack</span>
          </div>
        </div>
      </div>

      {/* Main Memory Diagram */}
      {memorySnapshot.vars.length === 0 ? (
        <div className="my-auto py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60">
            <Binary className="w-6 h-6" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              No Local Variables Detected
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Declare variables or pointers in your C program (e.g.{' '}
              <code className="text-indigo-500 font-mono">int x = 42; int *p = &x;</code>) to watch memory allocate in real time!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-3">
          {/* Stack Frame Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Function Scope: <span className="text-indigo-600 dark:text-indigo-400">main()</span>
              </span>
              <span className="text-[10px]">High Memory (Stack grows downward ↓)</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {memorySnapshot.vars.map((v) => {
                const isTargetOfHovered =
                  hoveredVar &&
                  memorySnapshot.vars.find((hv) => hv.name === hoveredVar)?.pointsToVarName === v.name;
                const isCurrentHovered = hoveredVar === v.name;

                return (
                  <div
                    key={v.name}
                    onMouseEnter={() => setHoveredVar(v.name)}
                    onMouseLeave={() => setHoveredVar(null)}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrentHovered
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                        : isTargetOfHovered
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* Variable Name & Type */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                            v.isPointer
                              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : v.isArray
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {v.type}
                        </span>

                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          {v.name}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          ({v.sizeBytes} {v.sizeBytes === 1 ? 'byte' : 'bytes'})
                        </span>
                      </div>

                      {/* Memory Address Badge */}
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-slate-400 text-[10px]">&{v.name} =</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300/80 dark:border-slate-700">
                          {v.address}
                        </span>
                      </div>
                    </div>

                    {/* Array Cells Visualizer */}
                    {v.isArray && v.arrayElements ? (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="flex flex-wrap gap-2">
                          {v.arrayElements.map((elem) => (
                            <div
                              key={elem.index}
                              className="flex flex-col items-center bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700 min-w-[70px]"
                            >
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                [{elem.index}]
                              </span>
                              <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white py-0.5">
                                {elem.value}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                                {elem.address}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : v.isPointer ? (
                      /* Pointer Target Link with Visual Arrow */
                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[11px]">Points To Address:</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {v.value}
                          </span>
                        </div>

                        {v.pointsToVarName && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300/70 dark:border-emerald-800">
                            <ArrowRight className="w-3 h-3" />
                            <span>Target: &{v.pointsToVarName}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Standard Scalar Value */
                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 text-[11px]">Stored Value:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {v.value}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Legend & Cheat Sheet */}
          <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 text-[11px] space-y-1.5">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>C Memory Cheat Sheet</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
              <div>
                <strong className="text-indigo-600 dark:text-indigo-400">&var</strong>: Address of variable in RAM
              </div>
              <div>
                <strong className="text-purple-600 dark:text-purple-400">*ptr</strong>: Dereference (value at target address)
              </div>
              <div>
                <strong className="text-amber-600 dark:text-amber-400">arr[i]</strong>: Offset address <code className="text-[9px]">*(arr + i)</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
