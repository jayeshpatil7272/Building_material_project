import { NextResponse } from 'next/server';
import { readDb, writeDb, Lead } from '@/lib/db';

export async function GET() {
  try {
    const db = readDb();
    // Sort leads by date descending
    const sortedLeads = [...db.leads].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json(sortedLeads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, division, message } = body;

    if (!name || !phone || !division) {
      return NextResponse.json({ error: 'Name, Phone, and Division are required fields.' }, { status: 400 });
    }

    const db = readDb();
    const newLead: Lead = {
      id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      email: email || '',
      phone,
      division,
      message: message || '',
      status: 'New',
      timestamp: new Date().toISOString()
    };

    db.leads.push(newLead);
    writeDb(db);

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Lead ID and status are required.' }, { status: 400 });
    }

    const db = readDb();
    const leadIndex = db.leads.findIndex(l => l.id === id);

    if (leadIndex === -1) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    db.leads[leadIndex].status = status;
    writeDb(db);

    return NextResponse.json({ success: true, lead: db.leads[leadIndex] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
