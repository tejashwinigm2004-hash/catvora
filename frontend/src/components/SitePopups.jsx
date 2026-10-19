import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiX, FiPhoneCall } from 'react-icons/fi';
import { useAuth } from '../auth.jsx';
import { useContent } from '../api.js';

const DELAY_MS = 20000;               // wait after each close (20 seconds)
const ORDER = ['signup', 'services']; // popups take turns
const openBooking = () => window.dispatchEvent(new Event('open-booking'));

export default function SitePopups() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { services } = useContent();
  const [current, setCurrent] = useState(null); // null, 'signup' or 'services'
  const [turn, setTurn] = useState(0);

  const onAuthPage = pathname === '/login' || pathname === '/register';

  // While nothing is showing, wait 20 seconds, then show the next popup in turn
  useEffect(() => {
    if (user !== null || current || onAuthPage) return; // only for signed-out visitors
    const t = setTimeout(() => {
      setCurrent(ORDER[turn % ORDER.length]);
      setTurn((n) => n + 1);
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [user, current, onAuthPage, turn]);

  // Hide everything once they sign in or open the sign in / register page
  useEffect(() => {
    if (user || onAuthPage) setCurrent(null);
  }, [user, onAuthPage]);

  const close = () => setCurrent(null);

  // Escape closes it, and the page behind doesn't scroll
  useEffect(() => {
    if (!current) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [current]);

  const bookCall = () => {
    close();
    if (pathname === '/') openBooking();
    else {
      navigate('/#book');           // go to the home page booking section
      setTimeout(openBooking, 300); // then open the booking form
    }
  };

  if (!current || user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        data-lenis-prevent
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
        >
          <FiX size={22} />
        </button>

        {current === 'signup' && (
          <>
            <h2 className="pr-8 text-2xl font-semibold">Join CATVORA Technology</h2>
            <p className="mt-2 text-ink/70">
              Create a free account to stay in touch with us and get updates about our services.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link to="/register" onClick={close} className="btn w-full justify-center">Sign up</Link>
              <button onClick={close} className="w-full rounded px-3 py-3 text-[15px] font-semibold text-ink/70 hover:bg-black/5">
                Not now
              </button>
            </div>
            <p className="mt-4 text-center text-sm text-ink/70">
              Already have an account?{' '}
              <Link to="/login" onClick={close} className="font-semibold text-cobalt hover:underline">Sign in</Link>
            </p>
          </>
        )}

        {current === 'services' && (
          <>
            <h2 className="pr-8 text-2xl font-semibold">How can we help you?</h2>
            <p className="mt-2 text-ink/70">Talk to us about any of these. The first call is free.</p>
            <ul className="mt-4 space-y-2">
              {services.slice(0, 3).map((s) => (
                <li key={s._id} className="rounded-lg bg-mist px-4 py-3">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-ink/70">{s.summary}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={bookCall} className="btn w-full justify-center">
                <FiPhoneCall /> Book a call
              </button>
              <Link to="/services" onClick={close} className="w-full rounded px-3 py-3 text-center text-[15px] font-semibold text-cobalt hover:bg-black/5">
                View all services
              </Link>
              <button onClick={close} className="w-full rounded px-3 py-3 text-[15px] font-semibold text-ink/70 hover:bg-black/5">
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}