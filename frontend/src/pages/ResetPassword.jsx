import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import { api } from '../api.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const go = useNavigate();
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/user/reset-password', { token, newPassword: pw });
      toast.success('Password changed. Please sign in.');
      go('/login');
    } catch (x) {
      toast.error(x.response?.data?.message || "Can't reach the server. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 pb-24 pt-28 md:pb-20">
      <Seo title="Set a new password" desc="Choose a new password for your CATVORA Technology account." />
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">Set a new password</h1>
        {!token ? (
          <>
            <p className="text-ink/70">This reset link is not valid. Please request a new one.</p>
            <Link to="/forgot-password" className="btn w-full justify-center">Request a new link</Link>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">New password (8 characters or more)
              <div className="relative mt-1">
                <input className="field !pr-12" type={show ? 'text' : 'password'} autoComplete="new-password"
                  required minLength={8} maxLength={72} value={pw} onChange={(e) => setPw(e.target.value)} />
                <button type="button" onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink/60 hover:bg-black/5 hover:text-ink">
                  {show ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </label>
            <button className="btn w-full" disabled={busy}>{busy ? 'Saving...' : 'Change password'}</button>
          </form>
        )}
      </div>
    </div>
  );
}