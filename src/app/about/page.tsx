'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { History, Target, ShieldAlert, Award, Star, ShieldCheck } from 'lucide-react';

interface TeamMember {
  name: string;
  role_en: string;
  role_hi: string;
  role_mr: string;
  desc_en: string;
  desc_hi: string;
  desc_mr: string;
}

export default function AboutPage() {
  const { t, language } = useLanguage();

  const team: TeamMember[] = [
    {
      name: 'Mr. Bhaiyya Patil',
      role_en: 'Chairman & Managing Director',
      role_hi: 'अध्यक्ष एवं प्रबंध निदेशक',
      role_mr: 'चेअरमन आणि मॅनेजिंग डायरेक्टर',
      desc_en: 'Founded the group in 2008 with a single transport dumper. Led expansion into wholesale building supplies and regional infrastructure supply.',
      desc_hi: '2008 में एक एकल परिवहन डंपर के साथ समूह की स्थापना की। थोक भवन निर्माण सामग्री और क्षेत्रीय बुनियादी ढांचा आपूर्ति में विस्तार का नेतृत्व किया।',
      desc_mr: '२००८ मध्ये एका ट्रकने व्यवसायाची सुरुवात केली. त्यांच्या नेतृत्वाखाली समूहाने घाऊक बांधकाम साहित्य आणि प्रादेशिक पायाभूत कंत्राटांमध्ये मोठा विस्तार केला.'
    },
    {
      name: 'Mr. Manoj Patil',
      role_en: 'Chief Operating Officer',
      role_hi: 'मुख्य परिचालन अधिकारी',
      role_mr: 'मुख्य परिचालन अधिकारी',
      desc_en: 'Over 20 years of experience in heavy materials supply chain. Manages warehouse hubs, inventory stocks, supplier agreements, and dealer network accounts.',
      desc_hi: 'भारी सामग्री आपूर्ति श्रृंखला में 20 से अधिक वर्षों का अनुभव। गोदाम केंद्रों, इन्वेंट्री स्टॉक, आपूर्तिकर्ता समझौतों और डीलर नेटवर्क खातों का प्रबंधन करते हैं।',
      desc_mr: 'जड बांधकाम साहित्य पुरवठा साखळीतील २० वर्षांपेक्षा जास्त अनुभव. गोदामांचे जाळे, इन्व्हेंटरी आणि डीलर नेटवर्कचे व्यवस्थापन पाहतात.'
    },
    {
      name: 'Mr. Vijay Patil',
      role_en: 'Director of Logistics Operations',
      role_hi: 'रसद संचालन निदेशक',
      role_mr: 'लॉजिस्टिक्स ऑपरेशन्स संचालक',
      desc_en: 'Manages sand mining coordinates, fleet schedules, GPS tracking, and corporate building developer accounts.',
      desc_hi: 'रेत खनन निर्देशांक, बेड़े के कार्यक्रम, जीपीएस ट्रैकिंग और कॉर्पोरेट भवन डेवलपर खातों का प्रबंधन करते हैं।',
      desc_mr: 'वाळू उपसा खडी केंद्र, ५०+ वाहनांचा वाहतूक ताफा आणि शासकीय बांधकामाचे कंत्राट याचे संपूर्ण नियोजन करतात.'
    }
  ];

  const milestones = [
    { year: '2008', title_en: 'Logistics Foundation', title_hi: 'रसद स्थापना', title_mr: 'लॉजिस्टिक्स पायाभरणी', desc_en: 'Started operations with one dumper truck supplying sand to local builders.' },
    { year: '2014', title_en: 'Material Supply Hub', title_hi: 'सामग्री आपूर्ति हब', title_mr: 'बांधकाम साहित्य हब', desc_en: 'Expanded into direct dealership of cement brands and structural steel.' },
    { year: '2019', title_en: 'JSR Warehousing Terminal', title_hi: 'जेएसआर वेयरहाउसिंग टर्मिनल', title_mr: 'जेएसआर वेअरहाउसिंग टर्मिनल', desc_en: 'Established a major central distribution terminal and logistics hub in Jalgaon.' },
    { year: '2025', title_en: 'Fleet Modernization', title_hi: 'बेड़े का आधुनिकीकरण', title_mr: 'वाहतूक ताफा आधुनिकीकरण', desc_en: 'Integrated GPS tracking, green dumpers, and a localized JSON database system.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-24">
      {/* Story section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 bg-const-orange/10 border border-const-orange/20 px-4 py-1 rounded-full text-xs font-semibold text-const-orange tracking-widest uppercase">
            <History className="w-3.5 h-3.5" />
            <span>Corporate Timeline</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            {t('about.story.title')}
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t('about.story.desc')}
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Today, Jay Shree Ram spans multiple locations, managing high-volume supply contracts with premium infrastructure builders. Our operations include dedicated warehouse divisions and a robust transit fleet to guarantee material availability.
          </p>
        </div>

        {/* Milestones list */}
        <div className="space-y-6 border-l-2 border-premium-border pl-6 ml-2">
          {milestones.map((m, index) => (
            <div key={index} className="relative space-y-2">
              {/* Dot indicator */}
              <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 bg-premium-dark border-2 border-const-orange rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-const-orange rounded-full" />
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-extrabold text-const-orange font-display">{m.year}</span>
                <h3 className="font-bold text-sm text-white">
                  {language === 'hi' ? m.title_hi : language === 'mr' ? m.title_mr : m.title_en}
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{m.desc_en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-const-orange/10 flex items-center justify-center border border-const-orange/20 text-const-orange">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-white">{t('about.vision')}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{t('about.vision.desc')}</p>
        </div>
        <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-const-orange/10 flex items-center justify-center border border-const-orange/20 text-const-orange">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-white">{t('about.mission')}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{t('about.mission.desc')}</p>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="space-y-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white text-center">
          Our Leadership Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="glassmorphism p-8 rounded-3xl border border-premium-border text-center space-y-4 hover:border-const-orange/40 transition-colors">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-const-orange to-slate-700 flex items-center justify-center text-white font-extrabold text-2xl">
                {member.name.split(' ')[1]?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-xs text-const-orange mt-1 font-semibold">
                  {language === 'hi' ? member.role_hi : language === 'mr' ? member.role_mr : member.role_en}
                </p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {language === 'hi' ? member.desc_hi : language === 'mr' ? member.desc_mr : member.desc_en}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications and Achievements */}
      <section className="glassmorphism p-12 rounded-3xl border border-premium-border space-y-8">
        <h2 className="text-xl font-bold font-display text-white text-center flex items-center justify-center space-x-2">
          <Award className="w-6 h-6 text-const-orange" />
          <span>{t('about.cert')}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3 text-left">
            <ShieldCheck className="w-8 h-8 text-const-orange shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">ISO 9001:2015 Compliance</h4>
              <p className="text-xs text-gray-400 mt-1">International standards compliance for our building materials testing and logistical operations.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 text-left">
            <ShieldCheck className="w-8 h-8 text-const-orange shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">BIS Certified Materials</h4>
              <p className="text-xs text-gray-400 mt-1">100% adherence to Bureau of Indian Standards (BIS) certifications for structural steel rebars and OPC/PPC cement grades.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 text-left">
            <ShieldCheck className="w-8 h-8 text-const-orange shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Eco-Green Logistics</h4>
              <p className="text-xs text-gray-400 mt-1">Environmental certification for fuel-efficient transit, GPS tracking route optimization, and washed sand beds.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
