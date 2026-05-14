import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { socket } from '../../lib/socket';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { admin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('fd_theme') as 'dark' | 'light') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    localStorage.setItem('fd_theme', theme);
  }, [theme]);

  useEffect(() => {
    const closeSidebar = () => setSidebarOpen(false);
    socket.on('players:updated', closeSidebar);
    socket.on('matches:updated', closeSidebar);
    socket.on('payments:updated', closeSidebar);

    return () => {
      socket.off('players:updated', closeSidebar);
      socket.off('matches:updated', closeSidebar);
      socket.off('payments:updated', closeSidebar);
    };
  }, []);

  const shellStyles = useMemo(
    () =>
      theme === 'dark'
        ? 'bg-transparent text-slate-100'
        : 'bg-slate-50 text-slate-900',
    [theme],
  );

  return (
    <div className={`min-h-screen ${shellStyles}`}>
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-0 lg:gap-5">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex min-h-screen flex-1 flex-col px-4 py-4 lg:px-6 lg:py-6">
          <Topbar
            admin={admin}
            onMenuClick={() => setSidebarOpen((value) => !value)}
            onLogout={logout}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
          <div className="mt-5 flex-1 pb-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
