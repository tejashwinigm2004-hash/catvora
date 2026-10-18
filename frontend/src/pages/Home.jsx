import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { FaWhatsapp } from 'react-icons/fa';
import { FiShield, FiTag, FiPhone, FiLayers, FiSliders, FiUsers, FiMail, FiChevronRight } from 'react-icons/fi';
import Hero from '../components/Hero.jsx';
import Seo from '../components/Seo.jsx';
import ServiceIcon from '../components/ServiceIcon.jsx';
import ProjectEstimator from '../components/ProjectEstimator.jsx';
import FeatureCards from '../components/FeatureCards.jsx'; // added
import { Reveal, Stagger } from '../components/motion/Reveal.jsx';
import { useContent } from '../api.js';
import { CONFIG } from '../config.js';

const quick = [
  [FiLayers, 'Our services', '/services'],
  [FiSliders, 'Get an estimate', '/#estimate'],
  [FiUsers, 'About us', '/about'],
  [FiMail, 'Contact us', '/contact'],
];
const stats = [[50, '+', 'Projects delivered'], [30, '+', 'Business clients'], [5, '', 'Core services'], [24, 'h', 'Typical first reply']];
const steps = [
  ['01', 'Discuss', 'We listen to your goals and constraints.'],
  ['02', 'Plan', 'You get a scope, a timeline and a clear quote.'],
  ['03', 'Build', 'We build or install, with updates along the way.'],
  ['04', 'Support', 'We stay on to fix, tune and grow.'],
];
const why = [
  [FiShield, 'Tested before it goes live', 'Every build and installation is checked before we hand it over.'],
  [FiTag, 'Clear pricing', 'Scope, timeline and cost are shown before you commit.'],
  [FiPhone, 'We are a call away', 'Call or message us if anything goes wrong.'],
];

const Eyebrow = ({ children }) => (
  <p className="text-sm font-semibold uppercase tracking-wider text-ink/60">{children}</p>
);

export default function Home() {
  const { services } = useContent();
  const go = useNavigate();
  const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hi CATVORA, I would like to know more about your services.')}`;
  const wrap = 'mx-auto max-w-6xl px-5';

  return (
    <>
      <Seo title="Software, Networking and AI Solutions" desc="CATVORA Technology builds software, networks and AI data solutions that help businesses grow faster." />

      {/* Full-screen advertisement video */}
      <Hero />

      {/* Quick links */}
      <section className="border-b border-black/10 bg-paper">
        <Stagger className={`${wrap} grid grid-cols-2 gap-2 py-5 md:grid-cols-4`}>
          {quick.map(([Icon, t, to]) => (
            <div key={t}>
              <button onClick={() => go(to)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-semibold transition hover:bg-black/5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-peach"><Icon size={20} /></span>
                {t}
              </button>
            </div>
          ))}
        </Stagger>
      </section>

      {/* Power your business: four tall cards */}
      <FeatureCards />

      {/* Services */}
      <section className="bg-paper py-20">
        <div className={wrap}>
          <Reveal>
            <Eyebrow>What we do</Eyebrow>
            <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">Everything your business needs to run and grow on technology</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-6">
            {services.map((s, i) => (
              <Reveal key={s._id} delay={(i % 3) * 0.08} className={i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}>
                <div className="flex h-full flex-col overflow-hidden rounded-lg bg-leaf transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="grid h-40 place-items-center bg-mist text-ink"><ServiceIcon name={s.icon} size={56} /></div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl">{s.title}</h3>
                    <p className="mt-2 flex-1 text-ink/70">{s.summary}</p>
                    <button onClick={() => go(`/contact?service=${encodeURIComponent(s.title)}`)}
                      className="mt-5 inline-flex items-center gap-1 self-start font-semibold text-cobalt hover:underline">
                      Request a quote <FiChevronRight />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal><button className="btn mt-8" onClick={() => go('/services')}>View all services</button></Reveal>
        </div>
      </section>

      {/* Why choose us: three equal cards */}
      <section className="bg-mist py-20">
        <div className={wrap}>
          <Reveal>
            <Eyebrow>Why CATVORA</Eyebrow>
            <h2 className="mt-2 text-3xl sm:text-4xl">Why businesses choose CATVORA</h2>
            <p className="mt-4 max-w-2xl text-lg text-ink/70">
              Software, networks and AI marketing under one roof, built around your data, with a small senior team that replies fast.
            </p>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-3" gap={0.12}>
            {why.map(([Icon, t, d]) => (
              <div key={t} className="flex">
                <div className="w-full rounded-lg bg-leaf p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <span className="grid h-14 w-14 place-items-center rounded-lg bg-peach text-ink"><Icon size={26} /></span>
                  <h3 className="mt-5 text-xl">{t}</h3>
                  <p className="mt-2 text-ink/70">{d}</p>
                </div>
              </div>
            ))}
          </Stagger>
          <Reveal><button className="btn mt-8" onClick={() => go('/about')}>Know more about us</button></Reveal>
        </div>
      </section>

      {/* Numbers */}
      <section className="bg-paper">
        <Stagger className={`${wrap} grid grid-cols-2 gap-8 py-14 md:grid-cols-4`}>
          {stats.map(([n, suf, l]) => (
            <div key={l}>
              <p className="font-display text-4xl font-semibold text-cobalt sm:text-5xl"><CountUp end={n} duration={2} enableScrollSpy scrollSpyOnce />{suf}</p>
              <p className="mt-1 text-sm text-ink/70">{l}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* Planner: the unique feature */}
      <div id="estimate" className="scroll-mt-20 bg-mist"><ProjectEstimator /></div>

      {/* Process */}
      <section className="bg-paper py-20">
        <div className={wrap}>
          <Reveal><Eyebrow>Our process</Eyebrow><h2 className="mt-2 text-3xl sm:text-4xl">How we work</h2></Reveal>
          <Stagger className="mt-10 grid gap-8 md:grid-cols-4" gap={0.12}>
            {steps.map(([n, t, d]) => (
              <div key={t}>
                <div className="border-t-2 border-ink pt-4">
                  <span className="font-display text-3xl font-semibold text-ink/40">{n}</span>
                  <h3 className="mt-2 text-xl">{t}</h3>
                  <p className="mt-1 text-ink/70">{d}</p>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* About: wide panel */}
      <section className="bg-mist py-20">
        <div className={wrap}>
          <Reveal>
            <div className="grid items-center gap-10 rounded-lg bg-leaf p-8 md:grid-cols-2 md:p-14">
              <div>
                <Eyebrow>About us</Eyebrow>
                <h2 className="mt-2 text-3xl sm:text-4xl">A startup that moves businesses from traditional to AI-driven</h2>
                <p className="mt-5 max-w-lg text-lg text-ink/70">
                  We started CATVORA so small and mid-size businesses can get the same quality of software, networks and data tools that large companies use.
                </p>
                <button className="btn mt-8" onClick={() => go('/about')}>Know more about us</button>
              </div>
              <div className="space-y-8">
                {[['Our vision', 'Every growing business runs on technology it understands and trusts.'],
                  ['Our mission', 'Software, networking and AI data solutions that turn into measurable growth.']].map(([t, d]) => (
                  <div key={t} className="border-l-4 border-accent pl-5">
                    <h3 className="text-2xl">{t}</h3>
                    <p className="mt-2 text-ink/70">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact call-to-action */}
      <section className="bg-paper px-5 py-20 text-center">
        <Reveal>
          <Eyebrow>Contact</Eyebrow>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl sm:text-4xl">Tell us what you want to improve</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">Send a message or talk to us directly. We usually reply within 24 hours.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button className="btn" onClick={() => go('/contact')}>Contact us</button>
            <a href={wa} target="_blank" rel="noreferrer" className="btn-ghost"><FaWhatsapp size={20} /> Chat on WhatsApp</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}