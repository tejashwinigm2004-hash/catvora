import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin, Ad, Service } from './models.js';

await mongoose.connect(process.env.MONGO_URI);
await Admin.findOneAndUpdate({ email: process.env.ADMIN_EMAIL },
  { password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) }, { upsert: true });
if (!(await Ad.countDocuments())) await Ad.create({
  title: 'Turn your marketing into an AI-driven growth engine',
  subtitle: 'Software, networks and data solutions that help your business grow faster.',
  ctaText: 'Book a call', ctaLink: '#book', order: 1,
});
if (!(await Service.countDocuments())) await Service.insertMany([
  { slug: 'software', title: 'Software Solutions', icon: 'code', order: 1, summary: 'Custom web and business software built around how your team works.', benefits: ['Built to your workflow', 'Scales as you grow', 'Ongoing support'] },
  { slug: 'networking', title: 'Networking Solutions', icon: 'wifi', order: 2, summary: 'Reliable, secure office and enterprise networks.', benefits: ['Secure by design', 'Less downtime', 'Remote monitoring'] },
  { slug: 'hardware', title: 'Network Hardware and Setup', icon: 'hardware', order: 3, summary: 'Routers, switches, cabling and installation done right.', benefits: ['Vendor-neutral advice', 'Clean installation', 'Warranty handling'] },
  { slug: 'ai-data', title: 'AI Data Solutions', icon: 'cpu', order: 4, summary: 'Turn your business data into dashboards and predictions.', benefits: ['Clear dashboards', 'Predictive insights', 'Data you can trust'] },
  { slug: 'ai-marketing', title: 'AI-driven Marketing', icon: 'trend', order: 5, summary: 'Replace guesswork with targeting and campaigns driven by data.', benefits: ['Better targeting', 'Lower cost per lead', 'Measurable results'] },
]);
console.log('Seeded'); process.exit(0);
