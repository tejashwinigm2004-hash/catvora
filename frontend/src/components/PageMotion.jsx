import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Headings animate on every page. Other text and cards animate on every page except Home
// (Home already has its own Reveal/Stagger animations).
const HEAD = 'h1, h2, .fx-text';
const BODY = 'h3, p, li, img, article, details, form, [class*="rounded-"]';
const SKIP = '[role="dialog"], .react-datepicker, header, footer, nav';

const css = `
/* headings: wipe in left to right, blur clears */
.fx-head { opacity: 0; clip-path: inset(-0.3em 100% -0.3em 0); filter: blur(8px); transform: translateY(14px);
  transition: clip-path .9s cubic-bezier(.22,1,.36,1), opacity .6s ease, filter .9s ease, transform .9s cubic-bezier(.22,1,.36,1); }
.fx-head.fx-in { opacity: 1; clip-path: inset(-0.3em -0.1em -0.3em -0.1em); filter: blur(0); transform: none; }

/* other text and cards: fade up */
.pr-hide { opacity: 0; transform: translateY(24px);
  transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
.pr-hide.pr-in { opacity: 1; transform: none; }

/* sliding underline for links: add className="fx-link" */
.fx-link { background-image: linear-gradient(currentColor, currentColor); background-repeat: no-repeat;
  background-position: 0 100%; background-size: 0% 1px; padding-bottom: 2px; transition: background-size .35s ease, color .2s ease; }
.fx-link:hover { background-size: 100% 1px; color: #1A1A1A; }

@media (prefers-reduced-motion: reduce) {
  .fx-head, .pr-hide { opacity: 1; clip-path: none; filter: none; transform: none; transition: none; }
}
`;

export default function PageMotion() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.querySelector('main');
    if (!main) return;
    const isHome = pathname === '/';

    const seen = new WeakSet();
    const pending = new Map(); // element -> 'head' | 'body'

    const tag = (el, kind) => {
      if (seen.has(el) || el.closest(SKIP)) return;
      if (kind === 'body' && (isHome || el.closest('.reveal, .stagger'))) return;
      seen.add(el);
      el.classList.add(kind === 'head' ? 'fx-head' : 'pr-hide');
      pending.set(el, kind);
    };

    const scan = (node) => {
      if (node.nodeType !== 1) return;
      const all = [node, ...node.querySelectorAll('*')];
      all.forEach((el) => {
        if (el.matches(HEAD)) tag(el, 'head');
        else if (el.matches(BODY)) tag(el, 'body');
      });
    };

    const show = (el, kind, i) => {
      const delay = Math.min(i, 5) * (kind === 'head' ? 90 : 80);
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add(kind === 'head' ? 'fx-in' : 'pr-in');
      setTimeout(() => {
        el.classList.remove('fx-head', 'fx-in', 'pr-hide', 'pr-in');
        el.style.transitionDelay = '';
      }, delay + 1300);
    };

    // Reveal everything that is now on screen. Uses plain position checks (no IntersectionObserver),
    // so nothing can stay hidden by accident.
    const check = () => {
      if (!pending.size) return;
      const vh = window.innerHeight;
      const ready = [];
      pending.forEach((kind, el) => {
        if (!el.isConnected) { pending.delete(el); return; }
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh * 0.92) ready.push([el, r.top, kind]);
      });
      ready.sort((a, b) => a[1] - b[1]).forEach(([el, , kind], i) => {
        pending.delete(el);
        show(el, kind, i);
      });
    };

    let ticking = false;
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; check(); });
    };

    scan(main);
    schedule();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const mo = new MutationObserver((records) => {
      records.forEach((r) => r.addedNodes.forEach(scan));
      schedule();
    });
    mo.observe(main, { childList: true, subtree: true });
    const timer = setInterval(check, 400); // catches layout shifts after content loads

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mo.disconnect();
      clearInterval(timer);
      pending.forEach((_, el) => el.classList.remove('fx-head', 'fx-in', 'pr-hide', 'pr-in'));
    };
  }, [pathname]);

  return <style>{css}</style>;
}