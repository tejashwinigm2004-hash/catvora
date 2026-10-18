import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceIcon from './ServiceIcon.jsx';
import { Reveal } from './motion/Reveal.jsx';

// TODO: CATVORA to set real prices (in ₹).
// once = one-time project cost, monthly = monthly plan, setup = setup fee added when you start monthly
const SERVICES = [
  { id: 'software', title: 'Software Solutions', sub: 'Custom apps and websites', icon: 'code', once: 120000, monthly: 8000, setup: 20000 },
  { id: 'networking', title: 'Networking Solutions', sub: 'Office and enterprise networks', icon: 'wifi', once: 60000, monthly: 5000, setup: 10000 },
  { id: 'hardware', title: 'Network Hardware and Setup', sub: 'Buy outright or managed monthly', icon: 'hardware', once: 45000, monthly: 3500, setup: 8000 },
  { id: 'ai-data', title: 'AI Data Solutions', sub: 'Dashboards and predictions', icon: 'cpu', once: 100000, monthly: 9000, setup: 15000 },
  { id: 'ai-marketing', title: 'AI-driven Marketing', sub: 'Campaigns that learn from data', icon: 'trend', once: 90000, monthly: 12000, setup: 10000 },
];
const SIZES = [
  { id: 's', label: 'Small', hint: '1 to 10 people', m: 1 },
  { id: 'm', label: 'Growing', hint: '11 to 50 people', m: 1.6 },
  { id: 'l', label: 'Large', hint: '50+ people', m: 2.4 },
];
const MAX = 36; // months shown on the chart

const inr = (n) => '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n / 100) * 100);

function Chart({ once, monthly, setup, h, cross }) {
  const W = 640, H = 300, L = 16, R = 16, T = 24, B = 44;
  const top = Math.max(once, setup + monthly * MAX) * 1.1;
  const x = (m) => L + ((W - L - R) * m) / MAX;
  const y = (v) => T + (H - T - B) * (1 - v / top);
  const hasCross = cross > 0 && cross <= MAX;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label={`Cost over ${MAX} months. One-time project ${inr(once)}. Monthly plan ${inr(monthly)} a month.`}>
      <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="#0B2A5B33" strokeWidth="2" />
      <line x1={L} y1={T} x2={L} y2={H - B} stroke="#0B2A5B33" strokeWidth="2" />
      {/* one-time cost: flat line */}
      <line x1={L} y1={y(once)} x2={W - R} y2={y(once)} stroke="#E9A57C" strokeWidth="3" strokeDasharray="8 8" />
      <text x={L + 10} y={y(once) - 10} fontSize="15" fill="#0B2A5B" opacity="0.7">One-time {inr(once)}</text>
      {/* monthly plan: climbing line */}
      <line x1={x(0)} y1={y(setup)} x2={x(MAX)} y2={y(setup + monthly * MAX)} stroke="#1456E0" strokeWidth="4" strokeLinecap="round" />
      {/* the month the visitor chose */}
      <line x1={x(h)} y1={T} x2={x(h)} y2={H - B} stroke="#0B2A5B" strokeWidth="2" opacity="0.35" />
      <circle cx={x(h)} cy={y(setup + monthly * h)} r="7" fill="#1456E0" stroke="#fff" strokeWidth="3" />
      {hasCross && <circle cx={x(cross)} cy={y(once)} r="9" fill="#FFE9DB" stroke="#0B2A5B" strokeWidth="3" />}
      <text x={L} y={H - 14} fontSize="15" fill="#0B2A5B" opacity="0.7">0</text>
      <text x={W - R} y={H - 14} fontSize="15" textAnchor="end" fill="#0B2A5B" opacity="0.7">{MAX} months</text>
    </svg>
  );
}

export default function ProjectEstimator() {
  const go = useNavigate();
  const [svc, setSvc] = useState(SERVICES[0]);
  const [size, setSize] = useState(SIZES[0]);
  const [h, setH] = useState(12);

  const once = svc.once * size.m;
  const monthly = svc.monthly * size.m;
  const setup = svc.setup * size.m;
  const cross = Math.max(0, (once - setup) / monthly);   // months where both options cost the same
  const monthlyTotal = setup + monthly * h;
  const monthlyWins = monthlyTotal < once;
  const saving = Math.abs(once - monthlyTotal);

  const send = () => {
    const note = `I would like a quote for ${svc.title}. Business size: ${size.label}. I need it for about ${h} months. One-time project is about ${inr(once)}; monthly plan is about ${inr(monthly)} a month. ${monthlyWins ? 'The monthly plan looks cheaper for me.' : 'The one-time project looks cheaper for me.'}`;
    go(`/contact?service=${encodeURIComponent(svc.title)}&note=${encodeURIComponent(note)}`);
  };

  const on = 'border-pline bg-peach';
  const off = 'border-transparent bg-leaf hover:border-pline';

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <span className="inline-block rounded-full bg-peach px-3 py-1 text-xs font-semibold tracking-wide">Project planner</span>
        <h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">One-time project or monthly plan? See which saves you more</h2>
        <p className="mt-3 max-w-xl text-ink/70">Pick a service and how long you need it. We show the cheaper option and the point where the two cost the same.</p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 grid gap-8 rounded-[2rem] bg-white p-5 shadow-sm md:grid-cols-[1fr_1.1fr] md:p-8">
          {/* LEFT: choices */}
          <div>
            <p className="text-lg font-semibold">What do you need?</p>
            <div className="mt-3 space-y-2" role="radiogroup" aria-label="Service">
              {SERVICES.map((s) => (
                <button key={s.id} role="radio" aria-checked={svc.id === s.id} onClick={() => setSvc(s)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition ${svc.id === s.id ? on : off}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white"><ServiceIcon name={s.icon} size={20} /></span>
                  <span><span className="block text-lg font-semibold leading-tight">{s.title}</span><span className="block text-sm text-ink/65">{s.sub}</span></span>
                </button>
              ))}
            </div>

            <div className="mt-7 flex items-baseline justify-between">
              <label htmlFor="months" className="text-lg font-semibold">How long do you need it?</label>
              <span className="font-semibold text-cobalt">{h} {h === 1 ? 'month' : 'months'}</span>
            </div>
            <input id="months" type="range" min="1" max={MAX} value={h} onChange={(e) => setH(+e.target.value)}
              className="mt-3 w-full accent-[#E9A57C]" />
            <div className="mt-1 flex justify-between text-sm text-ink/60"><span>1 month</span><span>3 years</span></div>

            <p className="mt-6 text-lg font-semibold">How big is your business?</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <button key={s.id} aria-pressed={size.id === s.id} onClick={() => setSize(s)}
                  className={`rounded-2xl border-2 px-3 py-3 text-left transition ${size.id === s.id ? on : off}`}>
                  <span className="block font-semibold">{s.label}</span><span className="block text-xs text-ink/60">{s.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: verdict, chart, prices */}
          <div aria-live="polite">
            <span className={`inline-block rounded-full border px-4 py-2 text-lg font-semibold ${monthlyWins ? 'border-pline bg-peach' : 'border-cobalt/30 bg-leaf'}`}>
              {monthlyWins ? `Monthly plan is cheaper for ${h} ${h === 1 ? 'month' : 'months'}` : `One-time project is cheaper for ${h} months`}
            </span>
            <p className="mt-4 text-ink/75">
              <b>{svc.title}</b>: monthly plan {inr(monthly)} a month against a one-time project of {inr(once)}.{' '}
              {cross <= MAX ? <>The two cost the same at about <b>{Math.max(1, Math.round(cross))} months</b>.</> : <>The monthly plan stays cheaper for the whole 3 years.</>}{' '}
              A setup fee of {inr(setup)} is added when you go monthly. You save about <b>{inr(saving)}</b> by choosing the cheaper option.
            </p>

            <div className="mt-4"><Chart once={once} monthly={monthly} setup={setup} h={h} cross={cross} /></div>
            <div className="flex flex-wrap gap-4 text-sm text-ink/70">
              <span className="inline-flex items-center gap-2"><i className="h-1 w-6 rounded bg-cobalt" /> Monthly plan (total so far)</span>
              <span className="inline-flex items-center gap-2"><i className="h-1 w-6 rounded bg-[#E9A57C]" /> One-time project</span>
            </div>

            <div className="mt-5 space-y-2">
              {[['One-time project', `${inr(once)} once`, !monthlyWins], ['Monthly plan', `${inr(monthly)} / month`, monthlyWins]].map(([t, p, best]) => (
                <div key={t} className="flex items-center justify-between rounded-2xl bg-leaf px-5 py-3">
                  <span className="font-semibold">{t}{best && <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold">Cheaper for you</span>}</span>
                  <span className="rounded-full border border-pline bg-peach px-4 py-1.5 font-semibold">{p}</span>
                </div>
              ))}
            </div>

            <button className="btn mt-5 w-full" onClick={send}>Get a detailed quote</button>
            <p className="mt-2 text-xs text-ink/50">Indicative prices. Final quote after a short call.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}