import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiX, FiPhoneCall } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../auth.jsx';
import { useContent } from '../api.js';
import { CONFIG } from '../config.js';

const GUEST_DELAY_MS = 20000;              // signed-out visitors: sign up popup every 20 seconds
const MEMBER_DELAY_MS = 60000;             // signed-in users: one popup every 1 minute
const MEMBER_ORDER = ['services', 'book']; // they take turns
const NEW_USER_DAYS = 30;                  // only users who joined in the last 30 days. Set 0 to show to everyone
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

const openBooking = () => window.dispatchEvent(new Event('open-booking'));

export default function SitePopups() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { services } = useContent();
  const [current, setCurrent] = useState(null); // null | 'signup' | 'services' | 'book'
  const [turn, setTurn] = useState(0);

  const onAuthPage = AUTH_PAGES.includes(pathname);
  const isGuest = user === null;
  const isMember = !!user && user.role !== 'admin';

  // "New user" check. If the server doesn't send createdAt, everyone signed in counts.
  const isNewUser =
    isMember &&
    (!NEW_USER_DAYS ||
      !user.createdAt ||
      Date.now() - new Date(user.createdAt).getTime() < NEW_USER_DAYS * 86400000);

  // Pick the next popup after the wait, and start again whenever one is closed
  useEffect(() => {
    if (current || onAuthPage) return;

    if (isGuest) {
      const t = setTimeout(() => setCurrent('signup'), GUEST_DELAY_MS);
      return () => clearTimeout(t);
    }
    if (isNewUser) {
      const t = setTimeout(() => {
        setCurrent(MEMBER_ORDER[turn % MEMBER_ORDER.length]);
        setTurn((n) => n + 1);
      }, MEMBER_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [isGuest, isNewUser, current, onAuthPage, turn]);

  // Remove a popup that no longer fits (just signed in, or opened an account page)
  useEffect(() => {
    if (onAuthPage) return setCurrent(null);
    if (current === 'signup' && !isGuest) setCurrent(null);
    if ((current === 'services' || current === 'book') && !isNewUser) setCurrent(null);
  }, [isGuest, isNewUser, onAuthPage, current]);

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

  if (!current) return null;

  const tel = `tel:${CONFIG.phone.replace(/\s/g, '')}`;
  const wa = `https://wa.me/${CONFIG.whatsapp}`;

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

        {/* 1. Sign up (signed-out visitors) */}
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

        {/* 2. Services (signed-in users) */}
        {current === 'services' && (
          <>
            <h2 className="pr-8 text-2xl font-semibold">Our services</h2>
            <p className="mt-2 text-ink/70">Here is how we can help your business.</p>
            <ul className="mt-4 space-y-2">
              {services.slice(0, 3).map((s) => (
                <li key={s._id} className="rounded-lg bg-mist px-4 py-3">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-ink/70">{s.summary}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <Link to="/services" onClick={close} className="btn w-full justify-center">
                View all services
              </Link>
              <button onClick={close} className="w-full rounded px-3 py-3 text-[15px] font-semibold text-ink/70 hover:bg-black/5">
                Not now
              </button>
            </div>
          </>
        )}

        {/* 3. Book a call (signed-in users) */}
        {current === 'book' && (
          <>
            <h2 className="pr-8 text-2xl font-semibold">Book a call</h2>
            <p className="mt-2 text-ink/70">
              Tell us what you need and our team will call you back. The first call is free.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={bookCall} className="btn w-full justify-center">
                <FiPhoneCall /> Book a call
              </button>
              <a href={wa} target="_blank" rel="noopener noreferrer" onClick={close}
                className="flex w-full items-center justify-center gap-2 rounded px-3 py-3 text-[15px] font-semibold text-ink hover:bg-black/5">
                <FaWhatsapp size={18} /> Chat on WhatsApp
              </a>
              <a href={tel} onClick={close}
                className="w-full rounded px-3 py-3 text-center text-[15px] font-semibold text-cobalt hover:bg-black/5">
                Call {CONFIG.phone}
              </a>
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