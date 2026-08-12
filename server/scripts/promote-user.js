import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[DB] Connected to MongoDB Atlas.');

  const args = process.argv.slice(2);
  const getArg = (name) => {
    const prefix = `--${name}=`;
    const arg = args.find((a) => a.startsWith(prefix));
    return arg ? arg.slice(prefix.length) : null;
  };

  const email = getArg('email');
  const role = getArg('role');
  const shouldList = args.includes('--list');
  const createDefaults = args.includes('--create-defaults');

  if (createDefaults) {
    console.log('\n--- CREATING DEFAULT ACCOUNTS ---');
    // Default Admin
    const adminEmail = 'admin@digimartrix.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash('Admin123!', 12);
      admin = await User.create({
        name: 'Digi Administrator',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        creditsBalance: 1000,
      });
      console.log(`Created Admin: ${adminEmail} (password: Admin123!)`);
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log(`Updated Admin role for: ${adminEmail}`);
    }

    // Default Instructor
    const instructorEmail = 'instructor@digimartrix.com';
    let instructor = await User.findOne({ email: instructorEmail });
    if (!instructor) {
      const passwordHash = await bcrypt.hash('Instructor123!', 12);
      instructor = await User.create({
        name: 'Professor Alex Rivera',
        email: instructorEmail,
        passwordHash,
        role: 'instructor',
        creditsBalance: 500,
      });
      console.log(`Created Instructor: ${instructorEmail} (password: Instructor123!)`);
    } else {
      instructor.role = 'instructor';
      await instructor.save();
      console.log(`Updated Instructor role for: ${instructorEmail}`);
    }
  }

  if (email && role) {
    if (!['student', 'mentor', 'instructor', 'admin'].includes(role)) {
      console.error(`Invalid role: ${role}. Valid roles: student, mentor, instructor, admin`);
      process.exit(1);
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error(`User with email "${email}" not found!`);
      process.exit(1);
    }
    const oldRole = user.role;
    user.role = role;
    await user.save();
    console.log(`Success! Updated ${user.name} (${user.email}) from "${oldRole}" to "${role}".`);
  }

  if (shouldList || (!email && !createDefaults)) {
    console.log('\n--- CURRENT REGISTERED USERS ---');
    const users = await User.find({}).sort('-createdAt');
    users.forEach((u) => {
      console.log(`- ${u.name.padEnd(20)} | ${u.email.padEnd(30)} | Role: [${u.role.toUpperCase()}]`);
    });
    console.log('--------------------------------\n');
  }

  await mongoose.disconnect();
  console.log('[DB] Disconnected.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
