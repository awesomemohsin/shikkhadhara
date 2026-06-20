const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '.env.local');
let mongodbUri = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGODB_URI=(.+)$/m);
  if (match) {
    mongodbUri = match[1].trim();
  }
}

if (!mongodbUri) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

console.log("Connecting to:", mongodbUri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(mongodbUri)
  .then(async () => {
    console.log("Connected successfully to MongoDB Atlas!");
    
    // Check collections and document counts
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\nFound collections:");
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
