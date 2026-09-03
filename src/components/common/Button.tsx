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
    primary: 'accent-gradient-btn text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:brightness-105',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200/80',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
    'soft-purple': 'bg-accent-light text-accent-primary hover:opacity-90 font-semibold',
    peach: 'bg-[#FFF3EC] text-[#E8590C] hover:bg-[#FFE8D9] font-semibold',
    cyan: 'bg-[#EBF8FF] text-[#0284C7] hover:bg-[#E0F2FE] font-semibold',
    amber: 'bg-[#FEFCE8] text-[#CA8A04] hover:bg-[#FEF9C3] font-semibold',
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
