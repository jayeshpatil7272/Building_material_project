'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Phone, ArrowRight, Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

function LoginForm() {
  const { login, register, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // Tabs: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'client' | 'dealer'>('client');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Redirect on successful auth
  const handleSuccessRedirect = (userRole: string) => {
    setStatus('success');
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => {
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (redirectPath === '/') {
        router.push('/portal');
      } else {
        router.push(redirectPath);
      }
      router.refresh();
    }, 1500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const loggedInUser = await login(email, password);
      handleSuccessRedirect(loggedInUser.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
      setStatus('error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setErrorMsg('Please fill out all fields.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const registeredUser = await register(name, email, phone, password, role);
      handleSuccessRedirect(registeredUser.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try a different email.');
      setStatus('error');
    }
  };

  // If already logged in, show user info and a button to redirect
  if (user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glassmorphism border border-premium-border rounded-3xl text-center space-y-6">
        <div className="w-16 h-16 bg-const-orange/15 rounded-full flex items-center justify-center mx-auto border border-const-orange/30">
          <User className="w-8 h-8 text-const-orange" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Already Logged In</h2>
          <p className="text-xs text-gray-400">
            You are currently authenticated as <span className="text-white font-semibold">{user.name}</span> ({user.role}).
          </p>
        </div>
        <button
          onClick={() => router.push(user.role === 'admin' ? '/admin' : '/')}
          className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl transition-all hover:scale-102"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      {/* Title Header */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-white">
          Client & Partner Portal
        </h1>
        <p className="text-xs text-gray-400">
          Access Jay Shree Ram logistics coordinates and wholesale calculators.
        </p>
      </div>

      {/* Auth Card */}
      <div className="glassmorphism p-8 rounded-3xl border border-premium-border space-y-6 relative overflow-hidden">
        {/* Decorative subtle background glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-const-orange/10 rounded-full blur-2xl pointer-events-none" />

        {/* Tab Controls */}
        <div className="flex border-b border-premium-border/60 pb-1">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setStatus('idle');
            }}
            className={`flex-1 text-center pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'login' ? 'text-const-orange' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Sign In</span>
            {activeTab === 'login' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-const-orange"
              />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setStatus('idle');
            }}
            className={`flex-1 text-center pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'register' ? 'text-const-orange' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Register / Sign Up</span>
            {activeTab === 'register' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-const-orange"
              />
            )}
          </button>
        </div>

        {/* Form Container */}
        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4 pt-2"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-premium-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Password</label>
                  <span className="text-[9px] text-gray-500 hover:text-const-orange cursor-pointer">Forgot?</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-premium-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Feedbacks */}
              {status === 'error' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {status === 'success' && (
                <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold">
                  ✓ Authentication successful! Logging you in...
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:scale-102 active:scale-98 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{status === 'loading' ? 'Verifying...' : 'Sign In / Secure Login'}</span>
                {status !== 'loading' && <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-4 pt-2"
            >
              {/* Account Role Selector */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Account Partnership Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      role === 'client'
                        ? 'bg-const-orange/15 border-const-orange text-white'
                        : 'bg-white/3 border-premium-border text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-bold block">Client Portal</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">Contractors & Builders</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('dealer')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      role === 'dealer'
                        ? 'bg-const-orange/15 border-const-orange text-white'
                        : 'bg-white/3 border-premium-border text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-bold block">Dealer Portal</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">Wholesale Partners</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Full Name / Business Firm</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-premium-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. client@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-premium-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 99751 75762"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-premium-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Secure Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-premium-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-const-orange focus:bg-white/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Feedbacks */}
              {status === 'error' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {status === 'success' && (
                <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-semibold">
                  ✓ Account registered! Initiating your session...
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg hover:scale-102 active:scale-98 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{status === 'loading' ? 'Creating Account...' : 'Complete Secure Sign Up'}</span>
                {status !== 'loading' && <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Demo credentials guide card */}
        <div className="border-t border-premium-border/40 pt-4 mt-2">
          <div className="bg-white/3 border border-premium-border/60 p-3.5 rounded-xl flex items-start space-x-2 text-[10px] text-gray-400">
            <KeyRound className="w-4 h-4 text-const-orange shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-white font-bold block">Developer / Seed Accounts:</span>
              <p>• Admin: <code className="text-const-orange font-semibold">admin@jayshreeram.com</code> / <code className="text-const-orange font-semibold">admin123</code></p>
              <p>• Client: <code className="text-white">customer@example.com</code> / <code className="text-white">customer123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto my-24 p-8 glassmorphism border border-premium-border rounded-3xl text-center">
        <div className="w-10 h-10 border-4 border-const-orange/30 border-t-const-orange rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 mt-4 font-bold tracking-widest uppercase">Loading Portal...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
