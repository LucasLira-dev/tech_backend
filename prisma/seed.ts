import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  featured: boolean;
}

interface SeedData {
  categories: SeedCategory[];
  products: SeedProduct[];
}

async function main() {
  const dataPath = path.join(__dirname, 'products.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data: SeedData = JSON.parse(rawData);

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.SEED_RESET_CONFIRM !== 'true'
  ) {
    throw new Error(
      'Refusing to reseed production without SEED_RESET_CONFIRM=true',
    );
  }

  console.log('Cleaning existing seed data...');
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log(`Creating ${data.categories.length} categories...`);
  const categoryMap = new Map<string, string>();

  for (const cat of data.categories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
      },
    });
    categoryMap.set(cat.slug, created.id);
    console.log(`  ✓ ${cat.name}`);
  }

  console.log(`Creating ${data.products.length} products...`);
  let count = 0;

  for (const product of data.products) {
    const categoryId = categoryMap.get(product.category);
    if (!categoryId) {
      throw new Error(
        `Seed data error: category '${product.category}' not found for product '${product.name}'`,
      );
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        categoryId,
        featured: product.featured,
      },
    });
    count++;
  }

  console.log(`\nSeed complete!`);
  console.log(`  Categories: ${categoryMap.size}`);
  console.log(`  Products: ${count}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
