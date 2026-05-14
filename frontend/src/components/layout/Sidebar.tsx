import { Activity, Coins, Home, Shield, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Tổng quan', icon: Home },
  { to: '/admin/players', label: 'Cầu thủ', icon: Users },
  { to: '/admin/matches', label: 'Trận đấu', icon: Activity },
  { to: '/admin/payments', label: 'Thanh toán', icon: Coins },
];

export const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/10 bg-slateNight-950/95 p-5 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pitch-500/15 text-pitch-400 ring-1 ring-pitch-400/30">
          <Shield size={22} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-pitch-300/70">2k3 DươngQuang</p>
          <h1 className="text-lg font-semibold text-white">Bảng điều hành</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-pitch-500/15 text-pitch-300 ring-1 ring-pitch-400/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10 rounded-3xl border border-pitch-500/20 bg-pitch-500/10 p-4 text-sm text-slate-200">
        <p className="text-pitch-300">Điều hành mùa giải</p>
        <p className="mt-2 leading-6 text-slate-300">
          Quản lý cầu thủ, lịch đấu, đóng tiền và cập nhật trực tiếp trên một màn hình.
        </p>
      </div>
    </aside>
  );
};
