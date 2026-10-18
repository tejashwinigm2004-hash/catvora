import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Which text gets the animation. Add className="fx-text" to any other element you want animated.
const SELECTOR = 'h1, h2, .fx-text';
const SKIP = '[role="dialog"], .react-datepicker, header, footer, nav';

const css = `
/* heading: wipes in left to right, blur clears, letters settle */
.fx-head {
  opacity: 0;
  clip-path: inset(-0.3em 100% -0.3em 0);
  filter: blur(8px);
  letter-spacing: 0.06em;
  transform: translateY(14px);
  transition:
    clip-path 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.6s ease,
    filter 0.9s ease,
    letter-spacing 1s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.fx-head.fx-in {
  opacity: 1;
  clip-path: inset(-0.3em -0.1em -0.3em -0.1em);
  filter: blur(0);
  letter-spacing: -0.025em;
  transform: none;
}

/* sliding underline for links: add className="fx-link" */
.fx-link {
  background-image: linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 1px;
  padding-bottom: 2px;
  transition: background-size 0.35s ease, color 0.2s ease;
}
.fx-link:hover { background-size: 100% 1px; color: #1A1A1A; }

@media (prefers-reduced-motion: reduce) {
  .fx-head { opacity: 1; clip-path: none; filter: none; transform: none; transition: none; }
}
`;

export default function TextAnimations() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.querySelector('main');
    if (!main) return;

    const seen = new WeakSet();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          io.unobserve(el);
          el.classList.add('fx-in');
          // after the animation ends, remove the helper classes so the element is back to normal
          setTimeout(() => el.classList.remove('fx-head', 'fx-in'), 1300);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -5% 0px' }
    );

    const tag = (el) => {
      if (seen.has(el) || el.closest(SKIP)) return;
      seen.add(el);
      el.classList.add('fx-head');
      io.observe(el);
    };
    const scan = (node) => {
      if (node.nodeType !== 1) return;
      if (node.matches(SELECTOR)) tag(node);
      node.querySelectorAll(SELECTOR).forEach(tag);
    };

    scan(main);
    // headings that load later (for example service titles) are picked up too
    const mo = new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach(scan)));
    mo.observe(main, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      main.querySelectorAll('.fx-head').forEach((el) => el.classList.remove('fx-head', 'fx-in'));
    };
  }, [pathname]);

  return <style>{css}</style>;
}