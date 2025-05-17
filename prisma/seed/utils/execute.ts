import { PrismaClient } from '@prisma/client';

export type Entity = {
  [key: string]: any;
};

export async function execute<T extends Entity>(
  prisma: PrismaClient,
  data: T[],
  model: string,
  uniqueField?: keyof T
) {
  console.log(`\nSeeding ${model}...`);
  
  for (const item of data) {
    if (uniqueField) {
      // If uniqueField is provided, use upsert
      const result = await prisma[model].upsert({
        where: { [uniqueField]: item[uniqueField] },
        update: item,
        create: item,
      });
      console.log(`Upserted ${model}: ${result[uniqueField]}`);
    } else {
      // If no uniqueField, use create
      const result = await prisma[model].create({
        data: item,
      });
      console.log(`Created ${model}: ${JSON.stringify(result)}`);
    }
  }
  
  console.log(`Finished seeding ${model}`);
} 