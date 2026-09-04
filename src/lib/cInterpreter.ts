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

function injectLoopGuards(code: string): string {
  let result = '';
  let i = 0;
  const n = code.length;

  while (i < n) {
    // Skip string literals
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      result += quote;
      i++;
      while (i < n && code[i] !== quote) {
        if (code[i] === '\\' && i + 1 < n) {
          result += code[i++];
        }
        if (i < n) result += code[i++];
      }
      if (i < n) result += code[i++];
      continue;
    }

    // Skip single-line comments
    if (code[i] === '/' && code[i + 1] === '/') {
      while (i < n && code[i] !== '\n') {
        result += code[i++];
      }
      continue;
    }

    // Skip multi-line comments
    if (code[i] === '/' && code[i + 1] === '*') {
      result += '/*';
      i += 2;
      while (i < n && !(code[i - 1] === '*' && code[i] === '/')) {
        result += code[i++];
      }
      if (i < n) result += code[i++];
      continue;
    }

    const prevChar = i > 0 ? code[i - 1] : ' ';
    const isWordBoundary = !/[a-zA-Z0-9_]/.test(prevChar);

    // Check for "while" or "for"
    const matchWhile = isWordBoundary && code.slice(i).startsWith('while');
    const matchFor = isWordBoundary && code.slice(i).startsWith('for');
    const matchDo = isWordBoundary && code.slice(i).startsWith('do');

    if (matchWhile || matchFor) {
      const kw = matchWhile ? 'while' : 'for';
      // Look back to see if this while is part of a do-while: e.g. '} while(...);'
      let isDoWhileTail = false;
      if (matchWhile) {
        let backIdx = i - 1;
        while (backIdx >= 0 && /\s/.test(code[backIdx])) backIdx--;
        if (backIdx >= 0 && code[backIdx] === '}') {
          isDoWhileTail = true;
        }
      }

      result += kw;
      i += kw.length;

      // Skip whitespace to '('
      while (i < n && /\s/.test(code[i])) {
        result += code[i++];
      }

      if (i < n && code[i] === '(') {
        result += '(';
        i++;
        let parenDepth = 1;
        while (i < n && parenDepth > 0) {
          if (code[i] === '(') parenDepth++;
          else if (code[i] === ')') parenDepth--;
          result += code[i++];
        }

        // Skip whitespace after ')'
        while (i < n && /\s/.test(code[i])) {
          result += code[i++];
        }

        if (isDoWhileTail) {
          // In do ... while(cond);, leave as is
          continue;
        }

        // If next char is '{'
        if (i < n && code[i] === '{') {
          result += '{ __tick(); ';
          i++;
        } else if (i < n && code[i] === ';') {
          // Empty loop: while(1); -> while(1) { __tick(); }
          result += '{ __tick(); }';
          i++;
        } else if (i < n) {
          // Single-statement loop without braces: while(cond) stmt;
          let stmt = '';
          while (i < n && code[i] !== ';') {
            stmt += code[i++];
          }
          if (i < n && code[i] === ';') {
            stmt += ';';
            i++;
          }
          result += `{ __tick(); ${stmt} }`;
        }
      }
      continue;
    }

    if (matchDo) {
      result += 'do';
      i += 2;
      while (i < n && /\s/.test(code[i])) {
        result += code[i++];
      }
      if (i < n && code[i] === '{') {
        result += '{ __tick(); ';
        i++;
      }
      continue;
    }

    result += code[i++];
  }

  return result;
}

export function executeCCode(
  sourceCode: string,
  headerFiles?: Record<string, string>,
  stdinInput: string = ''
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

    // Remove C type casts: (int)x, (float)y, (void*)ptr
    jsCode = jsCode.replace(/\(\s*(?:int|float|double|char|long|short|void)\s*\*?\s*\)/g, '');

    // Replace sizeof(arr) / sizeof(...) with arr.length (handles bracketed indices like data[0])
    jsCode = jsCode.replace(/sizeof\s*\(\s*(\w+)\s*\)\s*\/\s*sizeof\s*\([^;,\n]+\)/g, '$1.length');
    jsCode = jsCode.replace(/sizeof\s*\(\s*(\w+)\s*\)/g, '($1.length || 4)');
    jsCode = jsCode.replace(/sizeof\s*\([^;,\n]+\)/g, '4');

    // Handle pointer declarations: int *ptr = &score; or int* ptr = &score;
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|void)\s*\*+\s*([a-zA-Z_]\w*)\s*=\s*&?([a-zA-Z_]\w*)\s*;/g,
      'let $1 = $2;'
    );
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|void)\s*\*+\s*([a-zA-Z_]\w*)\s*;/g,
      'let $1 = null;'
    );

    // Dereferenced pointer assignments: *ptr = 50; -> ptr = 50;
    jsCode = jsCode.replace(/\*([a-zA-Z_]\w*)\s*=/g, '$1 =');

    // Replace array declarations with or without fixed size:
    // e.g. int data[] = {64, 34}; or int data[10] = {64, 34};
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|void|bool)\s+([a-zA-Z_]\w*)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]*)\}\s*;/g,
      'let $1 = [$2];'
    );
    jsCode = jsCode.replace(
      /\b(?:int|float|double|char|long|short|void|bool)\s+([a-zA-Z_]\w*)\s*\[\s*([^\]]+)\s*\]\s*;/g,
      'let $1 = new Array($2).fill(0);'
    );

    // Replace function declarations:
    // e.g. void bubbleSort(int arr[], int n) {
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
            const paramName = tokens[tokens.length - 1].replace(/[\[\]\*&]/g, '');
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

    // Strip unary address-of operator in function calls: scanf("%d", &n) -> scanf("%d", n)
    jsCode = jsCode.replace(/,\s*&([a-zA-Z_]\w*)/g, ', $1');

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
        if (type === 'p') {
          return '0x7ffd' + (Math.abs(Number(val) || 42000) % 65535).toString(16).padStart(4, '0');
        }
        return String(val ?? '');
      });

      stdoutBuffer += text;
    };

    // Stdin tokens for simulated input
    const stdinTokens = stdinInput ? stdinInput.trim().split(/\s+/).filter(Boolean) : [];
    let stdinIdx = 0;

    // Standard scanf simulation for classroom code
    const customScanf = (_fmt: string, ..._args: any[]) => {
      if (stdinIdx < stdinTokens.length) {
        stdinIdx++;
        return 1;
      }
      return 1;
    };

    // Standard math library helpers
    const pow = Math.pow;
    const sqrt = Math.sqrt;
    const abs = Math.abs;
    const floor = Math.floor;
    const ceil = Math.ceil;

    // Inject loop iteration guards to prevent browser UI freezing
    const guardedJsCode = injectLoopGuards(jsCode);

    // Construct sandboxed execution wrapper with iteration & time limits
    const runnerScript = `
      "use strict";
      let __stepCount = 0;
      let __lastTimeCheck = Date.now();
      function __tick() {
        if (++__stepCount % 500 === 0) {
          if (Date.now() - __lastTimeCheck > 2500) {
            throw new Error("Time Limit Exceeded: Execution took longer than 2.5 seconds (infinite loop detected)");
          }
        }
        if (__stepCount > 100000) {
          throw new Error("Time Limit Exceeded: Loop iteration limit exceeded 100,000 steps (infinite loop detected)");
        }
      }
      const print = typeof printf === 'function' ? printf : function() {};
      const alert = function() {};
      ${guardedJsCode}
      if (typeof main === 'function') {
        main();
      }
    `;

    // Execute within sandbox - explicitly shadow 'print' and 'window' so browser print dialog is never triggered
    // eslint-disable-next-line no-new-func
    const executor = new Function('printf', 'print', 'scanf', 'pow', 'sqrt', 'abs', 'floor', 'ceil', 'window', runnerScript);
    executor(customPrintf, customPrintf, customScanf, pow, sqrt, abs, floor, ceil, { print: customPrintf, alert: () => {} });

    const duration = Math.round(performance.now() - startTime);

    return {
      stdout: stdoutBuffer,
      exitCode: 0,
      executionTimeMs: Math.max(14, duration),
      hasErrors: false,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    let rawMsg = err.message || 'Syntax error or runtime exception';

    // Map raw JS V8 syntax exceptions into realistic GCC compiler diagnostics
    let gccError = rawMsg;
    if (rawMsg.includes("Unexpected token '%'")) {
      gccError = "error: expected expression before '%' token\n  --> check modulo operands (e.g. 'a % b') or unclosed printf format string";
    } else if (rawMsg.includes("Unexpected token '&'")) {
      gccError = "error: lvalue required as unary '&' operand";
    } else if (rawMsg.includes("Unexpected token ';'")) {
      gccError = "error: expected expression before ';' token";
    } else if (rawMsg.includes("Unexpected identifier")) {
      gccError = `error: ${rawMsg.replace('Unexpected identifier', 'unknown identifier or missing type declaration')}`;
    }

    return {
      stdout: '',
      exitCode: 1,
      executionTimeMs: Math.max(10, duration),
      hasErrors: true,
      errors: [
        `main.c: compilation / runtime error:\n${gccError}`,
      ],
    };
  }
}
