import type { LucideIcon } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  caption,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  caption?: string;
}) => (
  <div className="glass-panel rounded-[1.75rem] p-5 shadow-glow">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        {caption ? <p className="mt-2 text-sm text-slate-400">{caption}</p> : null}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pitch-500/15 text-pitch-300 ring-1 ring-pitch-400/25">
        <Icon size={20} />
      </div>
    </div>
  </div>
);
