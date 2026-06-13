'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Globe, Bell, Trash2, CheckCircle, RefreshCw, Send, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  division: string;
  message: string;
  status: string;
  timestamp: string;
}

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

interface SEOConfig {
  home_title: string;
  home_description: string;
  hotel_title: string;
  hotel_description: string;
  sand_title: string;
  sand_description: string;
  materials_title: string;
  materials_description: string;
  keywords: string;
}

export default function AdminPage() {
  const { user, loading: authLoading, login } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<'leads' | 'blogs' | 'seo'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [seo, setSeo] = useState<SEOConfig>({
    home_title: '',
    home_description: '',
    hotel_title: '',
    hotel_description: '',
    sand_title: '',
    sand_description: '',
    materials_title: '',
    materials_description: '',
    keywords: ''
  });

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);
    try {
      const u = await login(adminEmail, adminPassword);
      if (u.role !== 'admin') {
        setLoginError('Access Denied. Only administrator accounts can access this panel.');
      } else {
        confetti({ particleCount: 100, spread: 60 });
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Blog Form State
  const [blogForm, setBlogForm] = useState({
    title_en: '',
    title_hi: '',
    title_mr: '',
    content_en: '',
    content_hi: '',
    content_mr: '',
    author: ''
  });

  // Fetch Dashboard Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, blogsRes, seoRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/blogs'),
        fetch('/api/seo')
      ]);

      if (leadsRes.ok && blogsRes.ok && seoRes.ok) {
        const leadsData = await leadsRes.json();
        const blogsData = await blogsRes.json();
        const seoData = await seoRes.json();

        setLeads(leadsData);
        setBlogs(blogsData);
        setSeo(seoData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Lead Status
  const handleLeadStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus })
      });

      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        setStatusMsg('Lead status updated successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update lead', err);
    }
  };

  // Submit Blog Post
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title_en || !blogForm.content_en || !blogForm.author) {
      alert('English Title, English Content, and Author are mandatory.');
      return;
    }

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogForm)
      });

      if (res.ok) {
        confetti({ particleCount: 50, spread: 60 });
        setBlogForm({
          title_en: '',
          title_hi: '',
          title_mr: '',
          content_en: '',
          content_hi: '',
          content_mr: '',
          author: ''
        });
        setStatusMsg('New blog post added!');
        fetchData();
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Blog submission failed', err);
    }
  };

  // Delete Blog Post
  const handleBlogDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/blogs?id=${blogId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBlogs(prev => prev.filter(b => b.id !== blogId));
        setStatusMsg('Blog post deleted.');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // Update SEO Config
  const handleSeoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seo)
      });
      if (res.ok) {
        setStatusMsg('SEO metadata saved successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('SEO save failed', err);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-const-orange mx-auto" />
        <p className="text-xs text-gray-500 mt-4 font-bold tracking-widest uppercase">Checking Credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-500">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-white">Admin Access Required</h2>
            <p className="text-xs text-gray-400">
              Please authenticate below with your administrative credentials to unlock the Jay Shree Ram sales desk dashboard.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Admin Email</label>
              <input
                type="email"
                required
                placeholder="admin@jayshreeram.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange"
              />
            </div>

            {loginError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:scale-102 active:scale-98 transition-transform disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Authenticate Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-premium-border/60 pb-6 gap-4 pt-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center space-x-2">
            <LayoutDashboard className="w-8 h-8 text-const-orange" />
            <span>Jay Shree Ram Administration Panel</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Corporate lead manager, sitemap analyzer, and dynamic blog publications control.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 text-xs bg-white/5 border border-premium-border px-4 py-2.5 rounded-xl hover:bg-white/10 text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glassmorphism p-6 rounded-2xl border border-premium-border">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Leads Received</p>
          <p className="text-3xl font-extrabold font-display text-white mt-2">{leads.length}</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-const-orange h-full" style={{ width: `${Math.min(leads.length * 5, 100)}%` }} />
          </div>
        </div>
        <div className="glassmorphism p-6 rounded-2xl border border-premium-border">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Open Tasks</p>
          <p className="text-3xl font-extrabold font-display text-const-orange mt-2">
            {leads.filter(l => l.status === 'New').length}
          </p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-const-orange h-full" style={{ width: '40%' }} />
          </div>
        </div>
        <div className="glassmorphism p-6 rounded-2xl border border-premium-border">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Blog Publications</p>
          <p className="text-3xl font-extrabold font-display text-white mt-2">{blogs.length}</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-600 h-full" style={{ width: `${Math.min(blogs.length * 10, 100)}%` }} />
          </div>
        </div>
        <div className="glassmorphism p-6 rounded-2xl border border-premium-border">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Conversion Performance</p>
          <p className="text-3xl font-extrabold font-display text-green-400 mt-2">78%</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-green-400 h-full" style={{ width: '78%' }} />
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Tabs Panel */}
      <div className="flex border-b border-premium-border/60">
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center space-x-2 text-sm font-bold px-6 py-3 border-b-2 transition-colors ${
            activeTab === 'leads' ? 'border-const-orange text-const-orange' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads Tracker ({leads.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className={`flex items-center space-x-2 text-sm font-bold px-6 py-3 border-b-2 transition-colors ${
            activeTab === 'blogs' ? 'border-const-orange text-const-orange' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Blog Manager ({blogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center space-x-2 text-sm font-bold px-6 py-3 border-b-2 transition-colors ${
            activeTab === 'seo' ? 'border-const-orange text-const-orange' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>SEO Metas Dashboard</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-const-orange" />
          <span>Querying mock database...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: Leads Tracker */}
          {activeTab === 'leads' && (
            <div className="glassmorphism rounded-3xl border border-premium-border/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-premium-border bg-white/3 text-gray-400 font-semibold uppercase tracking-wider">
                      <th className="p-4">Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Division</th>
                      <th className="p-4">Message / Request Details</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-premium-border/60">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">No leads recorded in db.json yet. Submit a form to populate!</td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/1 text-gray-300">
                          <td className="p-4 whitespace-nowrap">{new Date(lead.timestamp).toLocaleDateString()}</td>
                          <td className="p-4">
                            <p className="font-bold text-white">{lead.name}</p>
                            <p className="text-[10px] text-gray-500">{lead.phone}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[9px] border ${
                              lead.division === 'hotel'
                                ? 'bg-const-orange/15 border-const-orange/30 text-const-orange'
                                : lead.division === 'sand'
                                ? 'bg-slate-500/15 border-slate-500/30 text-gray-300'
                                : 'bg-amber-600/15 border-amber-600/30 text-amber-500'
                            }`}>
                              {lead.division === 'hotel'
                                ? 'Cement & Steel'
                                : lead.division === 'sand'
                                ? 'Sand & Aggregate'
                                : lead.division === 'materials'
                                ? 'Plaster & Supplies'
                                : lead.division}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs">{lead.message}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              lead.status === 'New'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : lead.status === 'Contacted'
                                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                : 'bg-green-500/15 text-green-400 border border-green-500/30'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                                value={lead.status}
                                onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                                className="bg-[#121217] border border-premium-border text-[10px] rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-const-orange"
                            >
                              <option value="New">New Inquiry</option>
                              <option value="Contacted">Contacted Client</option>
                              <option value="Completed">Order Settled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Blog Manager */}
          {activeTab === 'blogs' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Write New Blog Form */}
              <form onSubmit={handleBlogSubmit} className="lg:col-span-7 glassmorphism p-8 rounded-3xl border border-premium-border space-y-6">
                <h3 className="text-lg font-bold font-display text-white">Create New Multilingual Blog Post</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">Author</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mr. Bhaiyya Patil"
                      value={blogForm.author}
                      onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                    />
                  </div>
                </div>

                {/* English inputs */}
                <div className="space-y-4 border-l-2 border-blue-500/40 pl-4">
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20">English Version</span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={blogForm.title_en}
                      onChange={(e) => setBlogForm({ ...blogForm, title_en: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold">Content (English) *</label>
                    <textarea
                      rows={3}
                      required
                      value={blogForm.content_en}
                      onChange={(e) => setBlogForm({ ...blogForm, content_en: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Hindi inputs */}
                <div className="space-y-4 border-l-2 border-orange-500/40 pl-4">
                  <span className="text-[9px] bg-orange-500/10 text-orange-400 font-bold px-2 py-0.5 rounded border border-orange-500/20">Hindi Translation (Optional)</span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold">Title (Hindi)</label>
                    <input
                      type="text"
                      value={blogForm.title_hi}
                      onChange={(e) => setBlogForm({ ...blogForm, title_hi: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold">Content (Hindi)</label>
                    <textarea
                      rows={3}
                      value={blogForm.content_hi}
                      onChange={(e) => setBlogForm({ ...blogForm, content_hi: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Marathi inputs */}
                <div className="space-y-4 border-l-2 border-green-500/40 pl-4">
                  <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded border border-green-500/20">Marathi Translation (Optional)</span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold">Title (Marathi)</label>
                    <input
                      type="text"
                      value={blogForm.title_mr}
                      onChange={(e) => setBlogForm({ ...blogForm, title_mr: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold">Content (Marathi)</label>
                    <textarea
                      rows={3}
                      value={blogForm.content_mr}
                      onChange={(e) => setBlogForm({ ...blogForm, content_mr: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  Publish Article
                </button>
              </form>

              {/* View Existing Articles */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-lg font-bold font-display text-white">Active Articles ({blogs.length})</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="glassmorphism p-5 rounded-2xl border border-premium-border space-y-3 relative group">
                      <button
                        onClick={() => handleBlogDelete(blog.id)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-300 p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="font-bold text-xs text-white pr-8">{blog.title_en}</h4>
                        <p className="text-[9px] text-gray-500 mt-1">By {blog.author} | {blog.date}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{blog.content_en}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO Dashboard */}
          {activeTab === 'seo' && (
            <form onSubmit={handleSeoSubmit} className="glassmorphism p-8 rounded-3xl border border-premium-border max-w-3xl mx-auto space-y-6">
              <h3 className="text-lg font-bold font-display text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-const-orange" />
                <span>Meta Tags & Sitemap Keywords Control</span>
              </h3>
              <p className="text-xs text-gray-400">
                Adjust meta titles and descriptors below. Next.js fetches these dynamically on rendering client requests to maximize Google local search rankings.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase">Homepage Head Title</label>
                  <input
                    type="text"
                    required
                    value={seo.home_title}
                    onChange={(e) => setSeo({ ...seo, home_title: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase">Homepage Meta Description</label>
                  <textarea
                    rows={2}
                    required
                    value={seo.home_description}
                    onChange={(e) => setSeo({ ...seo, home_description: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-premium-border/40">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">Products Catalog Meta Title</label>
                    <input
                      type="text"
                      required
                      value={seo.hotel_title}
                      onChange={(e) => setSeo({ ...seo, hotel_title: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">Products Catalog Description</label>
                    <textarea
                      rows={2}
                      required
                      value={seo.hotel_description}
                      onChange={(e) => setSeo({ ...seo, hotel_description: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">Sand & Fleet Logistics Meta Title</label>
                    <input
                      type="text"
                      required
                      value={seo.sand_title}
                      onChange={(e) => setSeo({ ...seo, sand_title: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase">Sand & Fleet Logistics Description</label>
                    <textarea
                      rows={2}
                      required
                      value={seo.sand_description}
                      onChange={(e) => setSeo({ ...seo, sand_description: e.target.value })}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-premium-border/40">
                <label className="text-[10px] text-gray-400 font-semibold uppercase">Meta Keywords (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={seo.keywords}
                  onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-const-orange to-amber-600 hover:from-const-orange/90 hover:to-amber-600/90 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Save SEO Configurations
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
