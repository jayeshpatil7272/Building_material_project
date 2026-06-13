'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ShieldCheck, Award, ArrowRight, CheckCircle2, 
  Zap, Check, Users, DollarSign, Handshake, Briefcase, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PartnerPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  rebates: string;
  creditLimit: string;
  logistics: string;
  target: string;
  icon: any;
  color: string;
  borderClass: string;
  popular: boolean;
  features: string[];
}

const PARTNERSHIP_PLANS: PartnerPlan[] = [
  {
    id: 'silver',
    name: 'Silver Retailer Plan',
    price: 'Free Join',
    period: 'Sub-dealer status',
    rebates: '8% – 10% rebates',
    creditLimit: 'Up to ₹5 Lakhs',
    logistics: 'Standard freight dispatches',
    target: 'For local hardware stores, small suppliers, and cement retailers',
    icon: Award,
    color: 'text-slate-400 bg-slate-500/10',
    borderClass: 'border-slate-500/20 hover:border-slate-500/50',
    popular: false,
    features: [
      'Access to standard wholesale pricing',
      '8% to 10% cashbacks on monthly targets',
      'Sourced directly from JSR stockyards',
      '₹5 Lakhs credit limit (upon GST check)',
      'Direct order tracking via Contractor Portal',
      'Basic support response under 24 hours'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Distributor Plan',
    price: 'Exclusive',
    period: 'Requires verification',
    rebates: '12% – 15% rebates',
    creditLimit: 'Up to ₹15 Lakhs',
    logistics: 'Priority cargo logistics route',
    target: 'For medium contractors, hardware wholesalers, and project managers',
    icon: Sparkles,
    color: 'text-const-orange bg-const-orange/10',
    borderClass: 'border-const-orange/30 hover:border-const-orange/60 shadow-lg shadow-const-orange/5',
    popular: true,
    features: [
      'Tier-1 manufacturer contract pricing',
      '12% to 15% immediate rebates on dispatches',
      'Direct delivery from cement/steel factories',
      '₹15 Lakhs rolling credit line',
      'Priority truck fleet dispatch (guaranteed 24h)',
      'Dedicated regional manager support desk',
      'Custom branding & marketing kit support'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Developer Plan',
    price: 'Enterprise',
    period: 'Volume-based contract',
    rebates: '18% – 20% rebates',
    creditLimit: 'Up to ₹50 Lakhs',
    logistics: 'Dedicated dumper fleet 24/7',
    target: 'For large real-estate firms, infrastructure developers, and bulk suppliers',
    icon: Zap,
    color: 'text-purple-400 bg-purple-500/10',
    borderClass: 'border-purple-500/20 hover:border-purple-500/50',
    popular: false,
    features: [
      'Direct factory-to-site pricing',
      '18% to 20% commission/rebate structure',
      '₹50 Lakhs bank-guarantee credit limit',
      'Dedicated dumper cargo fleet assigned to site',
      'Coordinated dispatch coordinator (24/7 desk)',
      'Complimentary laboratory material test certificates',
      'Joint-venture developer partnership options'
    ]
  }
];

const BRAND_PARTNERS = [
  { name: 'UltraTech Cement', category: 'Cement', type: 'Official Dealer', logoText: 'UltraTech', desc: 'India\'s No. 1 Cement' },
  { name: 'Ambuja Cements', category: 'Cement', type: 'Wholesale Partner', logoText: 'Ambuja', desc: 'Giant Compressive Strength' },
  { name: 'ACC Gold Cement', category: 'Cement', type: 'Authorized Stockist', logoText: 'ACC', desc: 'Premium Water Shield protection' },
  { name: 'JSW Neosteel TMT', category: 'Steel & Rebars', type: 'Official Distributor', logoText: 'JSW Steel', desc: 'High-ductility Fe 550D rebar steel' },
  { name: 'Tata Tiscon', category: 'Steel & Rebars', type: 'Direct Sourced Partner', logoText: 'Tata Tiscon', desc: 'Tempcore-processed high tensile rods' },
  { name: 'Astral Pipes', category: 'Plumbing', type: 'Certified Distributor', logoText: 'Astral CPVC', desc: 'Chlorinated PVC pipes & SWR fittings' },
  { name: 'Supreme SWR', category: 'Plumbing', type: 'Wholesale Depot Partner', logoText: 'Supreme SWR', desc: 'Commercial soil & waste pipes' },
  { name: 'Dr. Fixit', category: 'Waterproofing', type: 'Authorized Dealer', logoText: 'Dr. Fixit', desc: 'Integral waterproofing compounds' }
];

export default function PartnersPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'cement',
    plan: 'gold',
    message: ''
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone || !formData.contactPerson) {
      alert('Please fill out all required fields.');
      return;
    }
    setFormStatus('sending');

    // Format message to save as an official lead submission
    const rfqMessage = `PARTNERSHIP TIE-UP ENQUIRY:
    • Company: ${formData.companyName}
    • Contact: ${formData.contactPerson}
    • Plan Requested: ${formData.plan.toUpperCase()}
    • Sourcing Category: ${formData.category.toUpperCase()}
    • Email: ${formData.email}
    • Details: ${formData.message}`;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.contactPerson,
          phone: formData.phone,
          email: formData.email,
          division: 'materials',
          message: rfqMessage
        })
      });

      if (res.ok) {
        setFormStatus('success');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        setFormData({
          companyName: '',
          contactPerson: '',
          phone: '',
          email: '',
          category: 'cement',
          plan: 'gold',
          message: ''
        });
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-24 pb-20">
      
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden border-b border-premium-border/40 bg-gradient-to-b from-[#0d0d16] via-const-orange/5 to-transparent">
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-premium-dark -z-10" />
        <div className="max-w-5xl mx-auto px-6 py-16 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1.5 rounded-full text-xs font-bold text-const-orange uppercase tracking-wider">
            <Handshake className="w-3.5 h-3.5 animate-pulse" />
            <span>Official Dealer & Brand Tie-ups</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            Partner with <span className="text-const-orange">Jay Shree Ram Group</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Gain direct sourcing access, rolling credit lines, and volume-based dispatches from India's leading building material companies. Accelerate your commercial building contracts today.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-20">
        
        {/* 2. Top Companies Branding Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-const-orange tracking-widest uppercase">Brand Affiliations</h2>
            <h3 className="text-2xl font-bold font-display text-white">Authorized Manufacturer Tie-ups</h3>
            <p className="text-xs text-gray-500 max-w-lg mx-auto">We contract directly with leading plants to pass volume-discounts straight to contractors.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRAND_PARTNERS.map((brand, i) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={i}
                className="glassmorphism p-5 rounded-2xl border border-premium-border flex flex-col justify-between min-h-[160px] group transition-all hover:border-const-orange/40"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] bg-white/5 border border-premium-border text-gray-400 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">{brand.category}</span>
                    <span className="text-[8px] text-const-orange font-bold uppercase">{brand.type}</span>
                  </div>
                  <h4 className="text-base font-extrabold font-display text-white mt-3 group-hover:text-const-orange transition-colors">{brand.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{brand.desc}</p>
                </div>
                <div className="pt-3 border-t border-premium-border/40 text-[9px] text-gray-600 font-bold tracking-widest uppercase">
                  ⚡ Factory Direct Supply
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. Partnership Tier Plans Comparison */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-const-orange tracking-widest uppercase font-mono">Partnership Programs</h2>
            <h3 className="text-2xl font-bold font-display text-white">Dealer & Contractor Tie-up Plans</h3>
            <p className="text-xs text-gray-500 max-w-lg mx-auto">Unlock rebates, priority heavy dumpers, and custom credit facilities tailored to your dispatch size.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {PARTNERSHIP_PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`glassmorphism rounded-3xl border ${plan.borderClass} p-8 flex flex-col justify-between relative transition-all duration-300`}
                >
                  {plan.popular && (
                    <span className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-const-orange to-amber-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                      🔥 Most Popular Plan
                    </span>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{plan.name}</h3>
                        <p className="text-[10px] text-gray-500 font-medium">{plan.target}</p>
                      </div>
                    </div>

                    <div className="py-4 border-y border-premium-border/40 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Net Volume Rebates</span>
                        <span className="text-const-orange font-bold font-mono text-sm">{plan.rebates}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Sourcing Credit Limit</span>
                        <span className="text-white font-bold font-mono">{plan.creditLimit}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Fleet Logistics</span>
                        <span className="text-white font-medium text-right text-[10px]">{plan.logistics}</span>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-const-orange shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <a
                      href="#tieup-form"
                      onClick={() => setFormData({ ...formData, plan: plan.id })}
                      className={`block w-full text-center py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-const-orange to-amber-600 text-white shadow-xl hover:scale-102'
                          : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-premium-border'
                      }`}
                    >
                      Apply for {plan.name.split(' ')[0]}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Interactive Registration Form */}
        <section id="tieup-form" className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-const-orange tracking-widest uppercase">Register Sourcing Request</h2>
            <h3 className="text-2xl font-bold font-display text-white">Brand Tie-up Application</h3>
            <p className="text-xs text-gray-500">Submit your firm details below. Our corporate director Bhaiyya Patil will review your GST logs to activate credit lines.</p>
          </div>

          <form onSubmit={handleSubmit} className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahajan Builders & Suppliers"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Mahajan"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 99751 75762"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. info@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Desired Sourcing Material *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#121217] border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                >
                  <option value="cement">Portland OPC/PPC Cement</option>
                  <option value="steel">TMT Structural Steel</option>
                  <option value="sand">Girna/Tapi River Sand & M-Sand</option>
                  <option value="aggregate">Hard Basalt Aggregates & chips</option>
                  <option value="plumbing">Astral/Supreme Plumbing Fittings</option>
                  <option value="bricks">Siporex Blocks & Bricks</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Desired Partnership Plan *</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full bg-[#121217] border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                >
                  <option value="silver">Silver Retailer Plan</option>
                  <option value="gold">Gold Distributor Plan</option>
                  <option value="platinum">Platinum Developer Plan</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Additional details or Sourcing volume</label>
              <textarea
                rows={4}
                placeholder="List your average monthly requirements (e.g. 500 bags cement, 10 MT steel) and delivery city..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
              />
            </div>

            {formStatus === 'success' && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>✓ Partnership application submitted! Our team will contact you within 2 hours.</span>
              </div>
            )}

            {formStatus === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                ⚠️ Sourcing desk error. Please verify your phone number and try again.
              </div>
            )}

            <button
              type="submit"
              disabled={formStatus === 'sending'}
              className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-extrabold text-xs py-4 rounded-xl shadow-lg hover:scale-102 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{formStatus === 'sending' ? 'Reviewing GST & Submitting...' : 'Register Sourcing Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
