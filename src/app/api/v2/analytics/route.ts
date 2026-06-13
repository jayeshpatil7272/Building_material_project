import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/v2/analytics - admin analytics dashboard data

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !['admin', 'supplier'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let supplierId: string | undefined;
  if (user.role === 'supplier') {
    const supplier = await prisma.supplier.findUnique({ where: { userId: user.userId } });
    supplierId = supplier?.id;
  }

  const orderWhere: any = supplierId
    ? { items: { some: { supplierId } }, createdAt: { gte: thirtyDaysAgo } }
    : { createdAt: { gte: thirtyDaysAgo } };

  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    totalUsers,
    totalProducts,
    lowStockProducts,
    recentOrders,
    topProducts,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.count({ where: orderWhere }),
    prisma.order.count({ where: { ...orderWhere, status: 'pending' } }),
    prisma.order.count({ where: { ...orderWhere, status: 'delivered' } }),
    prisma.order.count({ where: { ...orderWhere, status: 'cancelled' } }),
    prisma.order.aggregate({ where: { ...orderWhere, status: { not: 'cancelled' } }, _sum: { totalAmount: true } }),
    user.role === 'admin' ? prisma.user.count() : Promise.resolve(0),
    user.role === 'admin'
      ? prisma.product.count({ where: { isApproved: true } })
      : prisma.product.count({ where: { supplierId } }),
    prisma.inventory.count({ where: { currentStock: { lte: prisma.inventory.fields.lowStockAlert } } }),
    prisma.order.findMany({
      where: supplierId ? { items: { some: { supplierId } } } : {},
      include: {
        customer: { select: { name: true, phone: true, companyName: true } },
        items: { select: { quantity: true, unitPrice: true, totalPrice: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.product.findMany({
      where: supplierId ? { supplierId } : { isApproved: true },
      orderBy: { totalSold: 'desc' },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: orderWhere,
      _count: { status: true },
    }),
  ]);

  // Weekly order trend (last 7 days)
  const weeklyOrders = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      const count = await prisma.order.count({
        where: {
          ...(supplierId ? { items: { some: { supplierId } } } : {}),
          createdAt: { gte: day, lt: nextDay },
        },
      });
      const revenue = await prisma.order.aggregate({
        where: {
          ...(supplierId ? { items: { some: { supplierId } } } : {}),
          createdAt: { gte: day, lt: nextDay },
          status: { not: 'cancelled' },
        },
        _sum: { totalAmount: true },
      });
      return {
        date: day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        orders: count,
        revenue: revenue._sum.totalAmount || 0,
      };
    })
  );

  return NextResponse.json({
    summary: {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalUsers,
      totalProducts,
      lowStockProducts,
    },
    recentOrders,
    topProducts,
    ordersByStatus: ordersByStatus.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status;
      return acc;
    }, {} as Record<string, number>),
    weeklyTrend: weeklyOrders,
  });
}
