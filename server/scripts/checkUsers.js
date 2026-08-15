import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[USERS] Connected to MongoDB');

  const users = await User.find({}).lean();
  console.log('[USERS] Total Users found:', users.length);
  for (const u of users) {
    console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
  }

  // Ensure default demo accounts exist with known passwords for convenience
  const defaultAccounts = [
    { name: 'DigiAdmin Veda', email: 'admin@digimartrix.com', role: 'admin', pass: 'Admin123!' },
    { name: 'Instructor Sarah', email: 'instructor@digimartrix.com', role: 'instructor', pass: 'Instructor123!' },
    { name: 'Veda Sarathi V', email: 'vedasaradhiv@gmail.com', role: 'student', pass: 'Student123!' },
  ];

  for (const acc of defaultAccounts) {
    const existing = await User.findOne({ email: acc.email });
    if (!existing) {
      const hash = await bcrypt.hash(acc.pass, 12);
      await User.create({
        name: acc.name,
        email: acc.email,
        passwordHash: hash,
        role: acc.role,
        creditsBalance: 500,
      });
      console.log(`[USERS] Created missing default account: ${acc.email} (${acc.role})`);
    } else {
      // Ensure role is accurate
      if (existing.role !== acc.role) {
        existing.role = acc.role;
        await existing.save();
        console.log(`[USERS] Updated role for ${acc.email} to ${acc.role}`);
      }
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

checkUsers().catch(err => {
  console.error('[USERS] Error:', err);
  process.exit(1);
});
