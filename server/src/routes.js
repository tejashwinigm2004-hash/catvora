import crypto from 'crypto';
import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Admin, User, Lead, Booking, Ad, Service, Member, Project, Message, Invoice, STAGES } from './models.js';
import { notify } from './mail.js';
import { sendMail } from './sendMail.js';
console.log('routes.js: user routes loaded');
const r = Router();
const strict = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });
const check = (req, res, next) => {
  const e = validationResult(req);
  return e.isEmpty() ? next() : res.status(422).json({ message: e.array()[0].msg });
};
const wrap = (fn) => (q, s, n) => fn(q, s, n).catch(n);
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

const badId = (_q, s, n, v) => (mongoose.isValidObjectId(v) ? n() : s.status(400).json({ message: 'Bad id' }));
r.param('id', badId);
r.param('userId', badId);

// ---------- auth ----------
const prod = process.env.NODE_ENV === 'production';
const cookieOpts = { httpOnly: true, secure: prod, sameSite: prod ? 'none' : 'lax' };

const userFrom = (req) => {
  try {
    const p = jwt.verify(req.cookies.ctoken, process.env.JWT_SECRET);
    return p.role === 'customer' ? p : null;
  } catch { return null; }
};

// Admin access = the owner (Admin account) OR a customer the owner promoted
const auth = async (req, res, next) => {
  try {
    if (req.cookies.token) {
      try {
        const p = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        if (p.role === 'admin') { req.admin = { ...p, owner: true }; return next(); }
      } catch {}
    }
    const c = userFrom(req);
    if (c) {
      const u = await User.findById(c.id).select('role');
      if (u?.role === 'admin') { req.admin = { id: c.id, owner: false }; return next(); }
    }
    res.status(401).json({ message: 'Please sign in' });
  } catch (e) { next(e); }
};

const ownerOnly = (q, s, n) => (q.admin?.owner ? n() : s.status(403).json({ message: 'Only the owner can do this' }));

r.post('/auth/login', strict, wrap(async (q, s) => {
  const a = await Admin.findOne({ email: q.body.email });
  if (!a || !(await bcrypt.compare(q.body.password || '', a.password)))
    return s.status(401).json({ message: 'Wrong email or password' });
  const token = jwt.sign({ id: a._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  s.cookie('token', token, { ...cookieOpts, maxAge: 8 * 3600e3 });
  s.json({ ok: true });
}));
r.post('/auth/logout', (_q, s) => { s.clearCookie('token', cookieOpts); s.json({ ok: true }); });
r.get('/auth/me', auth, (q, s) => s.json({ ok: true, owner: !!q.admin?.owner }));

// ---------- customer accounts ----------
const cauth = (q, s, n) => {
  const p = userFrom(q);
  if (!p) return s.status(401).json({ message: 'Please sign in' });
  q.user = p;
  n();
};
const startSession = (s, u) => {
  const token = jwt.sign({ id: u._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  s.cookie('ctoken', token, { ...cookieOpts, maxAge: 7 * 24 * 3600e3 });
};
const publicUser = (u) => ({ name: u.name, email: u.email, role: u.role || 'customer', createdAt: u.createdAt });

r.post('/user/register', authLimit,
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).escape(),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters'),
  check, wrap(async (q, s) => {
    const { name, email, password } = q.body;
    if (await User.findOne({ email })) return s.status(409).json({ message: 'An account with this email already exists' });
    let u;
    try { u = await User.create({ name, email, password: await bcrypt.hash(password, 12) }); }
    catch (e) {
      if (e.code === 11000) return s.status(409).json({ message: 'An account with this email already exists' });
      throw e;
    }
    startSession(s, u);
    s.status(201).json({ user: publicUser(u) });
  }));

r.post('/user/login', authLimit,
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password'),
  check, wrap(async (q, s) => {
    const u = await User.findOne({ email: q.body.email });
    if (!u || !(await bcrypt.compare(q.body.password, u.password)))
      return s.status(401).json({ message: 'Wrong email or password' });
    startSession(s, u);
    s.json({ user: publicUser(u) });
  }));

r.post('/user/logout', (_q, s) => { s.clearCookie('ctoken', cookieOpts); s.json({ ok: true }); });

r.get('/user/me', wrap(async (q, s) => {
  const p = userFrom(q);
  const u = p ? await User.findById(p.id).select('name email role createdAt') : null;
  s.json({ user: u ? publicUser(u) : null });
}));

// profile: change your own name and/or email (current password required to change email)
r.patch('/user/profile', cauth, authLimit,
  body('name').optional().trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).escape(),
  body('email').optional().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  check, wrap(async (q, s) => {
    const u = await User.findById(q.user.id);
    if (!u) return s.status(404).json({ message: 'Account not found' });

    if (q.body.email && q.body.email !== u.email) {
      if (!(await bcrypt.compare(String(q.body.currentPassword || ''), u.password)))
        return s.status(401).json({ message: 'Enter your current password to change your email' });
      if (await User.exists({ email: q.body.email, _id: { $ne: u._id } }))
        return s.status(409).json({ message: 'An account with this email already exists' });
      u.email = q.body.email;
    }
    if (q.body.name) u.name = q.body.name;
    await u.save();
    s.json({ user: publicUser(u) });
  }));

// profile: change your own password (current password required)
r.patch('/user/password', cauth, authLimit,
  body('newPassword').isLength({ min: 8, max: 72 }).withMessage('New password must be 8 to 72 characters'),
  check, wrap(async (q, s) => {
    const u = await User.findById(q.user.id);
    if (!u || !(await bcrypt.compare(String(q.body.currentPassword || ''), u.password)))
      return s.status(401).json({ message: 'Current password is wrong' });
    u.password = await bcrypt.hash(q.body.newPassword, 12);
    await u.save();
    s.json({ ok: true });
  }));

// forgot password: always answers the same, so nobody can find out which emails have accounts
r.post('/user/forgot-password', authLimit,
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  check, wrap(async (q, s) => {
    const u = await User.findOne({ email: q.body.email });
    if (u) {
      const token = crypto.randomBytes(32).toString('hex');
      u.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      u.resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await u.save();
      const site = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, '');
      try {
        await sendMail(u.email, 'Reset your CATVORA password',
          `Hi,\n\nUse this link to set a new password. It works for 1 hour:\n${site}/reset-password?token=${token}\n\nIf you did not ask for this, you can ignore this email.`);
      } catch (e) { console.error('reset mail failed', e); }
    }
    s.json({ ok: true });
  }));

// reset password with the emailed token
r.post('/user/reset-password', authLimit,
  body('newPassword').isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters'),
  check, wrap(async (q, s) => {
    const hash = crypto.createHash('sha256').update(String(q.body.token || '')).digest('hex');
    const u = await User.findOne({ resetTokenHash: hash, resetExpires: { $gt: new Date() } });
    if (!u) return s.status(400).json({ message: 'This reset link is invalid or has expired. Please request a new one.' });
    u.password = await bcrypt.hash(q.body.newPassword, 12);
    u.resetTokenHash = undefined;
    u.resetExpires = undefined;
    await u.save();
    s.json({ ok: true });
  }));

// ---------- customer dashboard ----------
const overdue = (i) => {
  const o = i.toObject ? i.toObject() : i;
  return { ...o, status: o.status === 'due' && o.dueDate && o.dueDate < new Date() ? 'overdue' : o.status };
};

r.get('/user/summary', cauth, wrap(async (q, s) => {
  const user = new mongoose.Types.ObjectId(q.user.id);
  const [upcoming, projects, unread, openLeads, inv] = await Promise.all([
    Booking.countDocuments({ user, date: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } }),
    Project.countDocuments({ user, status: 'active' }),
    Message.countDocuments({ user, from: 'team', readByCustomer: false }),
    Lead.countDocuments({ user, status: { $nin: ['won', 'lost'] } }),
    Invoice.aggregate([{ $match: { user, status: 'due' } }, { $group: { _id: null, n: { $sum: 1 }, total: { $sum: '$amount' } } }]),
  ]);
  s.json({ upcomingBookings: upcoming, activeProjects: projects, unreadMessages: unread, openEnquiries: openLeads,
    invoicesDue: inv[0]?.n || 0, amountDue: inv[0]?.total || 0 });
}));

r.get('/user/leads', cauth, wrap(async (q, s) => s.json(await Lead.find({ user: q.user.id }).sort('-createdAt'))));
r.get('/user/bookings', cauth, wrap(async (q, s) => s.json(await Booking.find({ user: q.user.id }).sort('-date'))));
r.get('/user/projects', cauth, wrap(async (q, s) => s.json(await Project.find({ user: q.user.id }).sort('-updatedAt'))));
r.get('/user/invoices', cauth, wrap(async (q, s) => s.json((await Invoice.find({ user: q.user.id }).sort('-createdAt')).map(overdue))));
r.get('/user/invoices/:id', cauth, wrap(async (q, s) => {
  const i = await Invoice.findOne({ _id: q.params.id, user: q.user.id }).populate('project', 'title');
  return i ? s.json(overdue(i)) : s.status(404).json({ message: 'Invoice not found' });
}));

r.patch('/user/bookings/:id', cauth, wrap(async (q, s) => {
  const b = await Booking.findOne({ _id: q.params.id, user: q.user.id });
  if (!b) return s.status(404).json({ message: 'Booking not found' });
  if (!['pending', 'confirmed'].includes(b.status)) return s.status(409).json({ message: 'This booking can no longer be changed' });
  if (q.body.action === 'cancel') b.status = 'cancelled';
  else if (q.body.date) {
    const d = new Date(q.body.date);
    if (isNaN(d) || d <= new Date()) return s.status(422).json({ message: 'Pick a future date and time' });
    b.date = d; b.status = 'pending';
  } else return s.status(400).json({ message: 'Nothing to change' });
  await b.save();
  notify(`Booking ${b.status === 'cancelled' ? 'cancelled' : 'rescheduled'}: ${b.name}`, `${b.name} <${b.email}>\nNow: ${b.date}\nStatus: ${b.status}`);
  s.json(b);
}));

r.get('/user/messages', cauth, wrap(async (q, s) => {
  const list = await Message.find({ user: q.user.id }).sort('createdAt');
  await Message.updateMany({ user: q.user.id, from: 'team', readByCustomer: false }, { readByCustomer: true });
  s.json(list);
}));
r.post('/user/messages', cauth, authLimit,
  body('text').trim().notEmpty().withMessage('Write a message').isLength({ max: 2000 }).withMessage('Message is too long').escape(),
  check, wrap(async (q, s) => {
    const m = await Message.create({ user: q.user.id, from: 'customer', text: q.body.text, readByCustomer: true });
    const u = await User.findById(q.user.id).select('name email');
    notify(`New message from ${u?.name}`, `${u?.name} <${u?.email}>\n\n${q.body.text}`);
    s.status(201).json(m);
  }));

// ---------- public ----------
r.get('/content', wrap(async (_q, s) => s.json({
  ads: await Ad.find({ active: true }).sort('order'),
  services: await Service.find({ active: true }).sort('order'),
  team: await Member.find().sort('order'),
})));

r.post('/leads', strict,
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).trim().escape(),
  body('service').optional({ values: 'falsy' }).trim().escape(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).escape(),
  body('type').optional().isIn(['contact', 'quote']),
  check, wrap(async (q, s) => {
    const { name, email, phone, service, message, type } = q.body;
    await Lead.create({ name, email, phone, service, message, type, user: userFrom(q)?.id });
    notify(`New ${type || 'contact'} enquiry: ${name}`, `${name} <${email}> ${phone || ''}\nService: ${service || '-'}\n\n${message}`, email);
    s.status(201).json({ ok: true });
  }));

r.post('/bookings', strict,
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required').escape(),
  body('date').isISO8601().withMessage('Pick a date and time').toDate(),
  body('note').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }).escape(),
  check, wrap(async (q, s) => {
    const { name, email, phone, date, note } = q.body;
    await Booking.create({ name, email, phone, date, note, user: userFrom(q)?.id });
    notify(`New call booking: ${name}`, `${name} <${email}> ${phone}\nWhen: ${date}\n${note || ''}`, email);
    s.status(201).json({ ok: true });
  }));

// ---------- admin ----------
for (const [path, M, sort] of [['leads', Lead, '-createdAt'], ['bookings', Booking, '-createdAt'],
  ['ads', Ad, 'order'], ['services', Service, 'order'], ['team', Member, 'order']]) {
  r.get(`/admin/${path}`, auth, wrap(async (_q, s) => s.json(await M.find().sort(sort))));
  r.post(`/admin/${path}`, auth, wrap(async (q, s) => s.status(201).json(await M.create(q.body))));
  r.put(`/admin/${path}/:id`, auth, wrap(async (q, s) => s.json(await M.findByIdAndUpdate(q.params.id, q.body, { new: true }))));
  r.delete(`/admin/${path}/:id`, auth, wrap(async (q, s) => { await M.findByIdAndDelete(q.params.id); s.json({ ok: true }); }));
}

r.get('/admin/stats', auth, wrap(async (_q, s) => {
  const since = new Date(Date.now() - 29 * 864e5); since.setHours(0, 0, 0, 0);
  const [newLeads, pendingBookings, customers, unread, due, perDay] = await Promise.all([
    Lead.countDocuments({ status: 'new' }),
    Booking.countDocuments({ status: 'pending' }),
    User.countDocuments(),
    Message.countDocuments({ from: 'customer', readByTeam: false }),
    Invoice.aggregate([{ $match: { status: 'due' } }, { $group: { _id: null, n: { $sum: 1 }, total: { $sum: '$amount' } } }]),
    Lead.aggregate([{ $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  s.json({ newLeads, pendingBookings, customers, unreadMessages: unread, invoicesDue: due[0]?.n || 0, amountDue: due[0]?.total || 0,
    leadsPerDay: perDay.map((d) => ({ day: d._id, count: d.n })) });
}));

const cell = (v) => {
  let x = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(x)) x = `'${x}`;
  return `"${x.replace(/"/g, '""')}"`;
};
r.get('/admin/export/:type', auth, wrap(async (q, s) => {
  const cfg = {
    leads: [Lead, ['createdAt', 'name', 'email', 'phone', 'service', 'type', 'status', 'message']],
    bookings: [Booking, ['date', 'name', 'email', 'phone', 'status', 'note']],
  }[q.params.type];
  if (!cfg) return s.status(404).json({ message: 'Unknown export' });
  const rows = await cfg[0].find().sort('-createdAt').lean();
  const csv = [cfg[1].join(','), ...rows.map((row) => cfg[1].map((k) => cell(row[k])).join(','))].join('\n');
  s.type('text/csv').attachment(`${q.params.type}.csv`).send(csv);
}));

r.get('/admin/customers', auth, wrap(async (_q, s) =>
  s.json(await User.find().select('name email role createdAt').sort('-createdAt'))));

r.patch('/admin/customers/:id/role', auth, ownerOnly, wrap(async (q, s) => {
  if (!['customer', 'admin'].includes(q.body.role)) return s.status(422).json({ message: 'Role must be customer or admin' });
  const u = await User.findByIdAndUpdate(q.params.id, { role: q.body.role }, { new: true }).select('name email role');
  return u ? s.json(u) : s.status(404).json({ message: 'Customer not found' });
}));

r.get('/admin/projects', auth, wrap(async (_q, s) => s.json(await Project.find().sort('-updatedAt').populate('user', 'name email'))));
r.post('/admin/projects', auth, wrap(async (q, s) => {
  if (!mongoose.isValidObjectId(q.body.user) || !(await User.exists({ _id: q.body.user }))) return s.status(422).json({ message: 'Choose a customer' });
  if (!String(q.body.title || '').trim()) return s.status(422).json({ message: 'Give the project a title' });
  s.status(201).json(await Project.create(pick(q.body, ['user', 'title', 'service', 'stage', 'progress', 'dueDate'])));
}));
r.put('/admin/projects/:id', auth, wrap(async (q, s) =>
  s.json(await Project.findByIdAndUpdate(q.params.id, pick(q.body, ['title', 'service', 'stage', 'progress', 'status', 'dueDate']), { new: true, runValidators: true }))));
r.delete('/admin/projects/:id', auth, wrap(async (q, s) => { await Project.findByIdAndDelete(q.params.id); s.json({ ok: true }); }));
r.post('/admin/projects/:id/updates', auth, wrap(async (q, s) => {
  const text = String(q.body.text || '').trim().slice(0, 1000);
  if (!text) return s.status(422).json({ message: 'Write the update' });
  const p = await Project.findById(q.params.id);
  if (!p) return s.status(404).json({ message: 'Project not found' });
  if (STAGES.includes(q.body.stage)) p.stage = q.body.stage;
  if (q.body.progress != null) p.progress = Math.max(0, Math.min(100, Number(q.body.progress) || 0));
  p.updates.push({ text, stage: p.stage, progress: p.progress });
  await p.save();
  s.json(p);
}));

const invStatus = (i) => ({ ...i.toObject(), status: i.status === 'due' && i.dueDate && i.dueDate < new Date() ? 'overdue' : i.status });
r.get('/admin/invoices', auth, wrap(async (_q, s) =>
  s.json((await Invoice.find().sort('-createdAt').populate('user', 'name email')).map(invStatus))));
r.post('/admin/invoices', auth, wrap(async (q, s) => {
  const { user, project, items = [], dueDate, note } = q.body;
  if (!mongoose.isValidObjectId(user) || !(await User.exists({ _id: user }))) return s.status(422).json({ message: 'Choose a customer' });
  const clean = (Array.isArray(items) ? items : []).filter((i) => i.description && Number(i.amount) > 0)
    .map((i) => ({ description: String(i.description).slice(0, 200), amount: Number(i.amount) }));
  if (!clean.length) return s.status(422).json({ message: 'Add at least one item with an amount' });
  const last = await Invoice.findOne().sort('-seq').select('seq');
  const seq = (last?.seq || 0) + 1;
  const inv = await Invoice.create({ user, project: mongoose.isValidObjectId(project) ? project : undefined, items: clean,
    amount: clean.reduce((a, i) => a + i.amount, 0), dueDate, note: String(note || '').slice(0, 500), seq, number: `INV-${String(seq).padStart(4, '0')}` });
  s.status(201).json(inv);
}));
r.patch('/admin/invoices/:id/status', auth, wrap(async (q, s) => {
  if (!['due', 'paid'].includes(q.body.status)) return s.status(422).json({ message: 'Status must be due or paid' });
  const inv = await Invoice.findByIdAndUpdate(q.params.id, { status: q.body.status, paidAt: q.body.status === 'paid' ? new Date() : null }, { new: true });
  return inv ? s.json(inv) : s.status(404).json({ message: 'Invoice not found' });
}));
r.delete('/admin/invoices/:id', auth, wrap(async (q, s) => { await Invoice.findByIdAndDelete(q.params.id); s.json({ ok: true }); }));

r.get('/admin/messages', auth, wrap(async (_q, s) => {
  const rows = await Message.aggregate([{ $sort: { createdAt: -1 } },
    { $group: { _id: '$user', last: { $first: '$text' }, at: { $first: '$createdAt' },
      unread: { $sum: { $cond: [{ $and: [{ $eq: ['$from', 'customer'] }, { $eq: ['$readByTeam', false] }] }, 1, 0] } } } },
    { $sort: { at: -1 } }]);
  const users = await User.find({ _id: { $in: rows.map((x) => x._id) } }).select('name email');
  const byId = Object.fromEntries(users.map((u) => [String(u._id), u]));
  s.json(rows.map((x) => ({ user: byId[String(x._id)] || { _id: x._id, name: 'Deleted customer' }, last: x.last, at: x.at, unread: x.unread })));
}));
r.get('/admin/messages/:userId', auth, wrap(async (q, s) => {
  const list = await Message.find({ user: q.params.userId }).sort('createdAt');
  await Message.updateMany({ user: q.params.userId, from: 'customer', readByTeam: false }, { readByTeam: true });
  s.json(list);
}));
r.post('/admin/messages/:userId', auth,
  body('text').trim().notEmpty().withMessage('Write a reply').isLength({ max: 2000 }).escape(), check,
  wrap(async (q, s) => {
    if (!(await User.exists({ _id: q.params.userId }))) return s.status(404).json({ message: 'Customer not found' });
    s.status(201).json(await Message.create({ user: q.params.userId, from: 'team', text: q.body.text, readByTeam: true }));
  }));

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_q, f, cb) => cb(null, /^image\/(png|jpe?g|webp)$/.test(f.mimetype)) });
r.post('/admin/upload', auth, up.single('image'), (q, s, n) => {
  if (!q.file) return s.status(400).json({ message: 'Upload a PNG, JPG or WebP under 5 MB' });
  cloudinary.uploader.upload_stream({ folder: 'catvora' }, (e, out) => e ? n(e) : s.json({ url: out.secure_url })).end(q.file.buffer);
});

export default r;