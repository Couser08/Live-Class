import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'peach' | 'cyan' | 'amber' | 'soft-purple';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    icon: 'p-2.5 rounded-xl aspect-square',
  };

  const variantStyles = {
    primary: 'bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold shadow-md shadow-indigo-500/20 active:scale-[0.98] border-0',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 font-semibold',
    outline: 'bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    glass: 'bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-700/50 text-white hover:bg-white/20',
    'soft-purple': 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold border border-indigo-100 dark:border-indigo-900/40',
    peach: 'bg-[#FFF3EC] dark:bg-orange-950/40 text-[#E8590C] dark:text-orange-400 hover:bg-[#FFE8D9] dark:hover:bg-orange-900/40 font-bold border border-orange-100 dark:border-orange-900/40',
    cyan: 'bg-[#EBF8FF] dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-400 hover:bg-[#E0F2FE] dark:hover:bg-sky-900/40 font-bold border border-sky-100 dark:border-sky-900/40',
    amber: 'bg-[#FEFCE8] dark:bg-amber-950/40 text-[#CA8A04] dark:text-amber-400 hover:bg-[#FEF9C3] dark:hover:bg-amber-900/40 font-bold border border-amber-100 dark:border-amber-900/40',
  };

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
