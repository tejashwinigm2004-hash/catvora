import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useAuth } from '../auth.jsx';

const DELAY_MS = 20000; // 20 seconds, also the wait after each close

export default function SignupPrompt() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  const onAuthPage = pathname === '/login' || pathname === '/register';

  // Start a 20 second timer whenever the popup is hidden.
  // Closing the popup sets show=false, which starts the timer again.
  useEffect(() => {
    if (user !== null || show || onAuthPage) return; // only for visitors who are not signed in
    const t = setTimeout(() => setShow(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [user, show, onAuthPage]);

  // Hide it if they sign in, or open the sign in / register page
  useEffect(() => {
    if (user || onAuthPage) setShow(false);
  }, [user, onAuthPage]);

  const close = () => setShow(false);

  // Escape key closes it, and the page behind doesn't scroll
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show || user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
        >
          <FiX size={22} />
        </button>

        <h2 id="signup-title" className="pr-8 text-2xl font-semibold">Join CATVORA Technology</h2>
        <p className="mt-2 text-ink/70">
          Create a free account to stay in touch with us and get updates about our services.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link to="/register" onClick={close} className="btn w-full justify-center">Sign up</Link>
          <button
            onClick={close}
            className="w-full rounded px-3 py-3 text-[15px] font-semibold text-ink/70 hover:bg-black/5"
          >
            Not now
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-ink/70">
          Already have an account?{' '}
          <Link to="/login" onClick={close} className="font-semibold text-cobalt hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}