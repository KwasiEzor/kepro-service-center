import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../server/src/config/database.js';

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
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

  // Create demo user
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

  // Create sample services
  const services = [
    {
      nameFr: 'Programmation de clés',
      nameEn: 'Key Programming',
      descriptionFr: 'Programmation complète de clés pour tous types de véhicules',
      descriptionEn: 'Complete key programming for all vehicle types',
      icon: 'key',
      priceFrom: 150,
      priceTo: 500,
      duration: '30-60 min',
      order: 1,
    },
    {
      nameFr: 'Diagnostic ECU',
      nameEn: 'ECU Diagnostics',
      descriptionFr: 'Diagnostic complet du calculateur électronique',
      descriptionEn: 'Complete electronic control unit diagnostics',
      icon: 'cpu',
      priceFrom: 100,
      priceTo: 300,
      duration: '45-90 min',
      order: 2,
    },
    {
      nameFr: 'Reprogrammation immobilisateur',
      nameEn: 'Immobilizer Reprogramming',
      descriptionFr: 'Réinitialisation et programmation immobilisateur',
      descriptionEn: 'Immobilizer reset and reprogramming',
      icon: 'shield',
      priceFrom: 200,
      priceTo: 600,
      duration: '60-120 min',
      order: 3,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.nameFr }, // Use name as unique identifier for upsert
      update: {},
      create: service,
    });
  }
  console.log('✅ Sample services created');

  // Create sample FAQs
  const faqs = [
    {
      questionFr: 'Combien de temps prend la programmation d\'une clé ?',
      questionEn: 'How long does key programming take?',
      answerFr: 'La programmation d\'une clé prend généralement entre 30 et 60 minutes selon le modèle de véhicule.',
      answerEn: 'Key programming typically takes between 30 and 60 minutes depending on the vehicle model.',
      category: 'general',
      order: 1,
    },
    {
      questionFr: 'Intervenez-vous 24/7 ?',
      questionEn: 'Do you operate 24/7?',
      answerFr: 'Oui, notre service d\'intervention mobile est disponible 24h/24 et 7j/7 pour les urgences.',
      answerEn: 'Yes, our mobile intervention service is available 24/7 for emergencies.',
      category: 'services',
      order: 2,
    },
    {
      questionFr: 'Quelles marques supportez-vous ?',
      questionEn: 'Which brands do you support?',
      answerFr: 'Nous supportons toutes les marques premium : BMW, Mercedes, Audi, Porsche, et bien d\'autres.',
      answerEn: 'We support all premium brands: BMW, Mercedes, Audi, Porsche, and many more.',
      category: 'brands',
      order: 3,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }
  console.log('✅ Sample FAQs created');

  console.log('🎉 Seeding completed!');
  console.log('\n📧 Admin credentials:');
  console.log('   Email: admin@keypro.service');
  console.log('   Password: Admin123!');
  console.log('\n📧 Demo user credentials:');
  console.log('   Email: user@example.com');
  console.log('   Password: User123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
