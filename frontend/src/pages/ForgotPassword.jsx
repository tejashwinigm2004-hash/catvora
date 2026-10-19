import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import { api } from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/user/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (x) {
      toast.error(x.response?.data?.message || "Can't reach the server. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 pb-24 pt-28 md:pb-20">
      <Seo title="Forgot password" desc="Reset your CATVORA Technology password." />
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">Forgot password?</h1>
        {sent ? (
          <>
            <p className="text-ink/70">
              If an account exists for <b>{email}</b>, we have sent a link to reset your password. It works for 1 hour.
              Check your spam folder too.
            </p>
            <Link to="/login" className="btn w-full justify-center">Back to sign in</Link>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-ink/70">Enter your email and we will send you a link to set a new password.</p>
            <label className="block text-sm font-semibold">Email
              <input className="field mt-1" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className="btn w-full" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
            <p className="text-center text-sm text-ink/70">
              <Link to="/login" className="font-semibold text-cobalt hover:underline">Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}