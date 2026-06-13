'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Star, Building2, Truck, Check, ShieldCheck, 
  Award, Users, Sparkles, Zap, ArrowDown, MapPin, Phone, 
  Mail, Play, ChevronRight, Calculator, Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StatProps {
  end: number;
  label: string;
  suffix?: string;
}

function StatItem({ end, label, suffix = '' }: StatProps) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const duration = 1500;
    const increment = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [end, hasStarted]);

  return (
    <div ref={containerRef} className="text-center p-6 glassmorphism rounded-3xl border border-premium-border transition-transform hover:scale-[1.03] duration-300">
      <div className="text-3xl md:text-5xl font-extrabold font-display text-const-orange text-glow-orange">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-bold tracking-wider uppercase">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Scroll Progress Hooks
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pageContainerRef,
    offset: ["start start", "end end"]
  });

  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    {
      name: 'Anil Deshpande',
      role: t('test.t1.role'),
      text: t('test.t1.text'),
      rating: 5,
      project: t('test.t1.project')
    },
    {
      name: 'Sanjay Mahajan',
      role: t('test.t2.role'),
      text: t('test.t2.text'),
      rating: 5,
      project: t('test.t2.project')
    },
    {
      name: 'Vikram Salunkhe',
      role: t('test.t3.role'),
      text: t('test.t3.text'),
      rating: 5,
      project: t('test.t3.project')
    }
  ];

  // Before/After Project completion slider state
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Inquiry Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    division: 'materials',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleFormSubmit = async (e: React.FormEvent) => {
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
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          division: 'materials',
          message: ''
        });
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  // Active product card index to trigger rotation descriptions
  const [activeProduct, setActiveProduct] = useState(0);
  const products = [
    { name: t('prod.p1.name'), desc: t('prod.p1.desc'), spec: t('prod.p1.spec'), rate: t('prod.p1.rate') },
    { name: t('prod.p2.name'), desc: t('prod.p2.desc'), spec: t('prod.p2.spec'), rate: t('prod.p2.rate') },
    { name: t('prod.p3.name'), desc: t('prod.p3.desc'), spec: t('prod.p3.spec'), rate: t('prod.p3.rate') },
    { name: t('prod.p4.name'), desc: t('prod.p4.desc'), spec: t('prod.p4.spec'), rate: t('prod.p4.rate') },
  ];

  return (
    <div ref={pageContainerRef} className="relative select-none z-10 space-y-36 pb-32">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-const-orange via-orange-400 to-amber-500 origin-[0%] z-50 shadow-[0_0_10px_rgba(242,100,25,0.7)]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* SECTION 1: HERO */}
      <section className="relative min-h-[100vh] flex flex-col justify-center items-center px-6 text-center pt-24">
        <div className="max-w-4xl space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2.5 bg-const-orange/10 dark:bg-const-orange/5 border border-const-orange/20 dark:border-const-orange/10 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-[0.15em] text-const-orange uppercase shadow-sm shadow-const-orange/5"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-const-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-const-orange"></span>
            </span>
            <span>{t('hero.award')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl sm:text-7xl font-extrabold font-display tracking-tight text-gray-900 dark:text-white leading-[1.1]"
          >
            {t('hero.title_part1')} <br />
            <span className="text-const-orange bg-clip-text text-glow-orange">{t('hero.title_part2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/marketplace"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-const-orange to-amber-600 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
              <span>{t('hero.cta.portal')}</span>
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </Link>
            <Link
              href="/quotation"
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-950 dark:text-white border border-premium-border font-extrabold text-sm px-8 py-4 rounded-2xl transition-all block text-center"
            >
              {t('hero.cta.contact')}
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-1 opacity-60 animate-bounce">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{t('hero.scroll_indicator')}</span>
          <ArrowDown className="w-4 h-4 text-const-orange" />
        </div>
      </section>

      {/* SECTION 2: COMPANY STORY TIMELINE */}
      <section className="max-w-5xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-[10px] font-black text-const-orange tracking-[0.2em] uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-const-orange animate-pulse" />
            {t('story.sub')}
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-gray-900 dark:text-white">{t('story.title')}</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('story.desc')}</p>
        </div>

        <div className="space-y-20 relative">
          {[
            { year: '2012', title: t('story.m1.title'), desc: t('story.m1.desc') },
            { year: '2016', title: t('story.m2.title'), desc: t('story.m2.desc') },
            { year: '2020', title: t('story.m3.title'), desc: t('story.m3.desc') },
            { year: '2026', title: t('story.m4.title'), desc: t('story.m4.desc') }
          ].map((milestone, i) => (
            <motion.div
              key={milestone.year}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {i % 2 === 0 ? (
                <>
                  <div className="col-span-1 md:col-span-6 space-y-4 text-left glassmorphism p-8 rounded-3xl border border-premium-border/80 hover:border-const-orange/30 transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-const-orange/10 border border-const-orange/20 text-xl font-black text-const-orange">
                      {milestone.year}
                    </div>
                    <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white">{milestone.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{milestone.desc}</p>
                  </div>
                  <div className="hidden md:block col-span-6 min-h-[120px] pointer-events-none" />
                </>
              ) : (
                <>
                  <div className="hidden md:block col-span-6 min-h-[120px] pointer-events-none" />
                  <div className="col-span-1 md:col-span-6 space-y-4 text-left glassmorphism p-8 rounded-3xl border border-premium-border/80 hover:border-const-orange/30 transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-const-orange/10 border border-const-orange/20 text-xl font-black text-const-orange">
                      {milestone.year}
                    </div>
                    <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white">{milestone.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{milestone.desc}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 3: PRODUCT SHOWCASE */}
      <section className="max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-[10px] font-black text-const-orange tracking-[0.2em] uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-const-orange animate-pulse" />
            {t('prod.sub')}
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-gray-900 dark:text-white">{t('prod.title')}</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('prod.desc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Product Cards List */}
          <div className="lg:col-span-5 space-y-3">
            {products.map((prod, idx) => (
              <div
                key={prod.name}
                onMouseEnter={() => setActiveProduct(idx)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  activeProduct === idx 
                    ? 'bg-gradient-to-r from-const-orange/10 to-amber-500/5 border-const-orange' 
                    : 'bg-white dark:bg-white/3 border-premium-border hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  activeProduct === idx ? 'bg-const-orange text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  0{idx + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{prod.name}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{prod.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Specification Viewport */}
          <div className="lg:col-span-7 glassmorphism p-8 rounded-3xl border border-premium-border/80 min-h-[350px] flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0c0d14] to-transparent text-left">
            <div className="absolute top-0 right-0 w-48 h-48 bg-const-orange/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 bg-const-orange/10 border border-const-orange/20 text-const-orange text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {t('prod.status')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {products[activeProduct].name}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                {t('prod.cert_desc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">{t('prod.specs_label')}</span>
                <p className="text-sm font-extrabold text-white">{products[activeProduct].spec}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">{t('prod.rate_label')}</span>
                <p className="text-sm font-extrabold text-const-orange">{products[activeProduct].rate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <Link href="/marketplace" className="inline-flex items-center gap-2 bg-const-orange hover:bg-amber-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors">
                <span>{t('prod.btn_market')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/compare" className="text-xs text-gray-400 hover:text-white font-bold transition-colors">
                {t('prod.btn_compare')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW WE SUPPLY (LOGISTICS JOURNEY) */}
      <section className="max-w-5xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-[10px] font-black text-const-orange tracking-[0.2em] uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-const-orange animate-pulse" />
            {t('log.sub')}
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-gray-900 dark:text-white">{t('log.title')}</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('log.desc')}</p>
        </div>

        <div className="space-y-20 relative">
          {[
            { step: '01', title: t('log.s1.title'), desc: t('log.s1.desc'), detail: t('log.s1.detail') },
            { step: '02', title: t('log.s2.title'), desc: t('log.s2.desc'), detail: t('log.s2.detail') },
            { step: '03', title: t('log.s3.title'), desc: t('log.s3.desc'), detail: t('log.s3.detail') },
            { step: '04', title: t('log.s4.title'), desc: t('log.s4.desc'), detail: t('log.s4.detail') }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {idx % 2 === 0 ? (
                <>
                  <div className="col-span-1 md:col-span-6 glassmorphism p-8 rounded-3xl border border-premium-border/80 space-y-4 hover:border-const-orange/30 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-4xl font-black text-const-orange/20">{item.step}</span>
                      <span className="text-[9px] bg-white/5 border border-premium-border text-gray-400 font-bold px-2.5 py-0.5 rounded uppercase font-mono">{item.detail}</span>
                    </div>
                    <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="hidden md:block col-span-6 min-h-[120px] pointer-events-none" />
                </>
              ) : (
                <>
                  <div className="hidden md:block col-span-6 min-h-[120px] pointer-events-none" />
                  <div className="col-span-1 md:col-span-6 glassmorphism p-8 rounded-3xl border border-premium-border/80 space-y-4 hover:border-const-orange/30 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-4xl font-black text-const-orange/20">{item.step}</span>
                      <span className="text-[9px] bg-white/5 border border-premium-border text-gray-400 font-bold px-2.5 py-0.5 rounded uppercase font-mono">{item.detail}</span>
                    </div>
                    <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5: WHY CHOOSE US */}
      <section className="max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-[10px] font-black text-const-orange tracking-[0.2em] uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-const-orange animate-pulse" />
            {t('wcu.sub')}
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-gray-900 dark:text-white">{t('wcu.title')}</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('wcu.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { title: t('wcu.i1.title'), desc: t('wcu.i1.desc') },
            { title: t('wcu.i2.title'), desc: t('wcu.i2.desc') },
            { title: t('wcu.i3.title'), desc: t('wcu.i3.desc') },
            { title: t('wcu.i4.title'), desc: t('wcu.i4.desc') },
            { title: t('wcu.i5.title'), desc: t('wcu.i5.desc') },
            { title: t('wcu.i6.title'), desc: t('wcu.i6.desc') }
          ].map((item, idx) => (
            <motion.div
              whileHover={{ y: -6 }}
              key={idx}
              className="p-6 bg-white/3 hover:bg-white/5 border border-premium-border rounded-3xl space-y-4 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-const-orange/10 flex items-center justify-center border border-const-orange/20 text-const-orange">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 6: PROJECTS SHOWCASE (BEFORE/AFTER SLIDER) */}
      <section className="max-w-5xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-[10px] font-black text-const-orange tracking-[0.2em] uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-const-orange animate-pulse" />
            {t('proj.sub')}
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-gray-900 dark:text-white">{t('proj.title')}</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('proj.desc')}</p>
        </div>

        {/* Interactive Slider Container */}
        <div 
          ref={sliderRef}
          onMouseMove={(e) => handleSliderMove(e.clientX)}
          onTouchMove={handleTouchMove}
          className="relative h-[300px] md:h-[450px] w-full rounded-3xl border border-premium-border overflow-hidden select-none cursor-ew-resize"
        >
          {/* Before State (Raw excavation) */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950 flex flex-col justify-center items-center text-center p-8">
            <Building2 className="w-16 h-16 text-gray-700 mb-4 animate-pulse" />
            <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-500 uppercase tracking-widest font-black">{t('proj.before.label')}</span>
            <h4 className="text-2xl font-bold font-display text-gray-500 mt-2">{t('proj.before.title')}</h4>
            <p className="text-xs text-gray-600 mt-1">{t('proj.before.desc')}</p>
          </div>

          {/* After State (Completed complex) */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-[#0c0d14] to-const-dark flex flex-col justify-center items-center text-center p-8 transition-all"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            <Building2 className="w-16 h-16 text-const-orange mb-4" />
            <span className="text-[10px] bg-const-orange/10 border border-const-orange/20 px-3 py-1 rounded-full text-const-orange uppercase tracking-widest font-black">{t('proj.after.label')}</span>
            <h4 className="text-2xl font-bold font-display text-white mt-2">{t('proj.after.title')}</h4>
            <p className="text-xs text-gray-400 mt-1">{t('proj.after.desc')}</p>
          </div>

          {/* Handle Line */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-const-orange pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Handle Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-const-orange border-2 border-white flex items-center justify-center shadow-lg text-white text-xs font-black">
              ↔
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          {[
            { count: '100%', title: t('proj.s1.title'), subtitle: t('proj.s1.sub') },
            { count: '1,200+', title: t('proj.s2.title'), subtitle: t('proj.s2.sub') },
            { count: '24/7', title: t('proj.s3.title'), subtitle: t('proj.s3.sub') },
            { count: 'Zero', title: t('proj.s4.title'), subtitle: t('proj.s4.sub') }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-white/3 border border-premium-border/60 rounded-2xl">
              <p className="text-2xl md:text-3xl font-black font-display text-const-orange">{item.count}</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">{item.title}</p>
              <p className="text-[10px] text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-8">
        <h2 className="text-[10px] font-black text-const-orange tracking-[0.2em] uppercase flex items-center justify-center gap-1.5 font-mono">{t('test.sub')}</h2>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-display">{t('test.title')}</h3>
        
        <div className="relative min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex justify-center space-x-1">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-const-orange text-const-orange" />
                ))}
              </div>
              <blockquote className="text-base sm:text-xl italic text-gray-800 dark:text-white max-w-2xl mx-auto leading-relaxed">
                "{testimonials[activeTestimonial].text}"
              </blockquote>
              <div>
                <cite className="not-italic font-bold text-sm text-gray-900 dark:text-gray-300 block">
                  {testimonials[activeTestimonial].name}
                </cite>
                <span className="text-xs text-gray-500">
                  {testimonials[activeTestimonial].role} • <strong className="text-const-orange font-normal">{testimonials[activeTestimonial].project}</strong>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel indicators */}
        <div className="flex justify-center space-x-2 pt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTestimonial(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeTestimonial === index ? 'w-8 bg-const-orange' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </section>

      {/* SECTION 8: CONTACT & CTA (FORM + INTERACTIVE MAP DETAILS) */}
      <section id="inquiry" className="max-w-6xl mx-auto px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-[10px] font-black text-const-orange tracking-[0.2em] uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-const-orange animate-pulse" />
            {t('contact.sub')}
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold font-display text-gray-900 dark:text-white">{t('contact.title')}</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{t('contact.desc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details & 3D Globe visual block */}
          <div className="lg:col-span-5 glassmorphism p-8 rounded-3xl border border-premium-border/80 flex flex-col justify-between relative bg-gradient-to-br from-[#0a0a0f] to-transparent text-left">
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white font-display">{t('contact.desk_title')}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('contact.desk_desc')}
              </p>

              <div className="space-y-4 text-xs text-gray-300">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-const-orange" />
                  <div>
                    <p className="font-bold text-white">{t('contact.loc_label')}</p>
                    <p className="text-[10px] text-gray-500">{t('contact.loc_address')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-const-orange" />
                  <div>
                    <p className="font-bold text-white">{t('contact.phone_label')}</p>
                    <p className="text-[10px] text-gray-500">+91 80108 71044</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-const-orange" />
                  <div>
                    <p className="font-bold text-white">{t('contact.email_label')}</p>
                    <p className="text-[10px] text-gray-500">info@jayshreeramgroup.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 mt-6">
              <span className="text-[10px] text-const-orange font-bold uppercase tracking-wider block">{t('contact.globe_active')}</span>
              <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                {t('contact.globe_desc')}
              </p>
            </div>
          </div>

          {/* Contact Sourcing Form */}
          <form onSubmit={handleFormSubmit} className="lg:col-span-7 glassmorphism p-8 rounded-3xl border border-premium-border space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{t('inq.name')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange focus:bg-white/10 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{t('inq.phone')} *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange focus:bg-white/10 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{t('inq.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange focus:bg-white/10 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{t('inq.division')} *</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full bg-[#121217] border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange transition-colors"
                >
                  <option value="materials">{t('inq.div.materials')}</option>
                  <option value="sand">{t('inq.div.sand')}</option>
                  <option value="hotel">{t('inq.div.hotel')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{t('inq.message')}</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange focus:bg-white/10 transition-colors"
              />
            </div>

            {formStatus === 'success' && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold">
                ✓ {t('inq.success')}
              </div>
            )}

            {formStatus === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {t('inq.error')}
              </div>
            )}

            <button
              type="submit"
              disabled={formStatus === 'sending'}
              className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-extrabold text-sm py-4 rounded-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {formStatus === 'sending' ? t('inq.sending') : t('inq.submit')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
