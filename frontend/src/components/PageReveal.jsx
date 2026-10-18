import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// What gets animated on every page except Home (Home already has its own animations)
const SELECTOR = 'h3, p, li, img, article, details, form, [class*="rounded-"]';
// Never touch these (pop-ups, date picker, navbar, footer, Home's own Reveal/Stagger)
const SKIP = '.reveal, .stagger, [role="dialog"], .react-datepicker, header, footer, nav';

const css = `
.pr-hide { opacity: 0; transform: translateY(24px);
  transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
.pr-hide.pr-in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .pr-hide { opacity: 1; transform: none; transition: none; } }
`;

export default function PageReveal() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (pathname === '/') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.querySelector('main');
    if (!main) return;

    const seen = new WeakSet();

    const io = new IntersectionObserver(
      (entries) => {
        const shown = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        shown.forEach((e, i) => {
          const el = e.target;
          io.unobserve(el);
          el.style.transitionDelay = `${Math.min(i, 6) * 80}ms`; // items appear one after another
          el.classList.add('pr-in');
          // clean up afterwards so normal hover effects on cards keep working
          const done = (ev) => {
            if (ev && ev.target !== el) return;
            el.classList.remove('pr-hide', 'pr-in');
            el.style.transitionDelay = '';
            el.removeEventListener('transitionend', done);
          };
          el.addEventListener('transitionend', done);
          setTimeout(() => done(), 1600);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    const tag = (el) => {
      if (seen.has(el) || el.closest(SKIP)) return;
      seen.add(el);
      el.classList.add('pr-hide');
      io.observe(el);
    };
    const scan = (node) => {
      if (node.nodeType !== 1) return;
      if (node.matches(SELECTOR)) tag(node);
      node.querySelectorAll(SELECTOR).forEach(tag);
    };

    scan(main);
    // content that loads later (services, team) is picked up automatically
    const mo = new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach(scan)));
    mo.observe(main, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      main.querySelectorAll('.pr-hide').forEach((el) => el.classList.remove('pr-hide', 'pr-in'));
    };
  }, [pathname]);

  return <style>{css}</style>;
}