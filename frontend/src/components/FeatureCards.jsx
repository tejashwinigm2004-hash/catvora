import { useState } from 'react';
import { FiCode, FiWifi, FiCpu, FiLifeBuoy, FiPause, FiPlay } from 'react-icons/fi';
import { Reveal, Stagger } from './motion/Reveal.jsx';

// Edit the text here. For a real photo: put it in frontend/public and set image: '/your-photo.jpg'
// scene: which animated background to show ('code' | 'signal' | 'data' | 'orbit'). tint: its colour.
const cards = [
  {
    icon: FiCode,
    scene: 'code',
    tint: '#cbd5e1',
    overlay: 'Software built for you',
    title: 'Built around your business',
    text: 'Modern applications and customized software that fit how your business really works.',
    image: '',
    glow: ['rgba(226,232,240,0.30)', 'rgba(148,163,184,0.25)'],
  },
  {
    icon: FiWifi,
    scene: 'signal',
    tint: '#fb923c',
    overlay: 'Stay connected',
    title: 'Reliable networks',
    text: 'Network setup, connectivity, configuration and support, so your team stays online.',
    image: '',
    glow: ['rgba(251,146,60,0.35)', 'rgba(180,83,9,0.35)'],
  },
  {
    icon: FiCpu,
    scene: 'data',
    tint: '#38bdf8',
    overlay: 'Smarter decisions with AI',
    title: 'Practical AI',
    text: 'AI-driven solutions that improve efficiency, automate processes and support better decisions.',
    image: '',
    glow: ['rgba(56,189,248,0.35)', 'rgba(37,99,235,0.35)'],
  },
  {
    icon: FiLifeBuoy,
    scene: 'orbit',
    tint: '#2dd4bf',
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

.fc-scene { position: absolute; inset: 0; pointer-events: none;
  -webkit-mask-image: linear-gradient(to bottom, #000 50%, transparent 88%);
  mask-image: linear-gradient(to bottom, #000 50%, transparent 88%); }

/* code: lines scrolling upward */
.fc-scroll { animation: fc-scroll 18s linear infinite; }
@keyframes fc-scroll { to { transform: translateY(-50%); } }

/* signal: rings expanding outward */
.fc-ring { position: absolute; left: 50%; top: 36%; width: 14rem; height: 14rem; margin: -7rem 0 0 -7rem;
  border: 1.5px solid currentColor; border-radius: 9999px; opacity: 0; animation: fc-ring 4s ease-out infinite; }
@keyframes fc-ring { from { transform: scale(0.15); opacity: 0.7; } to { transform: scale(1); opacity: 0; } }

/* data: points floating and glowing */
.fc-dot { position: absolute; border-radius: 9999px; background: currentColor; animation: fc-float ease-in-out infinite; }
@keyframes fc-float { 0%, 100% { transform: translateY(0); opacity: 0.15; } 50% { transform: translateY(-18px); opacity: 0.85; } }

/* orbit: rings turning */
.fc-orb { position: absolute; left: 50%; top: 36%; border-radius: 9999px; animation: fc-spin linear infinite; }
@keyframes fc-spin { to { transform: rotate(360deg); } }

.fc[data-paused="true"] .fc-a { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .fc-a { animation: none !important; } }
`;

const codeRows = [[0, 60], [16, 40], [16, 70], [0, 30], [0, 55], [16, 45], [32, 35], [16, 65], [0, 50], [0, 25], [16, 60], [0, 40]];
const dots = [
  [12, 14, 6, 0, 4.2], [28, 30, 4, 0.8, 5], [45, 12, 5, 1.6, 4.6], [62, 26, 7, 0.4, 5.4], [80, 16, 4, 2.2, 4.4],
  [20, 48, 5, 1.2, 5.2], [38, 42, 4, 2.8, 4.8], [56, 52, 6, 0.2, 5.6], [74, 44, 5, 1.8, 4.2], [88, 36, 4, 3, 5],
  [8, 34, 4, 2, 4.6], [50, 30, 8, 1, 5.8], [68, 8, 4, 2.6, 4.4], [32, 6, 5, 3.4, 5.2],
];

function Scene({ type, tint }) {
  return (
    <div className="fc-scene" style={{ color: tint }}>
      {type === 'code' && (
        <div className="absolute inset-x-8 top-4 h-[62%] overflow-hidden">
          <div className="fc-a fc-scroll flex flex-col gap-3">
            {[...codeRows, ...codeRows].map(([indent, w], i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-current"
                style={{ marginLeft: indent, width: `${w}%`, opacity: i % 3 === 0 ? 0.55 : 0.28 }}
              />
            ))}
          </div>
        </div>
      )}

      {type === 'signal' && [0, 1.3, 2.6].map((d) => (
        <span key={d} className="fc-a fc-ring" style={{ animationDelay: `${d}s` }} />
      ))}

      {type === 'data' && dots.map(([x, y, s, d, t], i) => (
        <span
          key={i}
          className="fc-a fc-dot"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s`, animationDuration: `${t}s` }}
        />
      ))}

      {type === 'orbit' && (
        <>
          <span className="fc-a fc-orb" style={{ width: '13rem', height: '13rem', margin: '-6.5rem 0 0 -6.5rem', animationDuration: '16s' }}>
            <span className="absolute inset-0 rounded-full border border-current opacity-30" />
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 -ml-1.5 rounded-full bg-current" />
          </span>
          <span className="fc-a fc-orb" style={{ width: '8.5rem', height: '8.5rem', margin: '-4.25rem 0 0 -4.25rem', animationDuration: '11s', animationDirection: 'reverse' }}>
            <span className="absolute inset-0 rounded-full border border-current opacity-30" />
            <span className="absolute -top-1 left-1/2 h-2 w-2 -ml-1 rounded-full bg-current" />
          </span>
        </>
      )}
    </div>
  );
}

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
            <span className="fc-a fc-blob fc-b1" style={{ background: `radial-gradient(circle, ${c.glow[0]}, transparent 65%)` }} />
            <span className="fc-a fc-blob fc-b2" style={{ background: `radial-gradient(circle, ${c.glow[1]}, transparent 65%)` }} />
            <Scene type={c.scene} tint={c.tint} />
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