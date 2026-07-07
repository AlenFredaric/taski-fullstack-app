// frontend/src/components/LandingPageView.jsx
import React, { useState, useContext } from 'react';
import { Ticket, ArrowRight, Cpu, Layers, Server, Database, Mail, Lock, User, Eye, EyeOff, Wallet, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../App';

export default function LandingPageView() {
  const { login, register } = useContext(AuthContext);
  const [showAuthCard, setShowAuthCard] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [error] = useState('');

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      login(email, password);
    } else {
      register(name, email, password, role);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between antialiased">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-[#0EA5E9] text-white p-1.5 rounded-lg flex items-center justify-center shadow-md">
            <Ticket className="h-5 w-5" />
          </div>
          <span className="text-xl font-black text-slate-950 tracking-tight">taSki</span>
        </div>
        <button 
          onClick={() => { setShowAuthCard(true); setAuthMode('login'); }}
          className="px-5 py-2 rounded-xl text-sm font-bold text-[#0EA5E9] border border-sky-100 bg-sky-50/40 hover:bg-sky-50 transition-all cursor-pointer"
        >
          Sign In
        </button>
      </nav>

      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {!showAuthCard ? (
          <div className="w-full max-w-6xl mx-auto px-6 py-16 animate-fadeIn flex flex-col items-center">
            
            <div className="text-center max-w-3xl mb-12">
              <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-full text-[11px] font-extrabold text-[#0EA5E9] uppercase tracking-wider mb-6">
                Enterprise-Grade Concurrency Protection
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-none mb-6">
                The Next-Gen <br />
                <span className="text-[#0EA5E9]">Ticket Booking Engine.</span>
              </h1>
              <p className="text-base text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
                Experience high-performance booking secured with strict idempotency ledgers. Zero double-booking, real-time millisecond locking mechanism, and automated decentralized wallet settlement.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => { setShowAuthCard(true); setAuthMode('register'); }}
                  className="px-8 py-3 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-[#0EA5E9]/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  Get Started for Free <ArrowRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => { setShowAuthCard(true); setAuthMode('login'); }}
                  className="px-8 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Explore Catalog Hub
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl border-t border-b border-slate-100 py-10 my-8">
              <div className="text-center p-2">
                <div className="text-2xl sm:text-3xl font-black text-slate-950">&lt; 5min</div>
                <div className="text-xs text-slate-400 font-semibold mt-1">Reservation Timeout</div>
              </div>
              <div className="text-center p-2">
                <div className="text-2xl sm:text-3xl font-black text-[#0EA5E9]">0</div>
                <div className="text-xs text-slate-400 font-semibold mt-1">Double-bookings</div>
              </div>
              <div className="text-center p-2">
                <div className="text-2xl sm:text-3xl font-black text-slate-950">100%</div>
                <div className="text-xs text-slate-400 font-semibold mt-1">Idempotent APIs</div>
              </div>
              <div className="text-center p-2">
                <div className="text-2xl sm:text-3xl font-black text-slate-950">99.9%</div>
                <div className="text-xs text-slate-400 font-semibold mt-1">Uptime SLA</div>
              </div>
            </div>

            <div className="w-full max-w-5xl mt-12">
              <h2 className="text-2xl font-extrabold text-center text-slate-950 mb-2">Engineered for High-Concurrency</h2>
              <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider mb-10">How taSki handles race conditions</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-xl bg-sky-50 text-[#0EA5E9] flex items-center justify-center mb-4">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Millisecond Locking</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Seats transition from AVAILABLE to RESERVED with an automatic 5-minute TTL lease lock. Zero overlapping requests.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Integer Wallet Ledger</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Maintains an immutable transactional ledger using atomic integer cents/paise. Floating-point errors are impossible.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">ACID Atomicity</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Seat reservation and wallet payment are wrapped in an atomic database session. No partial success or double spending.
                  </p>
                </div>
              </div>
            </div>

            
          </div>
        ) : (
          <div className="w-full relative max-w-7xl p-4 flex flex-col items-center animate-fadeIn">
            <button 
              onClick={() => setShowAuthCard(false)}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors bg-white border border-slate-200 px-5 py-2 rounded-full shadow-sm mb-4 cursor-pointer"
            >
              &larr; Back to Introduction Page
            </button>
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[4px] bg-[#0EA5E9]"></div>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="bg-[#0EA5E9]/10 text-[#0EA5E9] p-3 rounded-2xl flex items-center justify-center mb-3">
                  <Ticket className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                  {authMode === 'login' ? 'Sign In to taSki' : 'Create Operator Account'}
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">Access your ticket bookings & decentralized ledger</p>
              </div>

              {error && (
                <div className="mb-5 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 flex items-center gap-2">
                  <span>⚠️ {error}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-5">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input type="text" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0EA5E9]" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="email" placeholder="john@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0EA5E9]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-11 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0EA5E9]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 text-slate-400 hover:text-[#0EA5E9] bg-transparent border-none focus:outline-none cursor-pointer">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              
                <button type="submit" className="w-full py-3.5 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-black rounded-xl text-base shadow-md mt-6 transition-all active:scale-[0.99] border-none cursor-pointer">
                  {authMode === 'login' ? 'Sign In' : 'Authorize Account'}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
                  className="text-sm font-bold text-[#0EA5E9] hover:underline transition-all bg-transparent border-none cursor-pointer"
                >
                  {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="py-6 border-t border-slate-100 bg-white text-center text-xs text-slate-400 font-semibold">
        &copy; {new Date().getFullYear()} taSki Ticket Booking & Wallet Ledger System. All rights reserved.
      </footer>
    </div>
  );
}