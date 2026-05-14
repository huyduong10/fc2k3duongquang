import { Bell, LogOut, Menu, MoonStar, SunMedium } from 'lucide-react';
import type { AuthAdmin } from '../../types';

export const Topbar = ({
  admin,
  onMenuClick,
  onLogout,
  theme,
  onToggleTheme,
}: {
  admin: AuthAdmin | null;
  onMenuClick: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) => {
  return (
    <header className="glass-panel sticky top-0 z-30 flex items-center justify-between rounded-3xl px-4 py-3 shadow-glow lg:px-6">
      <button
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
        onClick={onMenuClick}
        type="button"
      >
        <Menu size={18} />
      </button>

      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-pitch-300/70">2k3 DươngQuang</p>
        <h2 className="text-lg font-semibold text-white">Hệ thống quản lý đội bóng</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-pitch-400/40 hover:text-pitch-300"
        >
          {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-pitch-400/40 hover:text-pitch-300"
        >
          <Bell size={18} />
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-slate-400">Đăng nhập bởi</p>
          <p className="font-medium text-white">{admin?.name || 'Quản trị'}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-2xl bg-pitch-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-pitch-400"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
};
