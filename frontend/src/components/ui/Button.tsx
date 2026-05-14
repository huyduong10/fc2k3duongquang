import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export const Button = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={twMerge(
      'inline-flex items-center justify-center rounded-2xl bg-pitch-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-pitch-400 disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
);
