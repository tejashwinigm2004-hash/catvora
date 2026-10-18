import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiPhoneCall, FiArrowUp, FiUser } from 'react-icons/fi';
import Floating from './Floating.jsx';
import ScrollProgress from './ScrollProgress.jsx';
import SmoothScroll from './SmoothScroll.jsx';
import PageMotion from './PageMotion.jsx'; // replaces PageReveal and TextAnimations
import { CONFIG } from '../config.js';
import { useAuth } from '../auth.jsx';

const links = [['/', 'Home'], ['/services', 'Services'], ['/about', 'About'], ['/contact', 'Contact us']];
const openBooking = () => window.dispatchEvent(new Event('open-booking'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 100);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isHome = pathname === '/';

  // desktop: text links with an underline on the active page
  const cls = ({ isActive }) =>
    `inline-flex h-[68px] items-center border-b-2 px-3 text-[15px] transition ${
      isActive ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink/75 hover:border-ink/30 hover:text-ink'
    }`;
  // mobile menu
  const mcls = ({ isActive }) =>
    `block rounded px-3 py-3 text-[15px] ${isActive ? 'bg-black/5 font-semibold' : 'hover:bg-black/5'}`;

  return (
    <>
      <ScrollProgress />
      <SmoothScroll />
      <header className="fixed inset-x-0 top-0 z-40 border-b border-black/10 bg-white">
        <nav className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
              <img src="/logo.png" alt="CATVORA logo" className="h-9 w-9" />
              <span>CATVORA <span className="font-normal text-ink/60">Technology</span></span>
            </Link>
            <div className="ml-4 hidden md:flex">
              {links.map(([to, l]) => <NavLink key={to} to={to} end className={cls}>{l}</NavLink>)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* account links (desktop) */}
            {user ? (
              <Link to="/account" className="hidden items-center gap-2 rounded px-3 py-2 text-[15px] font-semibold hover:bg-black/5 md:inline-flex">
                <FiUser /> {user.name.split(' ')[0]}
              </Link>
            ) : user === null && (
              <>
                <Link to="/login" className="hidden rounded px-3 py-2 text-[15px] text-ink/75 hover:bg-black/5 hover:text-ink md:inline-block">Sign in</Link>
                <Link to="/register" className="btn-ghost !py-2 hidden md:inline-flex">Register</Link>
              </>
            )}
            {isHome && (
              <button className="btn !py-2 hidden md:inline-flex" onClick={openBooking}><FiPhoneCall /> Book a call</button>
            )}
            <button className="grid h-10 w-10 place-items-center md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
              {open ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </nav>
        {open && (
          <div className="flex flex-col border-t border-black/10 bg-white p-3 md:hidden" onClick={() => setOpen(false)}>
            {links.map(([to, l]) => <NavLink key={to} to={to} end className={mcls}>{l}</NavLink>)}
            {user ? (
              <NavLink to="/account" className={mcls}>My account</NavLink>
            ) : user === null && (
              <>
                <NavLink to="/login" className={mcls}>Sign in</NavLink>
                <NavLink to="/register" className={mcls}>Register</NavLink>
              </>
            )}
            {isHome && (
              <button className="btn mt-2" onClick={openBooking}><FiPhoneCall /> Book a call</button>
            )}
          </div>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="bg-mist text-ink">
        <div className="mx-auto max-w-6xl px-5 pt-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <FiArrowUp /> Back to top
          </button>
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-10 w-10" />
              <p className="font-display text-xl font-semibold">CATVORA Technology</p>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink/70">Software, networking and AI data solutions for growing businesses.</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Pages</p>
            {links.map(([to, l]) => (
              <div key={to}><Link to={to} className="fx-link inline-block py-1 text-sm text-ink/75">{l}</Link></div>
            ))}
          </div>
          <div className="text-sm text-ink/75">
            <p className="font-semibold text-ink">Contact</p>
            <p className="py-1">{CONFIG.phone}</p>
            <p className="py-1">{CONFIG.email}</p>
            <p className="py-1">{CONFIG.address}</p>
          </div>
        </div>
        <div className="border-t border-black/10">
          <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-ink/60">© {new Date().getFullYear()} CATVORA Technology</p>
        </div>
      </footer>

      {isHome && <Floating />}
      <ScrollToTop />
      <PageMotion />
    </>
  );
}