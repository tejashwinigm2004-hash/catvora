import { Link, Navigate, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../auth.jsx';

export default function Account() {
  const { user, logout } = useAuth();
  const go = useNavigate();

  if (user === undefined) return <div className="min-h-screen" />; // still checking the session
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="bg-mist px-5 pb-20 pt-32">
      <Seo title="My account" desc="Your CATVORA Technology account." />
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Hi, {user.name.split(' ')[0]}</h1>
        <p className="mt-2 text-ink/70">You are signed in as {user.email}.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link to="/contact" className="rounded-xl border border-ink/10 p-5 transition hover:-translate-y-1 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Request a quote</h2>
            <p className="mt-1 text-sm text-ink/70">Tell us what you need and we will reply within 24 hours.</p>
          </Link>
          <Link to="/services" className="rounded-xl border border-ink/10 p-5 transition hover:-translate-y-1 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Browse services</h2>
            <p className="mt-1 text-sm text-ink/70">Software, networks, hardware, AI data and marketing.</p>
          </Link>
        </div>

        <button
          className="btn-ghost mt-8"
          onClick={async () => { await logout(); go('/'); }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}