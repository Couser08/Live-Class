import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'live' | 'online' | 'purple' | 'orange' | 'blue' | 'yellow' | 'gray';
  pulse?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  pulse = false,
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    live: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    online: 'bg-emerald-500 text-white',
    purple: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
    orange: 'bg-orange-50 text-orange-600 border-orange-200/60',
    blue: 'bg-sky-50 text-sky-600 border-sky-200/60',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200/60',
    gray: 'bg-slate-100 text-slate-600 border-slate-200/60',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
      {children}
    </span>
  );
};
