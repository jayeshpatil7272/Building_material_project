'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, ShoppingCart, Star, Truck, Package, Filter, X,
  ChevronRight, Zap, Shield, Clock, TrendingUp, Bell,
  Home, Building2, Flame, Tag, ChevronDown, Plus, Minus,
  AlertCircle, Check
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  unit: string;
  basePrice: number;
  mrp: number;
  gstRate: number;
  rating: number;
  totalReviews: number;
  totalSold: number;
  isFeatured: boolean;
  images: string;
  specs: string;
  description: string;
  category: { name: string; slug: string; icon: string };
  supplier: { businessName: string; city: string; rating: number };
  inventory: { currentStock: number; reservedStock: number } | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORIES = [
  { slug: 'all', name: 'All', icon: '🏪' },
  { slug: 'cement', name: 'Cement', icon: '🏗️' },
  { slug: 'steel', name: 'Steel', icon: '⚙️' },
  { slug: 'sand', name: 'Sand', icon: '🌊' },
  { slug: 'aggregate', name: 'Aggregates', icon: '🪨' },
  { slug: 'bricks', name: 'Bricks', icon: '🧱' },
  { slug: 'waterproofing', name: 'Chemicals', icon: '💧' },
  { slug: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { slug: 'electrical', name: 'Electrical', icon: '⚡' },
  { slug: 'tiles', name: 'Tiles', icon: '🏠' },
  { slug: 'paints', name: 'Paints', icon: '🎨' },
  { slug: 'hardware', name: 'Hardware', icon: '🔨' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function getImageUrl(images: string): string {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&auto=format&fit=crop&q=80';
  } catch {
    return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&auto=format&fit=crop&q=80';
  }
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Out of Stock</span>;
  if (stock <= 50) return <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Low Stock: {stock}</span>;
  return <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">In Stock</span>;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(search && { q: search }),
      });
      const res = await fetch(`/api/v2/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.pagination.pages);
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setLoading(false);
    }
  }, [page, sort, selectedCategory, search]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, search, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jsr_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem('jsr_cart', JSON.stringify(items));
  };

  const addToCart = (product: Product, qty = 1) => {
    const existing = cart.find(i => i.product.id === product.id);
    if (existing) {
      saveCart(cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i));
    } else {
      saveCart([...cart, { product, quantity: qty }]);
    }
    setAddedProduct(product.id);
    setTimeout(() => setAddedProduct(null), 2000);
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      saveCart(cart.filter(i => i.product.id !== productId));
    } else {
      saveCart(cart.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.basePrice * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const getCartQty = (productId: string) => cart.find(i => i.product.id === productId)?.quantity || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0e]">
      {/* ─── Hero Banner ─── */}
      <div className="bg-gradient-to-r from-[#0d0d16] via-const-orange/5 to-[#0d0d16] border-b border-premium-border/40 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-const-orange text-xs font-bold tracking-widest uppercase">
                <Zap className="w-3.5 h-3.5" />
                <span>B2B Construction Marketplace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                Order Building Materials
              </h1>
              <p className="text-gray-400 text-sm">
                Wholesale prices • Same-day dispatch • Direct mine to site
              </p>
              <div className="flex items-center gap-4 pt-1">
                {[
                  { icon: Shield, text: 'BIS Certified' },
                  { icon: Truck, text: 'Fleet Delivery' },
                  { icon: Clock, text: '2hr Response' },
                ].map(item => (
                  <div key={item.text} className="flex items-center space-x-1 text-[10px] text-gray-400 font-semibold">
                    <item.icon className="w-3 h-3 text-const-orange" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center space-x-3 bg-const-orange text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-2xl shadow-const-orange/25 hover:scale-105 active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart ({cartCount})</span>
              {cartCount > 0 && (
                <span className="bg-white text-const-orange font-black text-xs px-2 py-0.5 rounded-full">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ─── Search + Sort ─── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search cement, steel, sand, bricks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-premium-border rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-const-orange transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-3.5 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-[#121217] border border-premium-border rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-const-orange min-w-[180px]"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ─── Category Pills ─── */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat.slug
                  ? 'bg-const-orange text-white border-const-orange shadow-lg shadow-const-orange/20'
                  : 'bg-white/5 text-gray-300 border-premium-border hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* ─── Products Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/3 rounded-2xl h-72 animate-pulse border border-premium-border/40" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Package className="w-16 h-16 text-gray-700 mx-auto" />
            <p className="text-gray-500 text-sm font-semibold">No products found for "{search || selectedCategory}"</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('all'); }} className="text-const-orange text-xs font-bold hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {products.map((product, index) => {
                const cartQty = getCartQty(product.id);
                const isAdded = addedProduct === product.id;
                const stock = product.inventory?.currentStock || 0;
                const isOutOfStock = stock <= 0;
                const imageUrl = getImageUrl(product.images);
                const discount = product.mrp > product.basePrice
                  ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)
                  : 0;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group bg-gradient-to-b from-white/5 to-white/2 border border-premium-border/60 rounded-2xl overflow-hidden hover:border-const-orange/40 transition-all hover:shadow-xl hover:shadow-const-orange/5 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-36 sm:h-44 overflow-hidden bg-black/30">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      {product.isFeatured && (
                        <span className="absolute top-2 left-2 bg-const-orange text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ⭐ Featured
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <StockBadge stock={stock} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1 space-y-2">
                      <div>
                        <span className="text-[9px] text-const-orange font-bold uppercase tracking-wider">
                          {product.category.icon} {product.category.name}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5 line-clamp-2 group-hover:text-const-orange transition-colors">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="text-[9px] text-gray-500 font-semibold mt-0.5">{product.brand}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-const-orange text-const-orange" />
                        <span className="text-[10px] text-gray-400 font-semibold">{product.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-600">({product.totalReviews})</span>
                      </div>

                      <div className="flex-1" />

                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base sm:text-lg font-extrabold text-white">
                            ₹{product.basePrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] text-gray-500">/{product.unit}</span>
                        </div>
                        {product.mrp > product.basePrice && (
                          <span className="text-[10px] text-gray-500 line-through">
                            MRP ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                        <p className="text-[9px] text-gray-600 mt-0.5">+{product.gstRate}% GST</p>
                      </div>

                      {/* Add to Cart */}
                      {isOutOfStock ? (
                        <button disabled className="w-full bg-gray-800 text-gray-500 text-xs font-bold py-2 rounded-xl cursor-not-allowed">
                          Out of Stock
                        </button>
                      ) : cartQty > 0 ? (
                        <div className="flex items-center justify-between bg-const-orange/10 border border-const-orange/30 rounded-xl px-3 py-1.5">
                          <button
                            onClick={() => updateCartQty(product.id, cartQty - 1)}
                            className="text-const-orange font-bold hover:bg-const-orange/20 p-1 rounded-lg transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-white font-extrabold text-sm">{cartQty}</span>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="text-const-orange font-bold hover:bg-const-orange/20 p-1 rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(product)}
                          className={`w-full text-xs font-bold py-2 rounded-xl transition-all ${
                            isAdded
                              ? 'bg-green-500 text-white'
                              : 'bg-const-orange/10 border border-const-orange/30 text-const-orange hover:bg-const-orange hover:text-white'
                          }`}
                        >
                          {isAdded ? (
                            <span className="flex items-center justify-center space-x-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </span>
                          ) : (
                            '+ Add to Cart'
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-bold bg-white/5 border border-premium-border rounded-xl text-gray-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-xs font-bold text-white bg-const-orange/10 border border-const-orange/30 rounded-xl">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs font-bold bg-white/5 border border-premium-border rounded-xl text-gray-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ─── Cart Sidebar ─── */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#0e0e14] border-l border-premium-border z-50 flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b border-premium-border/40">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Your Cart</h2>
                  <p className="text-xs text-gray-400">{cartCount} item(s)</p>
                </div>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white p-2 rounded-xl border border-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <ShoppingCart className="w-16 h-16 text-gray-700 mx-auto" />
                    <p className="text-gray-500 text-sm">Your cart is empty</p>
                    <button onClick={() => setShowCart(false)} className="text-const-orange text-xs font-bold">
                      Continue Shopping →
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-3 bg-white/3 border border-premium-border/40 rounded-xl p-3">
                      <img
                        src={getImageUrl(item.product.images)}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-white line-clamp-2">{item.product.name}</p>
                        <p className="text-[10px] text-gray-500">{item.product.brand}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-const-orange">
                            ₹{(item.product.basePrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center hover:bg-white/20">−</button>
                            <span className="text-white text-xs font-bold w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center hover:bg-white/20">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-premium-border/40 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-white font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>GST (estimated)</span>
                      <span className="text-white font-bold">₹{Math.round(cartTotal * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Delivery</span>
                      <span className="text-green-400 font-bold">Based on distance</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-white border-t border-premium-border/40 pt-2">
                      <span>Estimated Total</span>
                      <span className="text-const-orange">₹{Math.round(cartTotal * 1.18).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setShowCart(false)}
                    className="block w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-extrabold text-sm py-4 rounded-2xl text-center hover:scale-[1.02] transition-transform shadow-2xl"
                  >
                    Proceed to Checkout →
                  </Link>
                  <a
                    href={`https://wa.me/918010871044?text=Hi, I want to place a bulk order. Cart total: ₹${Math.round(cartTotal * 1.18).toLocaleString('en-IN')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600/20 border border-green-600/30 text-green-400 font-bold text-xs py-3 rounded-2xl text-center hover:bg-green-600/30 transition-colors"
                  >
                    📱 Order via WhatsApp
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
