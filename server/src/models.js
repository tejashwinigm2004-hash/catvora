import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const t = { timestamps: true };
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });

export const Admin = model('Admin', new Schema({ email: { type: String, unique: true }, password: String }, t));
// Customer accounts (separate from Admin so the admin login is untouched)
export const User = model('User', new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
}, t));
export const Lead = model('Lead', new Schema({
  user: ref('User'),
  name: String, email: String, phone: String, service: String, message: String,
  type: { type: String, enum: ['contact', 'quote'], default: 'contact' },
  status: { type: String, enum: ['new', 'contacted', 'quoted', 'won', 'lost'], default: 'new' },
}, t));
export const Booking = model('Booking', new Schema({
  user: ref('User'),
  name: String, email: String, phone: String, date: Date, note: String,
  status: { type: String, enum: ['pending', 'confirmed', 'done', 'cancelled'], default: 'pending' },
}, t));
export const Ad = model('Ad', new Schema({
  title: String, subtitle: String, ctaText: String, ctaLink: String, image: String,
  active: { type: Boolean, default: true }, order: { type: Number, default: 0 },
}, t));
export const Service = model('Service', new Schema({
  slug: String, title: String, icon: String, summary: String, benefits: [String],
  active: { type: Boolean, default: true }, order: { type: Number, default: 0 },
}, t));
export const Member = model('Member', new Schema({
  name: String, role: String, bio: String, photo: String, order: { type: Number, default: 0 },
}, t));

// ---- customer dashboard ----
export const STAGES = ['Discuss', 'Plan', 'Build', 'Support'];
export const Project = model('Project', new Schema({
  user: { ...ref('User'), required: true, index: true },
  title: { type: String, required: true },
  service: String,
  stage: { type: String, enum: STAGES, default: 'Discuss' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  status: { type: String, enum: ['active', 'paused', 'done'], default: 'active' },
  dueDate: Date,
  updates: [{ text: String, stage: String, progress: Number, date: { type: Date, default: Date.now } }],
}, t));
export const Message = model('Message', new Schema({
  user: { ...ref('User'), required: true, index: true },   // the customer this conversation belongs to
  from: { type: String, enum: ['customer', 'team'], required: true },
  text: { type: String, required: true },
  readByCustomer: { type: Boolean, default: false },
  readByTeam: { type: Boolean, default: false },
}, t));
export const Invoice = model('Invoice', new Schema({
  user: { ...ref('User'), required: true, index: true },
  project: ref('Project'),
  seq: { type: Number, unique: true },
  number: String,
  items: [{ description: String, amount: Number }],
  amount: Number,
  status: { type: String, enum: ['due', 'paid'], default: 'due' },
  dueDate: Date,
  paidAt: Date,
  note: String,
}, t));