'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, User, ArrowLeft, RefreshCw } from 'lucide-react';

interface Blog {
  id: string;
  title_en: string;
  title_hi: string;
  title_mr: string;
  content_en: string;
  content_hi: string;
  content_mr: string;
  author: string;
  slug: string;
  date: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const { language } = useLanguage();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const blogs: Blog[] = await res.json();
          const found = blogs.find(b => b.slug === slug);
          if (found) {
            setBlog(found);
          }
        }
      } catch (err) {
        console.error('Failed to load blog post', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPost();
  }, [slug]);

  const getTitle = (post: Blog) => {
    return language === 'hi' ? post.title_hi : language === 'mr' ? post.title_mr : post.title_en;
  };

  const getContent = (post: Blog) => {
    return language === 'hi' ? post.content_hi : language === 'mr' ? post.content_mr : post.content_en;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-xs space-x-2">
        <RefreshCw className="w-4 h-4 animate-spin text-const-orange" />
        <span>Loading article...</span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-6">
        <h2 className="text-xl font-bold text-white">Article Not Found</h2>
        <p className="text-xs text-gray-400">The article you are trying to view does not exist or was deleted.</p>
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 text-xs font-bold text-const-orange"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 lg:px-8 py-12 space-y-8">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition-colors pt-4"
      >
        <ArrowLeft className="w-4 h-4 text-const-orange" />
        <span>Back to Publications</span>
      </Link>

      {/* Metadata */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4 text-[10px] text-gray-500">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{blog.date}</span>
          </span>
          <span className="flex items-center space-x-1">
            <User className="w-3.5 h-3.5" />
            <span>{blog.author}</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white leading-tight">
          {getTitle(blog)}
        </h1>
      </div>

      {/* Full Content */}
      <div className="glassmorphism p-8 rounded-3xl border border-premium-border/80 text-sm leading-relaxed text-gray-300 space-y-6">
        {getContent(blog).split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
