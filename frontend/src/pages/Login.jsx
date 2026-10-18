import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { user, setUser } = useAuth();
  const go = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/user/login', f);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
      go('/account');
    } catch (x) {
      toast.error(x.response?.data?.message || 'Sign in failed. Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <div className="bg-mist px-5 pb-20 pt-32">
      <Seo title="Sign in" desc="Sign in to your CATVORA Technology account." />
      <form onSubmit={submit} className="mx-auto w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-ink/70">Welcome back. Enter your details to continue.</p>
        <label className="block text-sm font-semibold">Email
          <input className="field mt-1" type="email" autoComplete="email" required value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })} />
        </label>
        <label className="block text-sm font-semibold">Password
          <input className="field mt-1" type="password" autoComplete="current-password" required value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })} />
        </label>
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        <p className="text-center text-sm text-ink/70">
          New here? <Link to="/register" className="font-semibold text-cobalt hover:underline">Create an account</Link>
        </p>
      </form>
    </div>
  );
}