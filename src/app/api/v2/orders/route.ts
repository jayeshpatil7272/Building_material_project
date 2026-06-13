import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// POST /api/v2/orders - place order
// GET  /api/v2/orders - list orders (customer sees own, supplier/admin sees all)

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where: any = {};
  if (user.role === 'client' || user.role === 'dealer') {
    where.customerId = user.userId;
  } else if (user.role === 'supplier') {
    const supplier = await prisma.supplier.findUnique({ where: { userId: user.userId } });
    if (supplier) where.items = { some: { supplierId: supplier.id } };
  }
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, unit: true, images: true } },
          },
        },
        tracking: { orderBy: { createdAt: 'desc' }, take: 1 },
        invoice: { select: { invoiceNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { items, addressId, deliveryDistance, paymentMethod = 'cod', notes } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 });
  }

  // Get delivery address
  let deliveryAddressData = body.address;
  if (addressId) {
    const addr = await prisma.address.findFirst({ where: { id: addressId, userId: user.userId } });
    if (!addr) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    deliveryAddressData = addr;
  }

  // Validate products and calculate pricing
  let subtotal = 0;
  let totalGst = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    const product = await prisma.product.findFirst({
      where: { id: item.productId, isActive: true, isApproved: true },
      include: { inventory: true },
    });
    if (!product) {
      return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
    }
    if (product.inventory && product.inventory.currentStock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
    }

    const unitPrice = product.basePrice;
    const gstAmount = (unitPrice * item.quantity * product.gstRate) / 100;
    const totalPrice = unitPrice * item.quantity + gstAmount;
    subtotal += unitPrice * item.quantity;
    totalGst += gstAmount;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      unit: product.unit,
      unitPrice,
      gstRate: product.gstRate,
      gstAmount,
      totalPrice,
      supplierId: product.supplierId,
    });
  }

  // Delivery charge based on distance
  const deliveryCharge = deliveryDistance ? Math.min(deliveryDistance * 15, 2000) : 0;
  const totalAmount = subtotal + totalGst + deliveryCharge;

  // Generate order number
  const orderNumber = `JSR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  // Create order with items
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: user.userId,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      paymentMethod,
      subtotal,
      gstAmount: totalGst,
      deliveryCharge,
      totalAmount,
      deliveryAddress: JSON.stringify(deliveryAddressData),
      deliveryDistKm: deliveryDistance,
      notes,
      items: { create: orderItems },
    },
    include: {
      items: {
        include: { product: { select: { name: true, unit: true } } },
      },
    },
  });

  // Deduct stock
  for (const item of orderItems) {
    await prisma.inventory.update({
      where: { productId: item.productId },
      data: { currentStock: { decrement: item.quantity } },
    });
    await prisma.stockMovement.create({
      data: {
        inventoryId: (await prisma.inventory.findUnique({ where: { productId: item.productId } }))!.id,
        type: 'OUT',
        quantity: item.quantity,
        orderId: order.id,
        reason: 'Order placed',
      },
    });
  }

  // Initial tracking entry
  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: 'pending',
      message: 'Order placed successfully. Awaiting confirmation from dispatch desk.',
    },
  });

  // Create notification for supplier(s)
  const supplierIds = [...new Set(orderItems.map(i => i.supplierId))];
  for (const suppId of supplierIds) {
    const supplierUser = await prisma.supplier.findUnique({ where: { id: suppId }, include: { user: true } });
    if (supplierUser) {
      await prisma.notification.create({
        data: {
          userId: supplierUser.userId,
          type: 'new_order',
          title: `🔔 New Order: ${orderNumber}`,
          message: `New order received for ₹${totalAmount.toLocaleString('en-IN')}. ${orderItems.length} item(s).`,
          data: JSON.stringify({ orderId: order.id, orderNumber, totalAmount }),
        },
      });
    }
  }

  // Customer notification
  await prisma.notification.create({
    data: {
      userId: user.userId,
      type: 'order_placed',
      title: `✅ Order Confirmed: ${orderNumber}`,
      message: `Your order of ₹${totalAmount.toLocaleString('en-IN')} has been placed. Our team will confirm shortly.`,
      data: JSON.stringify({ orderId: order.id, orderNumber }),
    },
  });

  // Create invoice
  const invoiceNumber = `INV-${new Date().getFullYear()}-${orderNumber}`;
  await prisma.invoice.create({
    data: {
      orderId: order.id,
      invoiceNumber,
      subtotal,
      totalAmount,
      gstBreakdown: JSON.stringify({
        cgst: totalGst / 2,
        sgst: totalGst / 2,
        igst: 0,
      }),
    },
  });

  return NextResponse.json({ order, orderNumber, invoiceNumber }, { status: 201 });
}
