'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Image as ImageIcon, ZoomIn, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  category: 'fleet' | 'materials' | 'warehouses' | 'projects';
  title_en: string;
  title_hi: string;
  title_mr: string;
  url: string;
}

export default function GalleryPage() {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'fleet' | 'materials' | 'warehouses' | 'projects'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'g-1',
      category: 'warehouses',
      title_en: 'Bulk Cement Storage & Silo Facility',
      title_hi: 'थोक सीमेंट भंडारण और साइलो सुविधा',
      title_mr: 'सिमेंट गोडाऊन आणि साठवणूक केंद्र',
      url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'g-2',
      category: 'fleet',
      title_en: 'Commercial Heavy Dumpers in Sand Logistics',
      title_hi: 'रेत रसद में व्यावसायिक भारी डंपर',
      title_mr: 'वाळू वाहतूक करणारे जड डंपर्स ताफा',
      url: 'https://images.unsplash.com/photo-1501700490588-4577880f3392?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'g-3',
      category: 'materials',
      title_en: 'High-Tensile TMT Steel Rebars in Storage',
      title_hi: 'भंडारण में उच्च-तनाव टीएमटी स्टील सरिये',
      title_mr: 'गोदामातील मजबूत टीएमटी स्टील सरळ्या',
      url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'g-4',
      category: 'projects',
      title_en: 'Completed Commercial Project Site',
      title_hi: 'पूर्ण हुई व्यावसायिक परियोजना स्थल',
      title_mr: 'पूर्ण झालेला व्यावसायिक प्रकल्प परिसर',
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'g-5',
      category: 'materials',
      title_en: 'Premium Washed Aggregates Cargo Batching',
      title_hi: 'प्रीमियम धुली हुई गिट्टी बैचिंग',
      title_mr: 'प्रीमियम वॉश केलेली दगडी खडी बॅचिंग',
      url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'g-6',
      category: 'warehouses',
      title_en: 'Central Building Materials Warehouse',
      title_hi: 'केंद्रीय भवन निर्माण सामग्री गोदाम',
      title_mr: 'मुख्य बांधकाम साहित्य साठवणूक गोदाम',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
    }
  ];

  const filteredItems = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  const getLocalizedTitle = (item: GalleryItem) => {
    return language === 'hi' ? item.title_hi : language === 'mr' ? item.title_mr : item.title_en;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Operational Portfolio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          Enterprise Showcase Gallery
        </h1>
        <p className="text-sm text-gray-400">
          Visual documentation of our heavy cargo operations, structural material warehouses, distribution transit fleets, and supplied commercial sites.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { code: 'all', label: 'All Operations' },
          { code: 'fleet', label: 'Transit Fleet' },
          { code: 'materials', label: 'Building Materials' },
          { code: 'warehouses', label: 'Warehouses' },
          { code: 'projects', label: 'Supplied Projects' }
        ].map((tab) => (
          <button
            key={tab.code}
            onClick={() => setActiveFilter(tab.code as any)}
            className={`text-xs font-bold px-4 py-2.5 rounded-full border transition-all ${
              activeFilter === tab.code
                ? 'bg-gradient-to-r from-const-orange to-amber-600 text-white border-transparent shadow-lg shadow-const-orange/20'
                : 'bg-white/5 text-gray-300 border-premium-border hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="group relative h-72 glassmorphism rounded-3xl overflow-hidden border border-premium-border cursor-pointer transition-all hover:scale-[1.02] hover:border-const-orange/40"
          >
            {/* Image render */}
            <img
              src={item.url}
              alt={item.title_en}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            />
            {/* Hover details overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-6 flex flex-col justify-end opacity-90 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] bg-white/10 text-const-orange px-2 py-0.5 rounded w-max uppercase tracking-wider mb-2 border border-white/5">
                {item.category}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                {getLocalizedTitle(item)}
              </h3>
              <span className="flex items-center space-x-1 text-[10px] text-gray-400 mt-2 font-semibold">
                <ZoomIn className="w-3.5 h-3.5 text-const-orange" />
                <span>View Fullscreen</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-const-orange p-2 bg-white/5 border border-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl w-full flex flex-col space-y-4">
            <img
              src={selectedImage.url}
              alt={selectedImage.title_en}
              className="w-full max-h-[75vh] object-contain rounded-xl border border-premium-border"
            />
            <div className="text-center">
              <span className="text-xs text-const-orange font-bold uppercase tracking-wider">
                {selectedImage.category}
              </span>
              <h2 className="text-sm md:text-base font-bold text-white mt-1">
                {getLocalizedTitle(selectedImage)}
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
