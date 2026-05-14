import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import type { AuthAdmin } from '../types';

interface AuthContextValue {
  admin: AuthAdmin | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AuthAdmin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fd_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('fd_token');
    disconnectSocket();
  };

  const refreshAdmin = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setAdmin(data.admin);
      connectSocket();
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setAdmin(data.admin);
    localStorage.setItem('fd_token', data.token);
    connectSocket();
  };

  useEffect(() => {
    refreshAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      admin,
      token,
      loading,
      isAuthenticated: Boolean(admin && token),
      login,
      logout,
      refreshAdmin,
    }),
    [admin, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
