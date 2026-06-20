import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Parse .env.local manually to ensure variables are loaded
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in environment or .env.local");
  process.exit(1);
}

import { Tenant, User } from './lib/models';
import { seedOrganizationData } from './lib/seed';

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected successfully!");

  // Check if a tenant already exists, or create a new default one
  let tenant = await Tenant.findOne({ subdomain: 'shikkhadhara' });
  if (!tenant) {
    console.log("Creating default tenant 'ShikkhaDhara Academy'...");
    tenant = new Tenant({
      name: 'ShikkhaDhara Academy',
      subdomain: 'shikkhadhara',
      type: 'school',
      email: 'admin@shikkhadhara.edu',
      phone: '+88029999999',
      address: 'House 12, Road 5, Dhanmondi',
      city: 'Dhaka',
      country: 'Bangladesh',
      logo: '/logo.png', // Default dashboard logo path
      featureFlags: {
        hifz: false,
        finance: true,
        attendance: true,
        academics: true,
        hrPayroll: true
      },
      settings: {
        theme: 'light',
        primaryColor: '#3b82f6',
        timezone: 'Asia/Dhaka',
        currency: 'BDT',
        language: 'en',
      },
    });
    await tenant.save();
    console.log("Tenant created with ID:", tenant._id);
  } else {
    console.log("Tenant already exists with ID:", tenant._id);
  }

  // Check if an admin user already exists, or create a new one
  let admin = await User.findOne({ email: 'admin@shikkhadhara.edu' });
  if (!admin) {
    console.log("Creating default admin user...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    admin = new User({
      tenantId: tenant._id,
      email: 'admin@shikkhadhara.edu',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+8801700000000',
      role: 'admin',
      status: 'active',
    });
    await admin.save();
    console.log("Admin user created! Credentials:\nEmail: admin@shikkhadhara.edu\nPassword: admin123");
  } else {
    console.log("Admin user already exists.");
  }

  // Check if owner user already exists, or create a new one
  let owner = await User.findOne({ email: 'mohsindude5@gmail.com' });
  if (!owner) {
    console.log("Creating owner user 'mohsindude5@gmail.com'...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    owner = new User({
      tenantId: tenant._id,
      email: 'mohsindude5@gmail.com',
      password: hashedPassword,
      firstName: 'Mohsin',
      lastName: 'Owner',
      phone: '+8801700000001',
      role: 'owner',
      status: 'active',
    });
    await owner.save();
    console.log("Owner user created! Credentials:\nEmail: mohsindude5@gmail.com\nPassword: admin123");
  } else {
    console.log("Owner user already exists.");
  }

  // Seed demo data for this tenant
  console.log("Seeding premium school management data...");
  await seedOrganizationData(tenant._id);
  console.log("Premium school management demo data seeded successfully!");

  await mongoose.connection.close();
  console.log("Seeding completed successfully. Database connection closed.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
