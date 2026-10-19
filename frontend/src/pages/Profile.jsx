import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

// the server stores text with HTML characters escaped; turn them back for display
const dec = (s) => (typeof s === 'string' ? s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : s);
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '');

export default function Profile() {
  const { user, setUser } = useAuth();
  const go = useNavigate();
  const [saved, setSaved] = useState(null); // the details as stored from registration
  const [f, setF] = useState({ name: '', email: '', currentPassword: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState('');

  // fetch the registered details from the server every time the page opens
  useEffect(() => {
    if (!user) return;
    api.get('/user/me').then(({ data }) => {
      if (!data.user) return;
      setSaved(data.user);
      setF({ name: dec(data.user.name), email: data.user.email, currentPassword: '' });
    }).catch(() => toast.error('Could not load your profile. Please refresh.'));
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  if (user === undefined) return null;
  if (user === null) return <Navigate to="/login" replace />;

  const changed = saved && (f.name.trim() !== dec(saved.name) || f.email.trim().toLowerCase() !== saved.email);
  const emailChanged = saved && f.email.trim().toLowerCase() !== saved.email;

  const saveDetails = async (e) => {
    e.preventDefault();
    setBusy('details');
    try {
      const body = { name: f.name.trim() };
      if (emailChanged) { body.email = f.email.trim(); body.currentPassword = f.currentPassword; }
      const { data } = await api.patch('/user/profile', body);
      setUser(data.user);
      setSaved(data.user);
      setF({ name: dec(data.user.name), email: data.user.email, currentPassword: '' });
      toast.success('Profile saved');
    } catch (x) {
      toast.error(x.response?.data?.message || 'Could not save. Try again.');
    } finally { setBusy(''); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setBusy('pw');
    try {
      await api.patch('/user/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (x) {
      toast.error(x.response?.data?.message || 'Could not change password.');
    } finally { setBusy(''); }
  };

  const signOut = async () => {
    setBusy('out');
    try { await api.post('/user/logout'); } catch { /* sign out locally anyway */ }
    setUser(null);
    toast.success('Signed out');
    go('/');
  };

  return (
    <div className="bg-mist px-4 pb-24 pt-28 md:pb-20">
      <Seo title="My profile" desc="Manage your CATVORA Technology profile." />
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold sm:text-3xl">My profile</h1>
          <Link to="/account" className="text-sm font-semibold text-cobalt hover:underline">Back to dashboard</Link>
        </div>

        {!saved ? (
          <p className="rounded-2xl bg-white p-6 text-ink/60 shadow-sm">Loading your details…</p>
        ) : (
          <>
            <form onSubmit={saveDetails} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Your details</h2>
                <span className="text-xs text-ink/60">Member since {day(saved.createdAt)}</span>
              </div>
              <p className="text-sm text-ink/70">These are the details you registered with. Change them only if you want to.</p>
              <label className="block text-sm font-semibold">Name
                <input className="field mt-1" required maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold">Email
                <input className="field mt-1" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              </label>
              {emailChanged && (
                <label className="block text-sm font-semibold">Current password (needed to change your email)
                  <input className="field mt-1" type="password" autoComplete="current-password" required
                    value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} />
                </label>
              )}
              <div className="flex gap-2">
                <button className="btn flex-1" disabled={!changed || busy === 'details'}>{busy === 'details' ? 'Saving...' : 'Save changes'}</button>
                {changed && (
                  <button type="button" className="btn-ghost"
                    onClick={() => setF({ name: dec(saved.name), email: saved.email, currentPassword: '' })}>Reset</button>
                )}
              </div>
            </form>

            <form onSubmit={savePassword} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Change password</h2>
              <label className="block text-sm font-semibold">Current password
                <input className="field mt-1" type="password" autoComplete="current-password" required
                  value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold">New password (8 characters or more)
                <input className="field mt-1" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                  value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
              </label>
              <button className="btn w-full" disabled={busy === 'pw'}>{busy === 'pw' ? 'Saving...' : 'Change password'}</button>
            </form>
          </>
        )}

        <button onClick={signOut} disabled={busy === 'out'}
          className="w-full rounded-full border border-red-200 bg-white px-6 py-3 font-semibold text-red-600 hover:bg-red-50">
          {busy === 'out' ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}