import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ServiceIcon from '../components/ServiceIcon.jsx';
import ArchDiagram from '../components/ArchDiagram.jsx';
import { Reveal } from '../components/motion/Reveal.jsx';
import { useContent } from '../api.js';

const steps = ['Discuss your goals', 'Plan and quote', 'Build or install', 'Support and improve'];
const faqs = [
  ['How long does a project take?', 'Small projects take 2 to 4 weeks. We give a timeline in your quote.'],
  ['Do you offer support after delivery?', 'Yes. Every project includes a support period, with monthly plans after that.'],
  ['Can I combine services?', 'Yes. Most clients pair software or data work with AI marketing.'],
];

// Detailed summary for each service, matched by slug. Edit the wording here whenever you need.
// TODO: CATVORA to confirm the timelines before launch.
const details = {
  software: {
    overview: 'We design and build web apps, business websites and internal tools around the way your team actually works. Instead of forcing you into off-the-shelf software, we build only what you need, in short steps you can review, so you see progress early and avoid surprises.',
    audience: 'Businesses that have outgrown spreadsheets, need a customer-facing website or app, or want to automate repeated manual work.',
    included: ['Business website or web app', 'Admin panel to manage your own content', 'Customer logins, forms and payments where needed', 'Mobile-friendly design', 'Hosting, domain and SSL setup', 'Handover with training and documentation'],
    outcomes: ['A product built for your workflow, not a generic template', 'Less manual work for your team', 'A site or app you can update yourself', 'Support from the same team that built it'],
    timeline: '4 to 12 weeks',
    tech: 'Typically built with React, Node.js and MongoDB',
  },
  networking: {
    overview: 'We plan, install and secure the network your business depends on: office Wi-Fi, wired connections, firewalls and remote access. A good network is invisible when it works, so we focus on coverage, speed and security, and on fixing weak spots before they cause downtime.',
    audience: 'Offices, shops, clinics and growing teams with slow Wi-Fi, dead zones, frequent drops or no proper security.',
    included: ['Site survey and coverage plan', 'Wired and wireless network design', 'Firewall, user access and guest Wi-Fi setup', 'Secure remote access for staff', 'Backup internet line options', 'Monitoring and support plans'],
    outcomes: ['Stable Wi-Fi in every room you use', 'Faster, more reliable internet for your team', 'Protection from common security risks', 'A network diagram and credentials handed over to you'],
    timeline: '1 to 3 weeks',
    tech: 'Business-grade routers, switches, access points and firewalls',
  },
  hardware: {
    overview: 'We help you choose, supply and install the right routers, switches, access points and cabling, with clear prices and no unnecessary extras. We give vendor-neutral advice, fit everything neatly on site and test it before we leave.',
    audience: 'Businesses setting up a new office, replacing old equipment, or expanding to more users or locations.',
    included: ['Requirement check and product advice', 'Clear quote with brand and model options', 'Supply and delivery', 'Structured cabling and rack setup', 'Installation, labelling and testing', 'Warranty and replacement support'],
    outcomes: ['Equipment matched to your users and budget', 'A neat, labelled installation', 'Warranty paperwork and a full device list', 'One contact for any hardware issue'],
    timeline: '1 to 2 weeks, depending on delivery',
    tech: 'Routers, switches, access points, cabling and racks from trusted brands',
  },
  'ai-data': {
    overview: 'We turn the data you already have in sheets, apps and systems into clear dashboards, reports and predictions. We start with the questions you want answered, clean the data so it can be trusted, and connect the results to your daily tools so your team actually uses them.',
    audience: 'Businesses with sales, customer or operations data that sits unused, or managers who make decisions without clear numbers.',
    included: ['Data collection from sheets, apps and systems', 'Cleaning and organising', 'Dashboards and automated reports', 'Forecasts such as sales or demand', 'Alerts when numbers move unexpectedly', 'Team training on reading the results'],
    outcomes: ['One place to see how your business is doing', 'Fewer hours spent on manual reports', 'Early signs of trends and problems', 'Decisions based on data instead of guesses'],
    timeline: '3 to 8 weeks',
    tech: 'Dashboards and models connected to your existing tools',
  },
  'ai-marketing': {
    overview: 'We replace guesswork with data. We study your customers and past results, choose the channels and messages most likely to work, run the campaigns and report openly on what brings leads and what wastes budget. Spending then moves to what works.',
    audience: 'Businesses that spend on ads or social media without clear results, or want a steady flow of enquiries online.',
    included: ['Audit of brand, website and past campaigns', 'Audience and channel strategy', 'Ads, posts, landing pages and email content', 'Campaign setup with tracking from day one', 'Monthly reports in plain language', 'Ongoing testing and budget optimisation'],
    outcomes: ['More qualified enquiries', 'A lower cost for each lead over time', 'Clear reports on what you spent and what it earned', 'A marketing plan that improves each month'],
    timeline: 'Setup in 2 to 4 weeks, with results building over 2 to 3 months',
    tech: 'Google Analytics 4, Meta Pixel and ad platform data',
  },
};

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

const Eyebrow = ({ children }) => (
  <span className="inline-block rounded-full bg-peach px-3 py-1 text-xs font-semibold tracking-wide">{children}</span>
);

const Check = ({ items }) => (
  <ul className="mt-3 space-y-2">
    {items.map((x) => (
      <li key={x} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-peach text-xs font-bold">✓</span><span>{x}</span></li>
    ))}
  </ul>
);

export default function Services() {
  const { services } = useContent();
  return (
    <div className="pt-24">
      <Seo title="Services" desc="Software, networking, network hardware, AI data and AI-driven marketing services from CATVORA Technology." />

      {/* Page intro with quick links */}
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-10">
        <Reveal>
          <Eyebrow>Services</Eyebrow>
          <h1 className="mt-3 text-4xl sm:text-5xl">Our services</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/70">
            Here is what each service covers, what is included, who it suits, how a project runs from the first call to support, and how it is built.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {services.map((s) => (
              <a key={s._id} href={`#${s.slug}`} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-medium transition hover:border-pline hover:bg-peach">{s.title}</a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* One detailed card per service */}
      <section className="mx-auto max-w-6xl space-y-8 px-5 py-10">
        {services.map((s) => {
          const d = details[s.slug];
          return (
            <Reveal key={s._id}>
              <article id={s.slug} className="scroll-mt-24 rounded-[2rem] bg-leaf p-6 md:p-10">
                {/* header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-peach"><ServiceIcon name={s.icon} size={26} /></span>
                    <div>
                      <h2 className="text-3xl sm:text-4xl">{s.title}</h2>
                      <p className="mt-2 max-w-xl text-lg text-ink/70">{s.summary}</p>
                    </div>
                  </div>
                  {d?.timeline && (
                    <div className="rounded-2xl bg-white px-5 py-3 text-sm">
                      <span className="block text-ink/60">Typical timeline</span>
                      <span className="font-semibold">{d.timeline}</span>
                    </div>
                  )}
                </div>

                {s.benefits?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {s.benefits.map((b) => <span key={b} className="rounded-full border border-pline bg-peach px-3 py-1 text-sm font-medium">{b}</span>)}
                  </div>
                )}

                {/* detailed summary */}
                {d && (
                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div className="rounded-3xl bg-white p-6">
                      <h3 className="text-xl">Overview</h3>
                      <p className="mt-2 text-ink/75">{d.overview}</p>
                      <h3 className="mt-6 text-xl">Who it is for</h3>
                      <p className="mt-2 text-ink/75">{d.audience}</p>
                      {d.tech && <p className="mt-6 text-sm text-ink/60"><b className="text-ink">Built with:</b> {d.tech}</p>}
                    </div>
                    <div className="space-y-5">
                      <div className="rounded-3xl bg-white p-6">
                        <h3 className="text-xl">What is included</h3>
                        <Check items={d.included} />
                      </div>
                      <div className="rounded-3xl bg-white p-6">
                        <h3 className="text-xl">What you get</h3>
                        <Check items={d.outcomes} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Workflow of this service */}
                <div className="mt-8">
                  <h3 className="text-2xl">How this service works</h3>
                  <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pickFlow(s.title).map(([t, desc], i) => (
                      <li key={t} className="rounded-2xl bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <span className="font-display text-2xl font-semibold text-[#E9A57C]">{String(i + 1).padStart(2, '0')}</span>
                        <p className="mt-1 font-semibold">{t}</p>
                        {desc && <p className="mt-1 text-sm text-ink/70">{desc}</p>}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Architecture diagram at the end of each service */}
                <div className="mt-8"><ArchDiagram slug={s.slug} /></div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={`/contact?service=${encodeURIComponent(s.title)}`} className="btn">Request a quote</Link>
                  <button className="btn-ghost" onClick={() => window.dispatchEvent(new Event('open-booking'))}>Book a call</button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </section>

      <section className="bg-mist px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl">How we work</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s} className="rounded-3xl bg-leaf p-6">
                <span className="font-display text-3xl font-semibold text-[#E9A57C]">{i + 1}</span>
                <p className="mt-1 font-semibold">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-3xl sm:text-4xl">Questions</h2>
        {faqs.map(([q, a]) => (
          <details key={q} className="border-b border-ink/15 py-4">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-ink/70">{a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}