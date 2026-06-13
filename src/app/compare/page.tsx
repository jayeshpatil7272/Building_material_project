'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight, Star, Shield, Zap, Check, X, Info,
  TrendingUp, DollarSign, Award, Truck, Layers
} from 'lucide-react';

interface MaterialOption {
  id: string;
  name: string;
  brand: string;
  icon: string;
  price: number;
  unit: string;
  gst: number;
  rating: number;
  grade: string;
  strength: string;
  bestFor: string[];
  pros: string[];
  cons: string[];
  is_code: string;
  availability: 'high' | 'medium' | 'low';
  eco: number; // 1-5
  durability: number; // 1-5
  workability: number; // 1-5
  costEfficiency: number; // 1-5
}

const COMPARISON_DATA: Record<string, MaterialOption[]> = {
  cement: [
    { id: 'opc53', name: 'OPC 53 Grade Cement', brand: 'UltraTech / ACC', icon: '🏗️', price: 400, unit: 'bag', gst: 28, rating: 4.8, grade: 'OPC 53', strength: '53 N/mm² (28 days)', bestFor: ['RCC Columns', 'Beams', 'Slabs', 'Foundations'], pros: ['Highest compressive strength', 'Fast setting', 'Ideal for structural work', 'BIS certified IS:8112'], cons: ['Higher cost', 'Generates more heat', 'Not ideal for plastering'], is_code: 'IS 8112:2013', availability: 'high', eco: 2, durability: 5, workability: 3, costEfficiency: 3 },
    { id: 'ppc', name: 'PPC Cement', brand: 'Ambuja / Birla', icon: '🏗️', price: 375, unit: 'bag', gst: 28, rating: 4.6, grade: 'PPC', strength: '33–43 N/mm² (28 days)', bestFor: ['Brickwork', 'Plastering', 'Tiling', 'Non-structural RCC'], pros: ['Cheaper', 'Better workability', 'Less heat generation', 'Flyash reduces CO2'], cons: ['Lower strength than OPC 53', 'Slower setting time', 'Not for heavy structural load'], is_code: 'IS 1489:2015', availability: 'high', eco: 4, durability: 4, workability: 5, costEfficiency: 5 },
    { id: 'psc', name: 'PSC / Slag Cement', brand: 'JSW / ACC', icon: '🏗️', price: 360, unit: 'bag', gst: 28, rating: 4.3, grade: 'PSC', strength: '33–43 N/mm² (28 days)', bestFor: ['Marine structures', 'Underground', 'Sewage work'], pros: ['Highly resistant to sulphate attacks', 'Very eco-friendly', 'Low heat', 'Best for underground'], cons: ['Slow initial strength gain', 'Limited availability', 'Not suitable for columns'], is_code: 'IS 455:2015', availability: 'low', eco: 5, durability: 4, workability: 4, costEfficiency: 4 },
  ],
  steel: [
    { id: 'jsw550', name: 'JSW Neosteel Fe 550D', brand: 'JSW Steel', icon: '⚙️', price: 64000, unit: 'MT', gst: 18, rating: 4.9, grade: 'Fe 550D', strength: '550 N/mm² yield', bestFor: ['All RCC structures', 'Seismic zones', 'High-rise'], pros: ['Best value for money', 'Corrosion-resistant CRS tech', 'Excellent ductility', 'Wide dia range 8mm–32mm'], cons: ['Slightly less brand prestige than Tata'], is_code: 'IS 1786:2008', availability: 'high', eco: 3, durability: 5, workability: 4, costEfficiency: 5 },
    { id: 'tata550', name: 'Tata Tiscon Fe 550D', brand: 'Tata Steel', icon: '⚙️', price: 68000, unit: 'MT', gst: 18, rating: 4.8, grade: 'Fe 550D', strength: '550 N/mm² yield', bestFor: ['Premium projects', 'Government contracts', 'Infrastructure'], pros: ['India\'s most trusted brand', 'Tempcore quench technology', 'Deep rib pattern for bonding', 'High resale value'], cons: ['~₹4000/MT more expensive', 'Premium pricing'], is_code: 'IS 1786:2008', availability: 'high', eco: 3, durability: 5, workability: 4, costEfficiency: 3 },
    { id: 'sail500', name: 'SAIL TMT Fe 500D', brand: 'SAIL', icon: '⚙️', price: 58000, unit: 'MT', gst: 18, rating: 4.4, grade: 'Fe 500D', strength: '500 N/mm² yield', bestFor: ['Budget residential', 'Rural construction', 'Fencing'], pros: ['Government-backed SAIL quality', 'Most affordable grade', 'Good for light RCC'], cons: ['Lower strength Fe 500 vs 550', 'Less ductility', 'Not ideal for seismic zones'], is_code: 'IS 1786:2008', availability: 'medium', eco: 3, durability: 4, workability: 4, costEfficiency: 5 },
  ],
  sand: [
    { id: 'river', name: 'Double-Washed River Sand', brand: 'Girna / Tapi River', icon: '🌊', price: 6200, unit: 'brass', gst: 5, rating: 4.9, grade: 'Coarse Grade', strength: 'Natural silica bond', bestFor: ['RCC mixing', 'Foundation', 'Brickwork', 'Plinth filling'], pros: ['Natural rounded grains — best cement bonding', 'Low silt (<1%)', 'Proven for generations', 'Superior concrete finish'], cons: ['Expensive', 'Scarce due to mining ban', 'Silt varies by source'], is_code: 'IS 383:2016 Zone II', availability: 'medium', eco: 2, durability: 5, workability: 5, costEfficiency: 3 },
    { id: 'msand', name: 'M-Sand (Manufactured Sand)', brand: 'Crushed Basalt', icon: '🌊', price: 4800, unit: 'brass', gst: 5, rating: 4.5, grade: 'Zone II Cubical', strength: 'Angular basalt', bestFor: ['RCC substitute', 'Plastering', 'Block work'], pros: ['₹1400/brass cheaper than river sand', 'Zero silt guaranteed', 'Eco-friendly (no mining)', 'Consistent grading'], cons: ['Angular shape — slightly rough finish', 'Needs more water in concrete', 'Plastering quality slightly less'], is_code: 'IS 383:2016', availability: 'high', eco: 5, durability: 4, workability: 3, costEfficiency: 5 },
    { id: 'plaster', name: 'Fine Plaster Sand', brand: 'Tapi River', icon: '🌊', price: 5500, unit: 'brass', gst: 5, rating: 4.7, grade: 'Fine Grade Zone III', strength: 'Ultra-fine natural', bestFor: ['Wall plastering', 'POP work', 'Tile bedding'], pros: ['Ultra-smooth finish', 'Triple-washed zero clay', 'Perfect for internal walls'], cons: ['Only for plastering, not RCC', 'Higher cost than M-Sand'], is_code: 'IS 383:2016 Zone III', availability: 'medium', eco: 2, durability: 4, workability: 5, costEfficiency: 3 },
  ],
  bricks: [
    { id: 'clay', name: 'Red Clay Bricks (Kiln-Fired)', brand: 'Local Kilns', icon: '🧱', price: 8.5, unit: 'pc', gst: 12, rating: 4.7, grade: 'Class 1 IS 1077', strength: '>75 kg/cm²', bestFor: ['External walls', 'Boundary walls', 'Load bearing'], pros: ['Cheapest option', 'Natural clay — breathable', 'Traditional trusted material', 'Good thermal mass'], cons: ['Heavy — more foundation load', 'Variable quality per kiln', 'Not eco (uses topsoil)'], is_code: 'IS 1077:1992', availability: 'high', eco: 2, durability: 4, workability: 4, costEfficiency: 5 },
    { id: 'aac', name: 'AAC Blocks (Siporex)', brand: 'Siporex / Ultratech', icon: '🧱', price: 115, unit: 'pc', gst: 12, rating: 4.8, grade: 'Grade 3–4', strength: '3–4 N/mm²', bestFor: ['High-rise infill walls', 'Insulated rooms', 'Partition walls'], pros: ['60% lighter than bricks', 'Excellent insulation (saves AC cost)', 'Faster construction (larger blocks)', 'Earthquake-resistant'], cons: ['More expensive per piece', 'Needs special adhesive', 'Lower compressive strength', 'Cannot be load-bearing'], is_code: 'IS 2185 Pt.3', availability: 'medium', eco: 4, durability: 5, workability: 5, costEfficiency: 3 },
    { id: 'hollow', name: 'Concrete Hollow Blocks', brand: 'Local Manufacturers', icon: '🧱', price: 38, unit: 'pc', gst: 12, rating: 4.4, grade: '100mm/150mm/200mm', strength: '3.5–5 N/mm²', bestFor: ['Compound walls', 'Non-load bearing partitions', 'Commercial buildings'], pros: ['Good balance of cost and strength', 'Quick to lay (larger)', 'Can be reinforced', 'Low moisture absorption'], cons: ['Not as insulating as AAC', 'Heavier than AAC', 'Rough surface needs thick plaster'], is_code: 'IS 2185 Pt.1', availability: 'high', eco: 3, durability: 4, workability: 3, costEfficiency: 4 },
  ],
};

const CATEGORIES = [
  { id: 'cement', label: '🏗️ Cement', desc: 'OPC vs PPC vs PSC' },
  { id: 'steel', label: '⚙️ Steel', desc: 'JSW vs Tata vs SAIL' },
  { id: 'sand', label: '🌊 Sand', desc: 'River vs M-Sand vs Plaster' },
  { id: 'bricks', label: '🧱 Bricks', desc: 'Clay vs AAC vs Hollow' },
];

function RatingBar({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-4 h-1.5 rounded-full ${i < value ? color : 'bg-white/10'}`} />
      ))}
    </div>
  );
}

export default function ComparePage() {
  const [category, setCategory] = useState('cement');
  const [selected, setSelected] = useState<string[]>([]);

  const materials = COMPARISON_DATA[category];
  const selectedMaterials = selected.length > 0
    ? materials.filter(m => selected.includes(m.id))
    : materials;

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 3 ? prev : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d0d16] via-blue-900/5 to-[#0d0d16] border-b border-premium-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-blue-400 uppercase tracking-wider">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Expert Material Comparison</span>
          </div>
          <h1 className="text-4xl font-extrabold font-display text-white">
            Compare Building <span className="text-const-orange">Materials</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Side-by-side comparison of materials with prices, IS codes, pros/cons, and expert ratings. Make informed decisions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Category Selector */}
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setCategory(cat.id); setSelected([]); }}
              className={`px-5 py-3 rounded-2xl border text-left transition-all ${
                category === cat.id ? 'bg-const-orange/15 border-const-orange' : 'bg-white/3 border-premium-border hover:bg-white/5'
              }`}>
              <div className="text-sm font-bold text-white">{cat.label}</div>
              <div className="text-[10px] text-gray-500">{cat.desc}</div>
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className={`grid gap-4 min-w-[700px]`} style={{ gridTemplateColumns: `repeat(${selectedMaterials.length}, 1fr)` }}>
            {selectedMaterials.map((mat, idx) => (
              <motion.div key={mat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`glassmorphism border rounded-3xl overflow-hidden ${
                  idx === 0 ? 'border-const-orange/40' : 'border-premium-border'
                }`}>
                {/* Header */}
                <div className={`p-5 border-b border-premium-border/40 ${idx === 0 ? 'bg-const-orange/5' : ''}`}>
                  {idx === 0 && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-const-orange bg-const-orange/10 border border-const-orange/20 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                      <Award className="w-3 h-3" /> JSR Recommended
                    </span>
                  )}
                  <div className="text-2xl mb-2">{mat.icon}</div>
                  <h3 className="text-sm font-extrabold text-white">{mat.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{mat.brand}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-xl font-extrabold text-const-orange">₹{mat.price.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-gray-500">/{mat.unit} +{mat.gst}%GST</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-const-orange text-const-orange" />
                    <span className="text-xs text-gray-300 font-bold">{mat.rating}</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    {[
                      { label: 'Grade', value: mat.grade },
                      { label: 'Strength', value: mat.strength },
                      { label: 'IS Code', value: mat.is_code },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-xs">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="text-white font-semibold text-right max-w-[60%]">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rating Bars */}
                  <div className="space-y-2 pt-2 border-t border-premium-border/30">
                    {[
                      { label: 'Durability', value: mat.durability, color: 'bg-green-400' },
                      { label: 'Workability', value: mat.workability, color: 'bg-blue-400' },
                      { label: 'Cost Efficiency', value: mat.costEfficiency, color: 'bg-const-orange' },
                      { label: 'Eco-Friendly', value: mat.eco, color: 'bg-emerald-400' },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{r.label}</span>
                        <RatingBar value={r.value} color={r.color} />
                      </div>
                    ))}
                  </div>

                  {/* Best For */}
                  <div className="space-y-1.5 pt-2 border-t border-premium-border/30">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Best For</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mat.bestFor.map(tag => (
                        <span key={tag} className="text-[9px] bg-white/5 border border-premium-border/40 text-gray-300 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Pros */}
                  <div className="space-y-1.5 pt-2 border-t border-premium-border/30">
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">✅ Advantages</span>
                    <ul className="space-y-1">
                      {mat.pros.map(p => (
                        <li key={p} className="flex gap-1.5 text-[10px] text-gray-300">
                          <Check className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="space-y-1.5 pt-2 border-t border-premium-border/30">
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">⚠️ Limitations</span>
                    <ul className="space-y-1">
                      {mat.cons.map(c => (
                        <li key={c} className="flex gap-1.5 text-[10px] text-gray-400">
                          <X className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Availability */}
                  <div className="pt-2 border-t border-premium-border/30 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500">Availability</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      mat.availability === 'high' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                      mat.availability === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                      'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}>{mat.availability.charAt(0).toUpperCase() + mat.availability.slice(1)}</span>
                  </div>

                  {/* CTA */}
                  <a href="/marketplace" className="block w-full text-center bg-const-orange/10 border border-const-orange/30 text-const-orange text-xs font-bold py-2.5 rounded-xl hover:bg-const-orange hover:text-white transition-all mt-3">
                    Order This →
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Expert Tip */}
        <div className="glassmorphism border border-blue-500/20 rounded-3xl p-6 flex gap-4 items-start">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">💡 JSR Expert Recommendation</h3>
            {category === 'cement' && <p className="text-xs text-gray-400 leading-relaxed">Use <strong className="text-const-orange">OPC 53</strong> for all RCC structural work (columns, beams, slabs). Use <strong className="text-const-orange">PPC</strong> for brickwork mortar and plastering. This mix saves ~8% on cement cost while maintaining full structural integrity.</p>}
            {category === 'steel' && <p className="text-xs text-gray-400 leading-relaxed"><strong className="text-const-orange">JSW Fe 550D</strong> offers the best value at ₹4000/MT less than Tata Tiscon with identical IS 1786 certification. For premium government contracts, Tata Tiscon may be specified. Always buy <strong>Fe 550D</strong> (not Fe 500) for earthquake resistance.</p>}
            {category === 'sand' && <p className="text-xs text-gray-400 leading-relaxed">Use <strong className="text-const-orange">River Sand</strong> for RCC work where concrete finish matters. Switch to <strong className="text-const-orange">M-Sand</strong> for brickwork and non-visible concrete to save ₹1400/brass. Use <strong>Fine Plaster Sand</strong> only for internal wall plastering.</p>}
            {category === 'bricks' && <p className="text-xs text-gray-400 leading-relaxed">For G+2 and above, <strong className="text-const-orange">AAC Blocks</strong> reduce dead load by 60%, allowing smaller columns/foundation — saving 10-15% on overall structural cost. For G+0 and boundary walls, <strong>Red Clay Bricks</strong> remain the most economical choice.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
