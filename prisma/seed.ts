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
  await prisma.image.deleteMany({});

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

  // 6. Create sample Gallery images
  const galleryImages = [
    {
      url: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
      filename: 'pexels-car-1.jpg',
      alt: 'BMW Luxury Sedan - Professional Car Diagnostics',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/97075/pexels-photo-97075.jpeg',
      filename: 'pexels-key-1.jpg',
      alt: 'Mercedes Smart Key Programming and Car Coding',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg',
      filename: 'pexels-diag-1.jpg',
      alt: 'Professional OBD2 Diagnostic Scan for European Cars',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg',
      filename: 'pexels-dash-1.jpg',
      alt: 'Audi Virtual Cockpit Car Software Update',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/1000624/pexels-photo-1000624.jpeg',
      filename: 'pexels-key-2.jpg',
      alt: 'Range Rover Smart Key Recovery and Programming',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/4489749/pexels-photo-4489749.jpeg',
      filename: 'pexels-mech-1.jpg',
      alt: 'Technical ECU Intervention - Car Electronic Repair',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg',
      filename: 'pexels-car-2.jpg',
      alt: 'Porsche 911 Sport Key Programming Service',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/712613/pexels-photo-712613.jpeg',
      filename: 'pexels-key-3.jpg',
      alt: 'BMW Spare Key Creation and IMMO Sync',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg',
      filename: 'pexels-engine-1.jpg',
      alt: 'Full Engine Network Diagnostic and Analysis',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    // Adding 15 more images to test pagination (Total ~24)
    {
      url: 'https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg',
      filename: 'pexels-engine-2.jpg',
      alt: 'Detailed Car Engine Diagnostic Scan',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg',
      filename: 'pexels-car-3.jpg',
      alt: 'Luxury Sport Car Electronic Inspection',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/3807278/pexels-photo-3807278.jpeg',
      filename: 'pexels-diag-2.jpg',
      alt: 'Advanced OBD Diagnostic Interface',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/1000624/pexels-photo-1000624.jpeg',
      filename: 'pexels-key-4.jpg',
      alt: 'Modern Car Key Fob Programming',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
      filename: 'pexels-car-4.jpg',
      alt: 'Classic Car Electrical System Restore',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/3806247/pexels-photo-3806247.jpeg',
      filename: 'pexels-diag-3.jpg',
      alt: 'Precision Automotive Sensor Calibration',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/3806253/pexels-photo-3806253.jpeg',
      filename: 'pexels-diag-4.jpg',
      alt: 'Real-time Data Logging for ECU Tuning',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg',
      filename: 'pexels-car-5.jpg',
      alt: 'Modern SUV Brake System Diagnostics',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/712613/pexels-photo-712613.jpeg',
      filename: 'pexels-key-5.jpg',
      alt: 'Smart Key Proximity Sensor Test',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg',
      filename: 'pexels-car-6.jpg',
      alt: 'Luxury Car Module Programming Intervention',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/3806248/pexels-photo-3806248.jpeg',
      filename: 'pexels-diag-5.jpg',
      alt: 'Deep Binary ECU Scan and Fault Clearing',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/1000624/pexels-photo-1000624.jpeg',
      filename: 'pexels-key-6.jpg',
      alt: 'Emergency Car Key Cutting and Coding',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/4489744/pexels-photo-4489744.jpeg',
      filename: 'pexels-diag-6.jpg',
      alt: 'Automotive Network Architecture Analysis',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
      filename: 'pexels-car-7.jpg',
      alt: 'Premium Brand Software Updates',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    },
    {
      url: 'https://images.pexels.com/photos/97075/pexels-photo-97075.jpeg',
      filename: 'pexels-key-7.jpg',
      alt: 'Remote Key Fob Battery and Signal Restore',
      category: 'gallery',
      size: 102400,
      mimeType: 'image/jpeg'
    }
  ];

  for (const image of galleryImages) {
    await prisma.image.create({ 
      data: {
        ...image,
        uploadedBy: admin.id
      } 
    });
  }
  console.log('✅ Sample Gallery images created');

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
