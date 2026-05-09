import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../server/src/config/database.js';

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@keypro.service' },
    update: {},
    create: {
      email: 'admin@keypro.service',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'KeyPro',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create demo user
  const userPassword = await bcrypt.hash('User123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+33 6 12 34 56 78',
      role: UserRole.USER,
      emailVerified: true,
    },
  });
  console.log('✅ Demo user created:', user.email);

  // 3. Clear existing content to avoid duplicates on re-run
  await prisma.service.deleteMany({});
  await prisma.fAQ.deleteMany({});

  // 4. Create sample services
  const services = [
    {
      nameFr: 'Double de clé',
      nameEn: 'Spare Key Creation',
      descriptionFr: 'Création d\'un double de clé fonctionnel avec programmation.',
      descriptionEn: 'Creation of a fully functional spare key with programming.',
      category: 'keys',
      priceFrom: 150,
      order: 1,
    },
    {
      nameFr: 'Perte totale de clés',
      nameEn: 'All Keys Lost',
      descriptionFr: 'Intervention mobile en cas de perte totale de vos clés.',
      descriptionEn: 'Mobile intervention if you have lost all your keys.',
      category: 'keys',
      priceFrom: 350,
      order: 2,
    },
    {
      nameFr: 'Scan complet OBD',
      nameEn: 'Full OBD Scan',
      descriptionFr: 'Diagnostic électronique complet via la prise OBD2.',
      descriptionEn: 'Complete electronic diagnostics via OBD2 port.',
      category: 'diagnostics',
      priceFrom: 80,
      order: 3,
    },
    {
      nameFr: 'Codage de modules',
      nameEn: 'Module Coding',
      descriptionFr: 'Configuration et adaptation de nouveaux modules électroniques.',
      descriptionEn: 'Configuration and adaptation of new electronic modules.',
      category: 'programming',
      priceFrom: 200,
      order: 4,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log('✅ Sample services created');

  // 5. Create sample FAQs
  const faqs = [
    {
      questionFr: 'Combien de temps prend la programmation d\'une clé ?',
      questionEn: 'How long does key programming take?',
      answerFr: 'La programmation d\'une clé prend généralement entre 30 et 60 minutes.',
      answerEn: 'Key programming typically takes between 30 and 60 minutes.',
      category: 'general',
      order: 1,
    },
    {
      questionFr: 'Intervenez-vous 24/7 ?',
      questionEn: 'Do you operate 24/7?',
      answerFr: 'Oui, notre service d\'intervention mobile est disponible 24h/24 et 7j/7.',
      answerEn: 'Yes, our mobile intervention service is available 24/7.',
      category: 'services',
      order: 2,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log('✅ Sample FAQs created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
