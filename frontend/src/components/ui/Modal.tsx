import { X } from 'lucide-react';

export const Modal = ({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="glass-panel relative flex max-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col overflow-y-auto rounded-[2rem] p-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-slate-300 transition hover:text-white"
        >
          <X size={18} />
        </button>
        <div className="mb-5 pr-10">
          <p className="text-xs uppercase tracking-[0.35em] text-pitch-300/70">Edit panel</p>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
};
