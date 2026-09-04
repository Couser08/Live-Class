/**
 * Piston Code Execution Service with Supabase Submission Logging & Fallback
 * Integrates official Piston API (GCC 10.2.0) with local client-side interpreter fallback.
 */

import { executeCCode as localFallbackCCode } from '../lib/cInterpreter';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEFAULT_PISTON_API = import.meta.env.VITE_PISTON_API_URL || 'https://emkc.org/api/v2/piston';

export function getPistonApiUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('codebuddy_custom_piston_api');
    if (custom) return custom.trim().replace(/\/+$/, '');
  }
  return DEFAULT_PISTON_API;
}

export interface PistonExecutionResult {
  success: boolean;
  stage: 'compile' | 'runtime' | 'network';
  stdout: string;
  stderr: string;
  output: string;
  exitCode: number;
  executionTimeMs: number;
  engine: 'piston-gcc-10.2' | 'client-fallback';
}

export interface CodeSubmissionRecord {
  id: string;
  user_id: string;
  language: string;
  source_code: string;
  stdin_input?: string;
  stdout_output?: string;
  stderr_output?: string;
  status: 'success' | 'compile_error' | 'runtime_error' | 'network_error';
  execution_time_ms: number;
  created_at: string;
}

export async function executeCCodeViaPiston(
  sourceCode: string,
  companionFiles?: Record<string, string>,
  stdin: string = '',
  timeoutMs: number = 15000
): Promise<PistonExecutionResult> {
  const startTime = performance.now();

  // Prepare multi-file payload for native GCC compilation
  const files: Array<{ name: string; content: string }> = [
    { name: 'main.c', content: sourceCode },
  ];

  if (companionFiles) {
    for (const [fileName, fileContent] of Object.entries(companionFiles)) {
      if (fileName !== 'main.c' && (fileName.endsWith('.h') || fileName.endsWith('.c'))) {
        files.push({ name: fileName, content: fileContent });
      }
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getPistonApiUrl()}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '10.2.0',
        files,
        stdin: stdin || '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Piston API HTTP status ${response.status}`);
    }

    const data = await response.json();
    const duration = Math.round(performance.now() - startTime);

    // If Piston returns an informational or whitelist message instead of run data, fall back gracefully
    if (data.message && !data.run) {
      throw new Error(data.message);
    }

    // 1. Check for GCC compilation errors (C, C++, etc.)
    if (data.compile && data.compile.code !== 0) {
      const compileErr = data.compile.stderr || data.compile.output || 'GCC compilation error';
      return {
        success: false,
        stage: 'compile',
        stdout: '',
        stderr: compileErr,
        output: compileErr,
        exitCode: data.compile.code || 1,
        executionTimeMs: duration,
        engine: 'piston-gcc-10.2',
      };
    }

    // 2. Check for runtime execution errors
    if (data.run && data.run.code !== 0) {
      const runtimeErr = data.run.stderr || data.run.output || 'Process terminated with non-zero exit code';
      return {
        success: false,
        stage: 'runtime',
        stdout: data.run.stdout || '',
        stderr: runtimeErr,
        output: runtimeErr,
        exitCode: data.run.code,
        executionTimeMs: duration,
        engine: 'piston-gcc-10.2',
      };
    }

    // 3. Successful execution
    const out = data.run ? (data.run.stdout || data.run.output || '') : '';
    return {
      success: true,
      stage: 'runtime',
      stdout: out,
      stderr: '',
      output: out,
      exitCode: 0,
      executionTimeMs: duration,
      engine: 'piston-gcc-10.2',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Automatic graceful fallback to local client-side interpreter
    try {
      const localResult = localFallbackCCode(sourceCode, companionFiles, stdin);
      const duration = Math.round(performance.now() - startTime);

      if (localResult.hasErrors) {
        return {
          success: false,
          stage: 'compile',
          stdout: '',
          stderr: (localResult.errors && localResult.errors[0]) || 'Local syntax/compilation error',
          output: (localResult.errors && localResult.errors[0]) || 'Local syntax/compilation error',
          exitCode: localResult.exitCode || 1,
          executionTimeMs: duration,
          engine: 'client-fallback',
        };
      }

      return {
        success: true,
        stage: 'runtime',
        stdout: localResult.stdout,
        stderr: '',
        output: localResult.stdout,
        exitCode: 0,
        executionTimeMs: duration,
        engine: 'client-fallback',
      };
    } catch {
      const duration = Math.round(performance.now() - startTime);
      return {
        success: false,
        stage: 'network',
        stdout: '',
        stderr: `Execution Service Error: ${err?.message || 'Network unreachable'}`,
        output: `Execution Service Error: ${err?.message || 'Network unreachable'}`,
        exitCode: 1,
        executionTimeMs: duration,
        engine: 'client-fallback',
      };
    }
  }
}

/**
 * Record code submission into Supabase code_submissions table
 */
export async function saveCodeSubmission(
  sourceCode: string,
  stdin: string,
  execResult: PistonExecutionResult,
  userId?: string,
  companionFiles?: Record<string, string>,
  roomCode?: string
): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data } = await supabase.auth.getUser();
      resolvedUserId = data?.user?.id;
    }

    if (!resolvedUserId) return;

    const status = execResult.success
      ? 'success'
      : execResult.stage === 'compile'
      ? 'compile_error'
      : execResult.stage === 'runtime'
      ? 'runtime_error'
      : 'network_error';

    await supabase.from('code_submissions').insert({
      user_id: resolvedUserId,
      room_code: roomCode || null,
      language: 'c',
      source_code: sourceCode,
      companion_files: companionFiles || {},
      stdin_input: stdin || null,
      stdout_output: execResult.stdout || null,
      stderr_output: !execResult.success ? execResult.stderr : null,
      exit_code: execResult.exitCode || 0,
      engine: execResult.engine,
      compiler_version: '10.2.0',
      status,
      execution_time_ms: execResult.executionTimeMs,
    });
  } catch (e) {
    // Fail silently in demo/offline mode
    console.warn('Could not save submission to Supabase:', e);
  }
}

/**
 * Fetch past 20 code submissions from Supabase
 */
export async function getCodeSubmissionsHistory(userId?: string): Promise<CodeSubmissionRecord[]> {
  if (!isSupabaseConfigured) return [];

  try {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data } = await supabase.auth.getUser();
      resolvedUserId = data?.user?.id;
    }

    if (!resolvedUserId) return [];

    const { data, error } = await supabase
      .from('code_submissions')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];
    return data as CodeSubmissionRecord[];
  } catch {
    return [];
  }
}
