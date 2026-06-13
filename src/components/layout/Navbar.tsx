'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Globe, PhoneCall, LogOut, User, LayoutDashboard, LogIn, Sun, Moon,
  Calculator, Scale, Bot, FileText, ShoppingCart, Users, Store, Info, Layers, ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({
    tools: false,
    sourcing: false,
    company: false,
  });
  
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on path changes
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setLangMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = (menuId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const toggleMobileDropdown = (menuId: string) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const languages = [
    { code: 'en' as const, label: 'English' },
    { code: 'hi' as const, label: 'हिंदी (Hindi)' },
    { code: 'mr' as const, label: 'मराठी (Marathi)' },
  ];

  const toolsMenu = {
    label: t('nav.tools'),
    id: 'tools',
    items: [
      { href: '/estimator', label: t('nav.estimator'), desc: t('nav.estimator.desc'), icon: <Calculator className="w-4 h-4 text-const-orange" /> },
      { href: '/compare', label: t('nav.compare'), desc: t('nav.compare.desc'), icon: <Scale className="w-4 h-4 text-amber-500" /> },
      { href: '/ai-assistant', label: t('nav.ai-assistant'), desc: t('nav.ai-assistant.desc'), icon: <Bot className="w-4 h-4 text-purple-400" /> },
      { href: '/rfq', label: t('nav.rfq'), desc: t('nav.rfq.desc'), icon: <FileText className="w-4 h-4 text-blue-400" /> },
    ],
    footer: (
      <div className="col-span-2 mt-2 pt-3.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-medium">
        <span>💡 Calculate steel and cement quantities instantly</span>
        <Link href="/estimator" className="text-const-orange font-semibold hover:underline">Start Calculator →</Link>
      </div>
    )
  };

  const sourcingMenu = {
    label: t('nav.sourcing'),
    id: 'sourcing',
    items: [
      { href: '/marketplace', label: t('nav.marketplace'), desc: t('nav.marketplace.desc'), icon: <ShoppingCart className="w-4 h-4 text-green-400" /> },
      { href: '/partners', label: t('nav.partners'), desc: t('nav.partners.desc'), icon: <Users className="w-4 h-4 text-teal-400" /> },
      { href: '/seller', label: t('nav.seller'), desc: t('nav.seller.desc'), icon: <Store className="w-4 h-4 text-indigo-400" /> },
    ],
    footer: (
      <div className="col-span-2 mt-2 pt-3.5 border-t border-gray-150 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-550 dark:text-gray-400 font-medium">
        <span>🤝 Factory-direct contracts: JSW Steel, UltraTech Cement</span>
        <Link href="/partners" className="text-const-orange font-semibold hover:underline">Become Partner →</Link>
      </div>
    )
  };

  const companyMenu = {
    label: t('nav.company'),
    id: 'company',
    items: [
      { href: '/about', label: t('nav.about'), desc: t('nav.about.desc'), icon: <Info className="w-4 h-4 text-yellow-400" /> },
      { href: '/projects', label: t('nav.projects'), desc: t('nav.projects.desc'), icon: <Layers className="w-4 h-4 text-cyan-400" /> },
      { href: '/contact', label: t('nav.contact'), desc: t('nav.contact.desc'), icon: <PhoneCall className="w-4 h-4 text-rose-400" /> },
    ],
    footer: (
      <div className="col-span-2 mt-2 pt-3.5 border-t border-gray-150 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-550 dark:text-gray-400 font-medium">
        <span>📞 24/7 Wholesale Dispatch Support active</span>
        <a href="tel:+918010871044" className="text-const-orange font-semibold hover:underline">Call Sourcing Desk →</a>
      </div>
    )
  };

  const menuGroups = [toolsMenu, sourcingMenu, companyMenu];

  return (
    <div className="fixed top-4 left-0 w-full z-50 px-4 md:px-6">
      <nav
        className={`mx-auto max-w-7xl w-full transition-all duration-300 rounded-full border shadow-lg ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#07070c]/90 backdrop-blur-md border-gray-200 dark:border-white/10 py-2.5 px-6 md:px-8'
            : 'bg-white/60 dark:bg-[#07070c]/40 backdrop-blur-sm border-gray-100 dark:border-white/5 py-4 px-6 md:px-8'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start leading-none gap-0.5 select-none">
            <span className="text-sm md:text-base font-bold font-display tracking-widest bg-gradient-to-r from-const-orange via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm leading-none">
              JAY SHREE RAM
            </span>
            <span className="text-[7.5px] font-semibold tracking-[0.25em] text-gray-400 dark:text-gray-500 uppercase leading-none font-mono">
              Building Materials
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1" onMouseLeave={() => setHoveredLink(null)}>
            {/* Home Link */}
            <div
              className="relative"
              onMouseEnter={() => setHoveredLink('home')}
            >
              <Link
                href="/"
                className={`relative z-10 block px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  pathname === '/' ? 'text-const-orange font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-const-orange'
                }`}
              >
                {t('nav.home')}
              </Link>
              {hoveredLink === 'home' && (
                <motion.div
                  layoutId="navHoverBg"
                  className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
            </div>

            {/* Dropdown Menu Groups */}
            {menuGroups.map((group) => {
              const isDropdownActive = activeDropdown === group.id;
              const hasActiveLink = group.items.some(item => pathname === item.href);

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => {
                    handleMouseEnter(group.id);
                    setHoveredLink(group.id);
                  }}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`relative z-10 flex items-center space-x-1 px-4 py-2 text-xs font-semibold tracking-wide transition-colors focus:outline-none ${
                      hasActiveLink ? 'text-const-orange font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-const-orange'
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDropdownActive ? 'rotate-180' : ''}`} />
                  </button>

                  {hoveredLink === group.id && (
                    <motion.div
                      layoutId="navHoverBg"
                      className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}

                  <AnimatePresence>
                    {isDropdownActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3.5 w-[500px] bg-white dark:bg-[#0c0c14] rounded-2xl shadow-xl p-4.5 p-4 border border-gray-150 dark:border-white/10 grid grid-cols-2 gap-3 z-50 text-left"
                      >
                        {group.items.map((item) => {
                          const isLinkActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                                isLinkActive
                                  ? 'bg-const-orange/5 border border-const-orange/15'
                                  : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              <div className={`p-2 rounded-xl transition-colors ${
                                isLinkActive
                                  ? 'bg-const-orange/10 text-const-orange'
                                  : 'bg-gray-100 dark:bg-white/10 text-gray-550 dark:text-gray-350'
                              }`}>
                                {item.icon}
                              </div>
                              <div className="space-y-0.5">
                                <p className={`text-xs font-bold ${
                                  isLinkActive ? 'text-const-orange' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {item.label}
                                </p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}

                        {/* Dropdown Footer */}
                        {group.footer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-350 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all border border-gray-200 dark:border-white/10 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-const-orange" />}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-const-orange" />
                <span className="uppercase font-bold">{language}</span>
              </button>
              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#0c0c12] rounded-xl shadow-xl py-1.5 border border-gray-200 dark:border-white/10 z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                          language === lang.code ? 'text-const-orange font-bold' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-const-orange" />
                  <span className="max-w-[90px] truncate font-bold">{user.name}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0c0c12] rounded-xl shadow-xl py-1.5 border border-gray-200 dark:border-white/10 z-50 text-left"
                    >
                      <div className="px-3.5 py-1.5 border-b border-gray-100 dark:border-white/5 text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">
                        Role: {user.role}
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 w-full text-left px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-const-orange dark:hover:text-const-orange transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      {(['supplier', 'admin'].includes(user.role as string)) && (
                        <Link
                          href="/seller"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 w-full text-left px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-const-orange dark:hover:text-const-orange transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Seller Hub</span>
                        </Link>
                      )}
                      {(user.role === 'client' || user.role === 'dealer') && (
                        <Link
                          href="/portal"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 w-full text-left px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-const-orange dark:hover:text-const-orange transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>My Portal</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full text-left px-3.5 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 px-4 py-1.5 rounded-full transition-all hover:border-const-orange/40 font-bold"
              >
                <LogIn className="w-3.5 h-3.5 text-const-orange" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Quick Call */}
            <a
              href="tel:+918010871044"
              className="flex items-center space-x-1.5 bg-const-orange hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center space-x-2.5">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-const-orange" />}
            </button>

            {/* Mobile Lang Button */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-white/10"
              >
                <Globe className="w-3.5 h-3.5 text-const-orange" />
                <span className="uppercase font-bold">{language}</span>
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-[#0c0c12] rounded-xl shadow-xl py-1.5 border border-gray-200 dark:border-white/10 z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs ${
                          language === lang.code ? 'text-const-orange font-bold' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none p-1.5"
            >
              {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden w-full overflow-hidden mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-5 text-left"
            >
              <div className="flex flex-col space-y-3">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`text-xs font-bold uppercase tracking-wider py-1 ${
                    pathname === '/' ? 'text-const-orange font-extrabold' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('nav.home')}
                </Link>

                {menuGroups.map((group) => {
                  const isGroupOpen = mobileDropdowns[group.id];
                  return (
                    <div key={group.id} className="space-y-1.5">
                      <button
                        onClick={() => toggleMobileDropdown(group.id)}
                        className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider py-1 text-gray-700 dark:text-gray-300 focus:outline-none"
                      >
                        <span>{group.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isGroupOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isGroupOpen && (
                        <div className="pl-3.5 border-l border-gray-150 dark:border-white/10 space-y-2.5 py-1">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-start gap-2.5 py-1 transition-colors ${
                                pathname === item.href ? 'text-const-orange font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="mt-0.5 text-const-orange">{item.icon}</div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold">{item.label}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{item.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {user ? (
                  <div className="space-y-2.5 pt-3.5 border-t border-gray-100 dark:border-white/5">
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      Role: {user.role} ({user.name})
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 py-1"
                      >
                        <LayoutDashboard className="w-4 h-4 text-const-orange" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    {(['supplier', 'admin'].includes(user.role as string)) && (
                      <Link
                        href="/seller"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 py-1"
                      >
                        <LayoutDashboard className="w-4 h-4 text-const-orange" />
                        <span>Seller Hub</span>
                      </Link>
                    )}
                    {(user.role === 'client' || user.role === 'dealer') && (
                      <Link
                        href="/portal"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 py-1"
                      >
                        <LayoutDashboard className="w-4 h-4 text-const-orange" />
                        <span>My Portal</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2 text-xs text-red-500 py-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 text-xs font-bold text-gray-600 dark:text-gray-300 py-2 border-t border-gray-100 dark:border-white/5 pt-3.5"
                  >
                    <LogIn className="w-4 h-4 text-const-orange" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-white/5 pt-3.5">
                <a
                  href="tel:+918010871044"
                  className="flex items-center justify-center space-x-2 w-full bg-const-orange text-white font-bold text-xs py-3 rounded-full shadow-md hover:bg-orange-655"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>+91 8010871044</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
