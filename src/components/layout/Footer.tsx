'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  // JSON-LD Local Business Schema Markup
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Jay Shree Ram Group',
    'image': 'https://example.com/logo.png',
    '@id': 'https://example.com/#localbusiness',
    'url': 'https://example.com',
    'telephone': '+919975175762',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Girad, Taluka Bhadgaon',
      'addressLocality': 'Jalgaon',
      'addressRegion': 'Maharashtra',
      'postalCode': '424105',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 20.6698,
      'longitude': 75.2284
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'opens': '08:00',
        'closes': '20:00'
      }
    ],
    'sameAs': [
      'https://facebook.com/jayshreeramgroup',
      'https://instagram.com/jayshreeramgroup'
    ]
  };

  return (
    <footer className="bg-[#08080c] border-t border-premium-border/60 text-gray-400 pt-16 pb-8 relative z-10">
      {/* Inject schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Profile */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-display text-white tracking-widest bg-gradient-to-r from-const-orange to-steel-gray bg-clip-text text-transparent">
              JAY SHREE RAM
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Leading wholesale supplier of building materials, high-ductility TMT steel rebars, premium brand cement, aggregates, and transit logistics operations.
            </p>
            <div className="flex items-center space-x-2 text-xs text-const-orange mt-4 bg-const-orange/5 border border-const-orange/20 px-3 py-1.5 rounded-lg w-max">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO 9001:2015 Certified Supplier</span>
            </div>
          </div>

          {/* Business Sitemaps */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-6 border-l-2 border-const-orange pl-3">
              Corporate Sitemap
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/products" className="hover:text-const-orange transition-colors block">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-const-orange transition-colors block">
                  Contractor Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-const-orange transition-colors block">
                  Infrastructure Projects
                </Link>
              </li>
              <li>
                <Link href="/quotation" className="hover:text-const-orange transition-colors block">
                  Interactive Quotation Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-6 border-l-2 border-const-orange pl-3">
              Wholesale Office
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-const-orange shrink-0 mt-0.5" />
                <span>Girad, Taluka Bhadgaon, Dist Jalgaon, Maharashtra, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-const-orange shrink-0" />
                <a href="tel:+918010871044" className="hover:text-white transition-colors">
                  +91 8010871044
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-const-orange shrink-0" />
                <a href="mailto:info@jayshreeram.com" className="hover:text-white transition-colors">
                  info@jayshreeram.com
                </a>
              </li>
            </ul>
          </div>

          {/* Operation Timings */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-6 border-l-2 border-const-orange pl-3">
              Operating Hours
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-const-orange shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Sales & Office Desk</p>
                  <p className="text-xs text-gray-400">Mon - Sat: 09:00 AM - 08:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-const-orange shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Logistics & Dispatches</p>
                  <p className="text-xs text-gray-400">24/7 Delivery & Site Dropping</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-premium-border/60 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {currentYear} Jay Shree Ram. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/admin" className="hover:text-const-orange transition-colors font-semibold">
              Admin Login Dashboard
            </Link>
            <span className="text-gray-800">|</span>
            <Link href="/sitemap" className="hover:text-white transition-colors">
              Sitemap.xml
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
