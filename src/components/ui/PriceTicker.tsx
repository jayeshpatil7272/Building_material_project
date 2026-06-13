'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

interface PriceTick {
  name: string;
  icon: string;
  price: number;
  unit: string;
  change: number; // percent
  trend: 'up' | 'down' | 'stable';
}

const BASE_PRICES: PriceTick[] = [
  { name: 'OPC 53 Cement', icon: '🏗️', price: 400, unit: '/bag', change: 1.2, trend: 'up' },
  { name: 'PPC Cement', icon: '🏗️', price: 375, unit: '/bag', change: -0.5, trend: 'down' },
  { name: 'TMT Steel Fe550D', icon: '⚙️', price: 66000, unit: '/MT', change: 2.1, trend: 'up' },
  { name: 'River Sand', icon: '🌊', price: 6200, unit: '/brass', change: 0, trend: 'stable' },
  { name: 'M-Sand', icon: '🌊', price: 4800, unit: '/brass', change: -1.3, trend: 'down' },
  { name: 'Aggregate 20mm', icon: '🪨', price: 4100, unit: '/brass', change: 0.8, trend: 'up' },
  { name: 'Red Bricks', icon: '🧱', price: 8.5, unit: '/pc', change: 0, trend: 'stable' },
  { name: 'AAC Blocks', icon: '🧱', price: 115, unit: '/pc', change: -0.7, trend: 'down' },
  { name: 'Dr. Fixit LW+', icon: '💧', price: 290, unit: '/L', change: 1.5, trend: 'up' },
  { name: 'RMC M25', icon: '🏗️', price: 5200, unit: '/cum', change: 0.3, trend: 'up' },
];

export default function PriceTicker() {
  const [prices, setPrices] = useState<PriceTick[]>(BASE_PRICES);
  const [flash, setFlash] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Simulate tiny live fluctuations every 8s
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => {
        const jitter = (Math.random() - 0.5) * 0.004; // ±0.2%
        const newPrice = p.price * (1 + jitter);
        const newChange = p.change + (Math.random() - 0.5) * 0.3;
        const newTrend = newChange > 0.3 ? 'up' : newChange < -0.3 ? 'down' : 'stable';
        if (Math.abs(jitter) > 0.002) setFlash(p.name);
        return {
          ...p,
          price: parseFloat(newPrice.toFixed(p.unit === '/pc' ? 1 : 0)),
          change: parseFloat(newChange.toFixed(1)),
          trend: newTrend,
        };
      }));
      setTimeout(() => setFlash(null), 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-0 w-full z-40 px-4 md:px-6 pointer-events-none">
      <AnimatePresence>
        {isVisible ? (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="mx-auto max-w-5xl w-full bg-white/90 dark:bg-[#07070c]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full shadow-[0_10px_50px_rgba(242,100,25,0.08)] py-2.5 px-5 flex items-center justify-between pointer-events-auto border-glow"
          >
            {/* Rates Label */}
            <div className="shrink-0 bg-const-orange/10 border-r border-gray-250 dark:border-white/10 pr-4 py-1 flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <span className="text-[10px] text-const-orange font-black uppercase tracking-widest whitespace-nowrap">Live Rates</span>
            </div>

            {/* Marquee Content */}
            <div className="flex-1 overflow-hidden mx-4 relative">
              <div className="flex animate-marquee">
                {[...prices, ...prices].map((p, i) => (
                  <div
                    key={`${p.name}-${i}`}
                    className={`flex items-center space-x-2 px-5 py-0.5 shrink-0 transition-colors duration-300 rounded-full ${
                      flash === p.name ? 'bg-const-orange/10' : ''
                    }`}
                  >
                    <span className="text-xs">{p.icon}</span>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold whitespace-nowrap uppercase tracking-wider">{p.name}</span>
                    <span className={`text-xs font-black whitespace-nowrap ${flash === p.name ? 'text-const-orange' : 'text-gray-900 dark:text-gray-200'}`}>
                      ₹{p.price.toLocaleString('en-IN')}<span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">{p.unit}</span>
                    </span>
                    <span className={`flex items-center text-[9px] font-extrabold whitespace-nowrap ${
                      p.trend === 'up' ? 'text-green-500' : p.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {p.trend === 'up' ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> :
                       p.trend === 'down' ? <TrendingDown className="w-2.5 h-2.5 mr-0.5" /> :
                       <Minus className="w-2.5 h-2.5 mr-0.5" />}
                      {Math.abs(p.change)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex items-center space-x-2 pl-3 border-l border-gray-200 dark:border-white/10">
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-950 dark:hover:text-white rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                title="Dismiss ticker"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsVisible(true)}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-const-orange to-amber-600 hover:scale-105 active:scale-95 text-white rounded-full py-2.5 px-4 shadow-2xl cursor-pointer pointer-events-auto flex items-center gap-1.5 border border-white/20"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-350 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-300"></span>
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest whitespace-nowrap">Live Rates</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
