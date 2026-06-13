import { NextResponse } from 'next/server';
import { readDb, writeDb, User } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, name, phone, role } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 });
    }

    const db = readDb();

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
      }

      // Check credentials
      const user = db.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }

      // Return user data (excluding password)
      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        timestamp: user.timestamp
      };

      return NextResponse.json({ success: true, user: sessionUser });
    }

    if (action === 'register') {
      if (!name || !email || !phone || !password) {
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
      }

      const userRole = role === 'dealer' ? 'dealer' : 'client';

      const newUser: User = {
        id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        email: email.toLowerCase(),
        phone,
        password,
        role: userRole,
        timestamp: new Date().toISOString()
      };

      db.users.push(newUser);
      writeDb(db);

      // Return user data (excluding password)
      const sessionUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        timestamp: newUser.timestamp
      };

      return NextResponse.json({ success: true, user: sessionUser });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
