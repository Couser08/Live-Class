import { SupportedLanguage } from './session.types';

export interface CodeFile {
  id: string;
  name: string;
  language: SupportedLanguage;
  content: string;
  isEntrypoint?: boolean;
}

export interface CodeStreamPayload {
  sessionId: string;
  fileId: string;
  code: string;
  cursorPosition: {
    line: number;
    column: number;
  };
  senderId: string;
  senderName: string;
  timestamp: number;
}

export interface CodeExecutionResult {
  output: string;
  error?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  executionTimeMs?: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  language: SupportedLanguage;
  starterCode: string;
  solutionSnippet?: string;
  testCases?: { input: string; expectedOutput: string }[];
  isSubmitted?: boolean;
  submittedCode?: string;
  mentorFeedback?: string;
}
