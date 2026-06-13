import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, signToken, setAuthCookie, clearAuthCookie, getCurrentUser } from '@/lib/auth';

// POST /api/v2/auth/register
// POST /api/v2/auth/login  
// POST /api/v2/auth/logout
// GET  /api/v2/auth/me

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, name: true, email: true, phone: true, role: true, companyName: true, gstNumber: true, avatar: true, isVerified: true, createdAt: true },
  });
  return NextResponse.json(dbUser);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // ─── Register ───
  if (action === 'register') {
    const { name, email, phone, password, role = 'client', companyName, gstNumber } = body;
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return NextResponse.json({ error: 'User with this email or phone already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role, companyName, gstNumber, isVerified: false },
    });

    // Auto-create supplier profile if role is supplier
    if (role === 'supplier') {
      await prisma.supplier.create({
        data: {
          userId: user.id,
          businessName: companyName || name,
          address: '',
          city: '',
          state: 'Maharashtra',
          pincode: '',
          isApproved: false,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    await setAuthCookie(token);

    return NextResponse.json({
      id: user.id, name: user.name, email: user.email, phone: user.phone,
      role: user.role, companyName: user.companyName,
    }, { status: 201 });
  }

  // ─── Login ───
  if (action === 'login') {
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    await setAuthCookie(token);

    return NextResponse.json({
      id: user.id, name: user.name, email: user.email, phone: user.phone,
      role: user.role, companyName: user.companyName, gstNumber: user.gstNumber,
    });
  }

  // ─── Logout ───
  if (action === 'logout') {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
