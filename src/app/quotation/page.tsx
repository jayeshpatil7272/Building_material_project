'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Calculator, ShieldCheck, Truck, ArrowRight, X, Hammer, ClipboardList } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuotationPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Active Calculator Tab: 'materials' | 'works'
  const [calculatorTab, setCalculatorTab] = useState<'materials' | 'works'>('materials');

  // Active calculator parameters (Materials Supply)
  const [cementType, setCementType] = useState<'ppc' | 'opc'>('ppc');
  const [cementQty, setCementQty] = useState<number>(0);

  const [steelBrand, setSteelBrand] = useState<'jsw' | 'tata'>('jsw');
  const [steelQty, setSteelQty] = useState<number>(0); // in metric tons

  const [sandType, setSandType] = useState<'river' | 'plaster' | 'msand'>('river');
  const [sandQty, setSandQty] = useState<number>(0); // in brass

  const [aggregateType, setAggregateType] = useState<'10mm' | '20mm' | 'gsb'>('20mm');
  const [aggregateQty, setAggregateQty] = useState<number>(0); // in brass

  const [brickType, setBrickType] = useState<'clay' | 'block' | 'aac'>('clay');
  const [brickQty, setBrickQty] = useState<number>(0); // count

  // Active calculator parameters (Civil Construction Work)
  const [workType, setWorkType] = useState<'slab' | 'brick' | 'plaster' | 'excavation'>('slab');
  const [workArea, setWorkArea] = useState<number>(0); // in square feet

  const [distance, setDistance] = useState<number>(5); // in km

  // Modal Inquiry Form State
  const [showInqModal, setShowInqModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Prefill lead coordinates if user is logged in
  useEffect(() => {
    if (user && showInqModal) {
      setLeadForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user, showInqModal]);

  // Dealer discount check (8% off base prices)
  const isDealer = user?.role === 'dealer';
  const dealerDiscount = isDealer ? 0.92 : 1;

  // Pricing Base Rates
  const PPC_RATE = 380; // per bag
  const OPC_RATE = 430; // per bag
  const JSW_STEEL_RATE = 64000; // per ton
  const TATA_STEEL_RATE = 68000; // per ton

  const SAND_CONFIG = {
    river: { name: 'Girna River Double-Washed Sand', baseRate: 6500, surcharge: 50 },
    plaster: { name: 'Tapi River Plaster Sand', baseRate: 5500, surcharge: 45 },
    msand: { name: 'Concrete M-Sand (Crushed Basalt)', baseRate: 4800, surcharge: 40 }
  };

  const AGGREGATE_CONFIG = {
    '10mm': { name: '10mm Basalt Aggregates', baseRate: 4000, surcharge: 38 },
    '20mm': { name: '20mm Basalt Aggregates', baseRate: 4200, surcharge: 40 },
    'gsb': { name: 'Basalt GSB Aggregates', baseRate: 3200, surcharge: 35 }
  };

  const BRICK_CONFIG = {
    clay: { name: 'Red Clay Bricks', baseRate: 7.5, surcharge: 0.10 },
    block: { name: 'Concrete Hollow Blocks', baseRate: 38, surcharge: 0.50 },
    aac: { name: 'Siporex AAC Blocks', baseRate: 110, surcharge: 1.20 }
  };

  // Logistics Transit Surcharges per unit per kilometer
  const SURCHARGE_CEMENT = 2; // per bag / km
  const SURCHARGE_STEEL = 150; // per ton / km

  // Distance-Wise Dynamic Rates calculation
  const rawBaseCementRate = cementType === 'ppc' ? PPC_RATE : OPC_RATE;
  const baseCementRate = rawBaseCementRate * dealerDiscount;
  const transitCementSurcharge = distance * SURCHARGE_CEMENT;
  const effectiveCementRate = baseCementRate + transitCementSurcharge;

  const rawBaseSteelRate = steelBrand === 'jsw' ? JSW_STEEL_RATE : TATA_STEEL_RATE;
  const baseSteelRate = rawBaseSteelRate * dealerDiscount;
  const transitSteelSurcharge = distance * SURCHARGE_STEEL;
  const effectiveSteelRate = baseSteelRate + transitSteelSurcharge;

  const rawBaseSandRate = SAND_CONFIG[sandType].baseRate;
  const baseSandRate = rawBaseSandRate * dealerDiscount;
  const transitSandSurcharge = distance * SAND_CONFIG[sandType].surcharge;
  const effectiveSandRate = baseSandRate + transitSandSurcharge;

  const rawBaseAggregateRate = AGGREGATE_CONFIG[aggregateType].baseRate;
  const baseAggregateRate = rawBaseAggregateRate * dealerDiscount;
  const transitAggregateSurcharge = distance * AGGREGATE_CONFIG[aggregateType].surcharge;
  const effectiveAggregateRate = baseAggregateRate + transitAggregateSurcharge;

  const rawBaseBrickRate = BRICK_CONFIG[brickType].baseRate;
  const baseBrickRate = rawBaseBrickRate * dealerDiscount;
  const transitBrickSurcharge = distance * BRICK_CONFIG[brickType].surcharge;
  const effectiveBrickRate = baseBrickRate + transitBrickSurcharge;

  // Final Material supply costs
  const cementCost = cementQty * effectiveCementRate;
  const steelCost = steelQty * effectiveSteelRate;
  const sandCost = sandQty * effectiveSandRate;
  const aggregateCost = aggregateQty * effectiveAggregateRate;
  const brickCost = brickQty * effectiveBrickRate;

  // Civil contractor work details configurations
  const worksConfig = {
    slab: { name: 'Concrete Slab Casting (Labor + Materials)', baseRate: 350, surchargePerKm: 1.5, unit: 'sq.ft' },
    brick: { name: 'Brick Masonry Work (Labor + Materials)', baseRate: 120, surchargePerKm: 0.5, unit: 'sq.ft' },
    plaster: { name: 'Plastering Work (Labor + Materials)', baseRate: 45, surchargePerKm: 0.2, unit: 'sq.ft' },
    excavation: { name: 'Excavation & Foundations', baseRate: 25, surchargePerKm: 0.1, unit: 'sq.ft' }
  };

  const baseWorkRate = worksConfig[workType].baseRate;
  const transitWorkSurcharge = distance * worksConfig[workType].surchargePerKm;
  const effectiveWorkRate = baseWorkRate + transitWorkSurcharge;
  const workCost = workArea * effectiveWorkRate;

  // Dynamic cost totals mapping
  const subtotal = calculatorTab === 'materials'
    ? (cementCost + steelCost + sandCost + aggregateCost + brickCost)
    : workCost;

  const gstEstimate = Math.round(subtotal * 0.18); // 18% GST estimate
  const grandTotal = subtotal + gstEstimate;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      alert('Please fill out Name and Phone fields.');
      return;
    }
    setSubmitStatus('sending');

    try {
      let summaryMsg = '';
      if (calculatorTab === 'materials') {
        summaryMsg = `Calculated Estimate details (Material Supply):
- Cement: ${cementQty} bags (${cementType.toUpperCase()}) - ₹${cementCost.toLocaleString()} (Rate: ₹${effectiveCementRate}/bag, includes ₹${transitCementSurcharge} transit)
- Steel: ${steelQty} Tons (${steelBrand.toUpperCase()}) - ₹${steelCost.toLocaleString()} (Rate: ₹${effectiveSteelRate}/ton, includes ₹${transitSteelSurcharge} transit)
- Sand: ${sandQty} Brass (${SAND_CONFIG[sandType].name}) - ₹${sandCost.toLocaleString()} (Rate: ₹${effectiveSandRate}/brass, includes ₹${transitSandSurcharge} transit)
- Aggregates: ${aggregateQty} Brass (${AGGREGATE_CONFIG[aggregateType].name}) - ₹${aggregateCost.toLocaleString()} (Rate: ₹${effectiveAggregateRate}/brass, includes ₹${transitAggregateSurcharge} transit)
- Bricks/Blocks: ${brickQty} pcs (${BRICK_CONFIG[brickType].name}) - ₹${brickCost.toLocaleString()} (Rate: ₹${effectiveBrickRate.toFixed(2)}/pc, includes ₹${transitBrickSurcharge.toFixed(2)} transit)
- Logistics Radius: ${distance} km
- Est. Subtotal: ₹${subtotal.toLocaleString()}
- GST (18%): ₹${gstEstimate.toLocaleString()}
- Estimated Total: ₹${grandTotal.toLocaleString()}`;
      } else {
        summaryMsg = `Calculated Estimate details (Civil Construction Work):
- Work Type: ${worksConfig[workType].name}
- Area: ${workArea} Sq.Ft
- Effective Rate: ₹${effectiveWorkRate}/sq.ft (Base: ₹${baseWorkRate}, Transit Surcharge: ₹${transitWorkSurcharge})
- Logistics Radius: ${distance} km
- Est. Subtotal: ₹${subtotal.toLocaleString()}
- GST (18%): ₹${gstEstimate.toLocaleString()}
- Estimated Total: ₹${grandTotal.toLocaleString()}`;
      }

      const submission = {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        division: 'materials',
        message: `QUOTE CALCULATOR SUBMISSION: Contact: ${leadForm.name}. Address: ${leadForm.address}. Details:\n${summaryMsg}`
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
        setLeadForm({ name: '', phone: '', email: '', address: '' });
        setTimeout(() => {
          setShowInqModal(false);
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
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
          <Calculator className="w-3.5 h-3.5" />
          <span>Interactive Quotation Portal</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          Commercial Cost Estimator
        </h1>
        <p className="text-sm text-gray-400">
          Calculate real-time distance-wise logistics costings for wholesale material dispatches or custom structural engineering works.
        </p>
      </section>

      {/* Dynamic Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-[#121217] border border-premium-border/80 p-1.5 rounded-2xl flex space-x-1.5 shadow-2xl">
          <button
            onClick={() => setCalculatorTab('materials')}
            className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all ${
              calculatorTab === 'materials'
                ? 'bg-const-orange text-white shadow-lg shadow-const-orange/20 scale-102 font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Material Supply Cost</span>
          </button>
          <button
            onClick={() => setCalculatorTab('works')}
            className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all ${
              calculatorTab === 'works'
                ? 'bg-const-orange text-white shadow-lg shadow-const-orange/20 scale-102 font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span>Civil Construction Work</span>
          </button>
        </div>
      </div>

      {/* Grid: Estimator form + Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input sliders and selectors */}
        <div className="lg:col-span-7 glassmorphism p-8 rounded-3xl border border-premium-border space-y-8">
          <h3 className="text-lg font-bold text-white border-b border-premium-border/60 pb-3 flex items-center justify-between">
            <span>{calculatorTab === 'materials' ? 'Define Quantities' : 'Contractor Work Specifications'}</span>
            <span className="text-[10px] text-gray-500 font-semibold font-mono">Rates subject to logistics coordinates</span>
          </h3>

          {calculatorTab === 'materials' ? (
            <div className="space-y-6">
              {/* Cement */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">OPC / PPC Cement</label>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Base: ₹{baseCementRate} + Transit: ₹{transitCementSurcharge} = ₹{effectiveCementRate} / bag
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCementType('ppc')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        cementType === 'ppc' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      PPC (₹380)
                    </button>
                    <button
                      onClick={() => setCementType('opc')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        cementType === 'opc' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      OPC 53 (₹430)
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={cementQty}
                    onChange={(e) => setCementQty(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-const-orange"
                  />
                  <input
                    type="number"
                    min="0"
                    value={cementQty}
                    onChange={(e) => setCementQty(Number(e.target.value))}
                    className="bg-white/5 border border-premium-border rounded-xl text-center text-xs font-bold text-white px-2 py-1.5 w-20 focus:outline-none focus:border-const-orange"
                  />
                  <span className="text-xs text-gray-500 font-bold w-12">Bags</span>
                </div>
              </div>

              {/* Steel Rebars */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">TMT Steel Rebars</label>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Base: ₹{baseSteelRate.toLocaleString()} + Transit: ₹{transitSteelSurcharge.toLocaleString()} = ₹{effectiveSteelRate.toLocaleString()} / ton
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSteelBrand('jsw')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        steelBrand === 'jsw' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      JSW (₹64k)
                    </button>
                    <button
                      onClick={() => setSteelBrand('tata')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        steelBrand === 'tata' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      Tata Tiscon (₹68k)
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={steelQty}
                    onChange={(e) => setSteelQty(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-const-orange"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={steelQty}
                    onChange={(e) => setSteelQty(Number(e.target.value))}
                    className="bg-white/5 border border-premium-border rounded-xl text-center text-xs font-bold text-white px-2 py-1.5 w-20 focus:outline-none focus:border-const-orange"
                  />
                  <span className="text-xs text-gray-500 font-bold w-12">Tons</span>
                </div>
              </div>

              {/* River Sand */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">Sand Type</label>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Base: ₹{baseSandRate.toLocaleString()} + Transit: ₹{transitSandSurcharge.toLocaleString()} = ₹{effectiveSandRate.toLocaleString()} / brass
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSandType('river')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        sandType === 'river' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      River (₹6.5k)
                    </button>
                    <button
                      onClick={() => setSandType('plaster')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        sandType === 'plaster' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      Plaster (₹5.5k)
                    </button>
                    <button
                      onClick={() => setSandType('msand')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        sandType === 'msand' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      M-Sand (₹4.8k)
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={sandQty}
                    onChange={(e) => setSandQty(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-const-orange"
                  />
                  <input
                    type="number"
                    min="0"
                    value={sandQty}
                    onChange={(e) => setSandQty(Number(e.target.value))}
                    className="bg-white/5 border border-premium-border rounded-xl text-center text-xs font-bold text-white px-2 py-1.5 w-20 focus:outline-none focus:border-const-orange"
                  />
                  <span className="text-xs text-gray-500 font-bold w-12">Brass</span>
                </div>
              </div>

              {/* Aggregates */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">Crushed Basalt Aggregates</label>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Base: ₹{baseAggregateRate.toLocaleString()} + Transit: ₹{transitAggregateSurcharge.toLocaleString()} = ₹{effectiveAggregateRate.toLocaleString()} / brass
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAggregateType('10mm')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        aggregateType === '10mm' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      10mm (₹4k)
                    </button>
                    <button
                      onClick={() => setAggregateType('20mm')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        aggregateType === '20mm' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      20mm (₹4.2k)
                    </button>
                    <button
                      onClick={() => setAggregateType('gsb')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        aggregateType === 'gsb' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      GSB (₹3.2k)
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={aggregateQty}
                    onChange={(e) => setAggregateQty(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-const-orange"
                  />
                  <input
                    type="number"
                    min="0"
                    value={aggregateQty}
                    onChange={(e) => setAggregateQty(Number(e.target.value))}
                    className="bg-white/5 border border-premium-border rounded-xl text-center text-xs font-bold text-white px-2 py-1.5 w-20 focus:outline-none focus:border-const-orange"
                  />
                  <span className="text-xs text-gray-500 font-bold w-12">Brass</span>
                </div>
              </div>

              {/* Bricks & blocks */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">Bricks & Concrete Blocks</label>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Base: ₹{baseBrickRate} + Transit: ₹{transitBrickSurcharge.toFixed(2)} = ₹{effectiveBrickRate.toFixed(2)} / pc
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBrickType('clay')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        brickType === 'clay' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      Red Clay (₹7.5)
                    </button>
                    <button
                      onClick={() => setBrickType('block')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        brickType === 'block' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      Concrete (₹38)
                    </button>
                    <button
                      onClick={() => setBrickType('aac')}
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border transition-all ${
                        brickType === 'aac' ? 'bg-const-orange border-transparent text-white' : 'bg-white/5 border-premium-border text-gray-400'
                      }`}
                    >
                      AAC (₹110)
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    step="500"
                    value={brickQty}
                    onChange={(e) => setBrickQty(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-const-orange"
                  />
                  <input
                    type="number"
                    min="0"
                    value={brickQty}
                    onChange={(e) => setBrickQty(Number(e.target.value))}
                    className="bg-white/5 border border-premium-border rounded-xl text-center text-xs font-bold text-white px-2 py-1.5 w-20 focus:outline-none focus:border-const-orange"
                  />
                  <span className="text-xs text-gray-500 font-bold w-12">Pcs</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              {/* Selector of Works */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider">Select Construction Task</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(worksConfig).map(([key, item]) => {
                    const isSelected = workType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setWorkType(key as any)}
                        className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${
                          isSelected
                            ? 'bg-const-orange/15 border-const-orange text-white'
                            : 'bg-white/3 border-premium-border hover:bg-white/6 text-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white uppercase tracking-wide truncate">{key === 'slab' ? 'Slab Casting' : key === 'brick' ? 'Brick Masonry' : key === 'plaster' ? 'Plastering' : 'Excavation'}</span>
                          <span className="text-[10px] text-const-orange font-bold font-mono">₹{item.baseRate}/sq.ft</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-normal truncate">{item.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Work Area Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">Total Work Area</label>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Base Rate: ₹{baseWorkRate}/sq.ft + Surcharge: ₹{transitWorkSurcharge.toFixed(2)}/sq.ft = ₹{effectiveWorkRate.toFixed(2)} / sq.ft
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="50"
                    value={workArea}
                    onChange={(e) => setWorkArea(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-const-orange"
                  />
                  <input
                    type="number"
                    min="0"
                    value={workArea}
                    onChange={(e) => setWorkArea(Number(e.target.value))}
                    className="bg-white/5 border border-premium-border rounded-xl text-center text-xs font-bold text-white px-2 py-1.5 w-20 focus:outline-none focus:border-const-orange"
                  />
                  <span className="text-xs text-gray-500 font-bold w-12">Sq.Ft</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery logistics radius (Common Input) */}
          <div className="space-y-3 border-t border-premium-border/40 pt-6">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Logistics Delivery Coordinates Radius</label>
              <span className="text-[10px] text-const-orange font-bold font-mono">Radius: {distance} KM</span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-const-orange"
              />
              <input
                type="number"
                min="0"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="bg-white/5 border border-premium-border rounded-xl text-center text-xs font-bold text-white px-2 py-1.5 w-20 focus:outline-none focus:border-const-orange"
              />
              <span className="text-xs text-gray-500 font-bold w-12">KM</span>
            </div>
            <p className="text-[9px] text-gray-500 leading-normal">
              Transit Logistics surcharges are computed per unit per kilometer from our stockyards at Girad, Taluka Bhadgaon. Double-washed river sand contains heavier logistics factors.
            </p>
          </div>
        </div>

        {/* Right: Cost summary details sheet */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-premium-border/60 pb-3 flex items-center justify-between">
              <span>Estimate Summary</span>
              <span className="text-xs bg-green-500/10 border border-green-500/30 text-green-400 font-bold px-2 py-0.5 rounded uppercase">Estimated</span>
            </h3>

            {isDealer && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-400 font-bold flex items-center justify-between mb-4">
                <span>⚡ Dealer Tier Discount Applied (8% Off Base Rates)</span>
                <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Silver</span>
              </div>
            )}

            {calculatorTab === 'materials' ? (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Cement ({cementQty} Bags)</span>
                    <span className="text-white">₹{cementCost.toLocaleString()}</span>
                  </div>
                  {cementQty > 0 && (
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>Rate: ₹{effectiveCementRate}/bag</span>
                      <span>(Base ₹{baseCementRate} + Transit ₹{transitCementSurcharge})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>TMT Steel ({steelQty} Tons)</span>
                    <span className="text-white">₹{steelCost.toLocaleString()}</span>
                  </div>
                  {steelQty > 0 && (
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>Rate: ₹{effectiveSteelRate.toLocaleString()}/ton</span>
                      <span>(Base ₹{baseSteelRate.toLocaleString()} + Transit ₹{transitSteelSurcharge.toLocaleString()})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>{SAND_CONFIG[sandType].name} ({sandQty} Brass)</span>
                    <span className="text-white">₹{sandCost.toLocaleString()}</span>
                  </div>
                  {sandQty > 0 && (
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>Rate: ₹{effectiveSandRate.toLocaleString()}/brass</span>
                      <span>(Base ₹{baseSandRate.toLocaleString()} + Transit ₹{transitSandSurcharge.toLocaleString()})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>{AGGREGATE_CONFIG[aggregateType].name} ({aggregateQty} Brass)</span>
                    <span className="text-white">₹{aggregateCost.toLocaleString()}</span>
                  </div>
                  {aggregateQty > 0 && (
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>Rate: ₹{effectiveAggregateRate.toLocaleString()}/brass</span>
                      <span>(Base ₹{baseAggregateRate.toLocaleString()} + Transit ₹{transitAggregateSurcharge.toLocaleString()})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-gray-400 border-b border-premium-border/40 pb-2">
                    <span>{BRICK_CONFIG[brickType].name} ({brickQty} Pcs)</span>
                    <span className="text-white">₹{brickCost.toLocaleString()}</span>
                  </div>
                  {brickQty > 0 && (
                    <div className="flex justify-between text-[9px] text-gray-500 pb-2 border-b border-premium-border/40">
                      <span>Rate: ₹{effectiveBrickRate.toFixed(2)}/pc</span>
                      <span>(Base ₹{baseBrickRate} + Transit ₹{transitBrickSurcharge.toFixed(2)})</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-gray-400">
                  <span>Subtotal (Net Value)</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 pb-3 border-b border-premium-border/40">
                  <span>Est. Local Taxes (GST 18%)</span>
                  <span className="text-white">₹{gstEstimate.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-white pt-2">
                  <span className="text-const-orange uppercase tracking-wider font-extrabold text-[11px]">Estimated Price (INR)</span>
                  <span className="text-lg text-const-orange font-extrabold">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-semibold animate-fadeIn">
                <div className="space-y-1 border-b border-premium-border/40 pb-3">
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="text-[11px] font-extrabold uppercase">Civil Contracting Task</span>
                    <span className="text-white text-xs font-bold">{worksConfig[workType].name}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400 pt-1">
                    <span>Target Area</span>
                    <span className="text-white">{workArea.toLocaleString()} Sq.Ft</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Ex-Yard Base Cost (₹{baseWorkRate}/sq.ft)</span>
                    <span className="text-white">₹{(workArea * baseWorkRate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Logistics & Mobilization (₹{transitWorkSurcharge.toFixed(2)}/sq.ft)</span>
                    <span className="text-white">₹{(workArea * transitWorkSurcharge).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-400">
                  <span>Subtotal (Net Value)</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 pb-3 border-b border-premium-border/40">
                  <span>Est. Local Taxes (GST 18%)</span>
                  <span className="text-white">₹{gstEstimate.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-white pt-2">
                  <span className="text-const-orange uppercase tracking-wider font-extrabold text-[11px]">Contract Estimated Total</span>
                  <span className="text-lg text-const-orange font-extrabold">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInqModal(true)}
              className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-4 rounded-2xl shadow-lg hover:scale-102 active:scale-98 transition-transform flex items-center justify-center space-x-2"
            >
              <span>Submit Estimate to Dispatch Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glassmorphism p-6 rounded-2xl border border-premium-border/60 text-[10px] text-gray-500 leading-relaxed space-y-2">
            <div className="flex items-center space-x-1 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-const-orange" />
              <span>Note on Pricing Adjustments</span>
            </div>
            <p>
              This is a wholesale project estimation. Final dispatch invoices will adjust based on daily index fluctuations for Fe 550D structural steel rebar prices and fuel coordinates at delivery site.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Inquiry Drawer */}
      {showInqModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glassmorphism border border-premium-border max-w-lg w-full rounded-3xl p-8 space-y-6 animate-fadeIn relative">
            <button
              onClick={() => setShowInqModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-full border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[9px] text-const-orange font-bold uppercase tracking-wider">Pricing Desk Submission</span>
              <h2 className="text-xl font-bold text-white">Request Official Quotation</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect estimated calculations with Mr. Bhaiyya Patil's wholesale operations desk. We will return a final customized commercial invoice in 2 hours.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              {user && (
                <div className="p-2.5 bg-const-orange/5 border border-const-orange/20 rounded-xl text-[10px] text-const-orange flex items-center justify-between">
                  <span>Logged in as: <strong className="text-white">{user.name}</strong> ({user.role})</span>
                  <span>Auto-filled profiles</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Contact Person / Firm *</label>
                  <input
                    type="text"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-semibold">Email (Optional)</label>
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-semibold">Delivery Location Coordinates *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Exact site drop address (e.g. Near Market Road, Girad, Bhadgaon, Jalgaon)"
                  value={leadForm.address}
                  onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold">
                  ✓ Quotation registered! Our dispatch desk will coordinate the commercial invoice with you.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                  ⚠️ Dispatch register failed. Verify coordinates.
                </div>
              )}

              <button
                type="submit"
                disabled={submitStatus === 'sending'}
                className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg"
              >
                {submitStatus === 'sending' ? 'Processing...' : 'Submit Quotation Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
