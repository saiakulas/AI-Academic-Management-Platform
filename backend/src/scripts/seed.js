/**
 * EduFlow — Database Seed Script
 *
 * Creates one demo account per role.
 * Admin = institution principal (full access, cannot self-register).
 * Parent = guardian account (cannot self-register, admin-created only).
 * Teacher / Student = can self-register via /auth/register.
 *
 * Run: node src/scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const DEMO_USERS = [
  {
    firstName: 'Dr. Sarah',
    lastName: 'Mitchell',
    email: 'admin@eduflow.com',
    password: 'Demo@1234',
    role: 'admin',
    isEmailVerified: true,
    phone: '+1 (555) 100-0001',
  },
  {
    firstName: 'James',
    lastName: 'Carter',
    email: 'teacher@eduflow.com',
    password: 'Demo@1234',
    role: 'teacher',
    isEmailVerified: true,
    phone: '+1 (555) 100-0002',
  },
  {
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'student@eduflow.com',
    password: 'Demo@1234',
    role: 'student',
    isEmailVerified: true,
    phone: '+1 (555) 100-0003',
  },
  {
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'parent@eduflow.com',
    password: 'Demo@1234',
    role: 'parent',           // Created by admin — cannot self-register
    isEmailVerified: true,
    phone: '+1 (555) 100-0004',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    for (const userData of DEMO_USERS) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`⏭  Skipping  [${userData.role.padEnd(7)}] ${userData.email} (already exists)`);
        continue;
      }
      await User.create(userData);
      console.log(`✅ Created   [${userData.role.padEnd(7)}] ${userData.email}`);
    }

    console.log('\n─────────────────────────────────────────────────────');
    console.log('🎉  Seed complete!  All accounts use password: Demo@1234');
    console.log('─────────────────────────────────────────────────────');
    console.log('  admin@eduflow.com    → Principal (full institutional access)');
    console.log('  teacher@eduflow.com  → Faculty member');
    console.log('  student@eduflow.com  → Enrolled student');
    console.log('  parent@eduflow.com   → Parent / guardian (admin-created)');
    console.log('─────────────────────────────────────────────────────\n');
    console.log('⚠️  Note: admin & parent accounts cannot self-register.');
    console.log('   They must be created by a seeded admin or via this script.\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
