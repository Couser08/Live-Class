import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isOnline = false,
  className,
}) => {
  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const indicatorSizes = {
    sm: 'w-2 h-2 bottom-0 right-0 ring-1',
    md: 'w-2.5 h-2.5 bottom-0 right-0 ring-2',
    lg: 'w-3.5 h-3.5 bottom-0 right-0 ring-2',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover bg-slate-100 ring-2 ring-white/60 shadow-xs',
            sizeStyles[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center shadow-xs',
            sizeStyles[size]
          )}
        >
          {initials}
        </div>
      )}

      {isOnline && (
        <span
          className={cn(
            'absolute bg-emerald-500 rounded-full ring-white',
            indicatorSizes[size]
          )}
        />
      )}
    </div>
  );
};
