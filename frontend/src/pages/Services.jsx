import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ServiceIcon from '../components/ServiceIcon.jsx';
import { useContent } from '../api.js';

const steps = ['Discuss your goals', 'Plan and quote', 'Build or install', 'Support and improve'];
const faqs = [
  ['How long does a project take?', 'Small projects take 2 to 4 weeks. We give a timeline in your quote.'],
  ['Do you offer support after delivery?', 'Yes. Every project includes a support period, with monthly plans after that.'],
  ['Can I combine services?', 'Yes. Most clients pair software or data work with AI marketing.'],
];

// Workflow for each domain. Edit the steps here whenever you need.
const flows = {
  software: [
    ['Discover and scope', 'We learn your goals and users, then agree what is built first.'],
    ['Design', 'Screens and flow you can review and approve before coding starts.'],
    ['Develop', 'We build in short sprints and show working features as we go.'],
    ['Test', 'Bug fixing, speed and security checks on real devices.'],
    ['Launch', 'We deploy to your domain and hand over access.'],
    ['Support', 'Monitoring, fixes and new features after launch.'],
  ],
  network: [
    ['Site survey', 'We check your space, devices, internet line and current problems.'],
    ['Network design', 'A plan for coverage, speed, security and future growth.'],
    ['Installation', 'Cabling and equipment fitted neatly by our team.'],
    ['Configuration', 'Wi-Fi, firewall, user access and backups set up and secured.'],
    ['Testing', 'Speed and coverage checked in every room.'],
    ['Handover and support', 'Walkthrough for your staff, then fast help when needed.'],
  ],
  hardware: [
    ['Requirement check', 'We list what you need: devices, number of users and budget.'],
    ['Product selection', 'We suggest suitable routers, switches and equipment with clear prices.'],
    ['Quote and order', 'You approve the quote and we order the hardware.'],
    ['Delivery and installation', 'We deliver, fit and connect everything on site.'],
    ['Testing', 'Every device is tested before we leave.'],
    ['Warranty and support', 'Replacement and repair help during the warranty period.'],
  ],
  data: [
    ['Collect data', 'We gather your data from sheets, apps and systems.'],
    ['Clean and organise', 'Errors and gaps are fixed so the data can be trusted.'],
    ['Analyse', 'We find the patterns behind sales, cost and customer behaviour.'],
    ['Build model or dashboard', 'Reports, predictions or automation made for your questions.'],
    ['Deploy', 'Connected to your daily tools so your team uses it.'],
    ['Monitor and improve', 'We track accuracy and update it as your data changes.'],
  ],
  marketing: [
    ['Audit and goals', 'We review your brand, website and past campaigns, then set targets.'],
    ['Audience and strategy', 'We choose the customers, channels and message most likely to convert.'],
    ['Content and campaigns', 'Ads, posts, pages and emails created for you.'],
    ['Launch', 'Campaigns go live with tracking from day one.'],
    ['Measure with AI and data', 'Reports show what brings leads and what wastes budget.'],
    ['Optimise and scale', 'We move budget to what works and grow it step by step.'],
  ],
  generic: steps.map((s) => [s, '']),
};

const pickFlow = (title = '') => {
  const t = title.toLowerCase();
  if (/market|seo|ads|social|campaign/.test(t)) return flows.marketing;
  if (/hardware|router|switch|cctv|device/.test(t)) return flows.hardware;
  if (/network|wifi|wi-fi/.test(t)) return flows.network;
  if (/data|\bai\b|analytic|machine/.test(t)) return flows.data;
  if (/software|web|app|develop/.test(t)) return flows.software;
  return flows.generic;
};

export default function Services() {
  const { services } = useContent();
  return (
    <div className="pt-24">
      <Seo title="Services" desc="Software, networking, network hardware, AI data and AI-driven marketing services from CATVORA Technology." />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Our services</h1>
        {services.map((s) => (
          <article key={s._id} id={s.slug} className="grid scroll-mt-24 gap-6 border-b border-ink/15 py-12 md:grid-cols-2">
            <div><span className="text-cobalt"><ServiceIcon name={s.icon} size={36} /></span><h2 className="mt-3 text-3xl font-bold">{s.title}</h2><p className="mt-3 max-w-md text-ink/70">{s.summary}</p></div>
            <div><ul className="space-y-2">{s.benefits?.map((b) => <li key={b} className="flex gap-2"><span className="text-mint">✓</span>{b}</li>)}</ul>
              <Link to={`/contact?service=${encodeURIComponent(s.title)}`} className="btn mt-6">Request a quote</Link></div>

            {/* Workflow of this service */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold">How this service works</h3>
              <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pickFlow(s.title).map(([t, d], i) => (
                  <li key={t} className="rounded-2xl border border-ink/10 bg-white p-5">
                    <span className="font-display text-2xl font-extrabold text-cobalt">{String(i + 1).padStart(2, '0')}</span>
                    <p className="mt-1 font-bold">{t}</p>
                    {d && <p className="mt-1 text-sm text-ink/70">{d}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </section>
      <section className="bg-white px-5 py-16"><div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-extrabold">How we work</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">{steps.map((s, i) => <li key={s}><span className="font-display text-3xl font-extrabold text-cobalt">{i + 1}</span><p className="mt-1 font-bold">{s}</p></li>)}</ol>
      </div></section>
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-3xl font-extrabold">Questions</h2>
        {faqs.map(([q, a]) => <details key={q} className="border-b border-ink/15 py-4"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-2 text-ink/70">{a}</p></details>)}
      </section>
    </div>
  );
}