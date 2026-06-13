'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, TrendingUp, Bell, RefreshCw,
  Check, X, Clock, Truck, AlertCircle, BarChart2, Users, IndianRupee,
  CheckCircle2, XCircle, ArrowUpRight, Star, Volume2, Boxes
} from 'lucide-react';

interface Order {
  id: string; orderNumber: string; status: string; totalAmount: number;
  createdAt: string; customer: { name: string; phone: string; companyName: string };
  items: { quantity: number; unitPrice: number; totalPrice: number; product: { name: string; unit: string } }[];
}

interface Analytics {
  summary: {
    totalOrders: number; pendingOrders: number; completedOrders: number;
    cancelledOrders: number; totalRevenue: number; totalProducts: number;
  };
  recentOrders: Order[];
  weeklyTrend: { date: string; orders: number; revenue: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  confirmed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  packed: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  dispatched: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  delivered: 'text-green-400 bg-green-500/10 border-green-500/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function SellerDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory'>('overview');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch('/api/v2/analytics'),
        fetch('/api/v2/orders?limit=50'),
      ]);
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        const newOrders: Order[] = data.orders;

        // Real-time new order detection
        if (lastOrderCount > 0 && newOrders.length > lastOrderCount) {
          const newest = newOrders[0];
          if (newest.status === 'pending') {
            setNewOrderAlert(newest);
            playNotificationSound();
          }
        }
        setLastOrderCount(newOrders.length);
        setOrders(newOrders);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const playNotificationSound = () => {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: string, extra?: any) => {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/v2/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      if (res.ok) {
        await fetchData();
        setNewOrderAlert(null);
      }
    } catch {}
    finally { setUpdatingOrder(null); }
  };

  const StatCard = ({ icon: Icon, label, value, color, sub }: any) => (
    <div className="glassmorphism p-5 rounded-2xl border border-premium-border space-y-3 hover:border-const-orange/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-600" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white">{value}</p>
        <p className="text-xs text-gray-400 font-semibold">{label}</p>
        {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-16">
      {/* ─── New Order Alert Popup ─── */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <div className="bg-[#0e0e14] border-2 border-const-orange/60 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl shadow-const-orange/20">
              <div className="text-center space-y-3">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  className="w-20 h-20 mx-auto bg-const-orange/10 border-2 border-const-orange/40 rounded-full flex items-center justify-center">
                  <Bell className="w-10 h-10 text-const-orange" />
                </motion.div>
                <h2 className="text-2xl font-extrabold text-white">🔔 New Order!</h2>
                <p className="text-gray-400 text-sm">You have a new order from <span className="text-white font-bold">{newOrderAlert.customer.name}</span></p>
              </div>

              <div className="bg-white/5 border border-premium-border rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Order ID</span>
                  <span className="text-const-orange font-mono font-bold">{newOrderAlert.orderNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Customer</span>
                  <span className="text-white font-bold">{newOrderAlert.customer.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Phone</span>
                  <span className="text-white">{newOrderAlert.customer.phone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-green-400 font-extrabold text-sm">₹{newOrderAlert.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Items</span>
                  <span className="text-white">{newOrderAlert.items.length} item(s)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateOrderStatus(newOrderAlert.id, 'confirmed')}
                  disabled={!!updatingOrder}
                  className="flex items-center justify-center space-x-2 bg-green-500 text-white font-extrabold py-4 rounded-2xl hover:bg-green-600 active:scale-95 transition-all disabled:opacity-60"
                >
                  <Check className="w-5 h-5" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => updateOrderStatus(newOrderAlert.id, 'cancelled')}
                  disabled={!!updatingOrder}
                  className="flex items-center justify-center space-x-2 bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold py-4 rounded-2xl hover:bg-red-500/30 active:scale-95 transition-all disabled:opacity-60"
                >
                  <X className="w-5 h-5" />
                  <span>Reject</span>
                </button>
              </div>
              <button onClick={() => setNewOrderAlert(null)} className="w-full text-xs text-gray-500 hover:text-white transition-colors">
                Dismiss for now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-display">Seller Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1">Real-time order management & analytics</p>
          </div>
          <button onClick={fetchData} className={`p-2.5 rounded-xl border border-premium-border text-gray-400 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#121217] border border-premium-border/60 p-1 rounded-2xl w-fit gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory', icon: Boxes },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-const-orange text-white' : 'text-gray-400 hover:text-white'
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={IndianRupee} label="Total Revenue (30d)" value={`₹${(analytics.summary.totalRevenue / 100000).toFixed(1)}L`} color="bg-const-orange/10 text-const-orange" sub="+12% vs last month" />
              <StatCard icon={ShoppingBag} label="Total Orders" value={analytics.summary.totalOrders} color="bg-blue-500/10 text-blue-400" sub={`${analytics.summary.pendingOrders} pending`} />
              <StatCard icon={CheckCircle2} label="Delivered" value={analytics.summary.completedOrders} color="bg-green-500/10 text-green-400" sub="Last 30 days" />
              <StatCard icon={Package} label="Products Listed" value={analytics.summary.totalProducts} color="bg-purple-500/10 text-purple-400" sub="All categories" />
            </div>

            {/* Weekly Trend Chart */}
            <div className="glassmorphism p-6 rounded-3xl border border-premium-border">
              <h3 className="text-sm font-bold text-white mb-6">Weekly Order Trend</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {analytics.weeklyTrend.map((day, i) => {
                  const maxOrders = Math.max(...analytics.weeklyTrend.map(d => d.orders)) || 1;
                  const height = (day.orders / maxOrders) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[10px] text-gray-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.orders}
                      </div>
                      <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: '80px' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 4)}%` }}
                          transition={{ delay: i * 0.05 }}
                          className="absolute bottom-0 w-full bg-gradient-to-t from-const-orange to-amber-400 rounded-t-lg"
                        />
                      </div>
                      <span className="text-[9px] text-gray-500">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="glassmorphism p-6 rounded-3xl border border-premium-border">
              <h3 className="text-sm font-bold text-white mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {analytics.recentOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white/3 border border-premium-border/40 rounded-xl hover:border-const-orange/20 transition-colors">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white font-mono">{order.orderNumber}</p>
                      <p className="text-[10px] text-gray-400">{order.customer.name} • {order.items.length} items</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-const-orange">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[order.status] || 'text-gray-400 bg-gray-500/10'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Orders Tab ─── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(s => (
                <span key={s} className={`text-[10px] font-bold px-3 py-1 rounded-full border cursor-pointer capitalize ${s === 'all' ? 'bg-const-orange text-white border-transparent' : STATUS_COLORS[s] || 'bg-white/5 border-premium-border text-gray-400'}`}>
                  {s}
                </span>
              ))}
            </div>
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="glassmorphism border border-premium-border rounded-2xl p-5 space-y-4 hover:border-const-orange/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-white font-mono">{order.orderNumber}</span>
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[order.status] || 'text-gray-400 bg-gray-500/10'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {order.customer.name} • {order.customer.phone}
                        {order.customer.companyName ? ` • ${order.customer.companyName}` : ''}
                      </p>
                      <p className="text-[10px] text-gray-600">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-const-orange">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-gray-500">{order.items.length} item(s)</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-400">
                        <span>{item.product.name}</span>
                        <span>{item.quantity} {item.product.unit} × ₹{item.unitPrice.toLocaleString('en-IN')} = <span className="text-white font-bold">₹{item.totalPrice.toLocaleString('en-IN')}</span></span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => updateOrderStatus(order.id, 'confirmed')} disabled={updatingOrder === order.id}
                          className="flex items-center space-x-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-50">
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Order</span>
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, 'cancelled')} disabled={updatingOrder === order.id}
                          className="flex items-center space-x-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50">
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => updateOrderStatus(order.id, 'packed')} disabled={updatingOrder === order.id}
                        className="flex items-center space-x-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-purple-500/30 transition-colors disabled:opacity-50">
                        <Package className="w-3.5 h-3.5" />
                        <span>Mark as Packed</span>
                      </button>
                    )}
                    {order.status === 'packed' && (
                      <button onClick={() => updateOrderStatus(order.id, 'dispatched', { driverName: 'Raju Driver', driverPhone: '+918010871044', vehicleNo: 'MH-19-AB-1234' })}
                        disabled={updatingOrder === order.id}
                        className="flex items-center space-x-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-cyan-500/30 transition-colors disabled:opacity-50">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark Dispatched</span>
                      </button>
                    )}
                    {order.status === 'dispatched' && (
                      <button onClick={() => updateOrderStatus(order.id, 'delivered')} disabled={updatingOrder === order.id}
                        className="flex items-center space-x-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Delivered</span>
                      </button>
                    )}
                    <a href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=Hi ${order.customer.name}, your order ${order.orderNumber} update.`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-green-600/20 border border-green-600/30 text-green-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600/30 transition-colors">
                      <span>📱 WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                  <p className="text-sm">No orders yet. Share your marketplace link to get orders!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Inventory Tab ─── */}
        {activeTab === 'inventory' && (
          <div className="glassmorphism p-6 rounded-3xl border border-premium-border">
            <h3 className="text-sm font-bold text-white mb-4">Inventory Management</h3>
            <p className="text-xs text-gray-400">Connect to /api/v2/inventory for live stock data. Manage stock levels, set alerts, and track movements.</p>
            <div className="mt-6 space-y-3">
              {[
                { name: 'UltraTech OPC 53 Cement', stock: 450, unit: 'Bags', alert: 100, status: 'good' },
                { name: 'JSW TMT Steel Fe550D', stock: 8.5, unit: 'MT', alert: 5, status: 'good' },
                { name: 'Girna River Sand', stock: 42, unit: 'Brass', alert: 20, status: 'low' },
                { name: 'Basalt Aggregates 20mm', stock: 28, unit: 'Brass', alert: 15, status: 'good' },
                { name: 'Red Clay Bricks', stock: 8500, unit: 'Pcs', alert: 5000, status: 'low' },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-white/3 border border-premium-border/40 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-gray-500">Alert at {item.alert} {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-white">{item.stock.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">{item.unit}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.status === 'low' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                      {item.status === 'low' ? '⚠️ Low' : '✅ OK'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
