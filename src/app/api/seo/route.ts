import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json(db.seo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();

    // Update fields from body
    db.seo = {
      ...db.seo,
      ...body
    };

    writeDb(db);

    return NextResponse.json({ success: true, seo: db.seo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
