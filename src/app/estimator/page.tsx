'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Calculator, Home, Building2, Layers, Download, Send,
  ChevronDown, ChevronUp, Printer, Share2, CheckCircle2,
  Package, Truck, IndianRupee, Hammer, Zap, Droplets,
  Shield, RefreshCw, ArrowRight, Star, Info, ShoppingCart, Calendar, Clock,
  TrendingUp, BarChart3, DollarSign, Ruler, Users, AlertTriangle
} from 'lucide-react';

const HouseVisualizer3D = dynamic(() => import('@/components/HouseVisualizer3D'), { ssr: false });


// ─── Constants ───

const FLOOR_OPTIONS = [
  { value: 1, label: 'G+0 (Ground Floor Only)', multiplier: 1.0 },
  { value: 2, label: 'G+1 (Ground + 1st Floor)', multiplier: 1.75 },
  { value: 3, label: 'G+2 (Ground + 2 Floors)', multiplier: 2.45 },
  { value: 4, label: 'G+3 (Ground + 3 Floors)', multiplier: 3.10 },
];

const CONSTRUCTION_TYPES = [
  { value: 'rcc', label: 'RCC Framed Structure', desc: 'Columns, beams, slabs — most common', icon: '🏗️' },
  { value: 'loadbearing', label: 'Load Bearing Brick', desc: 'Traditional brick wall construction', icon: '🧱' },
  { value: 'premium', label: 'Premium RCC (Luxury)', desc: 'Higher quality materials, thicker slabs', icon: '⭐' },
];

const SOIL_TYPES = [
  { value: 'normal', label: 'Normal Soil / Hard Murrum', extraFoundation: 0 },
  { value: 'soft', label: 'Soft / Black Cotton Soil', extraFoundation: 15 },
  { value: 'rocky', label: 'Rocky / Laterite', extraFoundation: 8 },
];

// Material rates (per unit)
const RATES = {
  cement: 400,       // per bag (50kg)
  steel: 66000,      // per MT
  sand: 6200,        // per brass
  aggregate: 4100,   // per brass
  bricks: 8.5,       // per piece
  waterproofing: 290, // per litre
  plaster: 5800,     // per brass (fine sand)
  plumbing: 350,     // per meter
  gst_cement: 28,
  gst_steel: 18,
  gst_sand: 5,
  gst_aggregate: 5,
  gst_bricks: 12,
  gst_plumbing: 18,
};

// Base material quantities per 1000 sqft for RCC G+0
const BASE_QTY_PER_1000 = {
  rcc: {
    cement: 680,       // bags
    steel: 5.8,        // MT
    sand: 38,          // brass
    aggregate: 28,     // brass
    bricks: 20000,     // pcs
    waterproofing: 120, // litres
    plasterSand: 12,   // brass
    plumbing: 150,     // meters
  },
  loadbearing: {
    cement: 520,
    steel: 2.5,
    sand: 32,
    aggregate: 18,
    bricks: 35000,
    waterproofing: 100,
    plasterSand: 10,
    plumbing: 100,
  },
  premium: {
    cement: 780,
    steel: 7.2,
    sand: 45,
    aggregate: 33,
    bricks: 22000,
    waterproofing: 160,
    plasterSand: 14,
    plumbing: 200,
  },
};

// Labor cost % of material cost
const LABOR_PERCENT = { rcc: 65, loadbearing: 55, premium: 75 };

// Other costs
const FINISHING_PERCENT = 18; // Tiles, paint, doors, windows
const ELECTRICAL_PLUMBING_PERCENT = 12;
const CONTINGENCY_PERCENT = 5;

// Construction scheduling phases with material allocation shares
const CONSTRUCTION_PHASES = [
  {
    id: 1,
    name: 'Foundation & Footing',
    desc: 'Excavation, soil prep, and foundation pads installation.',
    duration: 12,
    offset: 0,
    shares: { cement: 0.15, steel: 0.20, sand: 0.25, aggregate: 0.25, waterproofing: 0.10, bricks: 0, plasterSand: 0 },
    tips: 'Ensure correct soil compaction. Add waterproofing compound to footing concrete to prevent capillary groundwater seepage.',
  },
  {
    id: 2,
    name: 'RCC Column & Beam Structure',
    desc: 'Casting of load-bearing pillars, beams, and horizontal slabs.',
    duration: 20,
    offset: 14,
    shares: { cement: 0.45, steel: 0.60, sand: 0.40, aggregate: 0.50, waterproofing: 0.40, bricks: 0, plasterSand: 0 },
    tips: 'Allow slabs to cure for at least 14 days under constant ponding. Do not load pillars prematurely.',
  },
  {
    id: 3,
    name: 'Brickwork Masonry',
    desc: 'Erection of internal partition walls and outer walls.',
    duration: 15,
    offset: 36,
    shares: { cement: 0.15, steel: 0.10, sand: 0.20, aggregate: 0.05, waterproofing: 0.10, bricks: 1.0, plasterSand: 0 },
    tips: 'Wetting bricks prior to laying improves mortar bond. Maintain clean 10mm mortar joints.',
  },
  {
    id: 4,
    name: 'Plastering & Waterproofing',
    desc: 'External/internal wall plaster coating & roof damp-proofing.',
    duration: 14,
    offset: 53,
    shares: { cement: 0.25, steel: 0.10, sand: 0.15, aggregate: 0.20, waterproofing: 0.40, bricks: 0, plasterSand: 1.0 },
    tips: 'Use fine-grained plaster sand to avoid shrinkage cracks. Waterproof terrace slabs before monsoons.',
  },
  {
    id: 5,
    name: 'Finishing & Services',
    desc: 'Tile flooring, wiring, sanitary plumbing, and painting.',
    duration: 25,
    offset: 69,
    shares: { cement: 0.0, steel: 0.0, sand: 0.0, aggregate: 0.0, waterproofing: 0.0, bricks: 0, plasterSand: 0, plumbing: 1.0 },
    tips: 'Plan electric conduit layouts before plastering. Pre-test all pipes for leakages before laying tiles.',
  },
];


interface EstimateResult {
  sqft: number;
  floors: number;
  constructionType: string;
  totalSqft: number;
  materials: {
    cement: { qty: number; rate: number; subtotal: number; gst: number; total: number };
    steel: { qty: number; rate: number; subtotal: number; gst: number; total: number };
    sand: { qty: number; rate: number; subtotal: number; gst: number; total: number };
    aggregate: { qty: number; rate: number; subtotal: number; gst: number; total: number };
    bricks: { qty: number; rate: number; subtotal: number; gst: number; total: number };
    waterproofing: { qty: number; rate: number; subtotal: number; gst: number; total: number };
    plasterSand: { qty: number; rate: number; subtotal: number; gst: number; total: number };
    plumbing: { qty: number; rate: number; subtotal: number; gst: number; total: number };
  };
  materialTotal: number;
  laborCost: number;
  finishingCost: number;
  epCost: number;
  deliveryCost: number;
  contingency: number;
  grandTotal: number;
  costPerSqft: number;
}

function calcEstimate(
  sqft: number,
  floors: number,
  constructionType: string,
  deliveryDistance: number,
  soilType: string,
  includeLabor: boolean,
  includeFinishing: boolean
): EstimateResult {
  const floorData = FLOOR_OPTIONS.find(f => f.value === floors)!;
  const totalSqft = sqft * floorData.multiplier;
  const factor = totalSqft / 1000;
  const baseQty = BASE_QTY_PER_1000[constructionType as keyof typeof BASE_QTY_PER_1000];
  const soilExtra = SOIL_TYPES.find(s => s.value === soilType)?.extraFoundation || 0;
  const soilFactor = 1 + soilExtra / 100;

  const m = (baseQty: number, soilAffected = false) => baseQty * factor * (soilAffected ? soilFactor : 1);

  const cement = m(baseQty.cement, true);
  const steel = m(baseQty.steel, true);
  const sand = m(baseQty.sand);
  const aggregate = m(baseQty.aggregate);
  const bricks = m(baseQty.bricks);
  const waterproofing = m(baseQty.waterproofing);
  const plasterSand = m(baseQty.plasterSand);
  const plumbing = m(baseQty.plumbing);

  const mat = {
    cement: { qty: Math.round(cement), rate: RATES.cement, subtotal: Math.round(cement * RATES.cement), gst: Math.round(cement * RATES.cement * RATES.gst_cement / 100), total: Math.round(cement * RATES.cement * (1 + RATES.gst_cement / 100)) },
    steel: { qty: parseFloat(steel.toFixed(2)), rate: RATES.steel, subtotal: Math.round(steel * RATES.steel), gst: Math.round(steel * RATES.steel * RATES.gst_steel / 100), total: Math.round(steel * RATES.steel * (1 + RATES.gst_steel / 100)) },
    sand: { qty: Math.round(sand), rate: RATES.sand, subtotal: Math.round(sand * RATES.sand), gst: Math.round(sand * RATES.sand * RATES.gst_sand / 100), total: Math.round(sand * RATES.sand * (1 + RATES.gst_sand / 100)) },
    aggregate: { qty: Math.round(aggregate), rate: RATES.aggregate, subtotal: Math.round(aggregate * RATES.aggregate), gst: Math.round(aggregate * RATES.aggregate * RATES.gst_aggregate / 100), total: Math.round(aggregate * RATES.aggregate * (1 + RATES.gst_aggregate / 100)) },
    bricks: { qty: Math.round(bricks), rate: RATES.bricks, subtotal: Math.round(bricks * RATES.bricks), gst: Math.round(bricks * RATES.bricks * RATES.gst_bricks / 100), total: Math.round(bricks * RATES.bricks * (1 + RATES.gst_bricks / 100)) },
    waterproofing: { qty: Math.round(waterproofing), rate: RATES.waterproofing, subtotal: Math.round(waterproofing * RATES.waterproofing), gst: Math.round(waterproofing * RATES.waterproofing * 0.18), total: Math.round(waterproofing * RATES.waterproofing * 1.18) },
    plasterSand: { qty: Math.round(plasterSand), rate: RATES.plaster, subtotal: Math.round(plasterSand * RATES.plaster), gst: Math.round(plasterSand * RATES.plaster * RATES.gst_sand / 100), total: Math.round(plasterSand * RATES.plaster * (1 + RATES.gst_sand / 100)) },
    plumbing: { qty: Math.round(plumbing), rate: RATES.plumbing, subtotal: Math.round(plumbing * RATES.plumbing), gst: Math.round(plumbing * RATES.plumbing * RATES.gst_plumbing / 100), total: Math.round(plumbing * RATES.plumbing * (1 + RATES.gst_plumbing / 100)) },
  };

  const materialTotal = Object.values(mat).reduce((s, m) => s + m.total, 0);
  const laborCost = includeLabor ? Math.round(materialTotal * LABOR_PERCENT[constructionType as keyof typeof LABOR_PERCENT] / 100) : 0;
  const finishingCost = includeFinishing ? Math.round(materialTotal * FINISHING_PERCENT / 100) : 0;
  const epCost = includeFinishing ? Math.round(materialTotal * ELECTRICAL_PLUMBING_PERCENT / 100) : 0;
  const deliveryCost = Math.round(deliveryDistance * 15 * (totalSqft / 500));
  const base = materialTotal + laborCost + finishingCost + epCost + deliveryCost;
  const contingency = Math.round(base * CONTINGENCY_PERCENT / 100);
  const grandTotal = base + contingency;
  const costPerSqft = Math.round(grandTotal / totalSqft);

  return { sqft, floors, constructionType, totalSqft: Math.round(totalSqft), materials: mat, materialTotal, laborCost, finishingCost, epCost, deliveryCost, contingency, grandTotal, costPerSqft };
}

const fmt = (n: number) => n.toLocaleString('en-IN');
const fmtL = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${fmt(n)}`;

// EMI Calculator helper
function calcEMI(principal: number, ratePercent: number, tenureYears: number): number {
  const r = ratePercent / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
}

// BHK Room dimension breakdown presets
const BHK_ROOM_DIMS: Record<string, { room: string; sqft: number; icon: string }[]> = {
  '2bhk': [
    { room: 'Master Bedroom', sqft: 160, icon: '🛏️' },
    { room: 'Bedroom 2', sqft: 130, icon: '🛏️' },
    { room: 'Living + Dining', sqft: 250, icon: '🛋️' },
    { room: 'Kitchen', sqft: 90, icon: '🍳' },
    { room: 'Bathroom 1', sqft: 55, icon: '🚿' },
    { room: 'Bathroom 2', sqft: 50, icon: '🚿' },
    { room: 'Balcony / Utility', sqft: 75, icon: '🌿' },
    { room: 'Walls & Passages', sqft: 90, icon: '🧱' },
  ],
  '3bhk': [
    { room: 'Master Bedroom (En-suite)', sqft: 200, icon: '🛏️' },
    { room: 'Bedroom 2', sqft: 150, icon: '🛏️' },
    { room: 'Bedroom 3', sqft: 140, icon: '🛏️' },
    { room: 'Living Room', sqft: 220, icon: '🛋️' },
    { room: 'Dining Area', sqft: 110, icon: '🍽️' },
    { room: 'Kitchen', sqft: 110, icon: '🍳' },
    { room: 'Master Bathroom', sqft: 65, icon: '🛁' },
    { room: 'Common Bathroom', sqft: 55, icon: '🚿' },
    { room: 'Balcony (2x)', sqft: 130, icon: '🌿' },
    { room: 'Lobby & Passages', sqft: 170, icon: '🏠' },
  ],
};

export default function EstimatorPage() {
  const [sqft, setSqft] = useState(1000);
  const [floors, setFloors] = useState(1);
  const [constructionType, setConstructionType] = useState('rcc');
  const [soilType, setSoilType] = useState('normal');
  const [deliveryDistance, setDeliveryDistance] = useState(15);
  const [includeLabor, setIncludeLabor] = useState(true);
  const [includeFinishing, setIncludeFinishing] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('materials');
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Advanced integration states
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [activePhase, setActivePhase] = useState<number>(1);
  const [addingToCartPhase, setAddingToCartPhase] = useState<number | null>(null);
  const [layoutPreset, setLayoutPreset] = useState<'custom' | '2bhk' | '3bhk'>('custom');

  // EMI Calculator states
  const [emiLoanAmount, setEmiLoanAmount] = useState(2500000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiTenure, setEmiTenure] = useState(20);
  const [showEmiCalc, setShowEmiCalc] = useState(false);
  const [wastageBuffer, setWastageBuffer] = useState(10); // percent


  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const res = await fetch('/api/v2/products?limit=50');
        if (res.ok) {
          const data = await res.json();
          setDbProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to pre-fetch products for estimator integrations', err);
      }
    };
    fetchDbProducts();
  }, []);

  const getProductForMaterialKey = (key: string, productsList: any[], type: string) => {
    if (!productsList || productsList.length === 0) return null;
    
    switch (key) {
      case 'cement':
        return productsList.find(p => p.sku === 'JSR-CEM-ULTRA-OPC53') || productsList.find(p => p.category?.slug === 'cement');
      case 'steel':
        return productsList.find(p => p.sku === 'JSR-STL-JSW-550D') || productsList.find(p => p.category?.slug === 'steel');
      case 'sand':
        return productsList.find(p => p.sku === 'JSR-SND-GIRNA-RVR') || productsList.find(p => p.category?.slug === 'sand');
      case 'aggregate':
        return productsList.find(p => p.sku === 'JSR-AGG-20MM') || productsList.find(p => p.category?.slug === 'aggregate');
      case 'bricks':
        if (type === 'premium') {
          return productsList.find(p => p.sku === 'JSR-BLK-AAC-SIPX') || productsList.find(p => p.category?.slug === 'bricks');
        }
        return productsList.find(p => p.sku === 'JSR-BRK-RED-CLAY') || productsList.find(p => p.category?.slug === 'bricks');
      case 'waterproofing':
        return productsList.find(p => p.sku === 'JSR-WP-DRFIXIT-LW') || productsList.find(p => p.category?.slug === 'waterproofing');
      case 'plasterSand':
        return productsList.find(p => p.sku === 'JSR-SND-TAPI-PLT') || productsList.find(p => p.category?.slug === 'sand');
      case 'plumbing':
        return productsList.find(p => p.sku === 'JSR-PLM-AST-1SDR11') || productsList.find(p => p.category?.slug === 'plumbing');
      default:
        return null;
    }
  };

  const addPhaseToCart = async (phaseName: string, phaseShares: Record<string, number | undefined>) => {
    if (!result) return;
    const phaseId = CONSTRUCTION_PHASES.find(p => p.name === phaseName)?.id || 999;
    setAddingToCartPhase(phaseId);
    await new Promise(r => setTimeout(r, 600));

    try {
      const stored = localStorage.getItem('jsr_cart');
      let currentCart: any[] = [];
      if (stored) {
        currentCart = JSON.parse(stored);
      }

      let addedCount = 0;

      Object.entries(phaseShares).forEach(([key, share]) => {
        if (share === undefined || share <= 0) return;
        const totalQty = result.materials[key as keyof typeof result.materials]?.qty;
        if (!totalQty) return;
        
        const phaseQty = totalQty * share;
        const prod = getProductForMaterialKey(key, dbProducts, constructionType);
        if (!prod) return;

        const existingIdx = currentCart.findIndex(item => item.product.id === prod.id);
        if (existingIdx > -1) {
          currentCart[existingIdx].quantity += Math.ceil(phaseQty);
        } else {
          currentCart.push({ product: prod, quantity: Math.ceil(phaseQty) });
        }
        addedCount++;
      });

      localStorage.setItem('jsr_cart', JSON.stringify(currentCart));
      
      setToastMsg(`🚀 Added items for "${phaseName}" to your marketplace cart!`);
      setTimeout(() => setToastMsg(''), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setAddingToCartPhase(null);
    }
  };


  const handleCalculate = async () => {
    setCalculating(true);
    await new Promise(r => setTimeout(r, 800));
    const res = calcEstimate(sqft, floors, constructionType, deliveryDistance, soilType, includeLabor, includeFinishing);
    setResult(res);
    setCalculating(false);
    setExpandedSection('materials');

    // Fetch AI insight
    setLoadingAI(true);
    try {
      const floorLabel = FLOOR_OPTIONS.find(f => f.value === floors)?.label;
      const typeLabel = CONSTRUCTION_TYPES.find(t => t.value === constructionType)?.label;
      const aiRes = await fetch('/api/v2/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Give me 3 specific expert tips and money-saving suggestions for building a ${sqft} sqft ${floorLabel} ${typeLabel} house in Maharashtra. Focus on: 1) Smart material substitutions to save cost, 2) Construction sequence tips, 3) Quality checks. Be concise, practical and specific. Total estimated cost is ₹${fmt(res.grandTotal)}.`
        })
      });
      const data = await aiRes.json();
      setAiInsight(data.response || '');
    } catch { setAiInsight(''); }
    setLoadingAI(false);
  };

  const handlePrint = () => window.print();

  const MATERIAL_LABELS: Record<string, { label: string; unit: string; icon: string; color: string }> = {
    cement: { label: 'OPC/PPC Cement', unit: 'Bags (50kg)', icon: '🏗️', color: 'text-orange-400' },
    steel: { label: 'TMT Steel Fe550D', unit: 'Metric Tons (MT)', icon: '⚙️', color: 'text-blue-400' },
    sand: { label: 'River Sand (Coarse)', unit: 'Brass', icon: '🌊', color: 'text-yellow-400' },
    aggregate: { label: 'Basalt Aggregates 20mm', unit: 'Brass', icon: '🪨', color: 'text-gray-400' },
    bricks: { label: 'Clay Bricks / AAC Blocks', unit: 'Pieces', icon: '🧱', color: 'text-red-400' },
    waterproofing: { label: 'Waterproofing Compound', unit: 'Litres', icon: '💧', color: 'text-cyan-400' },
    plasterSand: { label: 'Fine Plaster Sand', unit: 'Brass', icon: '🌊', color: 'text-amber-400' },
    plumbing: { label: 'Astral/Supreme Plumbing Pipes', unit: 'Meters (m)', icon: '🔧', color: 'text-teal-400' },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-16 print:pt-0 print:bg-white">
      {/* ─── Print Styles ─── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-show { display: block !important; }
          .glassmorphism { border: 1px solid #e5e7eb !important; background: white !important; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d0d16] via-const-orange/5 to-[#0d0d16] border-b border-premium-border/40 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1.5 rounded-full text-xs font-bold text-const-orange uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>AI-Powered Construction Cost Estimator</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white">
            House Construction
            <span className="text-const-orange"> Cost Calculator</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Get a detailed material quantity & cost estimate based on your exact square footage. Includes GST, logistics, labor & AI-powered savings tips.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ─── Input Form ─── */}
        <div className="glassmorphism border border-premium-border rounded-3xl p-8 space-y-8 no-print">
          <h2 className="text-base font-bold text-white">Project Details</h2>

          {/* BHK Layout Presets */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-const-orange" />
              BHK Floor Plan Configuration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'custom', label: 'Open Floor Plan', desc: 'Customizable sq.ft area', icon: '📐', sqft: 1000 },
                { id: '2bhk', label: '2BHK Layout Preset', desc: 'Pre-mapped 900 Sq.Ft plan', icon: '🛏️🛏️', sqft: 900 },
                { id: '3bhk', label: '3BHK Layout Preset', desc: 'Pre-mapped 1350 Sq.Ft plan', icon: '🛏️🛏️🛏️', sqft: 1350 },
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setLayoutPreset(preset.id as any);
                    setSqft(preset.sqft);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    layoutPreset === preset.id
                      ? 'bg-const-orange/15 border-const-orange'
                      : 'bg-white/3 border-premium-border hover:bg-white/5'
                  }`}
                >
                  <div className="text-lg mb-1">{preset.icon}</div>
                  <div className="text-xs font-bold text-white">{preset.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sq Ft Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white">Plot / Construction Area</label>
              <div className="flex items-center gap-2">
                <input type="number" min="200" max="10000" value={sqft} 
                  disabled={layoutPreset !== 'custom'}
                  onChange={e => setSqft(Math.max(200, Math.min(10000, Number(e.target.value))))}
                  className={`w-24 bg-const-orange/10 border border-const-orange/30 text-const-orange font-extrabold text-center rounded-xl px-2 py-1.5 text-sm focus:outline-none ${layoutPreset !== 'custom' ? 'opacity-50 cursor-not-allowed' : ''}`} />
                <span className="text-gray-400 text-sm font-semibold">Sq.Ft</span>
              </div>
            </div>
            <input type="range" min="200" max="10000" step="50" value={sqft} 
              disabled={layoutPreset !== 'custom'}
              onChange={e => setSqft(Number(e.target.value))}
              className={`w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-const-orange ${layoutPreset !== 'custom' ? 'opacity-40 cursor-not-allowed' : ''}`} />
            <div className="flex justify-between text-[10px] text-gray-600">
              {[200, 500, 1000, 2000, 3000, 5000, 10000].map(v => (
                <button key={v} 
                  disabled={layoutPreset !== 'custom'}
                  onClick={() => setSqft(v)} 
                  className={`hover:text-const-orange transition-colors font-semibold ${layoutPreset !== 'custom' ? 'opacity-40 cursor-not-allowed hover:text-gray-600' : ''}`}>{v}</button>
              ))}
            </div>
            {layoutPreset !== 'custom' && (
              <p className="text-[10px] text-const-orange/80 font-semibold mt-1">
                ⚠️ Area is locked to standard BHK blueprint spec ({sqft} Sq.Ft). Choose "Open Floor Plan" preset above to unlock.
              </p>
            )}
          </div>


          {/* Floors */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white">Number of Floors</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FLOOR_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setFloors(opt.value)}
                  className={`p-3 rounded-2xl border text-left transition-all ${floors === opt.value ? 'bg-const-orange/15 border-const-orange' : 'bg-white/3 border-premium-border hover:bg-white/5'}`}>
                  <div className="text-xl mb-1">{['🏠', '🏘️', '🏢', '🏙️'][opt.value - 1]}</div>
                  <div className="text-xs font-bold text-white">{opt.label.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-500">{opt.label.split('(')[1]?.replace(')', '')}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Construction Type */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white">Construction Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CONSTRUCTION_TYPES.map(ct => (
                <button key={ct.value} onClick={() => setConstructionType(ct.value)}
                  className={`p-4 rounded-2xl border text-left transition-all ${constructionType === ct.value ? 'bg-const-orange/15 border-const-orange' : 'bg-white/3 border-premium-border hover:bg-white/5'}`}>
                  <div className="text-2xl mb-2">{ct.icon}</div>
                  <div className="text-xs font-bold text-white">{ct.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{ct.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Soil Type */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              Soil Type
              <span className="text-[10px] text-gray-500 font-normal">(affects foundation material qty)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SOIL_TYPES.map(st => (
                <button key={st.value} onClick={() => setSoilType(st.value)}
                  className={`p-3 rounded-2xl border text-left transition-all ${soilType === st.value ? 'bg-const-orange/15 border-const-orange' : 'bg-white/3 border-premium-border hover:bg-white/5'}`}>
                  <div className="text-xs font-bold text-white">{st.label}</div>
                  {st.extraFoundation > 0 && <div className="text-[10px] text-amber-400 mt-0.5">+{st.extraFoundation}% foundation material</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Distance & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-white flex items-center justify-between">
                Delivery Distance from Bhadgaon
                <span className="text-const-orange font-extrabold">{deliveryDistance} km</span>
              </label>
              <input type="range" min="0" max="150" value={deliveryDistance} onChange={e => setDeliveryDistance(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-const-orange" />
              <p className="text-[10px] text-gray-500">Est. delivery cost: ~₹{fmt(Math.round(deliveryDistance * 15 * (sqft * FLOOR_OPTIONS.find(f => f.value === floors)!.multiplier / 500)))}</p>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold text-white">Include in Estimate</label>
              <div className="space-y-3">
                {[
                  { key: 'labor', label: 'Labor / Mason Cost (~65% of material)', value: includeLabor, set: setIncludeLabor },
                  { key: 'finishing', label: 'Finishing (Tiles, Paint, Doors, E&P)', value: includeFinishing, set: setIncludeFinishing },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                    <div onClick={() => opt.set(!opt.value)}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${opt.value ? 'bg-const-orange' : 'bg-white/10'}`}>
                      <motion.div animate={{ x: opt.value ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-md" />
                    </div>
                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button onClick={handleCalculate} disabled={calculating}
            className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-extrabold text-base py-5 rounded-2xl shadow-2xl shadow-const-orange/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center space-x-3">
            {calculating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Calculating Estimate...</span>
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>Calculate Construction Cost</span>
              </>
            )}
          </button>
        </div>

        {/* ─── Results ─── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              ref={printRef}
            >
              {/* Print Header */}
              <div className="hidden print:block text-center py-4 border-b-2 border-gray-300 mb-6">
                <h1 className="text-2xl font-bold text-black">Jay Shree Ram Group</h1>
                <p className="text-sm text-gray-600">Construction Cost Estimate | Girad, Bhadgaon, Jalgaon | +91 8010871044</p>
                <p className="text-xs text-gray-500 mt-1">Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Area', value: `${fmt(result.totalSqft)} Sq.Ft`, icon: Home, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Material Cost', value: fmtL(result.materialTotal), icon: Package, color: 'text-const-orange', bg: 'bg-const-orange/10' },
                  { label: 'Grand Total', value: fmtL(result.grandTotal), icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-500/10' },
                  { label: 'Cost / Sq.Ft', value: `₹${fmt(result.costPerSqft)}`, icon: Calculator, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map(card => (
                  <div key={card.label} className="glassmorphism border border-premium-border rounded-2xl p-5 space-y-3 print:border-gray-300 print:rounded-none">
                    <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-white print:text-black">{card.value}</p>
                      <p className="text-xs text-gray-400 font-semibold print:text-gray-600">{card.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toast Notification for Cart Additions */}
              <AnimatePresence>
                {toastMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="no-print bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{toastMsg}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <a href="/marketplace" className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors">
                        Open Cart
                      </a>
                      <button onClick={() => setToastMsg('')} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3D Structure Visualizer & Phase Scheduler Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
                {/* 3D Visualizer block */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">3D Plane Blueprint Structure</span>
                    <span className="text-[10px] text-const-orange bg-const-orange/10 px-2.5 py-0.5 rounded-full border border-const-orange/20 font-bold font-mono">Sq.Ft-Wise Scale</span>
                  </div>
                  <HouseVisualizer3D
                    sqft={result.sqft}
                    floors={result.floors}
                    constructionType={result.constructionType}
                    soilType={soilType}
                    layout={layoutPreset}
                  />
                </div>

                {/* Construction Phase Scheduler */}
                <div className="glassmorphism border border-premium-border rounded-3xl p-6 flex flex-col space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-const-orange" />
                      Phase Material Scheduler
                    </h3>
                    <p className="text-[10px] text-gray-500">Estimates scheduling based on {fmt(result.totalSqft)} sq.ft</p>
                  </div>

                  {/* Phase timeline visual list */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[260px] pr-1 scrollbar-hide">
                    {CONSTRUCTION_PHASES.map(phase => {
                      const isActive = activePhase === phase.id;
                      return (
                        <div
                          key={phase.id}
                          onClick={() => setActivePhase(phase.id)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                            isActive
                              ? 'bg-const-orange/15 border-const-orange'
                              : 'bg-white/3 border-premium-border hover:bg-white/5'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-white">Phase {phase.id}: {phase.name}</p>
                              <p className="text-[9px] text-gray-500 leading-snug mt-0.5">{phase.desc}</p>
                            </div>
                            <span className="text-[9px] text-gray-400 font-semibold bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                              <Clock className="w-2.5 h-2.5" />
                              {phase.duration} Days
                            </span>
                          </div>

                          {/* Gantt progress representation bar */}
                          <div className="mt-2.5 w-full bg-white/5 rounded-full h-1.5 overflow-hidden relative">
                            <div
                              className="absolute bg-gradient-to-r from-const-orange to-amber-500 h-full rounded-full"
                              style={{
                                width: `${(phase.duration / 94) * 100}%`,
                                left: `${(phase.offset / 94) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Phase Details */}
                  {(() => {
                    const phase = CONSTRUCTION_PHASES.find(p => p.id === activePhase)!;
                    const phaseQtyText: string[] = [];
                    
                    Object.entries(phase.shares).forEach(([key, share]) => {
                      if (share <= 0) return;
                      const labelInfo = MATERIAL_LABELS[key];
                      const totalQty = result.materials[key as keyof typeof result.materials]?.qty;
                      if (totalQty && labelInfo) {
                        const phaseQty = totalQty * share;
                        phaseQtyText.push(`${labelInfo.icon} ${labelInfo.label.split('/')[0].split('(')[0].trim()}: ${phaseQty >= 1 ? fmt(Math.ceil(phaseQty)) : phaseQty.toFixed(2)} ${labelInfo.unit.split(' ')[0]}`);
                      }
                    });

                    return (
                      <div className="p-3 bg-white/3 border border-premium-border/40 rounded-2xl space-y-2.5 text-left animate-fadeIn">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-const-orange font-bold uppercase tracking-wider">Phase {phase.id} Allocation</span>
                          <span className="text-[9px] text-gray-500 font-semibold">Start: Day {phase.offset}</span>
                        </div>
                        
                        <div className="space-y-1">
                          {phaseQtyText.map((txt, idx) => (
                            <p key={idx} className="text-[10px] text-gray-300 font-medium">{txt}</p>
                          ))}
                        </div>

                        <p className="text-[9px] text-gray-500 italic leading-snug border-t border-white/5 pt-1.5">
                          💡 <strong className="text-gray-400 not-italic">JSR Tip:</strong> {phase.tips}
                        </p>

                        {phaseQtyText.length > 0 && (
                          <button
                            onClick={() => addPhaseToCart(phase.name, phase.shares)}
                            disabled={addingToCartPhase !== null}
                            className="w-full bg-const-orange text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1.5 hover:bg-const-orange/90 active:scale-95 transition-all disabled:opacity-60 mt-1"
                          >
                            {addingToCartPhase === phase.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <ShoppingCart className="w-3.5 h-3.5" />
                            )}
                            <span>Order Phase {phase.id} Materials</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 no-print">
                <button onClick={handlePrint}
                  className="flex items-center space-x-2 bg-white/10 border border-premium-border text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-white/15 transition-colors">
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <a href={`https://wa.me/918010871044?text=Hi, I need a quotation for ${result.totalSqft} sqft ${FLOOR_OPTIONS.find(f => f.value === result.floors)?.label} house. Estimated budget: ${fmtL(result.grandTotal)}. Please provide a commercial quote.`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-green-600/20 border border-green-600/30 text-green-400 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-green-600/30 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp Quote</span>
                </a>
                <a href="/rfq"
                  className="flex items-center space-x-2 bg-const-orange/10 border border-const-orange/30 text-const-orange text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-const-orange/20 transition-colors">
                  <Send className="w-4 h-4" />
                  <span>Request Formal Quotation</span>
                </a>
              </div>

              {/* ─── Material Table ─── */}
              <div className="glassmorphism border border-premium-border rounded-3xl overflow-hidden print:border-gray-300">
                <button onClick={() => setExpandedSection(expandedSection === 'materials' ? null : 'materials')}
                  className="w-full flex items-center justify-between p-6 no-print">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-const-orange" />
                    Material Quantity & Cost Breakdown
                  </h3>
                  {expandedSection === 'materials' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                <div className="hidden print:block p-6">
                  <h3 className="text-base font-bold text-black mb-4">Material Quantity & Cost Breakdown</h3>
                </div>

                <AnimatePresence>
                  {(expandedSection === 'materials' || true) && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-white/5 print:bg-gray-100">
                            {['Material', 'Quantity', 'Unit', 'Rate', 'Subtotal', 'GST', 'Total (incl. GST)'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider print:text-gray-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-gray-200">
                          {Object.entries(result.materials).map(([key, mat]) => {
                            const info = MATERIAL_LABELS[key];
                            return (
                              <tr key={key} className="hover:bg-white/3 transition-colors print:hover:bg-transparent">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{info.icon}</span>
                                    <span className={`text-xs font-bold ${info.color} print:text-black`}>{info.label}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-extrabold text-white print:text-black">{typeof mat.qty === 'number' ? (mat.qty >= 1 ? fmt(mat.qty) : mat.qty.toFixed(2)) : mat.qty}</td>
                                <td className="px-4 py-3 text-xs text-gray-400 print:text-gray-600">{info.unit}</td>
                                <td className="px-4 py-3 text-xs text-gray-400 print:text-gray-600">₹{fmt(mat.rate)}</td>
                                <td className="px-4 py-3 text-xs text-gray-300 print:text-gray-700">₹{fmt(mat.subtotal)}</td>
                                <td className="px-4 py-3 text-xs text-amber-400 print:text-gray-600">₹{fmt(mat.gst)}</td>
                                <td className="px-4 py-3 text-sm font-extrabold text-const-orange print:text-black">₹{fmt(mat.total)}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-const-orange/10 font-extrabold print:bg-gray-100">
                            <td colSpan={6} className="px-4 py-3 text-sm text-white print:text-black">Total Material Cost (incl. GST)</td>
                            <td className="px-4 py-3 text-sm text-const-orange print:text-black font-extrabold">₹{fmt(result.materialTotal)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Cost Summary ─── */}
              <div className="glassmorphism border border-premium-border rounded-3xl p-6 space-y-4 print:border-gray-300">
                <h3 className="text-base font-bold text-white print:text-black flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-const-orange" />
                  Complete Cost Summary
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '🧱 Raw Materials (incl. GST)', value: result.materialTotal, color: 'text-const-orange' },
                    ...(result.laborCost > 0 ? [{ label: '👷 Labor & Mason Cost', value: result.laborCost, color: 'text-blue-400' }] : []),
                    ...(result.finishingCost > 0 ? [{ label: '🎨 Finishing (Tiles, Paint, Doors)', value: result.finishingCost, color: 'text-purple-400' }] : []),
                    ...(result.epCost > 0 ? [{ label: '⚡ Electrical & Plumbing', value: result.epCost, color: 'text-yellow-400' }] : []),
                    { label: '🚛 Delivery & Logistics', value: result.deliveryCost, color: 'text-cyan-400' },
                    { label: '🔧 Contingency (5%)', value: result.contingency, color: 'text-gray-400' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-premium-border/30 print:border-gray-200">
                      <span className="text-sm text-gray-300 print:text-gray-700">{row.label}</span>
                      <span className={`text-sm font-extrabold ${row.color} print:text-black`}>₹{fmt(row.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-3 bg-const-orange/10 border border-const-orange/20 rounded-2xl px-4 mt-2 print:bg-gray-100 print:border-gray-300">
                    <div>
                      <p className="text-base font-extrabold text-white print:text-black">Total Estimated Cost</p>
                      <p className="text-[10px] text-gray-400">for {fmt(result.totalSqft)} sq.ft {FLOOR_OPTIONS.find(f => f.value === result.floors)?.label.split('(')[0].trim()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-const-orange print:text-black">{fmtL(result.grandTotal)}</p>
                      <p className="text-[10px] text-gray-400">₹{fmt(result.costPerSqft)} / sq.ft</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── AI Insights ─── */}
              <div className="glassmorphism border border-const-orange/20 rounded-3xl p-6 space-y-4 no-print">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-const-orange" />
                  AI Expert Insights & Savings Tips
                  {loadingAI && <div className="w-4 h-4 border-2 border-const-orange/30 border-t-const-orange rounded-full animate-spin" />}
                </h3>
                {loadingAI ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className={`h-4 bg-white/10 rounded animate-pulse w-${i === 3 ? '2/3' : 'full'}`} />)}
                  </div>
                ) : aiInsight ? (
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{aiInsight}</div>
                ) : (
                  <p className="text-xs text-gray-500">Calculate your estimate above to get AI-powered insights.</p>
                )}
              </div>

              {/* ─── Material Wastage Buffer ─── */}
              <div className="glassmorphism border border-amber-500/20 rounded-3xl p-6 space-y-4 no-print">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Material Wastage Buffer Calculator
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Buffer:</span>
                    {[5, 10, 15, 20].map(pct => (
                      <button key={pct} onClick={() => setWastageBuffer(pct)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          wastageBuffer === pct ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}>
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">Industry standard wastage buffer to account for breakage, cutting loss, and on-site mishaps.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(result.materials).slice(0, 4).map(([key, mat]) => {
                    const info = MATERIAL_LABELS[key];
                    const extra = Math.ceil(mat.qty * wastageBuffer / 100);
                    return (
                      <div key={key} className="bg-white/3 border border-amber-500/10 rounded-2xl p-3 space-y-1">
                        <p className="text-[10px] text-gray-400 font-semibold">{info.icon} {info.label.split('(')[0].trim()}</p>
                        <p className="text-sm font-extrabold text-white">{typeof mat.qty === 'number' && mat.qty >= 1 ? fmt(mat.qty) : mat.qty} <span className="text-[9px] text-gray-500">{info.unit.split(' ')[0]}</span></p>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-amber-400 font-bold">+{extra} extra</span>
                          <span className="text-[9px] text-gray-600">({wastageBuffer}% buffer)</span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold border-t border-white/5 pt-1">
                          Total to order: <span className="text-amber-300">{fmt(Math.ceil(mat.qty * (1 + wastageBuffer/100)))}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <p className="text-[10px] text-amber-300/80">
                    With {wastageBuffer}% buffer: Total additional material cost ≈ <strong>₹{fmt(Math.round(result.materialTotal * wastageBuffer / 100))}</strong> more than base estimate.
                  </p>
                </div>
              </div>

              {/* ─── Room Dimension Breakdown ─── */}
              {layoutPreset !== 'custom' && BHK_ROOM_DIMS[layoutPreset] && (
                <div className="glassmorphism border border-premium-border rounded-3xl p-6 space-y-4 no-print">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-const-orange" />
                    {layoutPreset.toUpperCase()} Room-Wise Area Breakdown
                    <span className="ml-auto text-[10px] bg-const-orange/10 text-const-orange border border-const-orange/20 px-2.5 py-0.5 rounded-full font-bold">
                      {sqft} Sq.Ft Blueprint
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BHK_ROOM_DIMS[layoutPreset].map(room => (
                      <div key={room.room} className="bg-white/3 border border-premium-border/40 rounded-2xl p-3 space-y-1.5">
                        <span className="text-lg">{room.icon}</span>
                        <p className="text-[10px] text-gray-400 font-semibold leading-tight">{room.room}</p>
                        <p className="text-sm font-extrabold text-white">{room.sqft} <span className="text-[9px] text-gray-500">Sq.Ft</span></p>
                        <div className="w-full bg-white/5 rounded-full h-1 mt-1">
                          <div className="bg-gradient-to-r from-const-orange to-amber-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (room.sqft / sqft) * 100 * 3)}%` }} />
                        </div>
                        <p className="text-[9px] text-gray-600">{((room.sqft / sqft) * 100).toFixed(1)}% of total</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── EMI Calculator ─── */}
              <div className="glassmorphism border border-premium-border rounded-3xl overflow-hidden no-print">
                <button onClick={() => setShowEmiCalc(!showEmiCalc)}
                  className="w-full flex items-center justify-between p-6">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Home Loan EMI Calculator
                    <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full font-bold">Finance Tool</span>
                  </h3>
                  {showEmiCalc ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showEmiCalc && (
                  <div className="px-6 pb-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <label className="font-bold text-white">Loan Amount</label>
                          <span className="text-green-400 font-extrabold">{fmtL(emiLoanAmount)}</span>
                        </div>
                        <input type="range" min={500000} max={15000000} step={100000} value={emiLoanAmount}
                          onChange={e => setEmiLoanAmount(Number(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500" />
                        <p className="text-[10px] text-gray-500">Range: ₹5L – ₹1.5Cr</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <label className="font-bold text-white">Interest Rate (p.a.)</label>
                          <span className="text-green-400 font-extrabold">{emiRate}%</span>
                        </div>
                        <input type="range" min={6.5} max={14} step={0.25} value={emiRate}
                          onChange={e => setEmiRate(Number(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500" />
                        <p className="text-[10px] text-gray-500">SBI: 8.5% | HDFC: 8.75% | PNB: 8.45%</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <label className="font-bold text-white">Loan Tenure</label>
                          <span className="text-green-400 font-extrabold">{emiTenure} Years</span>
                        </div>
                        <input type="range" min={5} max={30} step={1} value={emiTenure}
                          onChange={e => setEmiTenure(Number(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500" />
                        <p className="text-[10px] text-gray-500">Max tenure: 30 years</p>
                      </div>
                    </div>
                    {(() => {
                      const emi = calcEMI(emiLoanAmount, emiRate, emiTenure);
                      const totalPay = emi * emiTenure * 12;
                      const totalInterest = totalPay - emiLoanAmount;
                      return (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-green-400">₹{fmt(emi)}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Monthly EMI</p>
                          </div>
                          <div className="bg-white/3 border border-premium-border rounded-2xl p-4 text-center">
                            <p className="text-xl font-extrabold text-white">{fmtL(totalPay)}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Total Payment</p>
                          </div>
                          <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-4 text-center">
                            <p className="text-xl font-extrabold text-red-400">{fmtL(totalInterest)}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Total Interest</p>
                          </div>
                        </div>
                      );
                    })()}
                    <button
                      onClick={() => setEmiLoanAmount(Math.round(result.grandTotal * 0.8))}
                      className="text-[10px] text-const-orange hover:text-amber-400 font-bold flex items-center gap-1 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Auto-fill 80% of estimated cost as loan amount (₹{fmtL(Math.round(result.grandTotal * 0.8))})
                    </button>
                  </div>
                )}
              </div>

              {/* ─── Contractor Tier Comparison ─── */}
              <div className="glassmorphism border border-premium-border rounded-3xl p-6 space-y-4 no-print">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Contractor Tier Comparison
                  <span className="ml-auto text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold">3 Tiers</span>
                </h3>
                <p className="text-[10px] text-gray-500">Compare what different contractor tiers deliver for {fmt(result.totalSqft)} sq.ft at ₹{fmt(result.costPerSqft)}/sqft base rate.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-white/5">
                        {['Feature', '🔨 Local Mason', '🏗️ Mid-Tier Contractor', '⭐ Premium Firm'].map(h => (
                          <th key={h} className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        ['Rate / Sqft', `₹${fmt(Math.round(result.costPerSqft * 0.78))}`, `₹${fmt(result.costPerSqft)}`, `₹${fmt(Math.round(result.costPerSqft * 1.35))}`],
                        ['Total Cost', fmtL(Math.round(result.grandTotal * 0.78)), fmtL(result.grandTotal), fmtL(Math.round(result.grandTotal * 1.35))],
                        ['Timeline', '18–24 months', '12–18 months', '8–12 months'],
                        ['Warranty', 'None', '1 year structure', '5 year full'],
                        ['Material Quality', 'Market grade', 'ISI certified', 'Premium + audit'],
                        ['Documentation', 'Verbal only', 'Basic contract', 'Full BOQ + legal'],
                        ['Site Engineer', '❌', '✅ Weekly', '✅ Daily'],
                      ].map(([feat, local, mid, prem]) => (
                        <tr key={feat} className="hover:bg-white/3 transition-colors">
                          <td className="px-3 py-2.5 text-gray-400 font-semibold text-[10px]">{feat}</td>
                          <td className="px-3 py-2.5 text-gray-300">{local}</td>
                          <td className="px-3 py-2.5 text-const-orange font-bold">{mid}</td>
                          <td className="px-3 py-2.5 text-purple-400 font-bold">{prem}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-start gap-2 bg-purple-500/5 border border-purple-500/15 rounded-xl px-4 py-3">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-400">JSR Group offers mid-tier pricing with premium-grade ISI-certified materials sourced directly from manufacturers in Jalgaon district — no middlemen, lowest logistics cost.</p>
                </div>
              </div>

              {/* ─── Disclaimer ─── */}
              <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  <strong className="text-amber-400">Disclaimer:</strong> This is an approximate estimate based on standard construction practices in Maharashtra. Actual costs may vary ±15–20% based on design complexity, market rates, contractor, and site conditions. Add 10% wastage buffer on all materials. Rates as of June 2026.
                  <strong className="text-const-orange"> Contact us for an accurate commercial quotation: +91 8010871044</strong>
                </p>
              </div>

              {/* ─── Order CTA ─── */}
              <div className="glassmorphism border border-premium-border rounded-3xl p-8 text-center space-y-4 no-print">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <Star className="w-5 h-5 text-const-orange fill-const-orange" />
                  <h3 className="text-lg font-extrabold text-white">Ready to Order Materials?</h3>
                  <Star className="w-5 h-5 text-const-orange fill-const-orange" />
                </div>
                <p className="text-sm text-gray-400">We supply all materials in this estimate — directly from our stockyard to your site.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/marketplace" className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-const-orange to-amber-600 text-white font-extrabold text-sm py-4 px-8 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                    <span>🛒 Order from Marketplace</span>
                  </a>
                  <a href="/rfq" className="inline-flex items-center justify-center space-x-2 bg-white/5 border border-premium-border text-white font-bold text-sm py-4 px-8 rounded-2xl hover:bg-white/10 transition-colors">
                    <Send className="w-4 h-4" />
                    <span>Request Bulk Quotation</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Pre-calculate Quick Reference ─── */}
        {!result && (
          <div className="glassmorphism border border-premium-border rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-const-orange" />
              Quick Reference — Approx. Cost Guide (Maharashtra 2026)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { size: '500 sqft', type: 'G+0 RCC', cost: '₹12–15L', sqftRate: '₹2,400–3,000' },
                { size: '1000 sqft', type: 'G+0 RCC', cost: '₹22–28L', sqftRate: '₹2,200–2,800' },
                { size: '1500 sqft', type: 'G+0 RCC', cost: '₹32–40L', sqftRate: '₹2,100–2,700' },
                { size: '1000 sqft', type: 'G+1 RCC', cost: '₹38–47L', sqftRate: '₹2,200–2,700' },
                { size: '1500 sqft', type: 'G+1 RCC', cost: '₹55–70L', sqftRate: '₹2,100–2,600' },
                { size: '2000 sqft', type: 'G+1 RCC', cost: '₹72–90L', sqftRate: '₹2,000–2,500' },
                { size: '2000 sqft', type: 'G+2 RCC', cost: '₹1.1–1.3Cr', sqftRate: '₹2,200–2,600' },
                { size: '1000 sqft', type: 'Load Bearing', cost: '₹16–22L', sqftRate: '₹1,600–2,200' },
              ].map(row => (
                <div key={row.size + row.type} className="bg-white/3 border border-premium-border/40 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-white">{row.size}</p>
                  <p className="text-[10px] text-const-orange font-semibold">{row.type}</p>
                  <p className="text-sm font-extrabold text-green-400">{row.cost}</p>
                  <p className="text-[10px] text-gray-500">{row.sqftRate} / sqft</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-600">* Approximate totals including materials + labor + basic finishing. Delivery extra based on distance.</p>
          </div>
        )}
      </div>
    </div>
  );
}
