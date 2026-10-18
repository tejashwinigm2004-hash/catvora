import { useState } from 'react';
import { FiCode, FiWifi, FiCpu, FiLifeBuoy, FiPause, FiPlay } from 'react-icons/fi';
import { Reveal, Stagger } from './motion/Reveal.jsx';

// Edit the text here. For a real photo: put it in frontend/public and set image: '/your-photo.jpg'
const cards = [
  {
    icon: FiCode,
    overlay: 'Software built for you',
    title: 'Built around your business',
    text: 'Modern applications and customized software that fit how your business really works.',
    image: '',
    glow: ['rgba(226,232,240,0.30)', 'rgba(148,163,184,0.25)'],
  },
  {
    icon: FiWifi,
    overlay: 'Stay connected',
    title: 'Reliable networks',
    text: 'Network setup, connectivity, configuration and support, so your team stays online.',
    image: '',
    glow: ['rgba(251,146,60,0.35)', 'rgba(180,83,9,0.35)'],
  },
  {
    icon: FiCpu,
    overlay: 'Smarter decisions with AI',
    title: 'Practical AI',
    text: 'AI-driven solutions that improve efficiency, automate processes and support better decisions.',
    image: '',
    glow: ['rgba(56,189,248,0.35)', 'rgba(37,99,235,0.35)'],
  },
  {
    icon: FiLifeBuoy,
    overlay: 'Always with you',
    title: 'Support after launch',
    text: 'We stay on after delivery to fix, tune and grow your solution as your business grows.',
    image: '',
    glow: ['rgba(45,212,191,0.30)', 'rgba(16,185,129,0.30)'],
  },
];

const css = `
.fc-blob { position: absolute; width: 75%; height: 75%; border-radius: 9999px; filter: blur(30px); }
.fc-b1 { top: -10%; left: -15%; animation: fc-drift1 14s ease-in-out infinite alternate; }
.fc-b2 { bottom: -15%; right: -20%; animation: fc-drift2 18s ease-in-out infinite alternate; }
@keyframes fc-drift1 { to { transform: translate(35%, 25%) scale(1.2); } }
@keyframes fc-drift2 { to { transform: translate(-30%, -30%) scale(1.15); } }
.fc[data-paused="true"] .fc-blob { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .fc-blob { animation: none; } }
`;

function Card({ c, style }) {
  const [paused, setPaused] = useState(false);
  const Icon = c.icon;
  return (
    <article style={style}>
      <div className="fc relative aspect-[4/5] overflow-hidden rounded-[20px] bg-black" data-paused={paused}>
        {c.image ? (
          <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <>
            <span className="fc-blob fc-b1" style={{ background: `radial-gradient(circle, ${c.glow[0]}, transparent 65%)` }} />
            <span className="fc-blob fc-b2" style={{ background: `radial-gradient(circle, ${c.glow[1]}, transparent 65%)` }} />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play animation' : 'Pause animation'}
          aria-pressed={paused}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
        >
          {paused ? <FiPlay size={16} /> : <FiPause size={16} />}
        </button>

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-8 pb-12 text-center text-white">
          <span className="mb-5 grid h-20 w-20 place-items-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
            <Icon size={34} />
          </span>
          <h3 className="text-3xl font-light leading-tight">{c.overlay}</h3>
        </div>
      </div>

      <div className="px-6 pt-6">
        <h3 className="text-lg font-normal">{c.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{c.text}</p>
      </div>
    </article>
  );
}

export default function FeatureCards() {
  return (
    <section className="bg-mist py-20">
      <style>{css}</style>
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-light sm:text-4xl">Power your business</h2>
          <p className="mt-4 text-lg text-ink/80">
            From modern software to reliable networks and practical AI, CATVORA is built to help your business run smoothly and grow.
          </p>
        </Reveal>
        <Stagger className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4" gap={0.12}>
          {cards.map((c) => <Card key={c.title} c={c} />)}
        </Stagger>
      </div>
    </section>
  );
}