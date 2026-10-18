import { FiArrowRight } from 'react-icons/fi';

// Architecture for each service, matched by slug. Edit the boxes here whenever you need.
// Each column is one layer. Arrows show how things connect, from left to right.
const arch = {
  software: {
    caption: 'How a custom web app is put together',
    cols: [
      ['Users', ['Customers', 'Your staff', 'Admin']],
      ['Front end', ['React web app', 'Mobile-friendly screens']],
      ['Back end', ['Node.js and Express API', 'Secure login', 'Input checks']],
      ['Data and services', ['MongoDB database', 'Image storage', 'Email and payments']],
    ],
  },
  'networking': {
    caption: 'How a secured office network is laid out',
    cols: [
      ['Internet', ['Main internet line', 'Backup line']],
      ['Security', ['Firewall', 'Access rules', 'Secure remote access']],
      ['Core network', ['Router', 'Core switch', 'Monitoring']],
      ['Your devices', ['Wi-Fi access points', 'Desk computers', 'Printers and cameras']],
    ],
  },
  hardware: {
    caption: 'The equipment we supply and install',
    cols: [
      ['Internet line', ['Provider connection']],
      ['Router', ['Business router', 'Firewall unit']],
      ['Switching and cabling', ['Network switches', 'Structured cabling', 'Rack and labelling']],
      ['Connected devices', ['Access points', 'Computers', 'Printers', 'CCTV']],
    ],
  },
  'ai-data': {
    caption: 'How your data becomes decisions',
    cols: [
      ['Your data', ['Sheets and files', 'Business apps', 'Website and ads']],
      ['Data pipeline', ['Collect', 'Clean and organise', 'Store safely']],
      ['Intelligence', ['Analysis', 'Prediction models']],
      ['What you see', ['Dashboards', 'Automated reports', 'Alerts']],
    ],
  },
  'ai-marketing': {
    caption: 'How AI-driven marketing learns and improves',
    cols: [
      ['Audience', ['Website visitors', 'Social and search', 'Email lists']],
      ['Tracking and data', ['Google Analytics 4', 'Meta Pixel', 'Customer data']],
      ['AI optimisation', ['Better targeting', 'Budget allocation', 'Content testing']],
      ['Channels and results', ['Ads and social posts', 'Email campaigns', 'Leads and reports']],
    ],
  },
};

export default function ArchDiagram({ slug }) {
  const a = arch[slug];
  if (!a) return null;
  return (
    <figure className="rounded-3xl bg-white p-6">
      <figcaption className="text-xl font-display font-semibold">Architecture: {a.caption}</figcaption>
      <div className="mt-5 flex flex-col items-stretch gap-3 lg:flex-row">
        {a.cols.map(([title, items], i) => (
          <div key={title} className="flex flex-1 flex-col items-center gap-3 lg:flex-row">
            <div className="w-full flex-1 self-stretch rounded-2xl bg-leaf p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">{title}</p>
              <ul className="mt-3 space-y-2">
                {items.map((x) => (
                  <li key={x} className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm font-medium">{x}</li>
                ))}
              </ul>
            </div>
            {i < a.cols.length - 1 && (
              <span aria-hidden className="grid h-9 w-9 shrink-0 rotate-90 place-items-center rounded-full border border-pline bg-peach lg:rotate-0">
                <FiArrowRight />
              </span>
            )}
          </div>
        ))}
      </div>
    </figure>
  );
}