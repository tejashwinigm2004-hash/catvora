import Seo from '../components/Seo.jsx';
import { useContent } from '../api.js';

const values = [['Honest advice', 'We recommend what fits, not what costs more.'], ['Clear results', 'We agree on measures before we start.'], ['Long-term support', 'We stay after launch.']];

const whatWeDo = [
  ['Software Solutions', 'Developing modern applications and customized software to meet business requirements.'],
  ['Networking Solutions', 'Providing network setup, connectivity, configuration, and network support solutions.'],
  ['Artificial Intelligence', 'Exploring AI-driven solutions to improve efficiency, automate processes, and support smarter decision-making.'],
];

export default function About() {
  const { team } = useContent();
  return (
    <div className="pt-24">
      <Seo title="About" desc="CATVORA Technology is an emerging technology startup delivering software, networking and artificial intelligence solutions for businesses and individuals." />

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">About Us – CATVORA Technology</h1>
        <p className="mt-6 max-w-2xl text-lg text-ink/70">
          CATVORA Technology is an emerging technology startup focused on delivering innovative, reliable, and efficient technology solutions for businesses and individuals. We aim to bridge the gap between technology and business needs through modern software solutions, networking services, and artificial intelligence.
        </p>
        <p className="mt-4 max-w-2xl text-lg text-ink/70">
          Our goal is to help businesses simplify operations, improve connectivity, and embrace digital transformation with smart, scalable, and practical solutions.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-12">
        <h2 className="text-3xl font-extrabold">What We Do</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {whatWeDo.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-ink/10 bg-white p-6">
              <h3 className="text-xl font-bold">{t}</h3>
              <p className="mt-2 text-ink/70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="mt-2 text-ink/70">To become a trusted technology partner by driving innovation, enabling digital growth, and creating meaningful technological solutions.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="mt-2 text-ink/70">To deliver customer-focused technology solutions that combine innovation, quality, and reliability while helping businesses adapt to an evolving digital world.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-2xl font-bold">Our Commitment</h2>
        <p className="mt-2 max-w-3xl text-ink/70">
          At CATVORA Technology, we believe in continuous learning, innovation, and building solutions that create value. We strive to understand every client's needs and work toward practical, efficient, and future-ready technology solutions.
        </p>
        <p className="mt-8 text-xl font-extrabold text-cobalt">CATVORA Technology — Innovate. Connect. Transform.</p>
      </section>

      <section className="bg-white px-5 py-16"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        {values.map(([t, d]) => <div key={t}><h3 className="text-xl font-bold">{t}</h3><p className="mt-2 text-ink/70">{d}</p></div>)}
      </div></section>

      {team.length > 0 && <section className="mx-auto max-w-6xl px-5 py-16"><h2 className="text-3xl font-extrabold">Team</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-4">{team.map((m) => (
          <div key={m._id}>{m.photo && <img src={m.photo} alt={m.name} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />}
            <p className="mt-3 font-bold">{m.name}</p><p className="text-ink/70">{m.role}</p></div>))}</div></section>}
    </div>
  );
}