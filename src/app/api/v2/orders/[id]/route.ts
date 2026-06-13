import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PATCH /api/v2/orders/[id] - update order status (supplier/admin)
// GET   /api/v2/orders/[id] - get single order

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true, phone: true, companyName: true } },
      items: {
        include: {
          product: { select: { name: true, unit: true, images: true, brand: true } },
        },
      },
      tracking: { orderBy: { createdAt: 'asc' } },
      invoice: true,
    },
  });

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Access control
  if (user.role === 'client' || user.role === 'dealer') {
    if (order.customerId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !['admin', 'supplier'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, message, driverName, driverPhone, vehicleNo, location } = body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['packed', 'cancelled'],
    packed: ['dispatched'],
    dispatched: ['delivered'],
    delivered: ['refunded'],
  };

  if (status && !validTransitions[order.status]?.includes(status)) {
    return NextResponse.json({ error: `Invalid status transition: ${order.status} → ${status}` }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: status || order.status,
      paymentStatus: status === 'delivered' && order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus,
      actualDelivery: status === 'delivered' ? new Date() : undefined,
    },
  });

  // Add tracking event
  if (status) {
    const trackingMessages: Record<string, string> = {
      confirmed: 'Order confirmed by dispatch desk. Material preparation in progress.',
      packed: 'Materials packed and ready for dispatch.',
      dispatched: `Order dispatched.${driverName ? ` Driver: ${driverName}` : ''}${vehicleNo ? `, Vehicle: ${vehicleNo}` : ''}`,
      delivered: 'Order delivered successfully. Thank you for choosing Jay Shree Ram Group!',
      cancelled: 'Order cancelled.',
    };

    await prisma.orderTracking.create({
      data: {
        orderId: id,
        status,
        message: message || trackingMessages[status] || `Status updated to ${status}`,
        driverName,
        driverPhone,
        vehicleNo,
        location,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        type: `order_${status}`,
        title: `Order Update: ${order.orderNumber}`,
        message: trackingMessages[status] || `Your order status has been updated to ${status}.`,
        data: JSON.stringify({ orderId: id }),
      },
    });
  }

  return NextResponse.json(updated);
}
