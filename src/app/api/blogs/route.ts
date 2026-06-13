import { NextResponse } from 'next/server';
import { readDb, writeDb, Blog } from '@/lib/db';

export async function GET() {
  try {
    const db = readDb();
    // Sort blogs by date descending
    const sortedBlogs = [...db.blogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return NextResponse.json(sortedBlogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title_en, title_hi, title_mr, content_en, content_hi, content_mr, author } = body;

    if (!title_en || !content_en || !author) {
      return NextResponse.json({ error: 'Title (English), Content (English), and Author are required.' }, { status: 400 });
    }

    const db = readDb();
    
    // Generate clean slug from English title
    const slug = title_en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newBlog: Blog = {
      id: `blog-${Date.now()}`,
      title_en,
      title_hi: title_hi || title_en,
      title_mr: title_mr || title_en,
      content_en,
      content_hi: content_hi || content_en,
      content_mr: content_mr || content_en,
      author,
      slug,
      date: new Date().toISOString().split('T')[0]
    };

    db.blogs.push(newBlog);
    writeDb(db);

    return NextResponse.json({ success: true, blog: newBlog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required.' }, { status: 400 });
    }

    const db = readDb();
    const filteredBlogs = db.blogs.filter(b => b.id !== id);

    if (filteredBlogs.length === db.blogs.length) {
      return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
    }

    db.blogs = filteredBlogs;
    writeDb(db);

    return NextResponse.json({ success: true, message: 'Blog deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
