import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { user, setUser } = useAuth();
  const go = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (f.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (f.password !== f.confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      const { data } = await api.post('/user/register', { name: f.name, email: f.email, password: f.password });
      setUser(data.user);
      toast.success('Account created');
      go('/account');
    } catch (x) {
      toast.error(x.response?.data?.message || 'Could not create the account. Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <div className="bg-mist px-5 pb-20 pt-32">
      <Seo title="Create account" desc="Create your CATVORA Technology account." />
      <form onSubmit={submit} className="mx-auto w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="text-ink/70">It takes less than a minute.</p>
        <label className="block text-sm font-semibold">Full name
          <input className="field mt-1" autoComplete="name" required value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })} />
        </label>
        <label className="block text-sm font-semibold">Email
          <input className="field mt-1" type="email" autoComplete="email" required value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })} />
        </label>
        <label className="block text-sm font-semibold">Password
          <input className="field mt-1" type="password" autoComplete="new-password" minLength={8} required value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })} />
          <span className="mt-1 block text-xs font-normal text-ink/60">At least 8 characters.</span>
        </label>
        <label className="block text-sm font-semibold">Confirm password
          <input className="field mt-1" type="password" autoComplete="new-password" required value={f.confirm}
            onChange={(e) => setF({ ...f, confirm: e.target.value })} />
        </label>
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
        <p className="text-center text-sm text-ink/70">
          Already registered? <Link to="/login" className="font-semibold text-cobalt hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}