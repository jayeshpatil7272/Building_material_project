'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Truck, ShieldAlert, Award, ShieldCheck, Hammer, Layers, Eye, Users } from 'lucide-react';

export default function ServicesPage() {
  const { language, t } = useLanguage();

  const services = [
    {
      icon: Truck,
      title_en: 'Bulk Logistics & Dispatch',
      title_hi: 'थोक रसद और प्रेषण',
      title_mr: 'घाऊक वाहतूक आणि लॉजिस्टिक्स',
      desc_en: 'Our logistics fleet of dumpers and transport vehicles guarantees scheduled site deliveries in Jalgoan, Bhadgaon, and surrounding districts. 24/7 active cargo operations.',
      desc_desc_en: 'Equipped with GPS tracking on all heavy loaders, ensuring precise drop-off times for massive builder requirements.',
      desc_hi: 'डंपर और परिवहन वाहनों का हमारा लॉजिस्टिक्स बेड़ा जलगांव, भड़गांव और आसपास के जिलों में अनुसूचित साइट डिलीवरी की गारंटी देता है। 24/7 सक्रिय कार्गो संचालन।',
      desc_desc_hi: 'सभी भारी लोडरों पर जीपीएस ट्रैकिंग से लैस, विशाल बिल्डर आवश्यकताओं के लिए सटीक ड्रॉप-ऑफ समय सुनिश्चित करना।',
      desc_mr: 'आमचा स्वतःचा वाहनांचा ताफा २४/७ वाळू, सिमेंट आणि खडी थेट बांधकाम साईटवर ठरलेल्या वेळेत पोहोचवण्याची खात्री देतो.',
      desc_desc_mr: 'सर्व ट्रक्सवर जीपीएस ट्रॅकिंग बसवले आहे, ज्यामुळे माल केव्हा पोहोचणार याचे अचूक नियोजन बिल्डर्सना करता येते.'
    },
    {
      icon: Layers,
      title_en: 'Aggregates Processing & Crushing',
      title_hi: 'गिट्टी प्रसंस्करण और क्रशिंग',
      title_mr: 'खडी प्रक्रिया आणि क्रशर प्लांट',
      desc_en: 'High-speed crushing plants creating graded basalt stone aggregates (10mm, 20mm, 40mm) and premium double-washed river sand. Quality checked for low silt.',
      desc_desc_en: 'Rigorous sieving checks to clear clay and micro-dust deposits, creating aggregates with higher concrete bonding properties.',
      desc_hi: 'ग्रेडेड बेसाल्ट पत्थर गिट्टी (10 मिमी, 20 मिमी, 40 मिमी) और प्रीमियम डबल-धुली हुई नदी की रेत का उत्पादन करने वाले उच्च गति वाले क्रशिंग प्लांट।',
      desc_desc_hi: 'मिट्टी और सूक्ष्म धूल जमा को साफ करने के लिए सख्त छानने की जाँच, जिससे कंक्रीट बॉन्डिंग में मजबूती आती है।',
      desc_mr: 'आमच्या स्वतःच्या क्रशर प्लांटमध्ये वेगवेगळ्या आकाराची दर्जेदार खडी (१० मिमी, २० मिमी, ४० मिमी) आणि धुतलेली नदीची वाळू तयार केली जाते.',
      desc_desc_mr: 'माती आणि बारीक धुळीचे कण काढून टाकण्यासाठी वाळू व खडी स्वच्छ धुतली जाते, ज्यामुळे काँक्रीटमध्ये सिमेंटची पकड मजबूत होते.'
    },
    {
      icon: Award,
      title_en: 'Direct Factory Supply Tie-ups',
      title_hi: 'सीधा फैक्टरी आपूर्ति गठजोड़',
      title_mr: 'थेट फॅक्टरी पुरवठा करार',
      desc_en: 'Official authorized distributorship of premium cement brands like UltraTech and ACC, and steel brands like JSW and Tata Tiscon. Direct factory rate transfers.',
      desc_desc_en: 'Saves major retail broker overheads for developer chains, offering transparent price sheets directly from manufacturers.',
      desc_hi: 'अल्ट्राटेक और एसीसी जैसे प्रीमियम सीमेंट ब्रांडों और जेएसडब्ल्यू और टाटा टिस्कॉन जैसे स्टील ब्रांडों की आधिकारिक अधिकृत डीलरशिप।',
      desc_desc_hi: 'डेवलपर श्रृंखलाओं के लिए प्रमुख खुदरा दलाल ओवरहेड्स को बचाता है, सीधे निर्माताओं से पारदर्शी मूल्य पत्रक प्रदान करता है।',
      desc_mr: 'अल्ट्राटेक, एसीसी सिमेंट आणि टाटा टिस्कॉन, JSW लोखंड यांच्या थेट कंपन्यांशी असलेल्या भागीदारीमुळे थेट फॅक्टरी दरात माल पुरवठा.',
      desc_desc_mr: 'कोणतेही मध्यस्थ नसल्यामुळे बिल्डर्सना सर्वात स्वस्त घाऊक दरात साहित्य उपलब्ध होते.'
    },
    {
      icon: Hammer,
      title_en: 'Contractor Material Supply Planning',
      title_hi: 'ठेकेदार सामग्री आपूर्ति योजना',
      title_mr: 'कंत्राटदार साहित्य पुरवठा नियोजन',
      desc_en: 'Dedicated project managers who review blueprints to align material timelines, ensuring construction drops prevent cement setting delays or rebar rusting.',
      desc_desc_en: 'Phased warehouse release schedules tailored to match foundation casting, structural framing, and final plastering stages.',
      desc_hi: 'समर्पित परियोजना प्रबंधक जो निर्माण सामग्री की समयसीमा को संरेखित करने के लिए खाकों की समीक्षा करते हैं।',
      desc_desc_hi: 'फाउंडेशन कास्टिंग, संरचनात्मक फ्रेमिंग और अंतिम प्लास्टरिंग चरणों से मेल खाने के लिए अनुकूलित चरणबद्ध गोदाम रिलीज शेड्यूल।',
      desc_mr: 'बांधकाम कंत्राटदारांच्या गरजेनुसार टप्प्याटप्प्याने माल पुरवठा नियोजन करणे, जेणेकरून वेळेअभावी सिमेंट वाया जाणार नाही.',
      desc_desc_mr: 'पाया घालण्यापासून ते स्लॅब टाकणे आणि प्लास्टर करणे या प्रत्येक टप्प्यासाठी साहित्य पुरवठ्याचे वेळापत्रक.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-24">
      {/* Header */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
          <Truck className="w-3.5 h-3.5" />
          <span>Services Portfolio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          Contractor Logistics & Supply Solutions
        </h1>
        <p className="text-sm text-gray-400">
          Heavy cargo distribution network, crushed basalt crushing operations, factory-direct brand dealership systems, and project scheduling support.
        </p>
      </section>

      {/* Services Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {services.map((srv, index) => {
          const IconComponent = srv.icon;
          return (
            <div
              key={index}
              className="glassmorphism p-8 rounded-3xl border border-premium-border/80 space-y-6 hover:border-const-orange/30 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-const-orange/10 border border-const-orange/20 rounded-2xl flex items-center justify-center text-const-orange">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-white">
                  {language === 'hi' ? srv.title_hi : language === 'mr' ? srv.title_mr : srv.title_en}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {language === 'hi' ? srv.desc_hi : language === 'mr' ? srv.desc_mr : srv.desc_en}
                </p>
              </div>

              <div className="bg-white/3 border border-premium-border/50 p-4 rounded-2xl">
                <span className="text-[9px] text-const-orange uppercase font-bold tracking-wider">Enterprise Detail</span>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {language === 'hi' ? srv.desc_desc_hi : language === 'mr' ? srv.desc_desc_mr : srv.desc_desc_en}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quality commitment */}
      <section className="glassmorphism p-12 rounded-3xl border border-premium-border/80 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-green-400 tracking-wider uppercase">
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>Guaranteed Assurance</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Continuous Delivery & Phased Loading</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Our central warehouse coordinates supply round-the-clock dispatches, maintaining construction momentum for major infrastructure, highway bridges, and housing developments.
          </p>
        </div>
        <a
          href="/contact"
          className="bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs tracking-wider px-8 py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0"
        >
          Book Dispatch Delivery
        </a>
      </section>
    </div>
  );
}
