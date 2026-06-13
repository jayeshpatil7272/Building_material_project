'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, FileText, ArrowRight, RefreshCw, 
  ShieldCheck, Award, BadgeCheck, CheckCircle2, TrendingUp, HelpCircle 
} from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  division: string;
  message: string;
  status: string;
  timestamp: string;
}

export default function PortalPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/portal');
    }
  }, [user, authLoading, router]);

  // Fetch leads and filter by logged-in user's details
  const fetchMyLeads = async () => {
    if (!user) return;
    setLoadingLeads(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data: Lead[] = await res.json();
        // Filter leads matching this user's email or phone
        const filtered = data.filter(
          lead => 
            (lead.email && lead.email.toLowerCase() === user.email.toLowerCase()) || 
            (lead.phone && lead.phone.replace(/[^0-9]/g, '').includes(user.phone.replace(/[^0-9]/g, '')))
        );
        setMyLeads(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch user dispatches', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyLeads();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyLeads();
    setRefreshing(false);
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-const-orange mx-auto" />
        <p className="text-xs text-gray-500 mt-4 font-bold tracking-widest uppercase">Loading Portal Session...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const isDealer = user.role === 'dealer';

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10 animate-fadeIn">
      {/* Header Profile Panel */}
      <div className="glassmorphism p-8 rounded-3xl border border-premium-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-const-orange/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-const-orange/15 border border-const-orange/30 flex items-center justify-center shrink-0">
            {isDealer ? (
              <Award className="w-8 h-8 text-const-orange" />
            ) : (
              <Building2 className="w-8 h-8 text-const-orange" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold font-display text-white tracking-tight">
                {user.name}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                isDealer 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                {isDealer ? 'Wholesale Partner' : 'Contractor / Client'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{user.email} | Mobile: {user.phone}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 text-xs bg-white/5 border border-premium-border hover:bg-white/10 px-4 py-2.5 rounded-xl text-gray-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Portal</span>
          </button>
          <button
            onClick={logout}
            className="text-xs bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 px-4 py-2.5 rounded-xl text-red-400 font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Grid: Portal Stats & Catalogs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Columns (Tab Specific Content) */}
        <div className="lg:col-span-8 space-y-8">
          {isDealer ? (
            /* DEALER DASHBOARD SPECIFICS */
            <div className="space-y-8 animate-fadeIn">
              {/* Dealer Tier and stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Silver Tier Info Card */}
                <div className="glassmorphism p-6 rounded-2xl border border-premium-border flex flex-col justify-between min-h-[160px]">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Wholesale Level</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded border border-amber-500/20">SILVER DISTRIBUTOR</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mt-3 font-display">Silver Partner Tier</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Automatic 8% to 10% wholesale rebates applied to all dispatches.</p>
                  </div>
                  <div className="pt-4 border-t border-premium-border/40 flex justify-between items-center text-[10px] text-gray-500">
                    <span>Progress to Gold: 75%</span>
                    <span className="text-white">Need 120 Tons more</span>
                  </div>
                </div>

                {/* Logistics Metrics card */}
                <div className="glassmorphism p-6 rounded-2xl border border-premium-border flex flex-col justify-between min-h-[160px]">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Dealer Logistics</span>
                    <div className="flex items-center space-x-2 mt-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-2xl font-extrabold text-white font-display">Active Fleet Drops</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">All dealer orders route via PWD certified transport coordinate dispatchers.</p>
                  </div>
                  <div className="pt-4 border-t border-premium-border/40 text-[10px] text-gray-500">
                    <span>Active Dispatches: <strong className="text-white">{myLeads.filter(l=>l.status==='Contacted').length}</strong> drops in transit</span>
                  </div>
                </div>
              </div>

              {/* Wholesale Rates Catalog */}
              <div className="glassmorphism p-6 rounded-3xl border border-premium-border space-y-6">
                <div className="flex justify-between items-center border-b border-premium-border/60 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <BadgeCheck className="w-5 h-5 text-const-orange" />
                    <span>Exclusive Dealer Wholesale Catalog</span>
                  </h3>
                  <span className="text-[9px] bg-green-500/15 border border-green-500/30 text-green-400 font-extrabold px-2 py-0.5 rounded">Special Rates Active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-premium-border text-gray-500 font-bold">
                        <th className="pb-3 pr-4">Material / Grade</th>
                        <th className="pb-3 pr-4">Standard Rate</th>
                        <th className="pb-3 pr-4">Dealer Net Rate</th>
                        <th className="pb-3 text-right">Logistics Factor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-premium-border/40 text-gray-300">
                      <tr>
                        <td className="py-3 font-semibold text-white">UltraTech PPC Cement</td>
                        <td className="py-3 text-gray-500">₹380 / bag</td>
                        <td className="py-3 text-const-orange font-bold">₹350 / bag</td>
                        <td className="py-3 text-right text-[10px] text-gray-500">₹2 / bag / km</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold text-white">ACC Gold OPC 53 Cement</td>
                        <td className="py-3 text-gray-500">₹430 / bag</td>
                        <td className="py-3 text-const-orange font-bold">₹395 / bag</td>
                        <td className="py-3 text-right text-[10px] text-gray-500">₹2 / bag / km</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold text-white">JSW Neosteel Rebars (Fe 550D)</td>
                        <td className="py-3 text-gray-500">₹64,000 / ton</td>
                        <td className="py-3 text-const-orange font-bold">₹59,000 / ton</td>
                        <td className="py-3 text-right text-[10px] text-gray-500">₹150 / ton / km</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold text-white">Washed natural River Sand</td>
                        <td className="py-3 text-gray-500">₹6,500 / brass</td>
                        <td className="py-3 text-const-orange font-bold">₹6,000 / brass</td>
                        <td className="py-3 text-right text-[10px] text-gray-500">₹50 / brass / km</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold text-white">Crushed Concrete M-Sand</td>
                        <td className="py-3 text-gray-500">₹4,800 / brass</td>
                        <td className="py-3 text-const-orange font-bold">₹4,400 / brass</td>
                        <td className="py-3 text-right text-[10px] text-gray-500">₹40 / brass / km</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* CLIENT DASHBOARD SPECIFICS */
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contractor Active Info */}
                <div className="glassmorphism p-6 rounded-2xl border border-premium-border flex flex-col justify-between min-h-[160px]">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Contractor Profile</span>
                    <h3 className="text-xl font-extrabold text-white mt-3 font-display">Phased Drops Active</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Submit multiple quotation invoices. Phased deliveries scheduled with daily site dispatches.</p>
                  </div>
                  <div className="pt-4 border-t border-premium-border/40 text-[10px] text-gray-500 flex justify-between items-center">
                    <span>Helpdesk Coordinate: Bhaiyya Patil</span>
                    <a href="tel:+918010871044" className="text-const-orange font-bold">Call Office</a>
                  </div>
                </div>

                {/* Building Resources Card */}
                <div className="glassmorphism p-6 rounded-2xl border border-premium-border flex flex-col justify-between min-h-[160px]">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Material Work Guide</span>
                    <h3 className="text-xl font-extrabold text-white mt-3 font-display">Project Work Calculator</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Estimate total civil construction costs (slab casting, plastering, excavation) with dynamic mobilization.</p>
                  </div>
                  <div className="pt-4 border-t border-premium-border/40 flex justify-between items-center text-[10px]">
                    <span className="text-gray-500">Logistics surcharge standard</span>
                    <Link href="/quotation" className="text-const-orange font-bold flex items-center space-x-1">
                      <span>Launch Estimator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Specific Lead Dispatch Tracker (Common Panel) */}
          <div className="glassmorphism p-6 rounded-3xl border border-premium-border space-y-4">
            <h3 className="text-base font-bold text-white border-b border-premium-border/40 pb-3 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-const-orange" />
              <span>Quotation Requests & Logs ({myLeads.length})</span>
            </h3>

            {loadingLeads ? (
              <div className="text-center py-8 text-xs text-gray-500 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-const-orange" />
                <span>Checking records...</span>
              </div>
            ) : myLeads.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <HelpCircle className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-xs text-gray-500">No quotation invoices found for your account details.</p>
                <Link
                  href="/quotation"
                  className="inline-flex items-center space-x-1.5 text-xs text-const-orange font-bold hover:underline"
                >
                  <span>Generate New Quotation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {myLeads.map((lead) => {
                  const seed = lead.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const drivers = [
                    { name: 'Ramesh Shinde', phone: '+91 80108 71044', vehicle: 'Ashok Leyland Dumper (MH-19 BJ-4321)' },
                    { name: 'Vinay Pawar', phone: '+91 96570 98765', vehicle: 'Tata Signa Tipper (MH-19 BJ-8842)' },
                    { name: 'Rajesh Deshmukh', phone: '+91 98341 55678', vehicle: 'Eicher Pro Dumper (MH-19 BJ-5510)' },
                    { name: 'Sanjay Chaudhari', phone: '+91 91582 34567', vehicle: 'Mahindra Blazo (MH-19 BJ-6789)' }
                  ];
                  const sellers = [
                    { name: 'Mr. Bhaiyya Patil (Director)', phone: '+91 80108 71044' },
                    { name: 'Mr. Sagar Patil (Sales Manager)', phone: '+91 98234 56789' }
                  ];
                  const driver = drivers[seed % drivers.length];
                  const seller = sellers[seed % sellers.length];
                  
                  let source = 'Girad Stockyards (Taluka Bhadgaon)';
                  if (lead.message.toLowerCase().includes('girna river')) {
                    source = 'Girna River Sourcing Bed (Jalgaon District)';
                  } else if (lead.message.toLowerCase().includes('tapi river')) {
                    source = 'Tapi River Sourcing Bed (Jalgaon District)';
                  }

                  return (
                    <div key={lead.id} className="bg-white/3 border border-premium-border/60 p-5 rounded-2xl flex flex-col items-stretch gap-4 hover:border-premium-border transition-colors animate-fadeIn text-left">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">{lead.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                              lead.status === 'New' 
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                                : lead.status === 'Contacted' 
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
                                : 'bg-green-500/10 border-green-500/30 text-green-400'
                            }`}>
                              {lead.status === 'New' ? 'Under Review' : lead.status === 'Contacted' ? 'Drop Dispatched' : 'Settled'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500">{new Date(lead.timestamp).toLocaleDateString()} at {new Date(lead.timestamp).toLocaleTimeString()}</p>
                          <p className="text-[11px] text-gray-300 mt-1 font-mono leading-relaxed whitespace-pre-line">{lead.message.replace('QUOTE CALCULATOR SUBMISSION: ', '')}</p>
                        </div>
                        <Link
                          href="/quotation"
                          className="shrink-0 flex items-center space-x-1 text-[11px] text-const-orange font-bold hover:underline self-end sm:self-center"
                        >
                          <span>New Calc</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Real-Time Logistics Tracking Container */}
                      <div className="p-4 bg-white/5 border border-premium-border/40 rounded-xl space-y-3 text-[11px]">
                        <div className="flex justify-between items-center text-white font-bold border-b border-white/5 pb-2">
                          <span className="text-const-orange tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                            Live Logistics Tracking
                          </span>
                          <span className="text-[10px] text-gray-500 font-normal">Status: {lead.status === 'New' ? 'Origin Loading' : lead.status === 'Contacted' ? 'Out for Delivery' : 'Delivered'}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-gray-300">
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Sourcing Origin</p>
                            <p className="font-semibold text-white">{source}</p>
                          </div>
                          
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Seller Desk Manager</p>
                            <p className="font-semibold text-white">
                              {seller.name} (<a href={`tel:${seller.phone.replace(/\s+/g, '')}`} className="text-const-orange hover:underline">{seller.phone}</a>)
                            </p>
                          </div>
                          
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Transit Carrier Vehicle</p>
                            <p className="font-semibold text-white">{driver.vehicle}</p>
                          </div>
                          
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Assigned Dumper Driver</p>
                            <p className="font-semibold text-white">
                              {driver.name} (<a href={`tel:${driver.phone.replace(/\s+/g, '')}`} className="text-const-orange hover:underline">{driver.phone}</a>)
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="pt-2">
                          <div className="flex justify-between text-[9px] text-gray-500 mb-1 font-semibold uppercase tracking-wider">
                            <span>1. Origin Loading</span>
                            <span>2. Weighbridge Pass</span>
                            <span>3. In Transit</span>
                            <span>4. Dispatched Drop</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                            <div className={`h-full bg-gradient-to-r from-const-orange via-amber-500 to-green-500 rounded-full transition-all ${
                              lead.status === 'New' 
                                ? 'w-1/4' 
                                : lead.status === 'Contacted' 
                                ? 'w-3/4' 
                                : 'w-full'
                            }`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Side Menu / Quick Help desk) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Action links */}
          <div className="glassmorphism p-6 rounded-3xl border border-premium-border space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-premium-border/40 pb-2">Central Actions</h3>
            <div className="flex flex-col space-y-2 text-xs">
              <Link
                href="/quotation"
                className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-bold py-3 px-4 rounded-xl text-center shadow-lg transition-transform hover:scale-102 flex items-center justify-center space-x-2"
              >
                <span>Interactive Cost Estimator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="w-full bg-white/5 border border-premium-border text-center py-3 px-4 rounded-xl font-semibold text-gray-200 hover:bg-white/10 transition-colors block"
              >
                Browse Materials Catalog
              </Link>
            </div>
          </div>

          {/* Support Desk Coordinate */}
          <div className="glassmorphism p-6 rounded-3xl border border-premium-border space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-wider text-[11px] border-b border-premium-border/40 pb-2">
              <CheckCircle2 className="w-4 h-4 text-const-orange" />
              <span>Partner Help Desk</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-bold text-white">Mr. Bhaiyya Patil</p>
                  <p className="text-[10px] text-gray-500">Corporate Director</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Welcome to your client desk. If you need special custom project invoice adjustments, load-schedule edits or bulk credit limits, coordinate with Bhaiyya Patil's team directly.
              </p>
              <a
                href="tel:+918010871044"
                className="flex items-center justify-center space-x-2 bg-white/5 border border-premium-border text-gray-300 font-bold py-2.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span>Call Desk: +91 80108 71044</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
