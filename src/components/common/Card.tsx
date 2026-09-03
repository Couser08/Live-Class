import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'interactive' | 'glow';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none text-slate-900 dark:text-slate-100',
    flat: 'bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100',
    interactive: 'bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 text-slate-900 dark:text-slate-100',
    glow: 'bg-white dark:bg-[#111726] rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-[0_0_24px_rgba(99,102,241,0.08)] text-slate-900 dark:text-slate-100',
  };

  return (
    <div
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
