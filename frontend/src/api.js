import axios from 'axios';
import { useEffect, useState } from 'react';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', withCredentials: true });

// Used if the API is offline, so the site never looks empty
export const FALLBACK = {
  ads: [{ _id: 'd', title: 'Turn your marketing into an AI-driven growth engine', subtitle: 'Software, networks and data solutions that help your business grow faster.', ctaText: 'Book a call', ctaLink: '#book' }],
  services: [
    { _id: '1', slug: 'software', title: 'Software Solutions', icon: 'code', summary: 'Custom web and business software built around how your team works.', benefits: ['Built to your workflow', 'Scales as you grow', 'Ongoing support'] },
    { _id: '2', slug: 'networking', title: 'Networking Solutions', icon: 'wifi', summary: 'Reliable, secure office and enterprise networks.', benefits: ['Secure by design', 'Less downtime', 'Remote monitoring'] },
    { _id: '3', slug: 'hardware', title: 'Network Hardware and Setup', icon: 'hardware', summary: 'Routers, switches, cabling and installation done right.', benefits: ['Vendor-neutral advice', 'Clean installation', 'Warranty handling'] },
    { _id: '4', slug: 'ai-data', title: 'AI Data Solutions', icon: 'cpu', summary: 'Turn your business data into dashboards and predictions.', benefits: ['Clear dashboards', 'Predictive insights', 'Data you can trust'] },
    { _id: '5', slug: 'ai-marketing', title: 'AI-driven Marketing', icon: 'trend', summary: 'Replace guesswork with targeting and campaigns driven by data.', benefits: ['Better targeting', 'Lower cost per lead', 'Measurable results'] },
  ],
  team: [],
};

export function useContent() {
  const [c, setC] = useState(FALLBACK);
  useEffect(() => {
    api.get('/content').then(({ data }) => setC({
      ads: data.ads.length ? data.ads : FALLBACK.ads,
      services: data.services.length ? data.services : FALLBACK.services,
      team: data.team,
    })).catch(() => {});
  }, []);
  return c;
}
