'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Filter, ShieldCheck, Truck, ShoppingBag, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Product {
  id: string;
  category: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  desc_en: string;
  desc_hi: string;
  desc_mr: string;
  brands: string[];
  specs_en: string;
  specs_hi: string;
  specs_mr: string;
  image: string;
  division: 'hotel' | 'sand' | 'materials'; // mapping: hotel=cement/steel, sand=sand/aggregate, materials=construction supplies
}

export default function ProductsPage() {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Lead Inquiry form state
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    quantity: '',
    address: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const categories = [
    { code: 'all', label_en: 'All Materials', label_hi: 'सभी सामग्री', label_mr: 'सर्व साहित्य' },
    { code: 'cement', label_en: 'Cement (OPC/PPC)', label_hi: 'सीमेंट', label_mr: 'सिमेंट' },
    { code: 'steel', label_en: 'TMT Steel Rebars', label_hi: 'सरिया / स्टील', label_mr: 'लोखंड / स्टील' },
    { code: 'sand', label_en: 'River & Plaster Sand', label_hi: 'नदी की रेत', label_mr: 'नदीची वाळू' },
    { code: 'aggregate', label_en: 'Crushed Aggregates', label_hi: 'खड़ी / गिट्टी', label_mr: 'दगडी खडी' },
    { code: 'bricks', label_en: 'Bricks & Blocks', label_hi: 'ईंटें और ब्लॉक', label_mr: 'विटा आणि ब्लॉक्स' },
    { code: 'concrete', label_en: 'Ready-Mix Concrete', label_hi: 'रेडी-मिक्स कंक्रीट', label_mr: 'रेडी-मिक्स काँक्रीट' },
    { code: 'plumbing', label_en: 'Plumbing & Pipes', label_hi: 'प्लंबिंग पाइप्स', label_mr: 'प्लंबिंग पाईप्स' },
    { code: 'electrical', label_en: 'Electrical & Wires', label_hi: 'इलेक्ट्रिकल वायर', label_mr: 'इलेक्ट्रिकल वायर' },
    { code: 'chemicals', label_en: 'Waterproofing & Chemicals', label_hi: 'वॉटरप्रूफिंग केमिकल', label_mr: 'वॉटरप्रूफिंग केमिकल' },
    { code: 'hardware', label_en: 'Tools & Hardware', label_hi: 'औजार और हार्डवेयर', label_mr: 'साहित्य आणि हार्डवेअर' },
    { code: 'pavers', label_en: 'Paver Blocks & Tiles', label_hi: 'पेवर ब्लॉक', label_mr: 'पेव्हर ब्लॉक्स' },
    { code: 'roofing', label_en: 'Roofing Sheets', label_hi: 'छत की चादरें', label_mr: 'पतरे / रूफिंग' }
  ];

  const products: Product[] = [
    {
      id: 'p-1',
      category: 'cement',
      name_en: 'UltraTech OPC 53 Grade Cement',
      name_hi: 'अल्ट्राटेक ओपीसी 53 ग्रेड सीमेंट',
      name_mr: 'अल्ट्राटेक ओपीसी ५३ ग्रेड सिमेंट',
      desc_en: 'High-strength Ordinary Portland Cement ideal for load-bearing structures, high-rise buildings, and heavy reinforcement works.',
      desc_hi: 'लोड-बेयरिंग संरचनाओं, गगनचुंबी इमारतों और भारी सुदृढीकरण कार्यों के लिए आदर्श उच्च शक्ति वाला साधारण पोर्टलैंड सीमेंट।',
      desc_mr: 'लोड-बेअरिंग स्ट्रक्चर्स, उंच इमारती आणि जड काँक्रीट कामांसाठी आदर्श असणारे अत्यंत मजबूत सिमेंट.',
      brands: ['UltraTech Cement'],
      specs_en: 'Grade 53 OPC, BIS Certified, 50kg bag packing',
      specs_hi: 'ग्रेड 53 ओपीसी, बीआईएस प्रमाणित, 50 किलोग्राम बैग पैकिंग',
      specs_mr: 'ग्रेड ५३ ओपीसी, बीआयएस प्रमाणित, ५० किलो बॅग पॅकिंग',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80',
      division: 'hotel'
    },
    {
      id: 'p-2',
      category: 'cement',
      name_en: 'ACC Gold Water Shield Cement',
      name_hi: 'एसीसी गोल्ड वॉटर शील्ड सीमेंट',
      name_mr: 'एसीसी गोल्ड वॉटर शील्ड सिमेंट',
      desc_en: 'Water-repellent premium PPC cement customized with active micro-particles to protect foundation plinths and concrete structures from dampness.',
      desc_hi: 'नींव और कंक्रीट संरचनाओं को नमी से बचाने के लिए सक्रिय सूक्ष्म कणों के साथ अनुकूलित जल-विकर्षक प्रीमियम पीपीसी सीमेंट।',
      desc_mr: 'पाया आणि भिंतींना ओलसरपणापासून वाचवण्यासाठी वॉटर-रिपेलेंट तंत्रज्ञान असलेले प्रीमियम पीपीसी सिमेंट.',
      brands: ['ACC Limited'],
      specs_en: 'Premium PPC, Damp Shield Tech, 50kg bag packing',
      specs_hi: 'प्रीमियम पीपीसी, डैम्प शील्ड टेक, 50 किलोग्राम बैग पैकिंग',
      specs_mr: 'प्रीमियम पीपीसी, डॅम्प शील्ड तंत्रज्ञान, ५० किलो बॅग',
      image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80',
      division: 'hotel'
    },
    {
      id: 'p-3',
      category: 'steel',
      name_en: 'JSW Neosteel FE 550D TMT Rebars',
      name_hi: 'जेएसडब्ल्यू नियोस्टील FE 550D टीएमटी सरिया',
      name_mr: 'JSW निओस्टील FE ५५०D टीएमटी स्टील',
      desc_en: 'High-ductility thermo-mechanically treated reinforcement rebars designed for seismic zones. Offers superior bending capability and stress absorption.',
      desc_hi: 'भूकंपीय क्षेत्रों के लिए डिज़ाइन किए गए उच्च-लचीलेपन वाले थर्मो-मैकेनिकली रूप से इलाज किए गए सुदृढीकरण सरिये। उत्कृष्ट झुकने की क्षमता प्रदान करते हैं।',
      desc_mr: 'भूकंपप्रवण क्षेत्रातील बांधकामासाठी डिझाइन केलेल्या अतिशय लवचिक टीएमटी सरळ्या. उत्तम दर्जाची बेंडिंग क्षमता.',
      brands: ['JSW Steel'],
      specs_en: 'Fe 550D Grade, 8mm - 32mm diameters, Corrosion Resistant',
      specs_hi: 'Fe 550D ग्रेड, 8 मिमी - 32 मिमी व्यास, संक्षारण प्रतिरोधी',
      specs_mr: 'Fe ५५०D ग्रेड, ८ मिमी ते ३२ मिमी व्यास, गंजरोधक',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80',
      division: 'hotel'
    },
    {
      id: 'p-4',
      category: 'steel',
      name_en: 'Tata Tiscon Super Ductile TMT Rebars',
      name_hi: 'टाटा टिस्कॉन सुपर डक्टाइल टीएमटी सरिया',
      name_mr: 'टाटा टिस्कॉन सुपर डक्टाईल टीएमटी स्टील',
      desc_en: 'India’s leading structural rebars processed through advanced tempcore quenching. Delivers optimized rib pattern for deep bonding with cement concrete.',
      desc_hi: 'उन्नत टेम्पकोर शमन के माध्यम से संसाधित भारत के अग्रणी संरचनात्मक सरिये। सीमेंट कंक्रीट के साथ गहरे बंधन के लिए अनुकूलित रिब पैटर्न प्रदान करते हैं।',
      desc_mr: 'भारतातील आघाडीच्या टीएमटी सरळ्या. सिमेंटसोबत मजबूत ग्रिप तयार करण्यासाठी विशेष रिब पॅटर्न.',
      brands: ['Tata Tiscon'],
      specs_en: 'SD Grade Fe 550D, Tempcore Treated, Certified Quality',
      specs_hi: 'एसडी ग्रेड Fe 550D, टेम्पकोर उपचारित, प्रमाणित गुणवत्ता',
      specs_mr: 'SD ग्रेड Fe ५५०D, टेम्पकोर प्रक्रिया केलेले, प्रमाणित दर्जा',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80',
      division: 'hotel'
    },
    {
      id: 'p-5',
      category: 'sand',
      name_en: 'Premium Double-Washed River Sand',
      name_hi: 'प्रीमियम डबल-वॉश की हुई नदी की रेत',
      name_mr: 'प्रीमियम डबल-वॉश नदीची वाळू',
      desc_en: 'Clean, double-washed river bed sand ideal for high-strength brickwork and concrete casting. Free from organic silt, clay, and gravel contaminants.',
      desc_hi: 'उच्च शक्ति वाले ईंटवर्क और कंक्रीट कास्टिंग के लिए आदर्श साफ, डबल-धुली हुई नदी के किनारे की रेत। कार्बनिक गाद, मिट्टी और बजरी से मुक्त।',
      desc_mr: 'विटांच्या बांधकामासाठी आणि काँक्रीट कास्टिंगसाठी वापरली जाणारी स्वच्छ वाळू. गाळ आणि माती विरहीत.',
      brands: ['Direct Mine Logistics Dispatch'],
      specs_en: 'Silt content < 1%, washed, coarse grade texture',
      specs_hi: 'गाद की मात्रा < 1%, धुली हुई, मोटी बनावट',
      specs_mr: 'गाळाचे प्रमाण १% पेक्षा कमी, स्वच्छ धुतलेली',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80',
      division: 'sand'
    },
    {
      id: 'p-6',
      category: 'sand',
      name_en: 'Premium Fine Plastering Sand',
      name_hi: 'प्रीमियम बारीक प्लास्टरिंग रेत',
      name_mr: 'प्रीमियम बारीक प्लास्टर वाळू',
      desc_en: 'Perfectly graded, triple-washed fine plaster sand. Creates highly smooth surface finishes on internal and external masonry walls.',
      desc_hi: 'पूरी तरह से वर्गीकृत, ट्रिपल-धुली हुई बारीक प्लास्टर रेत। आंतरिक और बाहरी चिनाई वाली दीवारों पर अत्यधिक चिकनी सतह बनाती है।',
      desc_mr: 'गुळगुळीत प्लास्टर करण्यासाठी वापरली जाणारी अत्यंत बारीक वाळू. अंतर्गत आणि बाह्य भिंतींसाठी उत्तम.',
      brands: ['Direct Mine Logistics Dispatch'],
      specs_en: 'Triple-washed, fine particle profile, no clay inclusions',
      specs_hi: 'ट्रिपल-धुली हुई, महीन कण प्रोफ़ाइल, मिट्टी का कोई समावेश नहीं',
      specs_mr: 'ट्रिपल-वॉश, बारीक कणांची वाळू, मातीचे प्रमाण नाही',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80',
      division: 'sand'
    },
    {
      id: 'p-7',
      category: 'aggregate',
      name_en: 'Basalt Aggregates (10mm / 20mm)',
      name_hi: 'बेसाल्ट गिट्टी (10 मिमी / 20 मिमी)',
      name_mr: 'बेसाल्ट खडी / गिट्टी (१० मिमी / २० मिमी)',
      desc_en: 'High-compressive strength angular basalt stone aggregates crushed at local batching centers. Perfect for beam, column, and slab structural casting.',
      desc_hi: 'स्थानीय बैचिंग केंद्रों पर कुचली गई उच्च-संपीड़न शक्ति वाली कोणीय बेसाल्ट पत्थर की गिट्टी। बीम, कॉलम और स्लैब कास्टिंग के लिए बिल्कुल सही।',
      desc_mr: 'पाय आणि खांब भरण्यासाठी लागणारी मजबूत कोणीय बेसाल्ट खडी.',
      brands: ['JSR Crusher Plant Stock'],
      specs_en: 'Angular, crushed stone, free from dust, 10mm & 20mm sizes',
      specs_hi: 'कोणीय, कुचला हुआ पत्थर, धूल से मुक्त, 10 मिमी और 20 मिमी आकार',
      specs_mr: 'कोणीय कडक दगड, धूळ विरहीत, १० मिमी आणि २० मिमी आकार',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&auto=format&fit=crop&q=80',
      division: 'sand'
    },
    {
      id: 'p-8',
      category: 'bricks',
      name_en: 'Premium Red Clay Bricks & Concrete Blocks',
      name_hi: 'प्रीमियम लाल मिट्टी की ईंटें और कंक्रीट ब्लॉक',
      name_mr: 'प्रीमियम लाल विटा आणि काँक्रीट ब्लॉक्स',
      desc_en: 'Machine-molded, kiln-baked traditional red clay bricks and load-bearing hollow/solid concrete blocks. High load threshold and water resistance.',
      desc_hi: 'मशीन-मोल्डेड, भट्टी में पकी हुई पारंपरिक लाल मिट्टी की ईंटें और लोड-बेयरिंग कंक्रीट ब्लॉक। उच्च भार सीमा और जल प्रतिरोध।',
      desc_mr: 'मशीन-मोल्डेड, भट्टीत भाजलेल्या लाल विटा आणि मजबूत लोड-बेअरिंग ब्लॉक्स.',
      brands: ['JSR Brickworks & Kiln'],
      specs_en: 'First class kiln baked, dimensional consistency, solid block option',
      specs_hi: 'प्रथम श्रेणी भट्टी में पकी हुई, आयामी स्थिरता, ठोस ब्लॉक विकल्प',
      specs_mr: 'उत्कृष्ट भट्टीतील भाजलेली वीट, प्रमाणित लांबी-रुंदी',
      image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80',
      division: 'materials'
    },
    {
      id: 'p-9',
      category: 'chemicals',
      name_en: 'Dr. Fixit Waterproofing & Concrete Admixtures',
      name_hi: 'डॉ. फिक्सिट वॉटरप्रूफिंग केमिकल',
      name_mr: 'डॉ. फिक्सिट वॉटरप्रूफिंग आणि काँक्रीट केमिकल्स',
      desc_en: 'Advanced construction chemicals, acrylic coatings, and plasticizers to enhance concrete hydration and prevent terrace, bathroom, and basement leakage.',
      desc_hi: 'कंक्रीट जलयोजन को बढ़ाने और छत, बाथरूम और बेसमेंट रिसाव को रोकने के लिए उन्नत निर्माण रसायन और ऐक्रेलिक कोटिंग्स।',
      desc_mr: 'छत आणि भिंतींचे गळतीपासून रक्षण करणारे वॉटरप्रूफिंग केमिकल्स.',
      brands: ['Dr. Fixit', 'Fosroc'],
      specs_en: 'Lw+ Liquid, URP SBR latex, structural repair grade',
      specs_hi: 'Lw+ लिक्विड, यूआरपी एसबीआर लेटेक्स, संरचनात्मक मरम्मत ग्रेड',
      specs_mr: 'Lw+ लिक्विड, URP SBR लेटेक्स, रिपेअरिंग ग्रेड',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
      division: 'materials'
    }
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const localizedName = language === 'hi' ? p.name_hi : language === 'mr' ? p.name_mr : p.name_en;
    const matchesSearch = localizedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brands.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getLocalizedName = (p: Product) => {
    return language === 'hi' ? p.name_hi : language === 'mr' ? p.name_mr : p.name_en;
  };

  const getLocalizedDesc = (p: Product) => {
    return language === 'hi' ? p.desc_hi : language === 'mr' ? p.desc_mr : p.desc_en;
  };

  const getLocalizedSpecs = (p: Product) => {
    return language === 'hi' ? p.specs_hi : language === 'mr' ? p.specs_mr : p.specs_en;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      alert('Please fill out Name and Phone fields.');
      return;
    }
    setSubmitStatus('sending');

    try {
      const submission = {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        division: selectedProduct?.division || 'materials',
        message: `Bulk Inquiry for Product: ${selectedProduct ? getLocalizedName(selectedProduct) : 'Generic'}. Quantity Needed: ${leadForm.quantity}. Delivery Site: ${leadForm.address}`
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
        setLeadForm({
          name: '',
          phone: '',
          email: '',
          quantity: '',
          address: ''
        });
        setTimeout(() => {
          setSelectedProduct(null);
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
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
      {/* Hero section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Material Catalog</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          Building Materials & Supplies
        </h1>
        <p className="text-sm text-gray-400">
          Authorized distributor of premium building material brands, TMT rebars, double-washed river sand, aggregates, and structural additives.
        </p>
      </section>

      {/* Controls: Search + Categories */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0e0e12]/60 p-4 rounded-3xl border border-premium-border">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search materials or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-premium-border rounded-2xl pl-12 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
            />
          </div>
          {/* Support Indicator */}
          <div className="flex items-center space-x-4 text-xs font-semibold text-gray-400">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-const-orange" />
              <span>BIS & ISO Certified</span>
            </div>
            <div className="flex items-center space-x-1">
              <Truck className="w-4 h-4 text-const-orange" />
              <span>Transit Fleet Delivery</span>
            </div>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2.5 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                selectedCategory === cat.code
                  ? 'bg-const-orange text-white border-transparent shadow-lg shadow-const-orange/15'
                  : 'bg-white/5 text-gray-300 border-premium-border hover:bg-white/10'
              }`}
            >
              {language === 'hi' ? cat.label_hi : language === 'mr' ? cat.label_mr : cat.label_en}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 text-xs">
            No materials matching search queries or filters. Try searching for "UltraTech" or "Steel".
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glassmorphism rounded-3xl overflow-hidden border border-premium-border/80 flex flex-col justify-between hover:border-const-orange/40 transition-colors"
            >
              {/* Product Visual */}
              <div className="h-48 relative overflow-hidden bg-black/40">
                <img
                  src={product.image}
                  alt={product.name_en}
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm border border-premium-border/80 text-const-orange font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              {/* Product Details */}
              <div className="p-6 space-y-4 flex-1">
                <div>
                  <h3 className="text-base font-extrabold text-white">{getLocalizedName(product)}</h3>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">Brands: {product.brands.join(', ')}</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">{getLocalizedDesc(product)}</p>
                
                {/* Specifications parameters */}
                <div className="bg-[#121217] border border-premium-border/60 p-3.5 rounded-xl space-y-1">
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Specifications</span>
                  <p className="text-xs text-white font-semibold">{getLocalizedSpecs(product)}</p>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full bg-white/5 border border-premium-border hover:bg-const-orange hover:text-white transition-all text-xs font-bold py-3 rounded-xl flex items-center justify-center space-x-2"
                >
                  <span>Request Wholesale Quote</span>
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Inquiry Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glassmorphism border border-premium-border max-w-lg w-full rounded-3xl p-8 space-y-6 animate-fadeIn relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-full border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[9px] text-const-orange font-bold uppercase tracking-wider">Wholesale Inquiry Desk</span>
              <h2 className="text-xl font-bold text-white">Inquire Bulk: {getLocalizedName(selectedProduct)}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Provide estimate quantities needed at your site coordinates. Our pricing desk responds within 2 hours.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">{t('inq.name')} *</label>
                  <input
                    type="text"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">{t('inq.phone')} *</label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">{t('inq.email')}</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Quantity Needed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 Bags / 10 Tons"
                    value={leadForm.quantity}
                    onChange={(e) => setLeadForm({ ...leadForm, quantity: e.target.value })}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-semibold">Delivery Site Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Near Bus Stand, Bhadgaon, Jalgaon"
                  value={leadForm.address}
                  onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })}
                  className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold">
                  ✓ Wholesale quote registered! Dispatch desk will contact you.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                  ⚠️ Failed to submit query. Please check fields.
                </div>
              )}

              <button
                type="submit"
                disabled={submitStatus === 'sending'}
                className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {submitStatus === 'sending' ? t('inq.sending') : 'Submit Quote Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
