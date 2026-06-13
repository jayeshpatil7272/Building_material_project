'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Award, Briefcase, FileText, CheckCircle, ShieldCheck, MapPin, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Project {
  id: string;
  category: 'Infrastructure' | 'Commercial' | 'Industrial';
  title_en: string;
  title_hi: string;
  title_mr: string;
  status: 'Completed' | 'Ongoing';
  details_en: string;
  details_hi: string;
  details_mr: string;
  image: string;
}

export default function ProjectsPage() {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'Completed' | 'Ongoing'>('all');
  const [showRegModal, setShowRegModal] = useState(false);

  // Form State
  const [regForm, setRegForm] = useState({
    firmName: '',
    contactName: '',
    phone: '',
    email: '',
    role: 'dealer', // dealer / vendor / transporter
    address: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const projects: Project[] = [
    {
      id: 'proj-1',
      category: 'Infrastructure',
      title_en: 'Jalgaon Bypass Bridge Reinforcement',
      title_hi: 'जलगांव बाईपास ब्रिज सुदृढीकरण',
      title_mr: 'जळगाव बायपास पूल मजबुतीकरण',
      status: 'Completed',
      details_en: 'Supplied 500+ metric tons of Fe 550D JSW Neosteel rebars & heavy aggregates for structural durability.',
      details_hi: 'संरचनात्मक स्थायित्व के लिए 500+ मीट्रिक टन Fe 550D JSW नियोस्टील सरिया और भारी गिट्टी की आपूर्ति की गई।',
      details_mr: 'पूल बांधकामासाठी ५०० टन पेक्षा जास्त जेएसडब्ल्यू टीएमटी स्टील आणि खडीचा पुरवठा यशस्वीरीत्या पूर्ण.',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'proj-2',
      category: 'Commercial',
      title_en: 'Bhadgaon Premium Housing Complex',
      title_hi: 'भड़गांव प्रीमियम हाउसिंग कॉम्प्लेक्स',
      title_mr: 'भडगाव प्रीमियम गृहनिर्माण प्रकल्प',
      status: 'Ongoing',
      details_en: 'Consistently supplying UltraTech PPC cement (over 20,000 bags) & double-washed river sand phases.',
      details_hi: 'लगातार अल्ट्राटेक पीपीसी सीमेंट (20,000 से अधिक बैग) और डबल-धुली नदी की रेत की चरणबद्ध आपूर्ति।',
      details_mr: '२०,००० पेक्षा जास्त सिमेंट पोती आणि धुतलेल्या वाळूचा टप्प्याटप्प्याने पुरवठा सुरू आहे.',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'proj-3',
      category: 'Industrial',
      title_en: 'Girad Central Warehousing Terminals',
      title_hi: 'गिरड केंद्रीय भंडारण टर्मिनल',
      title_mr: 'गिरड वेअरहाउसिंग टर्मिनल',
      status: 'Completed',
      details_en: 'Supplied high-volume foundation Ready-Mix Concrete batches, brick masonry, and structural additives.',
      details_hi: 'उच्च-मात्रा वाले फाउंडेशन रेडी-मिक्स कंक्रीट बैच, ईंट चिनाई और संरचनात्मक रसायनों की आपूर्ति की गई।',
      details_mr: 'गोदामाच्या पायाभरणीसाठी आवश्यक आरएमसी काँक्रीट आणि विटांच्या संपूर्ण साहित्याचा यशस्वी पुरवठा.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'proj-4',
      category: 'Infrastructure',
      title_en: 'Pachora Corridor Road Expansion',
      title_hi: 'पाचोरा कॉरिडोर सड़क विस्तार',
      title_mr: 'पाचोरा रस्ता रुंदीकरण प्रकल्प',
      status: 'Ongoing',
      details_en: 'Active logistics dispatch, dropping aggregates and washed plaster sand coordinates continuously.',
      details_hi: 'सक्रिय रसद प्रेषण, लगातार गिट्टी और धुली हुई प्लास्टर रेत को गिराना।',
      details_mr: 'रस्ता रुंदीकरणासाठी खडी आणि प्लास्टर वाळूचा सातत्याने पुरवठा सुरू आहे.',
      image: 'https://images.unsplash.com/photo-1501700490588-4577880f3392?w=500&auto=format&fit=crop&q=80'
    }
  ];

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter);

  const getLocalizedTitle = (p: Project) => {
    return language === 'hi' ? p.title_hi : language === 'mr' ? p.title_mr : p.title_en;
  };

  const getLocalizedDetails = (p: Project) => {
    return language === 'hi' ? p.details_hi : language === 'mr' ? p.details_mr : p.details_en;
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.firmName || !regForm.phone) {
      alert('Please fill out Firm Name and Phone fields.');
      return;
    }
    setSubmitStatus('sending');

    try {
      const submission = {
        name: regForm.contactName || regForm.firmName,
        email: regForm.email,
        phone: regForm.phone,
        division: 'general',
        message: `DEALER/VENDOR REGISTRATION: Firm: ${regForm.firmName}. Partner Role: ${regForm.role}. Address: ${regForm.address}. Message: ${regForm.message}`
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });

      if (res.ok) {
        setSubmitStatus('success');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setRegForm({
          firmName: '',
          contactName: '',
          phone: '',
          email: '',
          role: 'dealer',
          address: '',
          message: ''
        });
        setTimeout(() => {
          setShowRegModal(false);
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-24">
      {/* Header */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Case Studies</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          Supplied Projects & Infrastructure
        </h1>
        <p className="text-sm text-gray-400">
          Explore key commercial, infrastructure, and industrial developments in Jalgaon district supplied with materials from JSR Group.
        </p>
      </section>

      {/* Controls & Projects Grid */}
      <section className="space-y-8">
        <div className="flex justify-between items-center border-b border-premium-border pb-4 flex-wrap gap-4">
          <div className="flex gap-2">
            {[
              { code: 'all', label: 'All Projects' },
              { code: 'Completed', label: 'Completed Site Works' },
              { code: 'Ongoing', label: 'Active Dispatches' }
            ].map((t) => (
              <button
                key={t.code}
                onClick={() => setFilter(t.code as any)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                  filter === t.code
                    ? 'bg-const-orange text-white border-transparent'
                    : 'bg-white/5 text-gray-300 border-premium-border hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRegModal(true)}
            className="bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs tracking-wider px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            Register as Dealer / Transporter
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="glassmorphism rounded-3xl overflow-hidden border border-premium-border flex flex-col md:flex-row hover:border-const-orange/30 transition-colors"
            >
              {/* Image */}
              <div className="w-full md:w-2/5 h-48 md:h-auto relative bg-black/40">
                <img src={p.image} alt={p.title_en} className="w-full h-full object-cover opacity-60" />
                <span className={`absolute top-4 left-4 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  p.status === 'Completed'
                    ? 'bg-green-500/15 border-green-500/30 text-green-400'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                }`}>
                  {p.status}
                </span>
              </div>

              {/* Specs */}
              <div className="p-6 md:w-3/5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[8px] bg-white/10 text-gray-300 border border-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                    {p.category}
                  </span>
                  <h3 className="text-base font-extrabold text-white">{getLocalizedTitle(p)}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{getLocalizedDetails(p)}</p>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] text-gray-500 font-semibold mt-4">
                  <MapPin className="w-3.5 h-3.5 text-const-orange" />
                  <span>Jalgaon Region Operations</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Network Highlights */}
      <section className="glassmorphism p-12 rounded-3xl border border-premium-border/80 text-center space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-display text-white">Join Our Materials Distribution Network</h2>
        <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
          We partner with retail building outlets, hardware stores, sub-contractors, and heavy cargo dumpers to expand infrastructure dispatches. Register to coordinate bulk wholesale pricing brackets.
        </p>
        <button
          onClick={() => setShowRegModal(true)}
          className="bg-white/5 border border-premium-border hover:bg-const-orange text-white hover:text-white transition-all text-xs font-bold px-8 py-3.5 rounded-xl inline-flex items-center space-x-2"
        >
          <span>Open Partner Registry Desk</span>
        </button>
      </section>

      {/* Dealer Registry Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glassmorphism border border-premium-border max-w-lg w-full rounded-3xl p-8 space-y-6 animate-fadeIn relative">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-full border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[9px] text-const-orange font-bold uppercase tracking-wider">Partnership Desk</span>
              <h2 className="text-xl font-bold text-white">Register as Dealer / Vendor</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect with Mr. Bhaiyya Patil’s supply chain. Fill details and our corporate operations office will review coordinates in 24 hours.
              </p>
            </div>

            <form onSubmit={handleRegSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Store / Firm Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JSR Hardware"
                    value={regForm.firmName}
                    onChange={(e) => setRegForm({ ...regForm, firmName: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={regForm.contactName}
                    onChange={(e) => setRegForm({ ...regForm, contactName: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Partnership Type *</label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    className="w-full bg-[#121217] border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  >
                    <option value="dealer">Sub-Dealer / Retail outlet</option>
                    <option value="vendor">Heavy Material Supplier</option>
                    <option value="transporter">Cargo Transit / Fleet partner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-semibold">Outlet / Office Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Girad Main Chowk, Bhadgaon"
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-semibold">Business Message / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Details about your active distribution volumes..."
                  value={regForm.message}
                  onChange={(e) => setRegForm({ ...regForm, message: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold">
                  ✓ Registration submitted! Operations team will contact you.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                  ⚠️ Submission failed. Please verify phone number.
                </div>
              )}

              <button
                type="submit"
                disabled={submitStatus === 'sending'}
                className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg"
              >
                {submitStatus === 'sending' ? 'Processing...' : 'Register to Partner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
