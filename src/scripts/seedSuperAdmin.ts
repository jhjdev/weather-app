import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from appropriate .env file
const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;

console.log(`Loading environment from: ${envFile}`);
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Simple hash function (same as in authService)
const hashPassword = (password: string): string => {
  // Note: This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  return Buffer.from(password).toString('base64');
};

// Environment variables for database connection
const MONGODB_URI = process.env.MONGODB_URI || 'your-hosted-mongodb-connection-string';
const DB_NAME = process.env.MONGODB_DB_NAME || 'hostaway';

const seedSuperAdmin = async () => {
  console.log('Starting superadmin seeding...');
  console.log('Database:', DB_NAME);

  if (MONGODB_URI.includes('your-hosted-mongodb-connection-string')) {
    console.error('❌ Please set your MONGODB_URI environment variable with your hosted MongoDB connection string');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Seed superadmin user
    const superAdminUser = await usersCollection.findOne({ email: 'jhj@jhjdev.com' });
    if (!superAdminUser) {
      console.log('Creating new superadmin user...');
      const superAdminData = {
        name: 'Jon Hefill Jakobsson',
        email: 'jhj@jhjdev.com',
        passwordHash: hashPassword('password123'),
        isVerified: true,
        isAdmin: true,
        isSuperAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          temperatureUnit: 'celsius',
          theme: 'auto',
          notifications: {
            weatherAlerts: true,
            dailyForecast: true,
          },
          locations: [],
        },
      };

      await usersCollection.insertOne(superAdminData);
      console.log('✅ Superadmin user created successfully');
      console.log('📧 Email: jhj@jhjdev.com');
      console.log('🔑 Password: password123');
    } else {
      console.log('Superadmin user already exists');

      // Update to superadmin if not already
      if (!superAdminUser.isSuperAdmin) {
        console.log('Updating existing user to superadmin...');
        await usersCollection.updateOne(
          { email: 'jhj@jhjdev.com' },
          {
            $set: {
              isSuperAdmin: true,
              isAdmin: true,
              updatedAt: new Date(),
            },
          }
        );
        console.log('✅ Updated existing user to superadmin');
      } else {
        console.log('✅ User already has superadmin privileges');
      }
    }
  } catch (error) {
    console.error('❌ Error during superadmin seeding:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('📋 Seeding completed');
  }
};

seedSuperAdmin().catch(console.error);
