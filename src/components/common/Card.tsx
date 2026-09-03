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
    default: 'bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] text-slate-900 dark:text-slate-100',
    flat: 'bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-slate-800/80 text-slate-900 dark:text-slate-100',
    interactive: 'bg-white dark:bg-[#111622] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(79,70,229,0.08)] hover:border-indigo-200 dark:hover:border-indigo-800/80 transition-all duration-200 text-slate-900 dark:text-slate-100',
    glow: 'bg-white dark:bg-[#111622] rounded-3xl border border-indigo-100 dark:border-indigo-900/60 shadow-[0_10px_35px_-5px_rgba(79,70,229,0.12)] text-slate-900 dark:text-slate-100',
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
