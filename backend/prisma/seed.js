const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  'Pickles',
  'Sweets',
  'Snacks',
  'Spice Powders',
  'Rice Mixes',
  'Instant Mixes',
  'Chutneys',
  'Dairy & Fats',
  'Health Foods',
  'Spice Blends',
  'Combos & Gift Packs'
];

async function main() {
  console.log('Seeding categories...');
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Categories seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
