import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET  /api/v2/products - list products with filters
// POST /api/v2/products - create product (supplier/admin)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('q');
  const featured = searchParams.get('featured');
  const supplierId = searchParams.get('supplier');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sortBy = searchParams.get('sort') || 'createdAt';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const where: any = { isActive: true, isApproved: true };
  
  if (category) where.category = { slug: category };
  if (featured === 'true') where.isFeatured = true;
  if (supplierId) where.supplierId = supplierId;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } },
      { tags: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) where.basePrice.gte = parseFloat(minPrice);
    if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        supplier: { select: { businessName: true, city: true, rating: true } },
        inventory: { select: { currentStock: true, reservedStock: true } },
      },
      orderBy: sortBy === 'price_asc' ? { basePrice: 'asc' }
        : sortBy === 'price_desc' ? { basePrice: 'desc' }
        : sortBy === 'rating' ? { rating: 'desc' }
        : sortBy === 'popular' ? { totalSold: 'desc' }
        : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !['supplier', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { name, categoryId, unit, basePrice, mrp, gstRate, description, brand, minOrderQty, specs, tags, images } = body;

  if (!name || !categoryId || !unit || !basePrice) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let supplierId = body.supplierId;
  if (user.role === 'supplier') {
    const supplier = await prisma.supplier.findUnique({ where: { userId: user.userId } });
    if (!supplier) return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    supplierId = supplier.id;
  }

  const sku = `JSR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const product = await prisma.product.create({
    data: {
      supplierId, categoryId, name, sku, unit, basePrice: parseFloat(basePrice),
      mrp: mrp ? parseFloat(mrp) : undefined,
      gstRate: gstRate ? parseFloat(gstRate) : 18,
      description, brand,
      minOrderQty: minOrderQty ? parseInt(minOrderQty) : 1,
      specs: specs ? JSON.stringify(specs) : undefined,
      tags: tags ? JSON.stringify(tags) : undefined,
      images: images ? JSON.stringify(images) : undefined,
      isActive: true,
      isApproved: user.role === 'admin', // Auto-approve for admin
    },
  });

  // Create inventory record
  await prisma.inventory.create({
    data: { productId: product.id, supplierId, currentStock: 0, lowStockAlert: 10, reorderPoint: 20 },
  });

  return NextResponse.json(product, { status: 201 });
}
