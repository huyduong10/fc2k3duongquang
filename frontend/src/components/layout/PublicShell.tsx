import { Menu, Shield, Trophy, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Trang chủ' },
  { to: '/squad', label: 'Đội hình' },
  { to: '/fixtures', label: 'Lịch đấu' },
  { to: '/contributions', label: 'Tiền đóng' },
  { to: '/book-sunday', label: 'Book Chủ nhật' },
  { to: '/login', label: 'Quản trị' },
];

export const PublicShell = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slateNight-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pitch-500/15 text-pitch-300 ring-1 ring-pitch-400/20">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-pitch-300/70">2k3 DươngQuang</p>
              <h1 className="text-lg font-semibold text-white">Trung tâm trận đấu</h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-pitch-500 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/10 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? 'bg-pitch-500 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 bg-slateNight-950/70 px-4 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Trophy size={16} className="text-pitch-300" />
            2k3 DươngQuang
          </div>
          <p>Giao diện công khai cho người hâm mộ, cầu thủ và thành viên đội.</p>
        </div>
      </footer>
    </div>
  );
};