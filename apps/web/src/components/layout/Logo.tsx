'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 'h-7 w-7', text: 'text-[15px]' },
  md: { icon: 'h-9 w-9', text: 'text-xl' },
  lg: { icon: 'h-14 w-14', text: 'text-3xl' },
};

export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/auth-logo.png"
        alt="Task Easy"
        className={cn('flex-shrink-0 object-contain', s.icon)}
      />
      {!iconOnly && (
        <div className="min-w-0">
          <span className={cn('block font-bold tracking-tight text-primary', s.text)}>
            Task<span className="text-primary/80">Easy</span>
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/auth-logo.png"
      alt="Task Easy"
      className={cn('object-contain', className)}
      aria-hidden="true"
    />
  );
}
