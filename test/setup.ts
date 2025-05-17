import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Set test environment
process.env.NODE_ENV = 'test';

// Set up test database URL
const TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/weather_test';

// Set required environment variables for tests
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.WEATHER_API_KEY = 'test_api_key';
process.env.SMTP_HOST = 'smtp.example.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test_password';

// Initialize Prisma client
const prisma = new PrismaClient();

// Function to reset database
async function resetDatabase() {
  try {
    // Drop and recreate the schema
    await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE;');
    await prisma.$executeRawUnsafe('CREATE SCHEMA public;');

    // Run migrations
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    });

    console.log('Test database reset successful');
  } catch (error) {
    console.error('Error resetting test database:', error);
    throw error;
  }
}

// Global setup function for Jest
export default async function globalSetup() {
  await resetDatabase();
}

// Test environment setup
if (typeof beforeAll === 'function') {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
} 