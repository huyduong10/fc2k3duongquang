import type { SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={twMerge(
      'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-pitch-400/60 focus:ring-2 focus:ring-pitch-500/20',
      className,
    )}
    {...props}
  />
);
