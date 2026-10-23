import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding...');

  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@wedora.id' },
    update: {},
    create: {
      email: 'admin@wedora.id',
      name: 'Admin Wedora',
      password: adminPass,
      phone: '081234567890',
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@wedora.id' },
    update: {},
    create: {
      email: 'user@wedora.id',
      name: 'Andi Pratama',
      password: userPass,
      phone: '089876543210',
      role: 'USER',
    },
  });

  console.log('✅ Users created');

  const packages = [
    {
      name: 'Paket Silver',
      slug: 'paket-silver',
      description: 'Paket pernikahan hemat untuk 200 tamu dengan fasilitas lengkap dan elegan.',
      basePrice: 50000000,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      category: 'SILVER',
      facilities: JSON.stringify([
        'Venue 200 pax',
        'Katering 200 porsi',
        'Dekorasi standard',
        'Fotografi 1 hari',
        'MUA pengantin',
        'Undangan 200 pcs',
      ]),
    },
    {
      name: 'Paket Gold',
      slug: 'paket-gold',
      description: 'Paket favorit untuk 500 tamu dengan dekorasi premium dan live music.',
      basePrice: 100000000,
      imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
      category: 'GOLD',
      facilities: JSON.stringify([
        'Venue 500 pax',
        'Katering 500 porsi',
        'Dekorasi premium',
        'Fotografi & videografi',
        'MUA pengantin + keluarga',
        'Live music',
        'Undangan 500 pcs',
        'Wedding organizer',
      ]),
    },
    {
      name: 'Paket Platinum',
      slug: 'paket-platinum',
      description: 'Paket mewah untuk 1000 tamu dengan semua fasilitas eksklusif dan honeymoon.',
      basePrice: 250000000,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      category: 'PLATINUM',
      facilities: JSON.stringify([
        'Venue 1000 pax',
        'Katering 1000 porsi',
        'Dekorasi luxury',
        'Fotografi + drone',
        'MUA artis',
        'Live band',
        'Undangan premium',
        'Wedding planner',
        'Honeymoon 3 hari',
      ]),
    },
  ];

  for (const p of packages) {
    await prisma.package.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log('✅ Packages created');

  const vendors = [
    {
      name: 'Dekorasi Bunga Indah',
      category: 'DECORATION' as const,
      description: 'Dekorasi bunga segar impor dengan tema apapun.',
      price: 15000000,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    },
    {
      name: 'Foto Studio Cinta',
      category: 'PHOTOGRAPHY' as const,
      description: 'Fotografer profesional dengan drone dan editing premium.',
      price: 8000000,
      imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
    },
    {
      name: 'Catering Rasa Nusantara',
      category: 'CATERING' as const,
      description: 'Katering 1000 porsi dengan menu Indonesia & Western.',
      price: 25000000,
      imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    },
    {
      name: 'Live Band Harmoni',
      category: 'MUSIC' as const,
      description: 'Live band 8 orang, performance 4 jam.',
      price: 12000000,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    },
    {
      name: 'MUA Cantika Professional',
      category: 'MUA' as const,
      description: 'Makeup artist profesional untuk wedding, wisuda, kondangan, & lamaran.',
      price: 5000000,
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    },
  ];

  for (const v of vendors) {
    const exists = await prisma.vendor.findFirst({ where: { name: v.name } });
    if (!exists) {
      await prisma.vendor.create({ data: v });
    } else {
      await prisma.vendor.update({
        where: { id: exists.id },
        data: { imageUrl: v.imageUrl, description: v.description },
      });
    }
  }

  console.log('✅ Vendors created');

  // ═══ VENDOR SERVICES — VARIAN DIPERBAIKI ═══
  console.log('🌱 Menambah layanan vendor...');

  const allVendors = await prisma.vendor.findMany();

  for (const vendor of allVendors) {
    await prisma.vendorService.deleteMany({ where: { vendorId: vendor.id } });

    let services: any[] = [];

    if (vendor.category === 'MUA') {
      services = [
        // 💍 WEDDING — Pasangan (2 orang)
        { 
          name: 'Paket Pengantin', 
          category: 'WEDDING', 
          description: 'Makeup + hairdo untuk 2 pengantin', 
          price: 5000000, 
          priceUnit: 'PER_PACKAGE', 
          minQty: 1 
        },
        { 
          name: 'Paket Pengantin + 2 Keluarga', 
          category: 'WEDDING', 
          description: 'Pengantin + 2 orang keluarga (total 4 orang)', 
          price: 7500000, 
          priceUnit: 'PER_PACKAGE', 
          minQty: 1 
        },
        { 
          name: 'Paket Full Wedding', 
          category: 'WEDDING', 
          description: 'Pengantin + 4 keluarga + touch up (total 6 orang)', 
          price: 12000000, 
          priceUnit: 'PER_PACKAGE', 
          minQty: 1 
        },

        // 🎓 WISUDA — 1 orang
        { 
          name: 'Paket Wisuda Standar', 
          category: 'WISUDA', 
          description: 'Makeup + hairdo wisuda (1 orang)', 
          price: 500000, 
          priceUnit: 'PER_PERSON', 
          minQty: 1, 
          maxQty: 10 
        },
        { 
          name: 'Paket Wisuda Premium', 
          category: 'WISUDA', 
          description: 'Makeup + hairdo premium + touch up (1 orang)', 
          price: 750000, 
          priceUnit: 'PER_PERSON', 
          minQty: 1, 
          maxQty: 10 
        },
        { 
          name: 'Paket Wisuda + Foto', 
          category: 'WISUDA', 
          description: 'Makeup + hairdo + sesi foto (1 orang)', 
          price: 2000000, 
          priceUnit: 'PER_PERSON', 
          minQty: 1, 
          maxQty: 5 
        },

        // 💐 KONDANGAN — 1 orang
        { 
          name: 'Paket Kondangan', 
          category: 'KONDANGAN', 
          description: 'Makeup + hairdo kondangan (1 orang)', 
          price: 350000, 
          priceUnit: 'PER_PERSON', 
          minQty: 1, 
          maxQty: 10 
        },
        { 
          name: 'Paket Kondangan + Hairdo', 
          category: 'KONDANGAN', 
          description: 'Makeup + hairdo premium (1 orang)', 
          price: 500000, 
          priceUnit: 'PER_PERSON', 
          minQty: 1, 
          maxQty: 10 
        },
        { 
          name: 'Paket Kondangan Premium', 
          category: 'KONDANGAN', 
          description: 'Makeup + hairdo + touch up (1 orang)', 
          price: 750000, 
          priceUnit: 'PER_PERSON', 
          minQty: 1, 
          maxQty: 10 
        },

        // 💒 LAMARAN — Pasangan (2 orang)
        { 
          name: 'Paket Lamaran Standar', 
          category: 'LAMARAN', 
          description: 'Makeup + hairdo untuk 2 orang', 
          price: 1000000, 
          priceUnit: 'PER_PACKAGE', 
          minQty: 1 
        },
        { 
          name: 'Paket Lamaran Premium', 
          category: 'LAMARAN', 
          description: 'Makeup + hairdo + touch up (2 orang)', 
          price: 1500000, 
          priceUnit: 'PER_PACKAGE', 
          minQty: 1 
        },
        { 
          name: 'Paket Lamaran + 2 Keluarga', 
          category: 'LAMARAN', 
          description: 'Mempelai + 2 keluarga (total 4 orang)', 
          price: 2500000, 
          priceUnit: 'PER_PACKAGE', 
          minQty: 1 
        },
      ];
    } else if (vendor.category === 'PHOTOGRAPHY') {
      services = [
        { name: 'Wedding Photography', category: 'WEDDING', description: 'Full day wedding photo', price: 8000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
        { name: 'Prewedding Photo', category: 'WEDDING', description: 'Sesi prewedding 3 jam', price: 5000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
        { name: 'Wisuda Photo', category: 'WISUDA', description: 'Foto wisuda 1 jam (1 orang)', price: 1000000, priceUnit: 'PER_PERSON', minQty: 1, maxQty: 5 },
        { name: 'Keluarga Photo', category: 'KELUARGA', description: 'Foto keluarga 2 jam', price: 2500000, priceUnit: 'PER_PACKAGE', minQty: 1 },
      ];
    } else if (vendor.category === 'DECORATION') {
      services = [
        { name: 'Wedding Decor Premium', category: 'WEDDING', description: 'Dekorasi wedding full', price: 15000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
        { name: 'Wedding Decor Standard', category: 'WEDDING', description: 'Dekorasi wedding sederhana', price: 8000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
        { name: 'Lamaran Decor', category: 'LAMARAN', description: 'Dekorasi lamaran', price: 5000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
        { name: 'Wisuda Decor', category: 'WISUDA', description: 'Dekorasi wisuda', price: 3000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
      ];
    } else if (vendor.category === 'CATERING') {
      services = [
        { name: 'Wedding Catering 500 pax', category: 'WEDDING', description: 'Menu lengkap 500 porsi', price: 25000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
        { name: 'Tumpeng', category: 'SYUKURAN', description: 'Tumpeng besar', price: 1000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
        { name: 'Snack Box', category: 'RAPAT', description: 'Snack box premium', price: 35000, priceUnit: 'PER_PERSON', minQty: 10, maxQty: 500 },
      ];
    } else if (vendor.category === 'MUSIC') {
      services = [
        { name: 'Live Band Wedding', category: 'WEDDING', description: 'Band 8 orang, 4 jam', price: 12000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
        { name: 'Akustik Intimate', category: 'LAMARAN', description: 'Akustik 3 orang, 2 jam', price: 5000000, priceUnit: 'PER_PACKAGE', minQty: 1 },
      ];
    }

    for (const service of services) {
      await prisma.vendorService.create({
        data: { vendorId: vendor.id, ...service },
      });
    }
  }

  console.log('✅ Vendor services created');

  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  await prisma.promo.upsert({
    where: { code: 'EARLYBIRD10' },
    update: {},
    create: {
      code: 'EARLYBIRD10',
      title: 'Early Bird 10%',
      description: 'Diskon 10% untuk booking 6 bulan sebelum acara.',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 50000000,
      maxDiscount: 20000000,
      quota: 100,
      validFrom: now,
      validTo: nextYear,
    },
  });

  await prisma.promo.upsert({
    where: { code: 'WEDDING5JT' },
    update: {},
    create: {
      code: 'WEDDING5JT',
      title: 'Diskon Rp 5 Juta',
      description: 'Potongan langsung Rp 5 juta untuk paket Gold & Platinum.',
      type: 'FIXED',
      value: 5000000,
      minPurchase: 80000000,
      quota: 50,
      validFrom: now,
      validTo: nextYear,
    },
  });

  console.log('✅ Promos created');

  const existingRules = await prisma.pricingRule.count();
  if (existingRules === 0) {
    await prisma.pricingRule.createMany({
      data: [
        {
          name: 'Weekend Surcharge',
          priority: 1,
          conditions: JSON.stringify({ dayOfWeek: [6, 0] }),
          adjustment: JSON.stringify({ type: 'percentage', value: 20 }),
        },
        {
          name: 'High Season (Jun-Aug, Dec)',
          priority: 2,
          conditions: JSON.stringify({ months: [6, 7, 8, 12] }),
          adjustment: JSON.stringify({ type: 'percentage', value: 15 }),
        },
      ],
    });
  }

  console.log('✅ Pricing rules created');

  console.log('');
  console.log('🎉 SEEDING SELESAI!');
  console.log('📧 Admin: admin@wedora.id / admin123');
  console.log('📧 User:  user@wedora.id  / user123');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });