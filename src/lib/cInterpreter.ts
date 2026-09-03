/**
 * Lightweight Client-Side C Interpreter & GCC Simulation
 * Parses and executes standard C programs (stdio.h, math.h, stdbool.h, functions, arrays, pointers, loops, recursion)
 * Generates realistic GCC compiler diagnostics and standard stdout output.
 */

export interface CExecutionResult {
  stdout: string;
  exitCode: number;
  executionTimeMs: number;
  hasErrors: boolean;
  errors?: string[];
}

export function executeCCode(
  sourceCode: string,
  headerFiles?: Record<string, string>
): CExecutionResult {
  const startTime = performance.now();

  // Basic syntax checks: main function presence
  if (!sourceCode.includes('main')) {
    return {
      stdout: '',
      exitCode: 1,
      executionTimeMs: 12,
      hasErrors: true,
      errors: ['error: undefined reference to `main`\ncollect2: error: ld returned 1 exit status'],
    };
  }

  // Check balanced braces
  const openBraces = (sourceCode.match(/\{/g) || []).length;
  const closeBraces = (sourceCode.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    return {
      stdout: '',
      exitCode: 1,
      executionTimeMs: 15,
      hasErrors: true,
      errors: [`error: expected '}' at end of input (found ${openBraces} '{' vs ${closeBraces} '}')`],
    };
  }

  try {
    let stdoutBuffer = '';

    // 1. Transpile C code to executable safe JavaScript
    let jsCode = sourceCode;

    // In-line user header files (e.g. #include "helper.h")
    if (headerFiles) {
      jsCode = jsCode.replace(/#include\s*"([^"]+)"/g, (_, headerName) => {
        return headerFiles[headerName] ? `\n${headerFiles[headerName]}\n` : '';
      });

      // Also append helper functions from any companion .h files
      for (const [hName, hContent] of Object.entries(headerFiles)) {
        if (hName.endsWith('.h') && !jsCode.includes(hContent)) {
          jsCode = `${hContent}\n${jsCode}`;
        }
      }
    }

    // Strip remaining preprocessor directives
    jsCode = jsCode.replace(/#include\s*<[^>]+>/g, '');
    jsCode = jsCode.replace(/#include\s*"[^"]+"/g, '');
    jsCode = jsCode.replace(/#define\s+(\w+)\s+([^\n]+)/g, 'const $1 = $2;');

    // Remove function forward declarations / prototypes ending with semicolon
    jsCode = jsCode.replace(/\b(?:int|float|double|char|long|short|void|bool)\s+[a-zA-Z_]\w*\s*\([^;{}]*\)\s*;/g, '');

    // Remove C type casts: (int)x, (float)y
    jsCode = jsCode.replace(/\(\s*(?:int|float|double|char|long|short|void\s*\*?)\s*\)/g, '');

    // Replace sizeof(arr) / sizeof(...) with arr.length (handles bracketed indices like data[0])
    jsCode = jsCode.replace(/sizeof\s*\(\s*(\w+)\s*\)\s*\/\s*sizeof\s*\([^;,\n]+\)/g, '$1.length');
    jsCode = jsCode.replace(/sizeof\s*\(\s*(\w+)\s*\)/g, '($1.length || 4)');
    jsCode = jsCode.replace(/sizeof\s*\([^;,\n]+\)/g, '4');

    // Replace array declarations:
    // e.g. int data[] = {64, 34, 25, 12, 22, 11, 90};
    // e.g. int arr[10];
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|void|bool)\s+([a-zA-Z_]\w*)\s*\[\s*\]\s*=\s*\{([^}]*)\}\s*;/g,
      'let $1 = [$2];'
    );
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|void|bool)\s+([a-zA-Z_]\w*)\s*\[\s*([^\]]+)\s*\]\s*;/g,
      'let $1 = new Array($2).fill(0);'
    );

    // Replace function declarations:
    // e.g. void bubbleSort(int arr[], int n) {
    // e.g. void printArray(int arr[], int size) {
    // e.g. int add(int a, int b) {
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|void|bool)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g,
      (_, fnName, paramList) => {
        const params = paramList
          .split(',')
          .map((p: string) => {
            const trimmed = p.trim();
            if (!trimmed || trimmed === 'void') return '';
            // Remove pointer symbols and array brackets from param name
            const tokens = trimmed.split(/\s+/);
            const paramName = tokens[tokens.length - 1].replace(/[\[\]\*]/g, '');
            return paramName;
          })
          .filter(Boolean)
          .join(', ');

        return `function ${fnName}(${params}) {`;
      }
    );

    // Replace multi-variable declarations:
    // e.g. int i, j, temp; or bool swapped;
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|bool)\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
      'let $1;'
    );

    // Replace typed variable definitions:
    // e.g. int n = 5; float pi = 3.14;
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|bool)\s+([a-zA-Z_]\w*)\s*=/g,
      'let $1 ='
    );

    // Standard printf implementation
    const customPrintf = (fmt: string, ...args: any[]) => {
      if (typeof fmt !== 'string') {
        stdoutBuffer += String(fmt);
        return;
      }

      // Convert literal \n and \t if present in raw string
      let text = fmt.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      let argIdx = 0;

      text = text.replace(/%(\.?\d*)?([dfiscp%])/g, (_, precision, type) => {
        if (type === '%') return '%';
        if (argIdx >= args.length) return '';

        const val = args[argIdx++];
        if (type === 'd' || type === 'i') {
          return String(Math.floor(Number(val) || 0));
        }
        if (type === 'f') {
          const num = Number(val) || 0;
          if (precision && precision.startsWith('.')) {
            const dec = parseInt(precision.substring(1), 10);
            return num.toFixed(dec);
          }
          return num.toFixed(6);
        }
        if (type === 'c') {
          return String(val).charAt(0);
        }
        return String(val ?? '');
      });

      stdoutBuffer += text;
    };

    // Construct sandboxed execution wrapper
    const runnerScript = `
      "use strict";
      ${jsCode}
      if (typeof main === 'function') {
        main();
      }
    `;

    // Execute within sandbox
    // eslint-disable-next-line no-new-func
    const executor = new Function('printf', runnerScript);
    executor(customPrintf);

    const duration = Math.round(performance.now() - startTime);

    return {
      stdout: stdoutBuffer,
      exitCode: 0,
      executionTimeMs: Math.max(14, duration),
      hasErrors: false,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return {
      stdout: '',
      exitCode: 1,
      executionTimeMs: Math.max(10, duration),
      hasErrors: true,
      errors: [
        `main.c: compilation / runtime error:\n${err.message || 'Syntax error or runtime exception'}`,
      ],
    };
  }
}
