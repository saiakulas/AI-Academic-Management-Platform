/**
 * Seed script — creates demo accounts for each role.
 * Run: node src/scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const DEMO_USERS = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@eduflow.com',
    password: 'Demo@1234',
    role: 'admin',
    isEmailVerified: true,
  },
  {
    firstName: 'Sarah',
    lastName: 'Green',
    email: 'teacher@eduflow.com',
    password: 'Demo@1234',
    role: 'teacher',
    isEmailVerified: true,
  },
  {
    firstName: 'James',
    lastName: 'Wilson',
    email: 'student@eduflow.com',
    password: 'Demo@1234',
    role: 'student',
    isEmailVerified: true,
  },
  {
    firstName: 'Mary',
    lastName: 'Wilson',
    email: 'parent@eduflow.com',
    password: 'Demo@1234',
    role: 'parent',
    isEmailVerified: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    for (const userData of DEMO_USERS) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`⏭  Skipping ${userData.email} (already exists)`);
        continue;
      }
      await User.create(userData);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Seed complete! Demo credentials:');
    console.log('   Email: admin@eduflow.com    | Password: Demo@1234');
    console.log('   Email: teacher@eduflow.com  | Password: Demo@1234');
    console.log('   Email: student@eduflow.com  | Password: Demo@1234');
    console.log('   Email: parent@eduflow.com   | Password: Demo@1234');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
