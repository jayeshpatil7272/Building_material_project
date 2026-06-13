'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { FileText, Calendar, User, ArrowRight, RefreshCw } from 'lucide-react';

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

export default function BlogListPage() {
  const { language, t } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error('Failed to load blogs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const getTitle = (blog: Blog) => {
    return language === 'hi' ? blog.title_hi : language === 'mr' ? blog.title_mr : blog.title_en;
  };

  const getContent = (blog: Blog) => {
    return language === 'hi' ? blog.content_hi : language === 'mr' ? blog.content_mr : blog.content_en;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
          <FileText className="w-3.5 h-3.5" />
          <span>Knowledge & Updates</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          Jay Shree Ram Insights & Blogs
        </h1>
        <p className="text-sm text-gray-400">
          Stay informed with industry insights on concrete grading, structural steel durability, and traditional satvik recipe guides from our corporate desk.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-const-orange" />
          <span>Fetching publications...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="glassmorphism p-12 rounded-3xl border border-premium-border text-center text-gray-500 text-xs">
          No articles published yet. You can create articles in the Admin Dashboard!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="glassmorphism p-8 rounded-3xl border border-premium-border flex flex-col justify-between hover:border-const-orange/40 transition-colors"
            >
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
                <h2 className="text-lg font-bold text-white leading-snug hover:text-const-orange transition-colors">
                  {getTitle(blog)}
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {getContent(blog)}
                </p>
              </div>
              <Link
                href={`/blog/${blog.slug}`}
                className="mt-6 flex items-center justify-between text-xs font-bold text-const-orange border-t border-premium-border/60 pt-4"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
