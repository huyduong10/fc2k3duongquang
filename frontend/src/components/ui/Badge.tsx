import { twMerge } from 'tailwind-merge';

export const Badge = ({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) => {
  const tones = {
    neutral: 'bg-white/10 text-slate-200 ring-white/10',
    success: 'bg-pitch-500/15 text-pitch-300 ring-pitch-400/20',
    warning: 'bg-amber-500/15 text-amber-300 ring-amber-400/20',
    danger: 'bg-rose-500/15 text-rose-300 ring-rose-400/20',
    info: 'bg-sky-500/15 text-sky-300 ring-sky-400/20',
  };

  return (
    <span className={twMerge('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1', tones[tone], className)}>
      {children}
    </span>
  );
};
