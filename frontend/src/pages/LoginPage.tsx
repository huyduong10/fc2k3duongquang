import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@football.local');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Đăng nhập thành công');
      navigate('/admin');
    } catch (error) {
      toast.error('Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,116,144,0.2),_transparent_30%)]" />
      <div className="glass-panel relative grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-pitch-500/15 text-pitch-300 ring-1 ring-pitch-400/25">
              <Shield size={26} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-pitch-300/70">FC 2K3 DUONG QUANG</p>
              <h1 className="text-2xl font-semibold text-white"></h1>
            </div>
          </div>

          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-pitch-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-pitch-300 ring-1 ring-pitch-400/20">
              <Trophy size={14} />
              dang cap
            </span>
            <h2 className="max-w-lg text-4xl font-semibold leading-tight text-white">
              mangement  by admin
            </h2>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
             
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {/* {[
              ['10+', 'cầu thủ mẫu'],
              ['5', 'trận mẫu'],
              ['Live', 'sẵn sàng realtime'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            ))} */}
          </div>
        </div>

        <div className="p-8 lg:p-10">
          <h3 className="text-2xl font-semibold text-white">Login with role admin </h3>
          <p className="mt-2 text-sm text-slate-400">just huy duonng</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Mật khẩu</label>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full py-3.5" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Login'}
            </Button>
          </form>


        </div>
      </div>
    </div>
  );
};
