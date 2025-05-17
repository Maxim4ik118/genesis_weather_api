import { PrismaClient } from '@prisma/client';
import { execute } from './utils/execute';
import { subscriptions } from './data/subscriptions';
import { weatherData } from './data/weather';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  try {
    // Clear existing data
    console.log('\nClearing existing data...');
    await prisma.weatherData.deleteMany();
    await prisma.subscription.deleteMany();
    console.log('Data cleared successfully');

    // Seed subscriptions
    await execute(prisma, subscriptions, 'subscription', 'token');

    // Seed weather data
    await execute(prisma, weatherData, 'weatherData');

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma Client at the end
    await prisma.$disconnect();
  });
