import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate an easy-to-share 6-character room code (e.g., "CB-4829")
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'CB-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a 4-digit session security PIN (e.g., "4821")
 */
export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Format milliseconds to hours and minutes string
 */
export function formatDuration(minutes: number): { hours: number; mins: number; formatted: string } {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return {
    hours,
    mins,
    formatted: `${hours}h ${mins}m`,
  };
}

/**
 * Delay execution for async animations or typing
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
