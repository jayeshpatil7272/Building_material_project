'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Send, CheckCircle2, Clock, Building2, Truck, Package,
  ChevronDown, AlertCircle, X, Plus, Trash2, ArrowRight, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RFQItem {
  id: string;
  material: string;
  quantity: string;
  unit: string;
  specification: string;
}

const MATERIALS = [
  { value: 'opc-cement', label: 'OPC 53 Cement (UltraTech/ACC)', unit: 'Bags', icon: '🏗️' },
  { value: 'ppc-cement', label: 'PPC Cement (Ambuja/ACC)', unit: 'Bags', icon: '🏗️' },
  { value: 'jsw-steel', label: 'TMT Steel Rebars (JSW Fe550D)', unit: 'MT', icon: '⚙️' },
  { value: 'tata-steel', label: 'TMT Steel Rebars (Tata Tiscon)', unit: 'MT', icon: '⚙️' },
  { value: 'river-sand', label: 'Double-Washed River Sand', unit: 'Brass', icon: '🌊' },
  { value: 'plaster-sand', label: 'Fine Plaster Sand', unit: 'Brass', icon: '🌊' },
  { value: 'msand', label: 'M-Sand (Crushed Basalt)', unit: 'Brass', icon: '🌊' },
  { value: 'aggregate-10mm', label: 'Basalt Aggregates 10mm', unit: 'Brass', icon: '🪨' },
  { value: 'aggregate-20mm', label: 'Basalt Aggregates 20mm', unit: 'Brass', icon: '🪨' },
  { value: 'red-bricks', label: 'Red Clay Bricks (Kiln-Fired)', unit: 'Pcs', icon: '🧱' },
  { value: 'concrete-blocks', label: 'Concrete Hollow Blocks', unit: 'Pcs', icon: '🧱' },
  { value: 'aac-blocks', label: 'AAC / Siporex Blocks', unit: 'Pcs', icon: '🧱' },
  { value: 'waterproofing', label: 'Waterproofing Compound (Dr. Fixit)', unit: 'Litre', icon: '💧' },
  { value: 'ready-mix', label: 'Ready-Mix Concrete (RMC)', unit: 'Cum', icon: '🏗️' },
];

const URGENCY_OPTIONS = [
  { value: 'standard', label: 'Standard (5-7 Days)', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { value: 'priority', label: 'Priority (2-3 Days)', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { value: 'urgent', label: 'Urgent (Same Day)', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
];

let idCounter = 1;
function genId() { return `item-${Date.now()}-${idCounter++}`; }

export default function RFQPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [items, setItems] = useState<RFQItem[]>([
    { id: genId(), material: 'opc-cement', quantity: '', unit: 'Bags', specification: '' }
  ]);
  const [projectName, setProjectName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState('');
  const [urgency, setUrgency] = useState('standard');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [rfqId, setRfqId] = useState('');

  // Prefill user data
  useEffect(() => {
    if (user) {
      setContactName(user.name || '');
      setContactPhone(user.phone || '');
      setContactEmail(user.email || '');
    }
  }, [user]);

  const addItem = () => {
    setItems(prev => [...prev, { id: genId(), material: 'river-sand', quantity: '', unit: 'Brass', specification: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof RFQItem, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'material') {
        const mat = MATERIALS.find(m => m.value === value);
        if (mat) updated.unit = mat.unit;
      }
      return updated;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      alert('Please fill Name and Phone number.');
      return;
    }
    if (items.some(i => !i.quantity)) {
      alert('Please enter quantity for all materials.');
      return;
    }
    setStatus('sending');

    const newRfqId = `RFQ-${Date.now().toString(36).toUpperCase()}`;
    const itemsSummary = items.map(i => {
      const mat = MATERIALS.find(m => m.value === i.material);
      return `• ${mat?.label}: ${i.quantity} ${i.unit}${i.specification ? ' [Spec: ' + i.specification + ']' : ''}`;
    }).join('\n');

    const message = `=== REQUEST FOR QUOTATION ===
RFQ ID: ${newRfqId}
Project: ${projectName || 'N/A'}
Urgency: ${urgency.toUpperCase()}
Delivery Address: ${deliveryAddress}
Delivery Distance: ${deliveryDistance} km

MATERIALS REQUIRED:
${itemsSummary}

ADDITIONAL NOTES: ${notes || 'None'}`;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
          division: 'materials',
          message
        })
      });

      if (res.ok) {
        setRfqId(newRfqId);
        setStatus('success');
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-24 h-24 mx-auto bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </motion.div>
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold font-display text-white">RFQ Submitted Successfully!</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your Request for Quotation has been received by our dispatch desk. 
            Our pricing team will respond within <span className="text-const-orange font-bold">2 business hours</span>.
          </p>
        </div>
        <div className="glassmorphism border border-premium-border rounded-2xl p-6 space-y-3">
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Your RFQ Reference Number</div>
          <div className="text-2xl font-extrabold text-const-orange font-mono tracking-wider">{rfqId}</div>
          <p className="text-xs text-gray-400">Save this ID for tracking your quotation status.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => { setStatus('idle'); setItems([{ id: genId(), material: 'opc-cement', quantity: '', unit: 'Bags', specification: '' }]); }}
            className="px-6 py-3 bg-const-orange text-white text-xs font-bold rounded-xl hover:scale-105 transition-transform"
          >
            Submit Another RFQ
          </button>
          <a
            href={`https://wa.me/918010871044?text=Hi, I submitted RFQ ${rfqId}. Please share the quotation.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white text-xs font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center space-x-2"
          >
            <span>Follow up on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1.5 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
          <FileText className="w-3.5 h-3.5" />
          <span>B2B Procurement</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          Request for Quotation
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed">
          Submit a structured RFQ for bulk material procurement. Our team will respond with a comprehensive commercial offer within 2 hours.
        </p>
      </section>

      {/* Process Steps */}
      <div className="flex items-center justify-center space-x-4 text-xs font-bold text-gray-500">
        {[
          { icon: FileText, label: 'Fill RFQ Form', active: true },
          { icon: Send, label: 'Our Team Reviews', active: false },
          { icon: Clock, label: 'Quote in 2 Hours', active: false },
          { icon: CheckCircle2, label: 'Order Confirmed', active: false },
        ].map((step, i) => (
          <React.Fragment key={step.label}>
            <div className={`flex items-center space-x-1.5 ${step.active ? 'text-const-orange' : 'text-gray-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${step.active ? 'bg-const-orange border-const-orange text-white' : 'border-gray-700'}`}>
                <step.icon className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:block">{step.label}</span>
            </div>
            {i < 3 && <div className="flex-1 h-px bg-gray-800 max-w-[40px]" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact & Project Info */}
        <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6">
          <h2 className="text-base font-bold text-white border-b border-premium-border/40 pb-3 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-const-orange" />
            <span>Company & Contact Details</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Project / Company Name</label>
              <input
                type="text"
                placeholder="e.g. Sunrise Township Phase 2"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact Name *</label>
              <input
                type="text"
                required
                placeholder="Full name"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 XXXXX XXXXX"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="business@example.com"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange transition-colors"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delivery Site Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. Survey No 45, Near Highway, Jalgaon - 425001"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Approx. Distance from Bhadgaon (KM)</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={deliveryDistance}
                onChange={e => setDeliveryDistance(e.target.value)}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delivery Urgency</label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value)}
                className="w-full bg-[#121217] border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange transition-colors"
              >
                {URGENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Materials Needed */}
        <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6">
          <div className="flex items-center justify-between border-b border-premium-border/40 pb-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Package className="w-4 h-4 text-const-orange" />
              <span>Materials Required</span>
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center space-x-1.5 text-[10px] font-bold text-const-orange bg-const-orange/10 border border-const-orange/20 px-3 py-1.5 rounded-full hover:bg-const-orange/20 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Material</span>
            </button>
          </div>

          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/3 border border-premium-border/60 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-const-orange font-bold uppercase tracking-wider">
                    Material #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-3 md:col-span-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Material Type *</label>
                    <select
                      value={item.material}
                      onChange={e => updateItem(item.id, 'material', e.target.value)}
                      className="w-full bg-[#121217] border border-premium-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                    >
                      {MATERIALS.map(m => (
                        <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 500"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      className="w-full bg-white/5 border border-premium-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Unit</label>
                    <input
                      type="text"
                      readOnly
                      value={item.unit}
                      className="w-full bg-white/3 border border-premium-border/40 rounded-xl px-3 py-2.5 text-xs text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Additional Specification (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 53 Grade OPC, 12mm dia, Coarse Grade, etc."
                    value={item.specification}
                    onChange={e => updateItem(item.id, 'specification', e.target.value)}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Additional Notes + Submit */}
        <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6">
          <h2 className="text-base font-bold text-white border-b border-premium-border/40 pb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-const-orange" />
            <span>Special Instructions & Terms</span>
          </h2>
          <textarea
            rows={4}
            placeholder="Any special requirements, phased delivery schedule, payment terms preference, brand preferences, etc."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange transition-colors resize-none"
          />

          {/* Urgency Visual Display */}
          <div className="grid grid-cols-3 gap-3">
            {URGENCY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setUrgency(opt.value)}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${urgency === opt.value ? opt.bg + ' ' + opt.color : 'bg-white/3 border-premium-border text-gray-500 hover:bg-white/5'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {status === 'error' && (
            <div className="flex items-center space-x-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-400 font-semibold">Failed to submit RFQ. Please check your details and try again.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="flex-1 bg-gradient-to-r from-const-orange to-amber-600 text-white font-extrabold text-sm py-4 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {status === 'sending' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting RFQ...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Request for Quotation</span>
                </>
              )}
            </button>
            <a
              href={`https://wa.me/918010871044?text=Hi, I want to request a bulk quotation for building materials. Please assist.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-green-600/20 border border-green-600/30 text-green-400 font-bold text-xs py-4 px-6 rounded-2xl hover:bg-green-600/30 transition-colors"
            >
              <span>WhatsApp Instead</span>
            </a>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-const-orange shrink-0" />
            <span>All submissions are secure & confidential. Response within 2 business hours by our pricing team.</span>
          </div>
        </div>
      </form>
    </div>
  );
}
