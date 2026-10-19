import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from './models.js';

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.log('Usage: node createAdmin.js email password');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const hash = await bcrypt.hash(password, 12);
await Admin.findOneAndUpdate({ email }, { email, password: hash }, { upsert: true });
console.log('Admin ready:', email);
await mongoose.disconnect();