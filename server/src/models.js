import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const t = { timestamps: true };

export const Admin = model('Admin', new Schema({ email: { type: String, unique: true }, password: String }, t));
// Customer accounts (separate from Admin so the admin login is untouched)
export const User = model('User', new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
}, t));
export const Lead = model('Lead', new Schema({
  name: String, email: String, phone: String, service: String, message: String,
  type: { type: String, enum: ['contact', 'quote'], default: 'contact' },
  status: { type: String, enum: ['new', 'contacted', 'won', 'lost'], default: 'new' },
}, t));
export const Booking = model('Booking', new Schema({
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