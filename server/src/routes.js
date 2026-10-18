import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Admin, User, Lead, Booking, Ad, Service, Member } from './models.js';
import { notify } from './mail.js';
console.log('routes.js: user routes loaded');
const r = Router();
const strict = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });
// separate limiter for customer sign in / register, so it does not use up the quota of forms
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });
const check = (req, res, next) => {
  const e = validationResult(req);
  return e.isEmpty() ? next() : res.status(422).json({ message: e.array()[0].msg });
};
const wrap = (fn) => (q, s, n) => fn(q, s, n).catch(n);

// ---------- auth ----------
const prod = process.env.NODE_ENV === 'production';
const cookieOpts = { httpOnly: true, secure: prod, sameSite: prod ? 'none' : 'lax' };

// Admin only: the token must carry role "admin", so a customer token can never open /admin routes
const auth = (req, res, next) => {
  try {
    const p = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    if (p.role !== 'admin') throw new Error('not admin');
    req.admin = p;
    next();
  } catch { res.status(401).json({ message: 'Please sign in' }); }
};
r.post('/auth/login', strict, wrap(async (q, s) => {
  const a = await Admin.findOne({ email: q.body.email });
  if (!a || !(await bcrypt.compare(q.body.password || '', a.password)))
    return s.status(401).json({ message: 'Wrong email or password' });
  const token = jwt.sign({ id: a._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  s.cookie('token', token, { ...cookieOpts, maxAge: 8 * 3600e3 });
  s.json({ ok: true });
}));
r.post('/auth/logout', (_q, s) => { s.clearCookie('token', cookieOpts); s.json({ ok: true }); });
r.get('/auth/me', auth, (_q, s) => s.json({ ok: true }));

// ---------- customer accounts ----------
const userFrom = (req) => {
  try {
    const p = jwt.verify(req.cookies.ctoken, process.env.JWT_SECRET);
    return p.role === 'customer' ? p : null;
  } catch { return null; }
};
const startSession = (s, u) => {
  const token = jwt.sign({ id: u._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  s.cookie('ctoken', token, { ...cookieOpts, maxAge: 7 * 24 * 3600e3 });
};

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
    s.status(201).json({ user: { name: u.name, email: u.email } });
  }));

r.post('/user/login', authLimit,
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password'),
  check, wrap(async (q, s) => {
    const u = await User.findOne({ email: q.body.email });
    if (!u || !(await bcrypt.compare(q.body.password, u.password)))
      return s.status(401).json({ message: 'Wrong email or password' });
    startSession(s, u);
    s.json({ user: { name: u.name, email: u.email } });
  }));

r.post('/user/logout', (_q, s) => { s.clearCookie('ctoken', cookieOpts); s.json({ ok: true }); });

r.get('/user/me', wrap(async (q, s) => {
  const p = userFrom(q);
  const u = p ? await User.findById(p.id).select('name email') : null;
  s.json({ user: u ? { name: u.name, email: u.email } : null });
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
    await Lead.create({ name, email, phone, service, message, type });
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
    await Booking.create({ name, email, phone, date, note });
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

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_q, f, cb) => cb(null, /^image\/(png|jpe?g|webp)$/.test(f.mimetype)) });
r.post('/admin/upload', auth, up.single('image'), (q, s, n) => {
  if (!q.file) return s.status(400).json({ message: 'Upload a PNG, JPG or WebP under 5 MB' });
  cloudinary.uploader.upload_stream({ folder: 'catvora' }, (e, out) => e ? n(e) : s.json({ url: out.secure_url })).end(q.file.buffer);
});

export default r;