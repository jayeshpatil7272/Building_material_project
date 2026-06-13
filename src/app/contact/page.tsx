'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Phone, Mail, Clock, MessageSquare, PhoneCall, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContactPage() {
  const { t } = useLanguage();

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    division: 'general',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill out all required fields.');
      return;
    }
    setFormStatus('sending');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setFormStatus('success');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          division: 'general',
          message: ''
        });
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      setFormStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-24">
      {/* Header */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Communications</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          Get In Touch With Us
        </h1>
        <p className="text-sm text-gray-400">
          Have a bulk construction inquiry, logistics delivery request, or dealer network query? Leave us a message below.
        </p>
      </section>

      {/* Grid: Contact details & Form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6">
            <h3 className="text-xl font-bold font-display text-white border-b border-premium-border/60 pb-3">
              Corporate Office
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-const-orange/10 flex items-center justify-center border border-const-orange/20 text-const-orange shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Address Location</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Girad, Taluka Bhadgaon, Dist Jalgaon, Maharashtra, India
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-const-orange/10 flex items-center justify-center border border-const-orange/20 text-const-orange shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Helpline Channels</h4>
                  <a href="tel:+918010871044" className="text-xs text-gray-300 hover:text-white transition-colors block mt-1">
                    Direct Call: +91 8010871044
                  </a>
                  <a href="tel:+918010871044" className="text-xs text-gray-400 hover:text-white transition-colors block">
                    Sales Desk: +91 8010871044
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-const-orange/10 flex items-center justify-center border border-const-orange/20 text-const-orange shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Correspondence</h4>
                  <a href="mailto:info@jayshreeram.com" className="text-xs text-gray-300 hover:text-white transition-colors block mt-1">
                    info@jayshreeram.com
                  </a>
                  <a href="mailto:sales@jayshreeram.com" className="text-xs text-gray-400 hover:text-white transition-colors block">
                    sales@jayshreeram.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Instant Connect Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <a
              href="tel:+918010871044"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Hotline</span>
            </a>
            <a
              href="https://wa.me/918010871044"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-[#25d366] text-white font-bold text-xs py-3.5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.338 5.393 0 11.95 0a11.82 11.82 0 018.412 3.48 11.82 11.82 0 013.48 8.413c-.003 6.557-5.337 11.892-11.893 11.892-1.996-.001-3.959-.5-5.706-1.459L0 24zm6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662z" />
              </svg>
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleContactSubmit} className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6">
            <h3 className="text-xl font-bold font-display text-white">Send Direct Message</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">{t('inq.name')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">{t('inq.phone')} *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">{t('inq.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">{t('inq.division')} *</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full bg-[#121217] border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                >
                  <option value="general">General Inquiries</option>
                  <option value="hotel">{t('inq.div.hotel')}</option>
                  <option value="sand">{t('inq.div.sand')}</option>
                  <option value="materials">{t('inq.div.materials')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">{t('inq.message')} *</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
              />
            </div>

            {formStatus === 'success' && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold">
                ✓ Message sent successfully. Our support desk will reply soon.
              </div>
            )}

            {formStatus === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                ⚠️ Message delivery failed. Please check parameters.
              </div>
            )}

            <button
              type="submit"
              disabled={formStatus === 'sending'}
              className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {formStatus === 'sending' ? t('inq.sending') : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* Map block */}
      <section className="glassmorphism p-4 rounded-3xl border border-premium-border h-96 overflow-hidden relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.150654271378!2d75.2262104!3d20.6698188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d1511.0!2sGirad!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          className="opacity-70 rounded-2xl"
        />
        <div className="absolute top-8 left-8 bg-black/80 backdrop-blur-md border border-premium-border p-4 rounded-xl text-[10px] text-gray-300 max-w-[200px] pointer-events-none">
          <p className="font-bold text-white mb-1">Corporate Headquarters</p>
          <p>Girad Main Road, Bhadgaon, Jalgaon, MH, India</p>
        </div>
      </section>
    </div>
  );
}
