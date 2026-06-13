import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbUrl = `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Jay Shree Ram Marketplace database...');

  // ─── Categories ───
  const categories = [
    { name: 'Cement', nameHi: 'सीमेंट', nameMr: 'सिमेंट', slug: 'cement', icon: '🏗️', sortOrder: 1 },
    { name: 'Steel & TMT', nameHi: 'स्टील / सरिया', nameMr: 'स्टील / लोखंड', slug: 'steel', icon: '⚙️', sortOrder: 2 },
    { name: 'River Sand', nameHi: 'नदी की रेत', nameMr: 'नदीची वाळू', slug: 'sand', icon: '🌊', sortOrder: 3 },
    { name: 'Aggregates', nameHi: 'गिट्टी / खड़ी', nameMr: 'खडी / गिट्टी', slug: 'aggregate', icon: '🪨', sortOrder: 4 },
    { name: 'Bricks & Blocks', nameHi: 'ईंटें और ब्लॉक', nameMr: 'विटा आणि ब्लॉक', slug: 'bricks', icon: '🧱', sortOrder: 5 },
    { name: 'Waterproofing', nameHi: 'वॉटरप्रूफिंग', nameMr: 'वॉटरप्रूफिंग', slug: 'waterproofing', icon: '💧', sortOrder: 6 },
    { name: 'Plumbing', nameHi: 'प्लंबिंग पाइप्स', nameMr: 'प्लंबिंग पाईप्स', slug: 'plumbing', icon: '🔧', sortOrder: 7 },
    { name: 'Electrical', nameHi: 'इलेक्ट्रिकल', nameMr: 'इलेक्ट्रिकल', slug: 'electrical', icon: '⚡', sortOrder: 8 },
    { name: 'Tiles & Flooring', nameHi: 'टाइल्स', nameMr: 'टाईल्स', slug: 'tiles', icon: '🏠', sortOrder: 9 },
    { name: 'Paints', nameHi: 'रंग / पेंट', nameMr: 'रंग / पेंट', slug: 'paints', icon: '🎨', sortOrder: 10 },
    { name: 'Tools & Hardware', nameHi: 'औजार और हार्डवेयर', nameMr: 'साहित्य आणि हार्डवेअर', slug: 'hardware', icon: '🔨', sortOrder: 11 },
    { name: 'Ready-Mix Concrete', nameHi: 'रेडी-मिक्स कंक्रीट', nameMr: 'रेडी-मिक्स काँक्रीट', slug: 'rmc', icon: '🏗️', sortOrder: 12 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
  }
  console.log('✅ Categories seeded');

  // ─── Admin User ───
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jayshreeramgroup.com' },
    update: {},
    create: {
      name: 'Bhaiyya Patil',
      email: 'admin@jayshreeramgroup.com',
      phone: '+919975175762',
      passwordHash: adminHash,
      role: 'admin',
      companyName: 'Jay Shree Ram Group',
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Admin user seeded:', admin.email);

  // ─── Supplier User ───
  const supplierHash = await bcrypt.hash('supplier123', 12);
  const supplierUser = await prisma.user.upsert({
    where: { email: 'supplier@jayshreeramgroup.com' },
    update: {},
    create: {
      name: 'Suresh Supplier',
      email: 'supplier@jayshreeramgroup.com',
      phone: '+919123456789',
      passwordHash: supplierHash,
      role: 'supplier',
      companyName: 'JSR Materials Depot',
      gstNumber: '27AABCJ1234F1ZE',
      isVerified: true,
      isActive: true,
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: {
      userId: supplierUser.id,
      businessName: 'Jay Shree Ram Materials Depot',
      gstNumber: '27AABCJ1234F1ZE',
      address: 'Girad, Taluka Bhadgaon',
      city: 'Jalgaon',
      state: 'Maharashtra',
      pincode: '425105',
      rating: 4.8,
      totalReviews: 127,
      isApproved: true,
      isActive: true,
    },
  });
  console.log('✅ Supplier seeded:', supplier.businessName);

  // ─── Client User ───
  const clientHash = await bcrypt.hash('client123', 12);
  await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Rahul Contractor',
      email: 'client@example.com',
      phone: '+919876543210',
      passwordHash: clientHash,
      role: 'client',
      companyName: 'Rahul Constructions',
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Client user seeded');

  // ─── Dealer User ───
  const dealerHash = await bcrypt.hash('dealer123', 12);
  await prisma.user.upsert({
    where: { email: 'dealer@example.com' },
    update: {},
    create: {
      name: 'Vijay Dealer',
      email: 'dealer@example.com',
      phone: '+919812345678',
      passwordHash: dealerHash,
      role: 'dealer',
      companyName: 'Vijay Building Supplies',
      gstNumber: '27AACVD5678G1ZF',
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Dealer user seeded');

  // ─── Delivery Partners ───
  await prisma.deliveryPartner.upsert({
    where: { phone: '+918010871044' },
    update: {},
    create: {
      name: 'Raju Driver',
      phone: '+918010871044',
      vehicleNo: 'MH-19-AB-1234',
      vehicleType: 'dumper',
      isAvailable: true,
      totalTrips: 324,
      rating: 4.7,
    },
  });
  console.log('✅ Delivery partner seeded');

  // ─── Products ───
  const cementCat = await prisma.category.findUnique({ where: { slug: 'cement' } });
  const steelCat = await prisma.category.findUnique({ where: { slug: 'steel' } });
  const sandCat = await prisma.category.findUnique({ where: { slug: 'sand' } });
  const aggCat = await prisma.category.findUnique({ where: { slug: 'aggregate' } });
  const brickCat = await prisma.category.findUnique({ where: { slug: 'bricks' } });
  const wpCat = await prisma.category.findUnique({ where: { slug: 'waterproofing' } });
  const plumbingCat = await prisma.category.findUnique({ where: { slug: 'plumbing' } });

  const products = [
    {
      supplierId: supplier.id, categoryId: cementCat!.id,
      name: 'UltraTech OPC 53 Grade Cement', brand: 'UltraTech',
      sku: 'JSR-CEM-ULTRA-OPC53', unit: 'Bags', basePrice: 380, mrp: 420, gstRate: 28,
      minOrderQty: 50,
      description: 'High-strength Ordinary Portland Cement for load-bearing structures and RCC work.',
      specs: JSON.stringify({ grade: 'OPC 53', packingSize: '50 kg', certification: 'BIS IS 8112', compressiveStrength: '53 N/mm²' }),
      tags: JSON.stringify(['cement', 'opc', 'ultratech', 'construction']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: true, rating: 4.8, totalReviews: 89,
    },
    {
      supplierId: supplier.id, categoryId: cementCat!.id,
      name: 'Ambuja PPC Cement (Portland Pozzolana)', brand: 'Ambuja',
      sku: 'JSR-CEM-AMB-PPC', unit: 'Bags', basePrice: 365, mrp: 400, gstRate: 28,
      minOrderQty: 50,
      description: 'Portland Pozzolana Cement ideal for plastering, brickwork and non-structural RCC.',
      specs: JSON.stringify({ grade: 'PPC', packingSize: '50 kg', certification: 'BIS IS 1489', flyAshContent: '30%' }),
      tags: JSON.stringify(['cement', 'ppc', 'ambuja', 'plastering']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: false, rating: 4.6, totalReviews: 54,
    },
    {
      supplierId: supplier.id, categoryId: cementCat!.id,
      name: 'ACC Gold Water Shield Cement', brand: 'ACC',
      sku: 'JSR-CEM-ACC-GOLD', unit: 'Bags', basePrice: 395, mrp: 440, gstRate: 28,
      minOrderQty: 50,
      description: 'Waterproof cement with micro-particle technology for basement and foundation work.',
      specs: JSON.stringify({ grade: 'PPC Premium', packingSize: '50 kg', waterResistance: 'Yes', certification: 'BIS IS 1489' }),
      tags: JSON.stringify(['cement', 'waterproof', 'acc', 'foundation']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: true, rating: 4.7, totalReviews: 41,
    },
    {
      supplierId: supplier.id, categoryId: steelCat!.id,
      name: 'JSW Neosteel TMT Rebars Fe 550D', brand: 'JSW Steel',
      sku: 'JSR-STL-JSW-550D', unit: 'MT', basePrice: 64000, mrp: 68000, gstRate: 18,
      minOrderQty: 1,
      description: 'High-ductility TMT rebars for seismic zones. Superior bending and corrosion resistance.',
      specs: JSON.stringify({ grade: 'Fe 550D', diameters: '8mm-32mm', standard: 'IS 1786', corrosionResistant: true }),
      tags: JSON.stringify(['steel', 'tmt', 'jsw', 'rebar', 'seismic']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: true, rating: 4.9, totalReviews: 112,
    },
    {
      supplierId: supplier.id, categoryId: steelCat!.id,
      name: 'Tata Tiscon Super Ductile TMT Rebars', brand: 'Tata Tiscon',
      sku: 'JSR-STL-TATA-SD', unit: 'MT', basePrice: 68000, mrp: 72000, gstRate: 18,
      minOrderQty: 1,
      description: "India's #1 structural rebar with Tempcore quench treatment. Deep rib pattern for cement bonding.",
      specs: JSON.stringify({ grade: 'Fe 550D', diameters: '8mm-32mm', standard: 'IS 1786', tempcore: true }),
      tags: JSON.stringify(['steel', 'tmt', 'tata', 'rebar', 'flagship']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: false, rating: 4.8, totalReviews: 78,
    },
    {
      supplierId: supplier.id, categoryId: sandCat!.id,
      name: 'Girna River Double-Washed Sand', brand: 'JSR Direct Mine',
      sku: 'JSR-SND-GIRNA-RVR', unit: 'Brass', basePrice: 6500, mrp: 7200, gstRate: 5,
      minOrderQty: 1,
      description: 'Premium double-washed river sand from Girna riverbed. Zero silt, ideal for RCC and brickwork.',
      specs: JSON.stringify({ siltContent: '<1%', processing: 'Double-Washed', source: 'Girna River, Bhadgaon', size: 'Coarse Grade' }),
      tags: JSON.stringify(['sand', 'river', 'girna', 'construction', 'rcc']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: true, rating: 4.9, totalReviews: 203,
    },
    {
      supplierId: supplier.id, categoryId: sandCat!.id,
      name: 'Tapi River Fine Plaster Sand', brand: 'JSR Direct Mine',
      sku: 'JSR-SND-TAPI-PLT', unit: 'Brass', basePrice: 5500, mrp: 6200, gstRate: 5,
      minOrderQty: 1,
      description: 'Triple-washed fine grade plaster sand. Creates smooth wall finishes with zero clay content.',
      specs: JSON.stringify({ siltContent: '<0.5%', processing: 'Triple-Washed', source: 'Tapi River', size: 'Fine Grade' }),
      tags: JSON.stringify(['sand', 'plaster', 'tapi', 'fine']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: false, rating: 4.7, totalReviews: 87,
    },
    {
      supplierId: supplier.id, categoryId: sandCat!.id,
      name: 'Concrete M-Sand (Manufactured Sand)', brand: 'JSR Crusher Plant',
      sku: 'JSR-SND-MSAND', unit: 'Brass', basePrice: 4800, mrp: 5500, gstRate: 5,
      minOrderQty: 1,
      description: 'Eco-friendly basalt crusher sand as river sand substitute. Consistent grading, no silt.',
      specs: JSON.stringify({ type: 'Manufactured Sand', material: 'Basalt', grading: 'Zone II IS 383', cubical: true }),
      tags: JSON.stringify(['sand', 'msand', 'manufactured', 'eco']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: false, rating: 4.5, totalReviews: 62,
    },
    {
      supplierId: supplier.id, categoryId: aggCat!.id,
      name: 'Basalt Aggregates 20mm (Jelly)', brand: 'JSR Crusher Plant',
      sku: 'JSR-AGG-20MM', unit: 'Brass', basePrice: 4200, mrp: 4800, gstRate: 5,
      minOrderQty: 1,
      description: 'Angular 20mm basalt aggregates for beam, column and slab casting. High compressive strength.',
      specs: JSON.stringify({ size: '20mm', material: 'Basalt', shape: 'Angular', flakiness: 'Low', standard: 'IS 383' }),
      tags: JSON.stringify(['aggregate', 'jelly', '20mm', 'basalt', 'rcc']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: true, rating: 4.8, totalReviews: 94,
    },
    {
      supplierId: supplier.id, categoryId: aggCat!.id,
      name: 'Basalt Aggregates 10mm (Chips)', brand: 'JSR Crusher Plant',
      sku: 'JSR-AGG-10MM', unit: 'Brass', basePrice: 4000, mrp: 4600, gstRate: 5,
      minOrderQty: 1,
      description: '10mm basalt chips for thin slab casting, road sub-base and plinth filling.',
      specs: JSON.stringify({ size: '10mm', material: 'Basalt', shape: 'Angular', standard: 'IS 383' }),
      tags: JSON.stringify(['aggregate', 'chips', '10mm', 'basalt']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: false, rating: 4.6, totalReviews: 58,
    },
    {
      supplierId: supplier.id, categoryId: brickCat!.id,
      name: 'Premium Red Clay Bricks (Kiln-Fired)', brand: 'JSR Brickworks',
      sku: 'JSR-BRK-RED-CLAY', unit: 'Pcs', basePrice: 7.5, mrp: 9, gstRate: 12,
      minOrderQty: 1000,
      description: 'First-class kiln-baked red clay bricks. Standard size 230x115x75mm. High load capacity.',
      specs: JSON.stringify({ size: '230x115x75mm', compressiveStrength: '>75 kg/cm²', waterAbsorption: '<15%', class: 'Class 1' }),
      tags: JSON.stringify(['bricks', 'clay', 'red', 'kiln']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: false, rating: 4.7, totalReviews: 145,
    },
    {
      supplierId: supplier.id, categoryId: brickCat!.id,
      name: 'Siporex AAC Blocks (Aerated Concrete)', brand: 'Siporex',
      sku: 'JSR-BLK-AAC-SIPX', unit: 'Pcs', basePrice: 110, mrp: 130, gstRate: 12,
      minOrderQty: 100,
      description: 'Lightweight autoclaved aerated concrete blocks. Superior thermal and sound insulation.',
      specs: JSON.stringify({ size: '600x200x200mm', density: '600 kg/m³', thermalConductivity: '0.16 W/mK', fireRating: '4 hours' }),
      tags: JSON.stringify(['blocks', 'aac', 'siporex', 'lightweight', 'insulation']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: true, rating: 4.8, totalReviews: 67,
    },
    {
      supplierId: supplier.id, categoryId: wpCat!.id,
      name: 'Dr. Fixit LW+ Waterproofing Compound', brand: 'Dr. Fixit',
      sku: 'JSR-WP-DRFIXIT-LW', unit: 'Litre', basePrice: 280, mrp: 350, gstRate: 18,
      minOrderQty: 10,
      description: 'Integral waterproofing compound for concrete and mortar. Protects against seepage and dampness.',
      specs: JSON.stringify({ type: 'Liquid Compound', coverage: '200ml per 50kg cement', standard: 'IS 2645', application: 'Mix with cement' }),
      tags: JSON.stringify(['waterproofing', 'drfixit', 'concrete', 'seepage']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: false, rating: 4.9, totalReviews: 112,
    },
    {
      supplierId: supplier.id, categoryId: plumbingCat!.id,
      name: 'Astral CPVC Pro Pipes 1 Inch SDR 11', brand: 'Astral',
      sku: 'JSR-PLM-AST-1SDR11', unit: 'Meters', basePrice: 350, mrp: 410, gstRate: 18,
      minOrderQty: 10,
      description: 'Chlorinated Polyvinyl Chloride (CPVC) pipes for hot and cold water distribution, Class 1 SDR 11.',
      specs: JSON.stringify({ material: 'CPVC', size: '1 inch (25mm)', length: '3 meters', class: 'SDR 11', standard: 'IS 15778' }),
      tags: JSON.stringify(['plumbing', 'pipe', 'astral', 'cpvc']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: true, rating: 4.8, totalReviews: 43,
    },
    {
      supplierId: supplier.id, categoryId: plumbingCat!.id,
      name: 'Supreme PVC SWR Pipe 4 Inch 10ft', brand: 'Supreme',
      sku: 'JSR-PLM-SUP-4SWR', unit: 'Meters', basePrice: 420, mrp: 490, gstRate: 18,
      minOrderQty: 5,
      description: 'Supreme Soil, Waste, and Rainwater (SWR) PVC pipes with rubber ring joints.',
      specs: JSON.stringify({ material: 'PVC', size: '4 inch (110mm)', length: '3 meters (10ft)', type: 'Grooved Ring Joint' }),
      tags: JSON.stringify(['plumbing', 'pipe', 'supreme', 'pvc', 'swr']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=400&auto=format&fit=crop&q=80']),
      isApproved: true, isFeatured: false, rating: 4.7, totalReviews: 29,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!existing) {
      const created = await prisma.product.create({ data: { ...product, isActive: true, totalSold: Math.floor(Math.random() * 500) } });
      // Create inventory
      await prisma.inventory.create({
        data: {
          productId: created.id,
          supplierId: supplier.id,
          currentStock: Math.floor(Math.random() * 1000) + 100,
          lowStockAlert: 50,
          reorderPoint: 100,
          warehouseLocation: 'Girad Stockyard, Bhadgaon',
        },
      });
    }
  }
  console.log('✅ Products and inventory seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin:    admin@jayshreeramgroup.com / admin123');
  console.log('   Supplier: supplier@jayshreeramgroup.com / supplier123');
  console.log('   Client:   client@example.com / client123');
  console.log('   Dealer:   dealer@example.com / dealer123');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
