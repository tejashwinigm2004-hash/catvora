import { useEffect, useRef, useState } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

// Full-screen advertisement video. Always visible (not a pop-up), loops continuously.
export default function Hero() {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const play = () => v.play().catch(() => {});
    play();
    const onVis = () => !document.hidden && play();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const toggleSound = () => {
    const v = ref.current;
    v.muted = !v.muted;
    setMuted(v.muted);
    v.play().catch(() => {});
  };

  return (
    <section className="px-3 pb-3 pt-[80px]">
      <div className="relative h-[calc(100svh-92px)] min-h-[520px] overflow-hidden rounded-[2rem] bg-ink">
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          src="/ad1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="CATVORA Technology advertisement"
        />

        <button
          onClick={toggleSound}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white"
        >
          {muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
        </button>
      </div>
    </section>
  );
}