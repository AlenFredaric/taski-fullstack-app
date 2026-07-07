// frontend/src/components/UserDashboardView.jsx
import React, { useState, useContext } from 'react';
import { 
  Ticket, LogOut, Wallet, LayoutDashboard, History, MessageSquare, Bell, Menu, X
} from 'lucide-react';
import { AuthContext } from '../App';

import WalletView from './WalletView';
import SeatSelectionGrid from './SeatSelectionGrid';
import EventsListView from './EventsListView';
import TransactionsView from './TransactionsView';
import PurchasedTicketsView from './PurchasedTicketsView';
import ActivityLogStreamView from './ActivityLogStreamView';

export default function UserDashboardView() {
  const { currentView, setCurrentView, user, logout, notifications } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatRupees = (paise) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
  };

  const getNavbarHeader = () => {
    switch (currentView) {
      case 'overview':
      case 'seat-select':
        return { heading: 'Live Events & Concerts', sub: 'Discover and book tickets for upcoming live entertainment. Select any layout pool.' };
      case 'wallet':
        return { heading: 'My Wallet Dashboard', sub: 'Manage liquidity funds, authorize secure credits, and inspect immutable node statements.' };
      case 'tickets':
        return { heading: 'Purchased Tickets', sub: 'Review upcoming virtual entry passes, dispatch backup receipts, and filter active vectors.' };
      case 'transactions':
        return { heading: 'Ledger History', sub: 'Inspect historical auditing streams, balance flow, and double-entry system compliance.' };
      case 'notifications':
        return { heading: 'Activity Log Stream', sub: 'Real-time interceptor updates regarding locks, permission gateways, and account adjustments.' };
      default:
        return { heading: 'Dashboard Overview', sub: 'Welcome to your master ticket reservation system control station.' };
    }
  };

  const navHeader = getNavbarHeader();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row antialiased relative">
      
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 w-64 sm:w-72 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          <div className="p-5 border-b border-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-[#0EA5E9] text-white p-2 rounded-xl flex items-center justify-center shadow-md">
                <Ticket className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black text-slate-950 tracking-tight">taSki</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 lg:hidden bg-transparent border-none cursor-pointer"><X className="h-6 w-6" /></button>
          </div>

          <nav className="p-4 space-y-2 overflow-y-auto">
            {[
              { id: 'overview', name: 'Explore Events', icon: LayoutDashboard },
              { id: 'wallet', name: 'My Wallet', icon: Wallet },
              { id: 'tickets', name: 'My Tickets', icon: Ticket },
              { id: 'transactions', name: 'Payment History', icon: History },
              { id: 'notifications', name: 'Booking Updates', icon: Bell }
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'overview' && currentView === 'seat-select');
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-bold transition-all cursor-pointer border-none bg-transparent text-left ${isActive ? 'bg-sky-50 text-[#0EA5E9] font-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Icon className="h-5.5 w-5.5 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 text-center text-[10px] text-slate-300 font-semibold tracking-wider uppercase">taSki Core Engine</div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full">
   
        <header className="bg-white border-b border-slate-100 h-24 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 lg:hidden flex items-center justify-center bg-transparent border-none cursor-pointer shrink-0"><Menu className="h-6 w-6" /></button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="truncate max-w-[150px] sm:max-w-none">{navHeader.heading}</span>
              {currentView === 'notifications' && notifications.length > 0 && (
                <span className="text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-md animate-pulse shrink-0">
                  {notifications.length} New
                </span>
              )}
            </h1>
            <p className="text-[10px] sm:text-sm text-slate-400 font-medium truncate mt-0.5 max-w-2xl hidden sm:block">{navHeader.sub}</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0 h-full">
            <div onClick={() => setCurrentView('wallet')} className="flex items-center gap-2 sm:gap-3 bg-[#15b981]/5 border border-[#15b981]/10 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#15b981]/10 transition-all h-12">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-[#15b981] shrink-0" />
              <div className="flex flex-col justify-center text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none hidden sm:block">Balance</span>
                <span className="text-xs sm:text-base font-black text-[#15b981] leading-none block whitespace-nowrap">{formatRupees(user?.walletBalance || 0)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 h-12">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-2 py-1.5 rounded-2xl h-full">
                <div className="h-8 w-8 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center font-black text-sm uppercase shrink-0 border border-[#0EA5E9]/20">{user?.name ? user.name.slice(0, 2) : 'US'}</div>
              </div>
              <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-all border-none bg-transparent cursor-pointer"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {currentView === 'overview' && <EventsListView />}
          {currentView === 'seat-select' && <SeatSelectionGrid />}
          {currentView === 'wallet' && <WalletView />}
          {currentView === 'transactions' && <TransactionsView />}
          {currentView === 'tickets' && <PurchasedTicketsView />}
          {currentView === 'notifications' && <ActivityLogStreamView />}
        </main>
      </div>
    </div>
  );
}