import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Scene = lazy(() => import('./NetworkScene.jsx'));

export default function NetworkBG({ className = '', ...props }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {on && <Suspense fallback={null}><Scene {...props} /></Suspense>}
    </div>
  );
}